import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `<div class="spinner" [class.inline]="inline">{{ label }}</div>`,
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  @Input() label = 'Cargando...';
  @Input() inline = false;
}
