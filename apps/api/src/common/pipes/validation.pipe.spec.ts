import type { ValidationError } from '@nestjs/common';
import { flattenValidationErrors } from './validation.pipe';

describe('flattenValidationErrors', () => {
  it('flattens nested errors into dotted field paths', () => {
    const errors: ValidationError[] = [
      { property: 'people', constraints: { max: 'people must not be greater than 20' } },
      {
        property: 'address',
        children: [{ property: 'city', constraints: { isString: 'city must be a string' } }],
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'people', errors: ['people must not be greater than 20'] },
      { field: 'address.city', errors: ['city must be a string'] },
    ]);
  });
});
