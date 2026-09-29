"""Order management endpoints.

Handles work orders with Kanban board support, works, and parts management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime, timezone

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.all_models import Order, OrderWork, OrderPart, Car, Client, User, OrderStatus, Priority
from app.schemas.all_schemas import (
    OrderCreate, OrderUpdate, OrderOut, OrderWorkCreate, OrderWorkUpdate,
    OrderPartCreate, OrderPartUpdate, OrderWorkOut, OrderPartOut,
)

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def _calc_totals(order: Order) -> tuple[float, float, float]:
    """Calculate works cost, parts cost, and total for an order.

    Args:
        order: Order with populated works and parts relationships.

    Returns:
        Tuple of (total_works_cost, total_parts_cost, grand_total).
    """
    total_works = sum(float(w.price) for w in order.works)
    total_parts = sum(float(p.price * p.qty) for p in order.parts)
    return total_works, total_parts, total_works + total_parts


def _build_order_out(order: Order) -> OrderOut:
    """Convert Order ORM object to OrderOut response schema.

    Populates works, parts, and calculates financial totals.

    Args:
        order: Order ORM object with eager-loaded works and parts.

    Returns:
        OrderOut: Serialized order data with calculated totals.
    """
    works_out = [OrderWorkOut.model_validate(w) for w in order.works]
    parts_out = [OrderPartOut.model_validate(p) for p in order.parts]
    tw, tp, total = _calc_totals(order)
    return OrderOut(
        id=order.id,
        number=order.number,
        car_id=order.car_id,
        client_id=order.client_id,
        manager_id=order.manager_id,
        mechanic_id=order.mechanic_id,
        type=order.type,
        status=order.status,
        priority=order.priority,
        description=order.description,
        notes=order.notes,
        created_at=order.created_at,
        started_at=order.started_at,
        completed_at=order.completed_at,
        works=works_out,
        parts=parts_out,
        total_works=tw,
        total_parts=tp,
        total=total,
    )


@router.get("", response_model=List[OrderOut])
async def get_orders(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    status: Optional[OrderStatus] = Query(None, description="Filter by order status"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=500, description="Page size (max 500)"),
):
    """Get paginated list of orders for current tenant.

    Supports filtering by status and sorting by creation date (newest first).

    Args:
        db: Database session.
        current_user: Authenticated user.
        status: Optional filter by OrderStatus enum value.
        skip: Pagination offset (default: 0).
        limit: Page size (default: 100, max: 500).

    Returns:
        List[OrderOut]: Paginated orders with works, parts, and totals.
    """
    query = select(Order).where(Order.tenant_id == current_user.tenant_id)

    if status:
        query = query.where(Order.status == status)

    query = query.order_by(Order.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()

    return [_build_order_out(o) for o in orders]


@router.get("/kanban", response_model=dict)
async def get_kanban(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get all orders grouped by status for Kanban board view.

    Returns a dictionary where keys are status values and values
    are lists of orders in that status. Useful for drag-and-drop
    Kanban UI components.

    Args:
        db: Database session.
        current_user: Authenticated user.

    Returns:
        dict: {status_value: [OrderOut, ...]} for each status.
    """
    statuses = [OrderStatus.NEW, OrderStatus.DIAGNOSTICS, OrderStatus.IN_PROGRESS,
                OrderStatus.WAITING_PARTS, OrderStatus.READY, OrderStatus.COMPLETED]

    result = await db.execute(
        select(Order).where(Order.tenant_id == current_user.tenant_id)
    )
    all_orders = result.scalars().all()

    kanban = {}
    for status in statuses:
        orders = [o for o in all_orders if o.status == status]
        kanban[status.value] = [_build_order_out(o) for o in orders]

    return kanban


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get a single work order with all works and parts.

    Args:
        order_id: Order database ID.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        OrderOut: Complete order data with works, parts, and totals.

    Raises:
        HTTPException 404: Order not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ-наряд не найден")

    return _build_order_out(order)


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new work order.

    Validates that the car and client exist before creating the order.
    Auto-generates order number in format ON-YYYY-NNNNN.

    Args:
        data: OrderCreate with car_id, client_id, manager_id (required),
              and optional mechanic_id, type, description, notes, priority.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        OrderOut: Created order with auto-generated number and calculated totals.

    Raises:
        HTTPException 404: Car or client not found or belongs to another tenant.
    """
    # Verify car and client exist
    car_result = await db.execute(
        select(Car).where(Car.id == data.car_id, Car.tenant_id == current_user.tenant_id)
    )
    if not car_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    client_result = await db.execute(
        select(Client).where(Client.id == data.client_id, Client.tenant_id == current_user.tenant_id)
    )
    if not client_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Клиент не найден")

    # Generate order number
    count_result = await db.execute(
        select(func.count(Order.id)).where(Order.tenant_id == current_user.tenant_id)
    )
    order_num = count_result.scalar() or 0
    number = f"ON-{datetime.now().strftime('%Y')}-{str(order_num + 1).zfill(5)}"

    order = Order(
        number=number,
        car_id=data.car_id,
        client_id=data.client_id,
        manager_id=data.manager_id,
        mechanic_id=data.mechanic_id,
        type=data.type,
        description=data.description,
        notes=data.notes,
        priority=data.priority,
        status=OrderStatus.NEW,
        tenant_id=current_user.tenant_id,
    )

    db.add(order)
    await db.commit()
    await db.refresh(order)

    return _build_order_out(order)


@router.put("/{order_id}", response_model=OrderOut)
async def update_order(
    order_id: int,
    data: OrderUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Update an existing work order. Only provided fields are updated.

    Automatically tracks started_at and completed_at timestamps
    when status changes to IN_PROGRESS or COMPLETED.

    Args:
        order_id: Order database ID.
        data: OrderUpdate with fields to update (all optional).
        db: Database session.
        current_user: Authenticated user.

    Returns:
        OrderOut: Updated order data.

    Raises:
        HTTPException 404: Order not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ-наряд не найден")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(order, key, value)

    # Track timestamps
    if data.status == OrderStatus.IN_PROGRESS and not order.started_at:
        order.started_at = datetime.now(timezone.utc)
    if data.status == OrderStatus.COMPLETED:
        order.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(order)

    return _build_order_out(order)


# ===================== Order Works =====================


@router.put("/{order_id}/works", response_model=OrderOut)
async def update_order_works(
    order_id: int,
    works: List[OrderWorkCreate],
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Replace all works in an order.

    Deletes existing works and adds new ones in a single transaction.
    Useful when the UI sends the complete updated list.

    Args:
        order_id: Order database ID.
        works: List of OrderWorkCreate with name, price, hours, employee_id.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        OrderOut: Updated order with new works and recalculated totals.

    Raises:
        HTTPException 404: Order not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.tenant_id == current_user.tenant_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ-наряд не найден")

    # Delete existing works
    await db.execute(
        OrderWork.__table__.delete().where(OrderWork.order_id == order_id)
    )

    # Add new works
    for w_data in works:
        work = OrderWork(
            order_id=order_id,
            name=w_data.name,
            price=w_data.price,
            hours=w_data.hours,
            employee_id=w_data.employee_id,
            tenant_id=current_user.tenant_id,
        )
        db.add(work)

    await db.commit()
    await db.refresh(order)

    return _build_order_out(order)


# ===================== Order Parts =====================


@router.put("/{order_id}/parts", response_model=OrderOut)
async def update_order_parts(
    order_id: int,
    parts: List[OrderPartCreate],
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Replace all parts in an order.

    Deletes existing parts and adds new ones in a single transaction.

    Args:
        order_id: Order database ID.
        parts: List of OrderPartCreate with name, qty, price, sku, warehouse_part_id.
        db: Database session.
        current_user: Authenticated user.

    Returns:
        OrderOut: Updated order with new parts and recalculated totals.

    Raises:
        HTTPException 404: Order not found or belongs to another tenant.
    """
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.tenant_id == current_user.tenant_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ-наряд не найден")

    # Delete existing parts
    await db.execute(
        OrderPart.__table__.delete().where(OrderPart.order_id == order_id)
    )

    # Add new parts
    for p_data in parts:
        part = OrderPart(
            order_id=order_id,
            warehouse_part_id=p_data.warehouse_part_id,
            name=p_data.name,
            sku=p_data.sku,
            qty=p_data.qty,
            price=p_data.price,
            tenant_id=current_user.tenant_id,
        )
        db.add(part)

    await db.commit()
    await db.refresh(order)

    return _build_order_out(order)
