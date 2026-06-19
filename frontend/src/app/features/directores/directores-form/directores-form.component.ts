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
  selector: 'app-directores-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './directores-form.component.html',
  styleUrl: './directores-form.component.scss',
})
export class DirectoresFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly directorService = inject(DirectorService);
  private readonly serieService = inject(SerieService);
  private readonly notificationService = inject(NotificationService);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    apellido: ['', [Validators.required, Validators.maxLength(255)]],
    fecha_nacimiento: [''],
    nacionalidad: [''],
    series: this.fb.array<FormGroup>([]),
  });

  seriesDisponibles: Serie[] = [];
  loading = false;
  saving = false;
  isEdit = false;
  directorId: number | null = null;
  directorActual: Director | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam;
    this.directorId = idParam ? Number(idParam) : null;

    this.loading = true;
    this.serieService.getAll().subscribe({
      next: (series) => {
        this.seriesDisponibles = series;
        this.buildSeriesFormArray();

        if (this.isEdit && this.directorId) {
          this.loadDirector(this.directorId);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get seriesFormArray(): FormArray<FormGroup> {
    return this.form.get('series') as FormArray<FormGroup>;
  }

  private buildSeriesFormArray(): void {
    this.seriesFormArray.clear();

    for (const serie of this.seriesDisponibles) {
      this.seriesFormArray.push(
        this.fb.group({
          serieId: [serie.id],
          label: [serie.nombre],
          selected: [false],
          rol: [''],
        })
      );
    }
  }

  private loadDirector(id: number): void {
    this.directorService.getById(id).subscribe({
      next: (director) => {
        this.directorActual = director;
        this.form.patchValue({
          nombre: director.nombre,
          apellido: director.apellido,
          fecha_nacimiento: director.fecha_nacimiento ?? '',
          nacionalidad: director.nacionalidad ?? '',
        });

        for (const control of this.seriesFormArray.controls) {
          const serieId = control.get('serieId')?.value as number;
          const asignacion = director.series.find((item) => item.id === serieId);
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
      apellido: this.form.value.apellido!.trim(),
      fecha_nacimiento: this.form.value.fecha_nacimiento?.trim() || null,
      nacionalidad: this.form.value.nacionalidad?.trim() || null,
    };

    const request$ = this.isEdit && this.directorId
      ? this.directorService.update(this.directorId, payload)
      : this.directorService.create(payload);

    request$
      .pipe(
        switchMap((director) => this.syncSeries(director.id)),
        switchMap(() => of(null))
      )
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            this.isEdit
              ? 'Director actualizado correctamente'
              : 'Director creado correctamente'
          );
          this.router.navigate(['/directores']);
        },
        complete: () => {
          this.saving = false;
        },
        error: () => {
          this.saving = false;
        },
      });
  }

  private syncSeries(directorId: number) {
    const selected = this.seriesFormArray.controls
      .filter((control) => control.get('selected')?.value)
      .map((control) => ({
        serieId: control.get('serieId')?.value as number,
        rol: (control.get('rol')?.value as string)?.trim() || null,
      }));

    const selectedIds = new Set(selected.map((item) => item.serieId));
    const currentIds = new Set(this.directorActual?.series.map((item) => item.id) ?? []);

    const toAssign = selected.filter((item) => !currentIds.has(item.serieId));
    const toUnassign = [...currentIds].filter((id) => !selectedIds.has(id));

    const operations = [
      ...toAssign.map((item) =>
        this.serieService.assignDirector(item.serieId, directorId, { rol: item.rol })
      ),
      ...toUnassign.map((serieId) =>
        this.serieService.unassignDirector(serieId, directorId)
      ),
    ];

    if (!operations.length) {
      return of(null);
    }

    return forkJoin(operations);
  }
}
