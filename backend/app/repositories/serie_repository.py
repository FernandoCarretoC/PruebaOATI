from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.serie import Serie
from app.models.serie_director import SerieDirector
from app.schemas.serie import SerieCreate, SerieUpdate


def get_all(db: Session) -> list[Serie]:
    stmt = (
        select(Serie)
        .where(Serie.deleted_at.is_(None))
        .options(
            selectinload(Serie.serie_directores).selectinload(SerieDirector.director)
        )
        .order_by(Serie.id)
    )
    return list(db.scalars(stmt).all())


def get_by_id(db: Session, serie_id: int) -> Serie | None:
    stmt = (
        select(Serie)
        .where(Serie.id == serie_id, Serie.deleted_at.is_(None))
        .options(
            selectinload(Serie.serie_directores).selectinload(SerieDirector.director)
        )
    )
    return db.scalars(stmt).first()


def create(db: Session, data: SerieCreate) -> Serie:
    serie = Serie(**data.model_dump())
    db.add(serie)
    db.commit()
    db.refresh(serie)
    return serie


def update(db: Session, serie: Serie, data: SerieUpdate) -> Serie:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(serie, field, value)
    db.commit()
    db.refresh(serie)
    return get_by_id(db, serie.id) or serie


def soft_delete(db: Session, serie: Serie) -> None:
    serie.deleted_at = datetime.now(timezone.utc)
    db.commit()
