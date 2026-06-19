from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.director import Director
    from app.models.serie import Serie


class SerieDirector(Base):
    __tablename__ = "serie_director"
    __table_args__ = (
        Index(
            "uq_serie_director_activo",
            "serie_id",
            "director_id",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    serie_id: Mapped[int] = mapped_column(
        ForeignKey("series.id", ondelete="CASCADE"),
        nullable=False,
    )
    director_id: Mapped[int] = mapped_column(
        ForeignKey("directores.id", ondelete="CASCADE"),
        nullable=False,
    )
    rol: Mapped[str | None] = mapped_column(String(100))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    serie: Mapped[Serie] = relationship(back_populates="serie_directores")
    director: Mapped[Director] = relationship(back_populates="serie_directores")
