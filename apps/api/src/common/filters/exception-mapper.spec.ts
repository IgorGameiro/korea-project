import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { mapException } from './exception-mapper';

const prismaError = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError('prisma failure', {
    code,
    clientVersion: 'test',
    meta,
  });

describe('mapException', () => {
  it('maps a Nest HttpException with a string message', () => {
    const result = mapException(new NotFoundException('City not found'));

    expect(result).toEqual({
      status: 404,
      body: { error: { code: 'NOT_FOUND', message: 'City not found' } },
    });
  });

  it('keeps bodies already in the API format (validation errors)', () => {
    const details = [{ field: 'people', errors: ['people must not be greater than 20'] }];
    const exception = new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details,
    });

    expect(mapException(exception)).toEqual({
      status: 400,
      body: { error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', details } },
    });
  });

  it('moves array messages into details', () => {
    const exception = new BadRequestException(['a is required', 'b is required']);

    const { status, body } = mapException(exception);

    expect(status).toBe(400);
    expect(body.error.code).toBe('BAD_REQUEST');
    expect(body.error.details).toEqual(['a is required', 'b is required']);
  });

  it('keeps unknown object payloads as details (e.g. health report)', () => {
    const report = { status: 'error', error: { database: { status: 'down' } } };

    const { status, body } = mapException(new HttpException(report, 503));

    expect(status).toBe(503);
    expect(body.error.code).toBe('SERVICE_UNAVAILABLE');
    expect(body.error.details).toEqual(report);
  });

  it('maps Prisma unique violation (P2002) to 409', () => {
    const { status, body } = mapException(prismaError('P2002', { target: ['email'] }));

    expect(status).toBe(409);
    expect(body.error).toEqual({
      code: 'CONFLICT',
      message: 'Resource already exists',
      details: { fields: ['email'] },
    });
  });

  it('maps Prisma record not found (P2025) to 404', () => {
    const { status, body } = mapException(prismaError('P2025'));

    expect(status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('maps unhandled Prisma codes and unknown errors to 500 without leaking the message', () => {
    for (const exception of [prismaError('P1001'), new Error('secret stack detail'), 'boom']) {
      const { status, body } = mapException(exception);

      expect(status).toBe(500);
      expect(body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
    }
  });
});
