import { NextResponse } from 'next/server';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : 'Server error';
  return NextResponse.json({ error: message }, { status: 500 });
}

export function handleApi<TContext = unknown>(
  handler: (request: Request, context: TContext) => Promise<NextResponse>,
) {
  return async (request: Request, context: TContext) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return jsonError(error);
    }
  };
}
