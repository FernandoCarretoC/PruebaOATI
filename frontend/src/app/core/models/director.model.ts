export interface SerieEnDirector {
  id: number;
  nombre: string;
  fecha_lanzamiento: string;
  rol?: string | null;
}

export interface Director {
  id: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento?: string | null;
  nacionalidad?: string | null;
  created_at: string;
  updated_at: string;
  series: SerieEnDirector[];
}

export interface DirectorCreate {
  nombre: string;
  apellido: string;
  fecha_nacimiento?: string | null;
  nacionalidad?: string | null;
}

export interface DirectorUpdate {
  nombre?: string;
  apellido?: string;
  fecha_nacimiento?: string | null;
  nacionalidad?: string | null;
}
