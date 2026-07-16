export interface BackendResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  data: T;
  error: BackendErrorPayload | string | null;
}

export interface BackendErrorPayload {
  message?: string;
  code?: string;
  title?: string;
}
