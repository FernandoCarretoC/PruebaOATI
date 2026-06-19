import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { NotificationMessage } from '../../../core/models/api-error.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-toast.component.html',
  styleUrl: './error-toast.component.scss',
})
export class ErrorToastComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private subscription?: Subscription;

  messages: NotificationMessage[] = [];

  ngOnInit(): void {
    this.subscription = this.notificationService.messages$.subscribe((message) => {
      this.messages = [...this.messages, message];
      setTimeout(() => this.dismiss(message), 5000);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  dismiss(message: NotificationMessage): void {
    this.messages = this.messages.filter((item) => item !== message);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
