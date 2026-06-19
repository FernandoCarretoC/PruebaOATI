from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class SerieEnDirector(BaseModel):
    id: int
    nombre: str
    fecha_lanzamiento: date
    rol: str | None = None

    model_config = ConfigDict(from_attributes=True)


class DirectorCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    apellido: str = Field(..., min_length=1, max_length=255)
    fecha_nacimiento: date | None = None
    nacionalidad: str | None = Field(default=None, max_length=100)


class DirectorUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=255)
    apellido: str | None = Field(default=None, min_length=1, max_length=255)
    fecha_nacimiento: date | None = None
    nacionalidad: str | None = Field(default=None, max_length=100)


class DirectorResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    fecha_nacimiento: date | None
    nacionalidad: str | None
    created_at: datetime
    updated_at: datetime
    series: list[SerieEnDirector] = []

    model_config = ConfigDict(from_attributes=True)


class AsignarDirectorBody(BaseModel):
    rol: str | None = Field(default=None, max_length=100)


def director_to_response(director) -> DirectorResponse:
    series = []
    for asignacion in director.serie_directores:
        if asignacion.deleted_at is not None:
            continue
        serie = asignacion.serie
        if serie is None or serie.deleted_at is not None:
            continue
        series.append(
            SerieEnDirector(
                id=serie.id,
                nombre=serie.nombre,
                fecha_lanzamiento=serie.fecha_lanzamiento,
                rol=asignacion.rol,
            )
        )

    return DirectorResponse(
        id=director.id,
        nombre=director.nombre,
        apellido=director.apellido,
        fecha_nacimiento=director.fecha_nacimiento,
        nacionalidad=director.nacionalidad,
        created_at=director.created_at,
        updated_at=director.updated_at,
        series=series,
    )
