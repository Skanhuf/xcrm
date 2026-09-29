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
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or SKU"),
    low_stock: bool = Query(False, description="Show only parts below minimum quantity"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=500, description="Page size (max 500)"),
):
    """Get warehouse parts with optional filters.

    Supports filtering by category, low stock level, and full-text
    search across name and SKU fields.

    Args:
        db: Database session.
        current_user: Authenticated user.
        category: Optional category filter.
        search: Optional search query for name or SKU.
        low_stock: If True, only show parts where qty <= min_qty.
        skip: Pagination offset (default: 0).
        limit: Page size (default: 100, max: 500).

    Returns:
        List[WarehousePartOut]: Filtered and paginated parts list.
    """
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
    """Get all unique categories for current tenant.

    Args:
        db: Database session.
        current_user: Authenticated user.

    Returns:
        List[str]: List of unique category names (empty strings excluded).
    """
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
    """Get parts that are below minimum stock level.

    Useful for generating reorder alerts in the UI.

    Args:
        db: Database session.
        current_user: Authenticated user.

    Returns:
        List[WarehousePartOut]: Parts where qty <= min_qty.
    """
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
    """Get a single warehouse part by ID.

    Args:
        part_id: Part database ID.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        WarehousePartOut: Part data with pricing and stock info.

    Raises:
        HTTPException 404: Part not found or belongs to another tenant.
    """
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
    """Add a new part to the warehouse inventory.

    Args:
        data: WarehousePartCreate with name (required), sku, category,
              qty, min_qty, buy_price, sell_price, notes.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        WarehousePartOut: Created part data with auto-generated id and tenant_id.
    """
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
    """Update warehouse part information. Only provided fields are updated.

    Args:
        part_id: Part database ID.
        data: WarehousePartUpdate with fields to update (all optional).
        db: Database session.
        current_user: Authenticated user.

    Returns:
        WarehousePartOut: Updated part data.

    Raises:
        HTTPException 404: Part not found or belongs to another tenant.
    """
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
    """Delete a warehouse part.

    Note:
        This does not delete OrderPart records that reference this part
        (they store a copy of the data). Only clean up unused inventory items.

    Args:
        part_id: Part database ID.
        db: Database session.
        current_user: Authenticated user.

    Raises:
        HTTPException 404: Part not found or belongs to another tenant.
    """
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
