from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class DirectorEnSerie(BaseModel):
    id: int
    nombre: str
    apellido: str
    rol: str | None = None

    model_config = ConfigDict(from_attributes=True)


class SerieCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    fecha_lanzamiento: date
    genero: str | None = Field(default=None, max_length=100)
    descripcion: str | None = None
    estado: str | None = Field(default=None, max_length=50)


class SerieUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=255)
    fecha_lanzamiento: date | None = None
    genero: str | None = Field(default=None, max_length=100)
    descripcion: str | None = None
    estado: str | None = Field(default=None, max_length=50)


class SerieResponse(BaseModel):
    id: int
    nombre: str
    fecha_lanzamiento: date
    genero: str | None
    descripcion: str | None
    estado: str | None
    created_at: datetime
    updated_at: datetime
    directores: list[DirectorEnSerie] = []

    model_config = ConfigDict(from_attributes=True)


def serie_to_response(serie) -> SerieResponse:
    directores = []
    for asignacion in serie.serie_directores:
        if asignacion.deleted_at is not None:
            continue
        director = asignacion.director
        if director is None or director.deleted_at is not None:
            continue
        directores.append(
            DirectorEnSerie(
                id=director.id,
                nombre=director.nombre,
                apellido=director.apellido,
                rol=asignacion.rol,
            )
        )

    return SerieResponse(
        id=serie.id,
        nombre=serie.nombre,
        fecha_lanzamiento=serie.fecha_lanzamiento,
        genero=serie.genero,
        descripcion=serie.descripcion,
        estado=serie.estado,
        created_at=serie.created_at,
        updated_at=serie.updated_at,
        directores=directores,
    )
