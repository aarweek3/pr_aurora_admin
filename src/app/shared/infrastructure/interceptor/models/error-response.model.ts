import { HttpErrorResponse } from '@angular/common/http';
export type ErrorStatus = 0 | 400 | 401 | 403 | 404 | 409 | 422 | 500 | 502 | 503 | 504;
export interface IErrorResponse {
  title: string;
  status: ErrorStatus;
  detail: string;
  instance: string;
  correlationId?: string;
  type?: string;
  details?: string[];
  entityName?: string;
  conflictField?: string;
  userMessage?: string;
}
export interface IExtendedErrorResponse extends IErrorResponse {
  timestamp?: string;
  requestUrl?: string;
  retryable?: boolean;
  metadata?: Record<string, any>;
}
export const errorTitles: Record<ErrorStatus, string> = {
  0: 'Проблемы с подключением',
  400: 'Некорректный запрос',
  401: 'Требуется авторизация',
  403: 'Доступ запрещен',
  404: 'Ресурс не найден',
  409: 'Конфликт данных',
  422: 'Ошибка валидации',
  500: 'Ошибка сервера',
  502: 'Сервер недоступен',
  503: 'Сервис временно недоступен',
  504: 'Превышено время ожидания',
};
export const errorMessages: Record<ErrorStatus, string> = {
  0: 'Не удается подключиться к серверу. Проверьте интернет-соединение.',
  400: 'Запрос содержит некорректные данные.',
  401: 'Сессия истекла. Необходимо войти в систему заново.',
  403: 'У вас нет прав для выполнения этой операции.',
  404: 'Запрашиваемый ресурс не найден. Возможно, сервер недоступен или неверен адрес API.',
  409: 'Операция не может быть выполнена из-за конфликта данных.',
  422: 'Проверьте правильность заполнения всех полей.',
  500: 'Внутренняя ошибка сервера. Попробуйте позже.',
  502: 'Сервер временно недоступен.',
  503: 'Сервис временно недоступен для обслуживания.',
  504: 'Превышено время ожидания ответа от сервера.',
};
export const errorRecommendations: Record<ErrorStatus, string> = {
  0: 'Проверьте подключение к интернету и попробуйте снова.',
  400: 'Проверьте правильность введенных данных и попробуйте снова.',
  401: 'Нажмите "Понятно" для перехода на страницу входа.',
  403: 'Обратитесь к администратору для получения необходимых прав доступа.',
  404: 'Убедитесь, что ресурс существует, и проверьте, запущен ли сервер.',
  409: 'Измените данные и повторите попытку.',
  422: 'Исправьте ошибки в форме (выделены красным) и отправьте заново.',
  500: 'Попробуйте повторить операцию через несколько минут.',
  502: 'Обновите страницу или попробуйте позже.',
  503: 'Подождите несколько минут и повторите попытку.',
  504: 'Подождите несколько минут и повторите попытку.',
};
export function toErrorStatus(status: number): ErrorStatus {
  const validStatuses: ErrorStatus[] = [0, 400, 401, 403, 404, 409, 422, 500, 502, 503, 504];
  if (validStatuses.includes(status as ErrorStatus)) {
    return status as ErrorStatus;
  }
  console.warn(`Неизвестный статус ${status}, установлен 500`);
  return 500;
}
export function isRetryableError(status: ErrorStatus): boolean {
  return [0, 502, 503, 504].includes(status);
}
export class ErrorResponse implements IExtendedErrorResponse {
  title: string;
  status: ErrorStatus;
  detail: string;
  instance: string;
  correlationId?: string;
  type?: string;
  details?: string[];
  entityName?: string;
  conflictField?: string;
  userMessage?: string;
  timestamp: string;
  requestUrl?: string;
  retryable: boolean;
  metadata?: Record<string, any>;
  constructor(data: IErrorResponse | IExtendedErrorResponse) {
    this.validateRequired(data);
    this.title = data.title;
    this.status = toErrorStatus(data.status);
    this.detail = data.detail;
    this.instance = data.instance;
    this.correlationId = data.correlationId || this.generateCorrelationId();
    this.type = data.type;
    this.details = data.details;
    this.entityName = data.entityName;
    this.conflictField = data.conflictField;
    this.userMessage = data.userMessage;
    const extended = data as IExtendedErrorResponse;
    this.timestamp = extended.timestamp || new Date().toISOString();
    this.requestUrl = extended.requestUrl;
    this.retryable = extended.retryable ?? isRetryableError(this.status);
    this.metadata = extended.metadata;
  }
  private validateRequired(data: IErrorResponse): void {
    if (!data.title || !data.detail || !data.instance) {
      throw new Error(
        'ErrorResponse: обязательные поля title, detail, instance должны быть заполнены',
      );
    }
  }
  private generateCorrelationId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  getUserMessage(): string {
    return this.userMessage || this.detail;
  }
  isNetworkError(): boolean {
    return this.status === 0;
  }
  isServerError(): boolean {
    return this.status >= 500;
  }
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
  toLogObject(): Record<string, any> {
    return {
      status: this.status,
      statusText: errorTitles[this.status] || 'Неизвестная ошибка',
      title: this.title,
      detail: this.detail,
      instance: this.instance,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      retryable: this.retryable,
      ...(this.entityName && { entityName: this.entityName }),
      ...(this.conflictField && { conflictField: this.conflictField }),
      ...(this.type && { type: this.type }),
      ...(this.metadata && { metadata: this.metadata }),
    };
  }
  toServerObject(): IErrorResponse {
    return {
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance: this.instance,
      correlationId: this.correlationId,
      type: this.type,
      details: this.details,
      entityName: this.entityName,
      conflictField: this.conflictField,
      userMessage: this.userMessage,
    };
  }
  static createNetworkError(requestUrl: string, detail?: string): ErrorResponse {
    return new ErrorResponse({
      title: errorTitles[0],
      status: 0,
      detail: detail || errorMessages[0],
      instance: requestUrl,
      requestUrl,
      userMessage: errorMessages[0],
    });
  }
  static fromServerResponse(serverError: any, requestUrl: string): ErrorResponse {
    if (serverError && typeof serverError === 'object' && serverError.title) {
      return new ErrorResponse({
        title: serverError.title,
        status: toErrorStatus(serverError.status),
        detail: serverError.detail,
        instance: serverError.instance || requestUrl,
        correlationId: serverError.correlationId,
        type: serverError.type,
        details: serverError.details,
        entityName: serverError.entityName,
        conflictField: serverError.conflictField,
        requestUrl,
        userMessage: serverError.userMessage,
      });
    }
    return new ErrorResponse({
      title: errorTitles[500],
      status: toErrorStatus(serverError?.status || 500),
      detail: serverError?.message || errorMessages[500],
      instance: requestUrl,
      requestUrl,
      userMessage: errorMessages[500],
    });
  }
  static fromHttpError(httpError: HttpErrorResponse, requestUrl: string): ErrorResponse {
    return new ErrorResponse({
      title: httpError.statusText || errorTitles[toErrorStatus(httpError.status)],
      status: toErrorStatus(httpError.status),
      detail:
        httpError.error?.message ||
        httpError.message ||
        errorMessages[toErrorStatus(httpError.status)],
      instance: requestUrl,
      requestUrl,
      ...(httpError.error && typeof httpError.error === 'object'
        ? {
            correlationId: httpError.error.correlationId,
            type: httpError.error.type,
            details: httpError.error.details,
            entityName: httpError.error.entityName,
            conflictField: httpError.error.conflictField,
            userMessage: httpError.error.userMessage,
          }
        : {}),
    });
  }
  static fromError(error: any, url: string): ErrorResponse {
    if (error instanceof HttpErrorResponse) {
      return ErrorResponse.fromHttpError(error, url);
    }
    if (error instanceof ErrorResponse) {
      return error;
    }
    return new ErrorResponse({
      title: 'Произошла неизвестная ошибка',
      status: toErrorStatus(0),
      detail: error?.message || 'Произошла неизвестная ошибка',
      instance: url || window.location.href,
      userMessage: 'Произошла ошибка в приложении',
    });
  }
}
export function isErrorResponse(obj: any): obj is IErrorResponse {
  return (
    obj &&
    typeof obj.title === 'string' &&
    typeof obj.status === 'number' &&
    typeof obj.detail === 'string' &&
    typeof obj.instance === 'string'
  );
}
export function isExtendedErrorResponse(obj: any): obj is IExtendedErrorResponse {
  return isErrorResponse(obj);
}
