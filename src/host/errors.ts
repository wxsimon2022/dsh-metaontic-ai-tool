export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function hasErrorCode(value: unknown): value is { code?: string } {
  return isRecord(value) && 'code' in value;
}

export class QueryError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'QueryError';
    this.code = code;
    this.status = status;
  }
}
