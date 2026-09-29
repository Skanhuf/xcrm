"""Warehouse inventory management endpoints.

Provides CRUD operations for parts with category filtering,
low stock alerts, and search functionality.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.all_models import WarehousePart, User
from app.schemas.all_schemas import (
    WarehousePartCreate, WarehousePartUpdate, WarehousePartOut,
)

router = APIRouter(prefix="/api/warehouse", tags=["Warehouse"])


@router.get("", response_model=List[WarehousePartOut])
async def get_parts(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    low_stock: bool = False,
    skip: int = 0,
    limit: int = 100,
):
    """Get warehouse parts with filters."""
    query = select(WarehousePart).where(
        WarehousePart.tenant_id == current_user.tenant_id
    )

    if category:
        query = query.where(WarehousePart.category == category)

    if search:
        ilike_search = f"%{search}%"
        query = query.where(
            (WarehousePart.name.ilike(ilike_search)) |
            (WarehousePart.sku.ilike(ilike_search))
        )

    if low_stock:
        query = query.where(
            WarehousePart.qty <= WarehousePart.min_qty
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    parts = result.scalars().all()

    return [WarehousePartOut.model_validate(p) for p in parts]


@router.get("/categories", response_model=List[str])
async def get_categories(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get all categories."""
    result = await db.execute(
        select(WarehousePart.category)
        .where(WarehousePart.tenant_id == current_user.tenant_id)
        .distinct()
    )
    return [row[0] for row in result.scalars().all() if row[0]]


@router.get("/low-stock")
async def get_low_stock(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get parts with low stock."""
    result = await db.execute(
        select(WarehousePart)
        .where(
            WarehousePart.tenant_id == current_user.tenant_id,
            WarehousePart.qty <= WarehousePart.min_qty,
        )
    )
    parts = result.scalars().all()
    return [WarehousePartOut.model_validate(p) for p in parts]


@router.get("/{part_id}", response_model=WarehousePartOut)
async def get_part(
    part_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get single part by ID."""
    result = await db.execute(
        select(WarehousePart).where(
            WarehousePart.id == part_id,
            WarehousePart.tenant_id == current_user.tenant_id,
        )
    )
    part = result.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="Запчасть не найдена")

    return WarehousePartOut.model_validate(part)


@router.post("", response_model=WarehousePartOut, status_code=201)
async def create_part(
    data: WarehousePartCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new warehouse part."""
    part = WarehousePart(
        name=data.name,
        sku=data.sku,
        category=data.category,
        qty=data.qty,
        min_qty=data.min_qty,
        buy_price=data.buy_price,
        sell_price=data.sell_price,
        notes=data.notes or "",
        tenant_id=current_user.tenant_id,
    )

    db.add(part)
    await db.commit()
    await db.refresh(part)

    return WarehousePartOut.model_validate(part)


@router.put("/{part_id}", response_model=WarehousePartOut)
async def update_part(
    part_id: int,
    data: WarehousePartUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Update warehouse part."""
    result = await db.execute(
        select(WarehousePart).where(
            WarehousePart.id == part_id,
            WarehousePart.tenant_id == current_user.tenant_id,
        )
    )
    part = result.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="Запчасть не найдена")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(part, key, value)

    await db.commit()
    await db.refresh(part)

    return WarehousePartOut.model_validate(part)


@router.delete("/{part_id}", status_code=204)
async def delete_part(
    part_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a warehouse part."""
    result = await db.execute(
        select(WarehousePart).where(
            WarehousePart.id == part_id,
            WarehousePart.tenant_id == current_user.tenant_id,
        )
    )
    part = result.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="Запчасть не найдена")

    await db.delete(part)
    await db.commit()
