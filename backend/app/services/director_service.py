from sqlalchemy.orm import Session

from app.core.exceptions import (
    AsignacionNotFoundError,
    DirectorNotFoundError,
    DirectorYaAsignadoError,
    SerieNotFoundError,
)
from app.repositories import director_repository, serie_repository
from app.schemas.director import (
    AsignarDirectorBody,
    DirectorCreate,
    DirectorResponse,
    DirectorUpdate,
    director_to_response,
)
from app.schemas.serie import SerieResponse, serie_to_response


class DirectorService:
    def list_directores(self, db: Session) -> list[DirectorResponse]:
        directores = director_repository.get_all(db)
        return [director_to_response(director) for director in directores]

    def get_director(self, db: Session, director_id: int) -> DirectorResponse:
        director = director_repository.get_by_id(db, director_id)
        if director is None:
            raise DirectorNotFoundError(
                f"Director con id {director_id} no encontrado"
            )
        return director_to_response(director)

    def create_director(self, db: Session, data: DirectorCreate) -> DirectorResponse:
        director = director_repository.create(db, data)
        director = director_repository.get_by_id(db, director.id)
        if director is None:
            raise DirectorNotFoundError(
                "No fue posible recuperar el director creado"
            )
        return director_to_response(director)

    def update_director(
        self, db: Session, director_id: int, data: DirectorUpdate
    ) -> DirectorResponse:
        director = director_repository.get_by_id(db, director_id)
        if director is None:
            raise DirectorNotFoundError(
                f"Director con id {director_id} no encontrado"
            )
        director = director_repository.update(db, director, data)
        return director_to_response(director)

    def delete_director(self, db: Session, director_id: int) -> None:
        director = director_repository.get_by_id(db, director_id)
        if director is None:
            raise DirectorNotFoundError(
                f"Director con id {director_id} no encontrado"
            )
        director_repository.soft_delete(db, director)

    def assign_director_to_serie(
        self,
        db: Session,
        serie_id: int,
        director_id: int,
        data: AsignarDirectorBody | None = None,
    ) -> SerieResponse:
        serie = serie_repository.get_by_id(db, serie_id)
        if serie is None:
            raise SerieNotFoundError(f"Serie con id {serie_id} no encontrada")

        director = director_repository.get_by_id(db, director_id)
        if director is None:
            raise DirectorNotFoundError(
                f"Director con id {director_id} no encontrado"
            )

        if director_repository.get_assignment(db, serie_id, director_id) is not None:
            raise DirectorYaAsignadoError(
                f"El director {director_id} ya esta asignado a la serie {serie_id}"
            )

        rol = data.rol if data else None
        director_repository.assign_director(db, serie_id, director_id, rol)

        serie = serie_repository.get_by_id(db, serie_id)
        if serie is None:
            raise SerieNotFoundError(f"Serie con id {serie_id} no encontrada")
        return serie_to_response(serie)

    def unassign_director_from_serie(
        self, db: Session, serie_id: int, director_id: int
    ) -> SerieResponse:
        serie = serie_repository.get_by_id(db, serie_id)
        if serie is None:
            raise SerieNotFoundError(f"Serie con id {serie_id} no encontrada")

        asignacion = director_repository.get_assignment(db, serie_id, director_id)
        if asignacion is None:
            raise AsignacionNotFoundError(
                f"No existe asignacion activa del director {director_id} "
                f"a la serie {serie_id}"
            )

        director_repository.unassign_director(db, asignacion)

        serie = serie_repository.get_by_id(db, serie_id)
        if serie is None:
            raise SerieNotFoundError(f"Serie con id {serie_id} no encontrada")
        return serie_to_response(serie)


director_service = DirectorService()
