import { ApiHideProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

/**
 * Base for localized list queries. `locale` is resolved by LocaleInterceptor (and documented with
 * @ApiLocale()); it is declared here only so the ValidationPipe whitelist accepts it.
 */
export class LocalizedPaginationQueryDto extends PaginationQueryDto {
  @ApiHideProperty()
  @IsOptional()
  @IsString()
  locale?: string;
}
