export interface DirectorEnSerie {
  id: number;
  nombre: string;
  apellido: string;
  rol?: string | null;
}

export interface Serie {
  id: number;
  nombre: string;
  fecha_lanzamiento: string;
  genero?: string | null;
  descripcion?: string | null;
  estado?: string | null;
  created_at: string;
  updated_at: string;
  directores: DirectorEnSerie[];
}

export interface SerieCreate {
  nombre: string;
  fecha_lanzamiento: string;
  genero?: string | null;
  descripcion?: string | null;
  estado?: string | null;
}

export interface SerieUpdate {
  nombre?: string;
  fecha_lanzamiento?: string;
  genero?: string | null;
  descripcion?: string | null;
  estado?: string | null;
}

export interface AsignarDirectorRequest {
  rol?: string | null;
}
