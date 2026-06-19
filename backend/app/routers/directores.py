from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.director import DirectorCreate, DirectorResponse, DirectorUpdate
from app.services.director_service import director_service

router = APIRouter(prefix="/api/directores", tags=["directores"])


@router.get("", response_model=list[DirectorResponse])
def list_directores(db: Session = Depends(get_db)) -> list[DirectorResponse]:
    return director_service.list_directores(db)


@router.get("/{director_id}", response_model=DirectorResponse)
def get_director(
    director_id: int, db: Session = Depends(get_db)
) -> DirectorResponse:
    return director_service.get_director(db, director_id)


@router.post("", response_model=DirectorResponse, status_code=status.HTTP_201_CREATED)
def create_director(
    data: DirectorCreate,
    db: Session = Depends(get_db),
) -> DirectorResponse:
    return director_service.create_director(db, data)


@router.put("/{director_id}", response_model=DirectorResponse)
def update_director(
    director_id: int,
    data: DirectorUpdate,
    db: Session = Depends(get_db),
) -> DirectorResponse:
    return director_service.update_director(db, director_id, data)


@router.delete("/{director_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_director(director_id: int, db: Session = Depends(get_db)) -> None:
    director_service.delete_director(db, director_id)
