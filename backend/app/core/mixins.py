"""SQLAlchemy model mixins.

Reusable column definitions for common patterns.
Mixins are combined with base models using multiple inheritance.
"""

from datetime import datetime, timezone
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column


class TimestampMixin:
    """Adds created_at and updated_at timestamp columns.

    Usage in a model:

        class MyModel(Base, TimestampMixin):
            __tablename__ = "my_table"
            id: Mapped[int] = mapped_column(Integer, primary_key=True)
            # ... other fields ...

    Columns:
        created_at: Set automatically on insert (server-side default).
        updated_at: Set automatically on insert and updated on every change.
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
