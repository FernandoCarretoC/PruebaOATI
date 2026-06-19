import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Director } from '../../../core/models/director.model';
import { DirectorService } from '../../../core/services/director.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-directores-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './directores-list.component.html',
  styleUrl: './directores-list.component.scss',
})
export class DirectoresListComponent implements OnInit {
  private readonly directorService = inject(DirectorService);
  private readonly notificationService = inject(NotificationService);

  directores: Director[] = [];
  loading = false;
  confirmOpen = false;
  directorToDelete: Director | null = null;

  ngOnInit(): void {
    this.loadDirectores();
  }

  loadDirectores(): void {
    this.loading = true;
    this.directorService
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (directores) => {
          this.directores = directores;
        },
      });
  }

  openDeleteConfirm(director: Director): void {
    this.directorToDelete = director;
    this.confirmOpen = true;
  }

  cancelDelete(): void {
    this.confirmOpen = false;
    this.directorToDelete = null;
  }

  confirmDelete(): void {
    if (!this.directorToDelete) {
      return;
    }

    const directorId = this.directorToDelete.id;
    this.confirmOpen = false;
    this.directorToDelete = null;

    this.directorService.delete(directorId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Director eliminado correctamente');
        this.loadDirectores();
      },
    });
  }

  formatSeries(director: Director): string {
    if (!director.series.length) {
      return 'Sin series';
    }

    return director.series.map((serie) => serie.nombre).join(', ');
  }

  fullName(director: Director): string {
    return `${director.nombre} ${director.apellido}`;
  }
}
