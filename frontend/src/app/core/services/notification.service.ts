import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { NotificationMessage } from '../models/api-error.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly messagesSubject = new Subject<NotificationMessage>();
  readonly messages$ = this.messagesSubject.asObservable();

  showError(message: string): void {
    this.messagesSubject.next({ type: 'error', message });
  }

  showSuccess(message: string): void {
    this.messagesSubject.next({ type: 'success', message });
  }

  showInfo(message: string): void {
    this.messagesSubject.next({ type: 'info', message });
  }
}
