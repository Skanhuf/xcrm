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
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
):
    """Get paginated clients list."""
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
    """Get single client by ID."""
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
    """Create a new client."""
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
    """Update client info."""
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
    """Delete a client."""
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
