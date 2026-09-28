from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime, timedelta

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.all_models import FinanceEntry, Order, User
from app.schemas.all_schemas import (
    FinanceEntryCreate, FinanceEntryOut,
    DashboardStats, MonthlyRevenue,
)

router = APIRouter(prefix="/api", tags=["Finance & Dashboard"])


# ===================== Finance =====================


@router.get("/finance", response_model=List[FinanceEntryOut])
async def get_finance(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
):
    """Get finance entries with filters."""
    query = select(FinanceEntry).where(
        FinanceEntry.tenant_id == current_user.tenant_id
    )

    if type:
        query = query.where(FinanceEntry.type == type)

    if start_date:
        query = query.where(FinanceEntry.date >= datetime.fromisoformat(start_date))

    if end_date:
        query = query.where(FinanceEntry.date <= datetime.fromisoformat(end_date))

    query = query.order_by(FinanceEntry.date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    entries = result.scalars().all()

    return [FinanceEntryOut.model_validate(e) for e in entries]


@router.post("/finance", response_model=FinanceEntryOut, status_code=201)
async def create_finance(
    data: FinanceEntryCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Create a finance entry (income or expense)."""
    entry = FinanceEntry(
        order_id=data.order_id,
        type=data.type,
        amount=data.amount,
        method=data.method,
        description=data.description or "",
        tenant_id=current_user.tenant_id,
    )

    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    return FinanceEntryOut.model_validate(entry)


@router.get("/finance/summary")
async def get_finance_summary(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get finance summary for current month."""
    now = datetime.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0)
    start_of_last_month = (now.replace(day=1) - timedelta(days=1)).replace(day=1)

    # Current month
    result = await db.execute(
        select(func.sum(FinanceEntry.amount))
        .where(
            FinanceEntry.tenant_id == current_user.tenant_id,
            FinanceEntry.date >= start_of_month,
            FinanceEntry.type == "income",
        )
    )
    income_month = result.scalar() or 0

    result = await db.execute(
        select(func.sum(FinanceEntry.amount))
        .where(
            FinanceEntry.tenant_id == current_user.tenant_id,
            FinanceEntry.date >= start_of_month,
            FinanceEntry.type == "expense",
        )
    )
    expense_month = result.scalar() or 0

    # Last month
    result = await db.execute(
        select(func.sum(FinanceEntry.amount))
        .where(
            FinanceEntry.tenant_id == current_user.tenant_id,
            FinanceEntry.date >= start_of_last_month,
            FinanceEntry.date < start_of_month,
            FinanceEntry.type == "income",
        )
    )
    income_last = result.scalar() or 0

    trend = ""
    if income_last > 0:
        change = ((income_month - income_last) / income_last) * 100
        trend = f"{change:+.0f}%"

    return {
        "income_month": income_month,
        "expense_month": expense_month,
        "profit": income_month - expense_month,
        "trend": trend,
    }


# ===================== Dashboard =====================


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard statistics."""
    now = datetime.now()
    today = now.replace(hour=0, minute=0, second=0)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0)
    start_of_last_month = (now.replace(day=1) - timedelta(days=1)).replace(day=1)

    # Today's revenue
    result = await db.execute(
        select(func.sum(FinanceEntry.amount))
        .where(
            FinanceEntry.tenant_id == current_user.tenant_id,
            FinanceEntry.date >= today,
            FinanceEntry.type == "income",
        )
    )
    today_revenue = result.scalar() or 0

    # Today's orders
    result = await db.execute(
        select(func.count(Order.id))
        .where(
            Order.tenant_id == current_user.tenant_id,
            Order.created_at >= today,
        )
    )
    today_orders = result.scalar() or 0

    # Active orders
    from app.models.all_models import OrderStatus
    active_statuses = [OrderStatus.NEW, OrderStatus.DIAGNOSTICS, OrderStatus.IN_PROGRESS,
                       OrderStatus.WAITING_PARTS, OrderStatus.READY]
    result = await db.execute(
        select(func.count(Order.id))
        .where(
            Order.tenant_id == current_user.tenant_id,
            Order.status.in_(active_statuses),
        )
    )
    active_orders = result.scalar() or 0

    # Month revenue
    result = await db.execute(
        select(func.sum(FinanceEntry.amount))
        .where(
            FinanceEntry.tenant_id == current_user.tenant_id,
            FinanceEntry.date >= start_of_month,
            FinanceEntry.type == "income",
        )
    )
    revenue_month = result.scalar() or 0

    # Avg check
    result = await db.execute(
        select(func.count(Order.id))
        .where(
            Order.tenant_id == current_user.tenant_id,
            Order.status == OrderStatus.COMPLETED,
            Order.completed_at >= start_of_month,
        )
    )
    completed_count = result.scalar() or 0
    avg_check = revenue_month / completed_count if completed_count > 0 else 0

    # Completed this month
    result = await db.execute(
        select(func.count(Order.id))
        .where(
            Order.tenant_id == current_user.tenant_id,
            Order.status == OrderStatus.COMPLETED,
            Order.completed_at >= start_of_month,
        )
    )
    completed_month = result.scalar() or 0

    # Total clients and cars
    from app.models.all_models import Client, Car
    result = await db.execute(
        select(func.count(Client.id))
        .where(Client.tenant_id == current_user.tenant_id)
    )
    total_clients = result.scalar() or 0

    result = await db.execute(
        select(func.count(Car.id))
        .where(Car.tenant_id == current_user.tenant_id)
    )
    total_cars = result.scalar() or 0

    # Revenue trend (vs last month)
    result = await db.execute(
        select(func.sum(FinanceEntry.amount))
        .where(
            FinanceEntry.tenant_id == current_user.tenant_id,
            FinanceEntry.date >= start_of_last_month,
            FinanceEntry.date < start_of_month,
            FinanceEntry.type == "income",
        )
    )
    revenue_last = result.scalar() or 0
    revenue_trend = ""
    if revenue_last > 0:
        change = ((revenue_month - revenue_last) / revenue_last) * 100
        revenue_trend = f"{change:+.0f}%"

    return DashboardStats(
        today_revenue=today_revenue,
        today_orders=today_orders,
        active_orders=active_orders,
        revenue_month=revenue_month,
        avg_check=avg_check,
        completed_month=completed_month,
        total_clients=total_clients,
        total_cars=total_cars,
        revenue_trend=revenue_trend,
        orders_trend="",
    )


@router.get("/dashboard/monthly-revenue", response_model=List[MonthlyRevenue])
async def get_monthly_revenue(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get monthly revenue for the last 6 months."""
    now = datetime.now()
    months = []
    for i in range(5, -1, -1):
        month_date = now.replace(day=1) - timedelta(days=32 * i)
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0)
        month_end = (month_start + timedelta(days=32)).replace(hour=23, minute=59, second=59)
        month_name = month_start.strftime("%b")

        result = await db.execute(
            select(func.sum(FinanceEntry.amount))
            .where(
                FinanceEntry.tenant_id == current_user.tenant_id,
                FinanceEntry.date >= month_start,
                FinanceEntry.date <= month_end,
                FinanceEntry.type == "income",
            )
        )
        revenue = result.scalar() or 0

        months.append(MonthlyRevenue(
            month=month_name,
            revenue=revenue,
        ))

    return months
