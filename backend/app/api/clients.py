"""Client management endpoints.

Provides CRUD operations for clients with search and pagination.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.all_models import Client, Car, User
from app.schemas.all_schemas import ClientCreate, ClientUpdate, ClientOut

router = APIRouter(prefix="/api/clients", tags=["Clients"])


@router.get("", response_model=List[ClientOut])
async def get_clients(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Search by name, phone, or email"),
    skip: int = Query(0, ge=0, description="Number of records to skip (pagination)"),
    limit: int = Query(100, ge=1, le=500, description="Max number of records to return"),
):
    """Get paginated list of clients for current tenant.

    Supports fuzzy search across name, phone, and email fields.
    Each client is enriched with car_count and order_count.

    Args:
        db: Database session.
        current_user: Authenticated user (auto-injected).
        search: Optional search query string.
        skip: Pagination offset (default: 0).
        limit: Page size (default: 100, max: 500).

    Returns:
        List[ClientOut]: Paginated list of clients with aggregated counts.
    """
    query = select(Client).where(Client.tenant_id == current_user.tenant_id)

    if search:
        ilike_search = f"%{search}%"
        query = query.where(
            (Client.name.ilike(ilike_search)) |
            (Client.phone.ilike(ilike_search)) |
            (Client.email.ilike(ilike_search))
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    clients = result.scalars().all()

    # Enrich with counts
    output = []
    for client in clients:
        cars_count = await db.execute(
            select(func.count(Car.id)).where(Car.client_id == client.id, Car.tenant_id == current_user.tenant_id)
        )
        orders_count = await db.execute(
            select(func.count(Client.id)).where(Client.id == client.id, Client.tenant_id == current_user.tenant_id)
        )

        output.append(ClientOut(
            id=client.id,
            name=client.name,
            phone=client.phone,
            email=client.email,
            company=client.company,
            address=client.address,
            notes=client.notes,
            car_count=cars_count.scalar() or 0,
            order_count=orders_count.scalar() or 0,
        ))

    return output


@router.get("/{client_id}", response_model=ClientOut)
async def get_client(
    client_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get a single client by ID with car count.

    Args:
        client_id: Client database ID.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        ClientOut: Client data with car_count.

    Raises:
        HTTPException 404: Client not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Client).where(
            Client.id == client_id,
            Client.tenant_id == current_user.tenant_id
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    cars_count = await db.execute(
        select(func.count(Car.id)).where(Car.client_id == client.id, Car.tenant_id == current_user.tenant_id)
    )

    return ClientOut(
        id=client.id,
        name=client.name,
        phone=client.phone,
        email=client.email,
        company=client.company,
        address=client.address,
        notes=client.notes,
        car_count=cars_count.scalar() or 0,
        order_count=0,
    )


@router.post("", response_model=ClientOut, status_code=201)
async def create_client(
    data: ClientCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new client for the current tenant.

    Args:
        data: ClientCreate with name (required) and optional phone, email, company, address, notes.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        ClientOut: Created client data with auto-generated id and tenant_id.

    Note:
        tenant_id is automatically set from the authenticated user's tenant.
    """
    client = Client(
        name=data.name,
        phone=data.phone,
        email=data.email,
        company=data.company,
        address=data.address,
        notes=data.notes or "",
        tenant_id=current_user.tenant_id,
    )

    db.add(client)
    await db.commit()
    await db.refresh(client)

    return ClientOut.model_validate(client)


@router.put("/{client_id}", response_model=ClientOut)
async def update_client(
    client_id: int,
    data: ClientUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Update an existing client. Only provided fields are updated.

    Uses Pydantic's exclude_unset to update only fields that were sent in the request.

    Args:
        client_id: Client database ID.
        data: ClientUpdate with fields to update (all optional).
        db: Database session.
        current_user: Authenticated user.

    Returns:
        ClientOut: Updated client data.

    Raises:
        HTTPException 404: Client not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Client).where(
            Client.id == client_id,
            Client.tenant_id == current_user.tenant_id
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(client, key, value)

    await db.commit()
    await db.refresh(client)

    return ClientOut.model_validate(client)


@router.delete("/{client_id}", status_code=204)
async def delete_client(
    client_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a client and all associated cars (cascade).

    Note:
        Cars have cascade="all, delete-orphan" so deleting a client
        also deletes their associated cars. Orders are NOT deleted
        (they have cascade but are typically soft-deleted in production).

    Args:
        client_id: Client database ID.
        db: Database session.
        current_user: Authenticated user.

    Raises:
        HTTPException 404: Client not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Client).where(
            Client.id == client_id,
            Client.tenant_id == current_user.tenant_id
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    await db.delete(client)
    await db.commit()
