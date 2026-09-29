"""Vehicle management endpoints.

Provides CRUD operations for client vehicles with search and filtering.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.all_models import Car, Client, User
from app.schemas.all_schemas import CarCreate, CarUpdate, CarOut

router = APIRouter(prefix="/api/cars", tags=["Cars"])


@router.get("", response_model=List[CarOut])
async def get_cars(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    client_id: Optional[int] = Query(None, description="Filter by client ID"),
    search: Optional[str] = Query(None, description="Search by brand, model, plate, or VIN"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=500, description="Page size (max 500)"),
):
    """Get paginated list of vehicles for current tenant.

    Supports filtering by client and full-text search across
    brand, model, license plate, and VIN fields.

    Args:
        db: Database session.
        current_user: Authenticated user.
        client_id: Optional filter by client ID.
        search: Optional search query string.
        skip: Pagination offset (default: 0).
        limit: Page size (default: 100, max: 500).

    Returns:
        List[CarOut]: Paginated list of vehicles.
    """
    query = select(Car).where(Car.tenant_id == current_user.tenant_id)

    if client_id:
        query = query.where(Car.client_id == client_id)

    if search:
        ilike_search = f"%{search}%"
        query = query.where(
            (Car.brand.ilike(ilike_search)) |
            (Car.model.ilike(ilike_search)) |
            (Car.plate.ilike(ilike_search)) |
            (Car.vin.ilike(ilike_search))
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    cars = result.scalars().all()

    return [CarOut.model_validate(car) for car in cars]


@router.get("/{car_id}", response_model=CarOut)
async def get_car(
    car_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get a single vehicle by ID.

    Args:
        car_id: Vehicle database ID.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        CarOut: Vehicle data.

    Raises:
        HTTPException 404: Vehicle not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Car).where(
            Car.id == car_id,
            Car.tenant_id == current_user.tenant_id
        )
    )
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    return CarOut.model_validate(car)


@router.post("", response_model=CarOut, status_code=201)
async def create_car(
    data: CarCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Register a new vehicle for a client.

    Validates that the client exists and belongs to the same tenant
    before creating the vehicle record.

    Args:
        data: CarCreate with client_id (required), brand, model, and optional vin, plate, year, color, mileage, image.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        CarOut: Created vehicle data.

    Raises:
        HTTPException 404: Client not found or belongs to another tenant.
    """
    # Verify client exists
    result = await db.execute(
        select(Client).where(Client.id == data.client_id, Client.tenant_id == current_user.tenant_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Клиент не найден")

    car = Car(
        client_id=data.client_id,
        brand=data.brand,
        model=data.model,
        year=data.year or 0,
        vin=data.vin or "",
        plate=data.plate or "",
        color=data.color or "",
        mileage=data.mileage or 0,
        image=data.image or "",
        tenant_id=current_user.tenant_id,
    )

    db.add(car)
    await db.commit()
    await db.refresh(car)

    return CarOut.model_validate(car)


@router.put("/{car_id}", response_model=CarOut)
async def update_car(
    car_id: int,
    data: CarUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Update vehicle information. Only provided fields are updated.

    Args:
        car_id: Vehicle database ID.
        data: CarUpdate with fields to update (all optional).
        db: Database session.
        current_user: Authenticated user.

    Returns:
        CarOut: Updated vehicle data.

    Raises:
        HTTPException 404: Vehicle not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Car).where(
            Car.id == car_id,
            Car.tenant_id == current_user.tenant_id
        )
    )
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(car, key, value)

    await db.commit()
    await db.refresh(car)

    return CarOut.model_validate(car)


@router.delete("/{car_id}", status_code=204)
async def delete_car(
    car_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a vehicle.

    Note:
        Associated orders are NOT deleted (they have no cascade).
        This preserves order history even after vehicle is removed.

    Args:
        car_id: Vehicle database ID.
        db: Database session.
        current_user: Authenticated user.

    Raises:
        HTTPException 404: Vehicle not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Car).where(
            Car.id == car_id,
            Car.tenant_id == current_user.tenant_id
        )
    )
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    await db.delete(car)
    await db.commit()
