import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import {
  ApiErrorBody,
  AppHttpError,
} from '../models/api-error.model';
import { NotificationService } from '../services/notification.service';

function extractErrorMessage(error: HttpErrorResponse): string {
  const body = error.error as ApiErrorBody | undefined;

  if (body?.message) {
    return body.message;
  }

  if (Array.isArray(body?.detail)) {
    return body.detail
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'msg' in item) {
          return String((item as { msg: string }).msg);
        }
        return String(item);
      })
      .join('. ');
  }

  if (typeof body?.detail === 'string') {
    return body.detail;
  }

  return error.message || 'Ocurrio un error inesperado';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = extractErrorMessage(error);
      notificationService.showError(message);

      return throwError(
        () =>
          new AppHttpError(message, error.status, error.error as ApiErrorBody)
      );
    })
  );
};
