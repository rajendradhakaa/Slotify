from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/user", tags=["User"])


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id=1)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/me", response_model=schemas.UserResponse)
def update_current_user(data: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = crud.update_user(db, user_id=1, name=data.name, timezone=data.timezone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
