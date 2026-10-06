import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Photo, type PhotoCredit, validatePhotos } from '@korea-project/shared';
import { ValidateBy } from 'class-validator';

// OpenAPI shape of the shared Photo/PhotoCredit types (validated by validatePhotos).

export class PhotoCreditDto implements PhotoCredit {
  @ApiProperty({ example: 'Jane Doe' }) author: string;
  @ApiProperty({ example: 'CC BY-SA 4.0' }) license: string;
  @ApiPropertyOptional({
    nullable: true,
    type: String,
    example: 'https://creativecommons.org/licenses/by-sa/4.0',
    description: 'Absent for public domain.',
  })
  licenseUrl?: string | null;
  @ApiProperty({ example: 'https://commons.wikimedia.org/wiki/File:Example.jpg' })
  sourceUrl: string;
}

export class PhotoDto implements Photo {
  @ApiProperty({ example: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Example.jpg' })
  url: string;
  @ApiPropertyOptional({
    type: PhotoCreditDto,
    nullable: true,
    description: 'Author, license and source; null for placeholder images.',
  })
  credit?: PhotoCreditDto | null;
}

/** Validates a Photo[] with the shared rules (https URLs, complete credits). */
export const IsPhotos = () =>
  ValidateBy({
    name: 'isPhotos',
    validator: {
      validate: (value: unknown) => validatePhotos(value).length === 0,
      defaultMessage: (args) => `images are invalid: ${validatePhotos(args?.value).join('; ')}`,
    },
  });

/** Problems with a single credit (checked as a credited photo), without the "[0].credit." prefix. */
const creditProblems = (credit: unknown): string[] =>
  validatePhotos([{ url: 'https://x.invalid', credit }]).map((error) =>
    error.replace('[0].credit.', ''),
  );

/** Validates a single PhotoCredit (null allowed: no credit). */
export const IsPhotoCredit = () =>
  ValidateBy({
    name: 'isPhotoCredit',
    validator: {
      validate: (value: unknown) => value === null || creditProblems(value).length === 0,
      defaultMessage: (args) =>
        `heroImageCredit is invalid: ${creditProblems(args?.value as unknown).join('; ')}`,
    },
  });
