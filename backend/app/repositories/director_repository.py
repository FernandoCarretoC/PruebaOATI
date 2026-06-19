from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.director import Director
from app.models.serie_director import SerieDirector
from app.schemas.director import DirectorCreate, DirectorUpdate


def get_all(db: Session) -> list[Director]:
    stmt = (
        select(Director)
        .where(Director.deleted_at.is_(None))
        .options(
            selectinload(Director.serie_directores).selectinload(SerieDirector.serie)
        )
        .order_by(Director.id)
    )
    return list(db.scalars(stmt).all())


def get_by_id(db: Session, director_id: int) -> Director | None:
    stmt = (
        select(Director)
        .where(Director.id == director_id, Director.deleted_at.is_(None))
        .options(
            selectinload(Director.serie_directores).selectinload(SerieDirector.serie)
        )
    )
    return db.scalars(stmt).first()


def create(db: Session, data: DirectorCreate) -> Director:
    director = Director(**data.model_dump())
    db.add(director)
    db.commit()
    db.refresh(director)
    return director


def update(db: Session, director: Director, data: DirectorUpdate) -> Director:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(director, field, value)
    db.commit()
    db.refresh(director)
    return get_by_id(db, director.id) or director


def soft_delete(db: Session, director: Director) -> None:
    director.deleted_at = datetime.now(timezone.utc)
    db.commit()


def get_assignment(
    db: Session, serie_id: int, director_id: int
) -> SerieDirector | None:
    stmt = select(SerieDirector).where(
        SerieDirector.serie_id == serie_id,
        SerieDirector.director_id == director_id,
        SerieDirector.deleted_at.is_(None),
    )
    return db.scalars(stmt).first()


def get_assignment_any(
    db: Session, serie_id: int, director_id: int
) -> SerieDirector | None:
    stmt = select(SerieDirector).where(
        SerieDirector.serie_id == serie_id,
        SerieDirector.director_id == director_id,
    )
    return db.scalars(stmt).first()


def assign_director(
    db: Session,
    serie_id: int,
    director_id: int,
    rol: str | None = None,
) -> SerieDirector:
    asignacion_previa = get_assignment_any(db, serie_id, director_id)
    if asignacion_previa is not None and asignacion_previa.deleted_at is not None:
        asignacion_previa.deleted_at = None
        asignacion_previa.rol = rol
        db.commit()
        db.refresh(asignacion_previa)
        return asignacion_previa

    asignacion = SerieDirector(
        serie_id=serie_id,
        director_id=director_id,
        rol=rol,
    )
    db.add(asignacion)
    db.commit()
    db.refresh(asignacion)
    return asignacion


def unassign_director(db: Session, asignacion: SerieDirector) -> None:
    asignacion.deleted_at = datetime.now(timezone.utc)
    db.commit()
