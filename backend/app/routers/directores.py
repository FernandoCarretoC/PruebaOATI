from fastapi import APIRouter, Depends, HTTPException, status
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
    try:
        return director_service.get_director(db, director_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


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
    try:
        return director_service.update_director(db, director_id, data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.delete("/{director_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_director(director_id: int, db: Session = Depends(get_db)) -> None:
    try:
        director_service.delete_director(db, director_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
