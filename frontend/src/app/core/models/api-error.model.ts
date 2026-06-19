export interface ApiErrorBody {
  error?: string;
  message?: string;
  status_code?: number;
  detail?: unknown;
}

export class AppHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: ApiErrorBody
  ) {
    super(message);
    this.name = 'AppHttpError';
  }
}

export interface NotificationMessage {
  type: 'error' | 'success' | 'info';
  message: string;
}
