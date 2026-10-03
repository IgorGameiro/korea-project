import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { LocalizedPaginationQueryDto } from '../../../common/dto';
import { toBooleanQuery } from '../../../common/validation';

export class ListCitiesQueryDto extends LocalizedPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Only cities featured on the home page.' })
  @IsOptional()
  @Transform(toBooleanQuery)
  @IsBoolean()
  featured?: boolean;
}
