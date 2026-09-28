from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.all_models import WorkTemplate, WorkTemplateItem, User
from app.schemas.all_schemas import (
    WorkTemplateCreate, WorkTemplateUpdate, WorkTemplateOut,
    WorkTemplateItemCreate, WorkTemplateItemOut,
)

router = APIRouter(prefix="/api/templates", tags=["Work Templates"])


@router.get("", response_model=List[WorkTemplateOut])
async def get_templates(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None),
):
    """Get all work templates for tenant."""
    query = select(WorkTemplate).where(
        WorkTemplate.tenant_id == current_user.tenant_id
    )

    if search:
        ilike_search = f"%{search}%"
        query = query.where(WorkTemplate.name.ilike(ilike_search))

    query = query.order_by(WorkTemplate.is_default.desc(), WorkTemplate.name)
    result = await db.execute(query)
    templates = result.scalars().all()

    output = []
    for t in templates:
        items_result = await db.execute(
            select(WorkTemplateItem)
            .where(WorkTemplateItem.template_id == t.id, WorkTemplateItem.tenant_id == current_user.tenant_id)
        )
        items = items_result.scalars().all()

        output.append(WorkTemplateOut(
            id=t.id,
            name=t.name,
            description=t.description,
            is_default=t.is_default,
            items=[
                WorkTemplateItemOut(
                    id=i.id,
                    name=i.name,
                    price=float(i.price),
                    hours=float(i.hours),
                    part_name=i.part_name,
                    part_qty=float(i.part_qty),
                    part_price=float(i.part_price),
                )
                for i in items
            ],
        ))

    return output


@router.get("/{template_id}", response_model=WorkTemplateOut)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Get single template with items."""
    result = await db.execute(
        select(WorkTemplate).where(
            WorkTemplate.id == template_id,
            WorkTemplate.tenant_id == current_user.tenant_id,
        )
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не найден")

    items_result = await db.execute(
        select(WorkTemplateItem).where(
            WorkTemplateItem.template_id == template.id,
            WorkTemplateItem.tenant_id == current_user.tenant_id,
        )
    )
    items = items_result.scalars().all()

    return WorkTemplateOut(
        id=template.id,
        name=template.name,
        description=template.description,
        is_default=template.is_default,
        items=[
            WorkTemplateItemOut(
                id=i.id,
                name=i.name,
                price=float(i.price),
                hours=float(i.hours),
                part_name=i.part_name,
                part_qty=float(i.part_qty),
                part_price=float(i.part_price),
            )
            for i in items
        ],
    )


@router.post("", response_model=WorkTemplateOut, status_code=201)
async def create_template(
    data: WorkTemplateCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new work template."""
    template = WorkTemplate(
        name=data.name,
        description=data.description or "",
        is_default=data.is_default,
        tenant_id=current_user.tenant_id,
    )

    db.add(template)
    await db.flush()

    if data.items:
        for item_data in data.items:
            item = WorkTemplateItem(
                template_id=template.id,
                name=item_data.name,
                price=item_data.price,
                hours=item_data.hours,
                part_name=item_data.part_name or "",
                part_qty=item_data.part_qty or 0,
                part_price=item_data.part_price or 0,
                tenant_id=current_user.tenant_id,
            )
            db.add(item)

    await db.commit()
    await db.refresh(template)

    # Fetch items
    items_result = await db.execute(
        select(WorkTemplateItem).where(
            WorkTemplateItem.template_id == template.id,
            WorkTemplateItem.tenant_id == current_user.tenant_id,
        )
    )
    items = items_result.scalars().all()

    return WorkTemplateOut(
        id=template.id,
        name=template.name,
        description=template.description,
        is_default=template.is_default,
        items=[
            WorkTemplateItemOut(
                id=i.id,
                name=i.name,
                price=float(i.price),
                hours=float(i.hours),
                part_name=i.part_name,
                part_qty=float(i.part_qty),
                part_price=float(i.part_price),
            )
            for i in items
        ],
    )


@router.put("/{template_id}", response_model=WorkTemplateOut)
async def update_template(
    template_id: int,
    data: WorkTemplateUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Update template and replace items."""
    result = await db.execute(
        select(WorkTemplate).where(
            WorkTemplate.id == template_id,
            WorkTemplate.tenant_id == current_user.tenant_id,
        )
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не найден")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(template, key, value)

    # Replace items
    await db.execute(
        WorkTemplateItem.__table__.delete().where(
            WorkTemplateItem.template_id == template_id
        )
    )

    if data.items:
        for item_data in data.items:
            item = WorkTemplateItem(
                template_id=template.id,
                name=item_data.name,
                price=item_data.price,
                hours=item_data.hours,
                part_name=item_data.part_name or "",
                part_qty=item_data.part_qty or 0,
                part_price=item_data.part_price or 0,
                tenant_id=current_user.tenant_id,
            )
            db.add(item)

    await db.commit()
    await db.refresh(template)

    items_result = await db.execute(
        select(WorkTemplateItem).where(
            WorkTemplateItem.template_id == template.id,
            WorkTemplateItem.tenant_id == current_user.tenant_id,
        )
    )
    items = items_result.scalars().all()

    return WorkTemplateOut(
        id=template.id,
        name=template.name,
        description=template.description,
        is_default=template.is_default,
        items=[
            WorkTemplateItemOut(
                id=i.id,
                name=i.name,
                price=float(i.price),
                hours=float(i.hours),
                part_name=i.part_name,
                part_qty=float(i.part_qty),
                part_price=float(i.part_price),
            )
            for i in items
        ],
    )


@router.delete("/{template_id}", status_code=204)
async def delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a template."""
    result = await db.execute(
        select(WorkTemplate).where(
            WorkTemplate.id == template_id,
            WorkTemplate.tenant_id == current_user.tenant_id,
        )
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не найден")

    await db.delete(template)
    await db.commit()
