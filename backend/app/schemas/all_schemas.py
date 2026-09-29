from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ===================== Enums =====================


class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    MECHANIC = "mechanic"


class EmployeeStatus(str, Enum):
    ACTIVE = "active"
    BUSY = "busy"
    OFF = "off"


class OrderStatus(str, Enum):
    NEW = "new"
    DIAGNOSTICS = "diagnostics"
    IN_PROGRESS = "in_progress"
    WAITING_PARTS = "waiting_parts"
    READY = "ready"
    COMPLETED = "completed"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    TRANSFER = "transfer"


# ===================== Auth =====================


class LoginRequest(BaseModel):
    login: str
    password: str


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    login: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    phone: Optional[str] = ""


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    login: str
    role: UserRole
    phone: str
    specialty: str
    status: EmployeeStatus

    model_config = {"from_attributes": True}


# ===================== Clients =====================


class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    phone: Optional[str] = ""
    email: Optional[str] = ""
    company: Optional[str] = ""
    address: Optional[str] = ""
    notes: Optional[str] = ""


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class ClientOut(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    company: str
    address: str
    notes: str
    car_count: int = 0
    order_count: int = 0

    model_config = {"from_attributes": True}


# ===================== Cars =====================


class CarCreate(BaseModel):
    client_id: int
    brand: str = Field(..., min_length=1, max_length=100)
    model: str = Field(..., min_length=1, max_length=100)
    year: Optional[int] = 0
    vin: Optional[str] = ""
    plate: Optional[str] = ""
    color: Optional[str] = ""
    mileage: Optional[int] = 0
    image: Optional[str] = ""


class CarUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vin: Optional[str] = None
    plate: Optional[str] = None
    color: Optional[str] = None
    mileage: Optional[int] = None
    image: Optional[str] = None


class CarOut(BaseModel):
    id: int
    client_id: int
    brand: str
    model: str
    year: int
    vin: str
    plate: str
    color: str
    mileage: int
    image: str

    model_config = {"from_attributes": True}


# ===================== Order Works =====================


class OrderWorkCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = 0
    hours: float = 0
    employee_id: Optional[int] = None


class OrderWorkUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    hours: Optional[float] = None
    done: Optional[bool] = None
    employee_id: Optional[int] = None


# ===================== Order Parts =====================


class OrderPartCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    qty: float = 1
    price: float = 0
    warehouse_part_id: Optional[int] = None
    sku: Optional[str] = ""


class OrderPartUpdate(BaseModel):
    name: Optional[str] = None
    qty: Optional[float] = None
    price: Optional[float] = None
    ordered: Optional[bool] = None


# ===================== Orders =====================


class OrderCreate(BaseModel):
    car_id: int
    client_id: int
    manager_id: int
    mechanic_id: Optional[int] = None
    type: str = ""
    description: str = ""
    notes: str = ""
    priority: Priority = Priority.MEDIUM


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    priority: Optional[Priority] = None
    mechanic_id: Optional[int] = None
    description: Optional[str] = None
    notes: Optional[str] = None


class OrderWorkOut(BaseModel):
    id: int
    name: str
    price: float
    hours: float
    done: bool
    employee_id: Optional[int]

    model_config = {"from_attributes": True}


class OrderPartOut(BaseModel):
    id: int
    name: str
    qty: float
    price: float
    ordered: bool
    sku: str

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    number: str
    car_id: int
    client_id: int
    manager_id: int
    mechanic_id: Optional[int]
    type: str
    status: OrderStatus
    priority: Priority
    description: str
    notes: str
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    works: list[OrderWorkOut] = []
    parts: list[OrderPartOut] = []
    total_works: float = 0
    total_parts: float = 0
    total: float = 0

    model_config = {"from_attributes": True}


# ===================== Warehouse =====================


class WarehousePartCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: Optional[str] = ""
    category: Optional[str] = ""
    qty: int = 0
    min_qty: int = 5
    buy_price: float = 0
    sell_price: float = 0
    notes: Optional[str] = ""


class WarehousePartUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    qty: Optional[int] = None
    min_qty: Optional[int] = None
    buy_price: Optional[float] = None
    sell_price: Optional[float] = None
    notes: Optional[str] = None


class WarehousePartOut(BaseModel):
    id: int
    name: str
    sku: str
    category: str
    qty: int
    min_qty: int
    buy_price: float
    sell_price: float
    notes: str

    model_config = {"from_attributes": True}


# ===================== Finance =====================


class FinanceEntryCreate(BaseModel):
    order_id: Optional[int] = None
    type: str = Field(..., pattern="^(income|expense)$")
    amount: float = Field(..., gt=0)
    method: PaymentMethod = PaymentMethod.CASH
    description: str = ""


class FinanceEntryOut(BaseModel):
    id: int
    order_id: Optional[int]
    type: str
    amount: float
    method: PaymentMethod
    date: datetime
    description: str

    model_config = {"from_attributes": True}


# ===================== Dashboard Stats =====================


class DashboardStats(BaseModel):
    today_revenue: float = 0
    today_orders: int = 0
    active_orders: int = 0
    revenue_month: float = 0
    avg_check: float = 0
    completed_month: int = 0
    total_clients: int = 0
    total_cars: int = 0
    revenue_trend: str = ""
    orders_trend: str = ""


class MonthlyRevenue(BaseModel):
    month: str
    revenue: float


# ===================== Work Templates =====================


class WorkTemplateItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = 0
    hours: float = 0
    part_name: Optional[str] = ""
    part_qty: float = 0
    part_price: float = 0


class WorkTemplateItemOut(BaseModel):
    id: int
    name: str
    price: float
    hours: float
    part_name: str
    part_qty: float
    part_price: float

    model_config = {"from_attributes": True}


class WorkTemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = ""
    is_default: bool = False
    items: Optional[List[WorkTemplateItemCreate]] = []


class WorkTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_default: Optional[bool] = None
    items: Optional[List[WorkTemplateItemCreate]] = None


class WorkTemplateOut(BaseModel):
    id: int
    name: str
    description: str
    is_default: bool
    items: List[WorkTemplateItemOut] = []

    model_config = {"from_attributes": True}
