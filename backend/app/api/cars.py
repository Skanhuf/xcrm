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
    client_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
):
    """Get paginated cars list."""
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
    """Get single car by ID."""
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
    """Create a new car."""
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
    """Update car info."""
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
    """Delete a car."""
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
