from sqlalchemy import String, Text, Integer, Boolean, Enum as SAEnum, DECIMAL, ForeignKey, DateTime, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

from app.core.database import Base
from app.core.mixins import TimestampMixin
import enum


# ===================== Enums =====================


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    MECHANIC = "mechanic"


class EmployeeStatus(str, enum.Enum):
    ACTIVE = "active"
    BUSY = "busy"
    OFF = "off"


class OrderStatus(str, enum.Enum):
    NEW = "new"
    DIAGNOSTICS = "diagnostics"
    IN_PROGRESS = "in_progress"
    WAITING_PARTS = "waiting_parts"
    READY = "ready"
    COMPLETED = "completed"


class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    TRANSFER = "transfer"


# ===================== Base Tenant Model =====================


class TenantModel(Base, TimestampMixin):
    """Base model with tenant_id for multi-tenancy."""
    __abstract__ = True

    tenant_id: Mapped[int] = mapped_column(Integer, nullable=False)


# ===================== Users =====================


class User(TenantModel):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    login: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.MANAGER)
    phone: Mapped[str] = mapped_column(String(20), default="")
    specialty: Mapped[str] = mapped_column(String(100), default="")
    status: Mapped[EmployeeStatus] = mapped_column(SAEnum(EmployeeStatus), default=EmployeeStatus.ACTIVE)

    # Relationships
    orders_created: list["Order"] = relationship("Order", back_populates="manager", foreign_keys="Order.manager_id")
    orders_assigned: list["Order"] = relationship("Order", back_populates="mechanic", foreign_keys="Order.mechanic_id")
    works_done: list["OrderWork"] = relationship("OrderWork", back_populates="employee")

    __table_args__ = (
        Index("ix_users_tenant", "tenant_id"),
    )


# ===================== Clients =====================


class Client(TenantModel):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), default="")
    email: Mapped[str] = mapped_column(String(150), default="")
    company: Mapped[str] = mapped_column(String(200), default="")
    address: Mapped[str] = mapped_column(String(300), default="")
    notes: Mapped[str] = mapped_column(Text, default="")

    # Relationships
    cars: list["Car"] = relationship("Car", back_populates="client", cascade="all, delete-orphan")
    orders: list["Order"] = relationship("Order", back_populates="client", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_clients_tenant", "tenant_id"),
        Index("ix_clients_phone", "tenant_id", "phone"),
    )


# ===================== Cars =====================


class Car(TenantModel):
    __tablename__ = "cars"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    client_id: Mapped[int] = mapped_column(Integer, ForeignKey("clients.id"), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    year: Mapped[int] = mapped_column(Integer, default=0)
    vin: Mapped[str] = mapped_column(String(50), default="")
    plate: Mapped[str] = mapped_column(String(20), default="")
    color: Mapped[str] = mapped_column(String(50), default="")
    mileage: Mapped[int] = mapped_column(Integer, default=0)
    image: Mapped[str] = mapped_column(String(500), default="")

    # Relationships
    client: Mapped["Client"] = relationship("Client", back_populates="cars")
    orders: list["Order"] = relationship("Order", back_populates="car", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_cars_tenant", "tenant_id"),
        Index("ix_cars_plate", "tenant_id", "plate"),
        Index("ix_cars_vin", "tenant_id", "vin"),
    )


# ===================== Orders =====================


class Order(TenantModel):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    car_id: Mapped[int] = mapped_column(Integer, ForeignKey("cars.id"), nullable=False)
    client_id: Mapped[int] = mapped_column(Integer, ForeignKey("clients.id"), nullable=False)
    manager_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    mechanic_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    type: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[OrderStatus] = mapped_column(SAEnum(OrderStatus), default=OrderStatus.NEW)
    priority: Mapped[Priority] = mapped_column(SAEnum(Priority), default=Priority.MEDIUM)
    description: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    car: Mapped["Car"] = relationship("Car", back_populates="orders")
    client: Mapped["Client"] = relationship("Order", back_populates="orders")
    manager: Mapped["User"] = relationship("User", back_populates="orders_created", foreign_keys=[manager_id])
    mechanic: Mapped["User"] = relationship("User", back_populates="orders_assigned", foreign_keys=[mechanic_id])
    works: list["OrderWork"] = relationship("OrderWork", back_populates="order", cascade="all, delete-orphan")
    parts: list["OrderPart"] = relationship("OrderPart", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_orders_tenant", "tenant_id"),
        Index("ix_orders_status", "tenant_id", "status"),
        Index("ix_orders_created", "tenant_id", "created_at"),
    )


# ===================== Order Works =====================


class OrderWork(TenantModel):
    __tablename__ = "order_works"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[float] = mapped_column(DECIMAL(10, 2), default=0)
    hours: Mapped[float] = mapped_column(DECIMAL(5, 2), default=0)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    employee_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="works")
    employee: Mapped["User"] = relationship("OrderWork", back_populates="works_done")

    __table_args__ = (
        Index("ix_order_works_tenant", "tenant_id"),
    )


# ===================== Order Parts =====================


class OrderPart(TenantModel):
    __tablename__ = "order_parts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), nullable=False)
    warehouse_part_id: Mapped[int] = mapped_column(Integer, ForeignKey("warehouse_parts.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), default="")
    qty: Mapped[float] = mapped_column(DECIMAL(10, 2), default=1)
    price: Mapped[float] = mapped_column(DECIMAL(10, 2), default=0)
    ordered: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="parts")

    __table_args__ = (
        Index("ix_order_parts_tenant", "tenant_id"),
    )


# ===================== Warehouse Parts =====================


class WarehousePart(TenantModel):
    __tablename__ = "warehouse_parts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), default="")
    category: Mapped[str] = mapped_column(String(100), default="")
    qty: Mapped[int] = mapped_column(Integer, default=0)
    min_qty: Mapped[int] = mapped_column(Integer, default=5)
    buy_price: Mapped[float] = mapped_column(DECIMAL(10, 2), default=0)
    sell_price: Mapped[float] = mapped_column(DECIMAL(10, 2), default=0)
    notes: Mapped[str] = mapped_column(Text, default="")

    __table_args__ = (
        Index("ix_warehouse_tenant", "tenant_id"),
        Index("ix_warehouse_sku", "tenant_id", "sku"),
    )


# ===================== Finance =====================


class FinanceEntry(TenantModel):
    __tablename__ = "finance_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), nullable=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # income / expense
    amount: Mapped[float] = mapped_column(DECIMAL(12, 2), default=0)
    method: Mapped[PaymentMethod] = mapped_column(SAEnum(PaymentMethod), default=PaymentMethod.CASH)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")
    description: Mapped[str] = mapped_column(Text, default="")

    __table_args__ = (
        Index("ix_finance_tenant", "tenant_id"),
        Index("ix_finance_date", "tenant_id", "date"),
    )
