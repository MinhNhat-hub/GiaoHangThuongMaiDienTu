// Failure injection point identifiers for simulating storage failures during testing
export type FailurePoint =
  | 'NONE'
  | 'ORDER_STORE'
  | 'ORDER_HISTORY'
  | 'DELIVERY_STORE';

export class StorageError extends Error {
  readonly code: string;
  readonly stage: FailurePoint;

  constructor(message: string, stage: FailurePoint) {
    super(message);
    this.name = 'StorageError';
    this.code = 'STORAGE_ERROR';
    this.stage = stage;
  }
}

let activeFailurePoint: FailurePoint = 'NONE';

// Sets the current failure point for subsequent operations
export function setFailureInjection(point: FailurePoint): void {
  activeFailurePoint = point;
}

// Retrieves the current failure injection point
export function getFailureInjection(): FailurePoint {
  return activeFailurePoint;
}

// Resets failure injection to default inactive state
export function clearFailureInjection(): void {
  activeFailurePoint = 'NONE';
}

// Checks if an operation should fail at the specified point
export function shouldFailAt(targetPoint: FailurePoint, requestPoint?: FailurePoint): boolean {
  const effective = requestPoint && requestPoint !== 'NONE' ? requestPoint : activeFailurePoint;
  return effective === targetPoint;
}

// Resolves failure point from request header or query parameter
export function resolveFailurePointFromHeader(headerValue?: string | null): FailurePoint {
  if (!headerValue) return 'NONE';
  const normalized = headerValue.trim().toUpperCase().replace(/-/g, '_');
  if (normalized === 'ORDER_STORE' || normalized === 'ORDER_HISTORY' || normalized === 'DELIVERY_STORE') {
    return normalized as FailurePoint;
  }
  return 'NONE';
}
