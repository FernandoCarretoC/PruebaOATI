from sqlalchemy.orm import Session

from app.repositories import serie_repository
from app.schemas.serie import SerieCreate, SerieResponse, SerieUpdate, serie_to_response


class SerieService:
    def list_series(self, db: Session) -> list[SerieResponse]:
        series = serie_repository.get_all(db)
        return [serie_to_response(serie) for serie in series]

    def get_serie(self, db: Session, serie_id: int) -> SerieResponse:
        serie = serie_repository.get_by_id(db, serie_id)
        if serie is None:
            raise ValueError(f"Serie con id {serie_id} no encontrada")
        return serie_to_response(serie)

    def create_serie(self, db: Session, data: SerieCreate) -> SerieResponse:
        serie = serie_repository.create(db, data)
        serie = serie_repository.get_by_id(db, serie.id)
        if serie is None:
            raise ValueError("No fue posible recuperar la serie creada")
        return serie_to_response(serie)

    def update_serie(
        self, db: Session, serie_id: int, data: SerieUpdate
    ) -> SerieResponse:
        serie = serie_repository.get_by_id(db, serie_id)
        if serie is None:
            raise ValueError(f"Serie con id {serie_id} no encontrada")
        serie = serie_repository.update(db, serie, data)
        return serie_to_response(serie)

    def delete_serie(self, db: Session, serie_id: int) -> None:
        serie = serie_repository.get_by_id(db, serie_id)
        if serie is None:
            raise ValueError(f"Serie con id {serie_id} no encontrada")
        serie_repository.soft_delete(db, serie)


serie_service = SerieService()
