import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';

import { Director } from '../../../core/models/director.model';
import { Serie } from '../../../core/models/serie.model';
import { DirectorService } from '../../../core/services/director.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SerieService } from '../../../core/services/serie.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-series-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './series-form.component.html',
  styleUrl: './series-form.component.scss',
})
export class SeriesFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly serieService = inject(SerieService);
  private readonly directorService = inject(DirectorService);
  private readonly notificationService = inject(NotificationService);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    fecha_lanzamiento: ['', Validators.required],
    genero: [''],
    descripcion: [''],
    estado: [''],
    directores: this.fb.array<FormGroup>([]),
  });

  directoresDisponibles: Director[] = [];
  loading = false;
  saving = false;
  isEdit = false;
  serieId: number | null = null;
  serieActual: Serie | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam;
    this.serieId = idParam ? Number(idParam) : null;

    this.loading = true;
    this.directorService.getAll().subscribe({
      next: (directores) => {
        this.directoresDisponibles = directores;
        this.buildDirectoresFormArray();

        if (this.isEdit && this.serieId) {
          this.loadSerie(this.serieId);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get directoresFormArray(): FormArray<FormGroup> {
    return this.form.get('directores') as FormArray<FormGroup>;
  }

  private buildDirectoresFormArray(): void {
    this.directoresFormArray.clear();

    for (const director of this.directoresDisponibles) {
      this.directoresFormArray.push(
        this.fb.group({
          directorId: [director.id],
          label: [`${director.nombre} ${director.apellido}`],
          selected: [false],
          rol: [''],
        })
      );
    }
  }

  private loadSerie(id: number): void {
    this.serieService.getById(id).subscribe({
      next: (serie) => {
        this.serieActual = serie;
        this.form.patchValue({
          nombre: serie.nombre,
          fecha_lanzamiento: serie.fecha_lanzamiento,
          genero: serie.genero ?? '',
          descripcion: serie.descripcion ?? '',
          estado: serie.estado ?? '',
        });

        for (const control of this.directoresFormArray.controls) {
          const directorId = control.get('directorId')?.value as number;
          const asignacion = serie.directores.find((item) => item.id === directorId);
          control.patchValue({
            selected: !!asignacion,
            rol: asignacion?.rol ?? '',
          });
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = {
      nombre: this.form.value.nombre!.trim(),
      fecha_lanzamiento: this.form.value.fecha_lanzamiento!,
      genero: this.form.value.genero?.trim() || null,
      descripcion: this.form.value.descripcion?.trim() || null,
      estado: this.form.value.estado?.trim() || null,
    };

    const request$ = this.isEdit && this.serieId
      ? this.serieService.update(this.serieId, payload)
      : this.serieService.create(payload);

    request$
      .pipe(
        switchMap((serie) => this.syncDirectores(serie.id)),
        switchMap(() => of(null))
      )
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            this.isEdit ? 'Serie actualizada correctamente' : 'Serie creada correctamente'
          );
          this.router.navigate(['/series']);
        },
        complete: () => {
          this.saving = false;
        },
        error: () => {
          this.saving = false;
        },
      });
  }

  private syncDirectores(serieId: number) {
    const selected = this.directoresFormArray.controls
      .filter((control) => control.get('selected')?.value)
      .map((control) => ({
        directorId: control.get('directorId')?.value as number,
        rol: (control.get('rol')?.value as string)?.trim() || null,
      }));

    const selectedIds = new Set(selected.map((item) => item.directorId));
    const currentIds = new Set(this.serieActual?.directores.map((item) => item.id) ?? []);

    const toAssign = selected.filter((item) => !currentIds.has(item.directorId));
    const toUnassign = [...currentIds].filter((id) => !selectedIds.has(id));

    const operations = [
      ...toAssign.map((item) =>
        this.serieService.assignDirector(serieId, item.directorId, { rol: item.rol })
      ),
      ...toUnassign.map((directorId) =>
        this.serieService.unassignDirector(serieId, directorId)
      ),
    ];

    if (!operations.length) {
      return of(null);
    }

    return forkJoin(operations);
  }
}
