from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/event-types", tags=["Event Types"])


@router.get("", response_model=list[schemas.EventTypeResponse])
def list_event_types(db: Session = Depends(get_db)):
    return crud.get_event_types(db)


@router.post("", response_model=schemas.EventTypeResponse, status_code=201)
def create_event_type(data: schemas.EventTypeCreate, db: Session = Depends(get_db)):
    # Check slug uniqueness
    existing = crud.get_event_type_by_slug(db, data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    return crud.create_event_type(
        db, user_id=1, name=data.name, duration=data.duration,
        slug=data.slug, color=data.color, is_active=data.is_active
    )


@router.get("/{event_type_id}", response_model=schemas.EventTypeResponse)
def get_event_type(event_type_id: int, db: Session = Depends(get_db)):
    et = crud.get_event_type(db, event_type_id)
    if not et:
        raise HTTPException(status_code=404, detail="Event type not found")
    return et


@router.put("/{event_type_id}", response_model=schemas.EventTypeResponse)
def update_event_type(event_type_id: int, data: schemas.EventTypeUpdate, db: Session = Depends(get_db)):
    # Check slug uniqueness if changing
    if data.slug:
        existing = crud.get_event_type_by_slug(db, data.slug)
        if existing and existing.id != event_type_id:
            raise HTTPException(status_code=400, detail="Slug already exists")
    et = crud.update_event_type(db, event_type_id, **data.model_dump(exclude_unset=True))
    if not et:
        raise HTTPException(status_code=404, detail="Event type not found")
    return et


@router.delete("/{event_type_id}", status_code=204)
def delete_event_type(event_type_id: int, db: Session = Depends(get_db)):
    success = crud.delete_event_type(db, event_type_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event type not found")
    return None


@router.get("/slug/{slug}", response_model=schemas.EventTypeResponse)
def get_event_type_by_slug(slug: str, db: Session = Depends(get_db)):
    et = crud.get_event_type_by_slug(db, slug)
    if not et:
        raise HTTPException(status_code=404, detail="Event type not found")
    return et
