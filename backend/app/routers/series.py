from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.director import AsignarDirectorBody
from app.schemas.serie import SerieCreate, SerieResponse, SerieUpdate
from app.services.director_service import director_service
from app.services.serie_service import serie_service

router = APIRouter(prefix="/api/series", tags=["series"])


@router.get("", response_model=list[SerieResponse])
def list_series(db: Session = Depends(get_db)) -> list[SerieResponse]:
    return serie_service.list_series(db)


@router.get("/{serie_id}", response_model=SerieResponse)
def get_serie(serie_id: int, db: Session = Depends(get_db)) -> SerieResponse:
    return serie_service.get_serie(db, serie_id)


@router.post("", response_model=SerieResponse, status_code=status.HTTP_201_CREATED)
def create_serie(
    data: SerieCreate,
    db: Session = Depends(get_db),
) -> SerieResponse:
    return serie_service.create_serie(db, data)


@router.put("/{serie_id}", response_model=SerieResponse)
def update_serie(
    serie_id: int,
    data: SerieUpdate,
    db: Session = Depends(get_db),
) -> SerieResponse:
    return serie_service.update_serie(db, serie_id, data)


@router.delete("/{serie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_serie(serie_id: int, db: Session = Depends(get_db)) -> None:
    serie_service.delete_serie(db, serie_id)


@router.post(
    "/{serie_id}/directores/{director_id}",
    response_model=SerieResponse,
    status_code=status.HTTP_200_OK,
)
def assign_director_to_serie(
    serie_id: int,
    director_id: int,
    data: AsignarDirectorBody | None = None,
    db: Session = Depends(get_db),
) -> SerieResponse:
    return director_service.assign_director_to_serie(
        db, serie_id, director_id, data
    )


@router.delete(
    "/{serie_id}/directores/{director_id}",
    response_model=SerieResponse,
)
def unassign_director_from_serie(
    serie_id: int,
    director_id: int,
    db: Session = Depends(get_db),
) -> SerieResponse:
    return director_service.unassign_director_from_serie(db, serie_id, director_id)
