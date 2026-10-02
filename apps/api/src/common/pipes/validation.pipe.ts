import { BadRequestException, ValidationPipe, type ValidationError } from '@nestjs/common';

export interface FieldError {
  field: string;
  errors: string[];
}

/** Flattens nested class-validator errors into `[{ field: 'address.city', errors: [...] }]`. */
export function flattenValidationErrors(errors: ValidationError[], parent = ''): FieldError[] {
  return errors.flatMap((err) => {
    const field = parent ? `${parent}.${err.property}` : err.property;
    const own: FieldError[] = err.constraints
      ? [{ field, errors: Object.values(err.constraints) }]
      : [];
    return [...own, ...flattenValidationErrors(err.children ?? [], field)];
  });
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: flattenValidationErrors(errors),
      }),
  });
}
