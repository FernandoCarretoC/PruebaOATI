import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Serie } from '../../../core/models/serie.model';
import { NotificationService } from '../../../core/services/notification.service';
import { SerieService } from '../../../core/services/serie.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-series-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './series-list.component.html',
  styleUrl: './series-list.component.scss',
})
export class SeriesListComponent implements OnInit {
  private readonly serieService = inject(SerieService);
  private readonly notificationService = inject(NotificationService);

  series: Serie[] = [];
  loading = false;
  confirmOpen = false;
  serieToDelete: Serie | null = null;

  ngOnInit(): void {
    this.loadSeries();
  }

  loadSeries(): void {
    this.loading = true;
    this.serieService
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (series) => {
          this.series = series;
        },
      });
  }

  openDeleteConfirm(serie: Serie): void {
    this.serieToDelete = serie;
    this.confirmOpen = true;
  }

  cancelDelete(): void {
    this.confirmOpen = false;
    this.serieToDelete = null;
  }

  confirmDelete(): void {
    if (!this.serieToDelete) {
      return;
    }

    const serieId = this.serieToDelete.id;
    this.confirmOpen = false;
    this.serieToDelete = null;

    this.serieService.delete(serieId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Serie eliminada correctamente');
        this.loadSeries();
      },
    });
  }

  formatDirectores(serie: Serie): string {
    if (!serie.directores.length) {
      return 'Sin directores';
    }

    return serie.directores
      .map((director) => `${director.nombre} ${director.apellido}`)
      .join(', ');
  }
}
