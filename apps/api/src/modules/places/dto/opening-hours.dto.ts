import { ApiProperty } from '@nestjs/swagger';
import type { OpeningHours } from '@korea-project/shared';

// OpenAPI shape of the shared OpeningHours type (validated by validateOpeningHours).

/** One opening period, Asia/Seoul time. A `close` earlier than `open` runs past midnight. */
export class TimeRangeDto {
  @ApiProperty({ example: '11:00', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' }) open: string;
  @ApiProperty({ example: '22:00', description: '"24:00" closes at midnight.' }) close: string;
}

/** Every weekday is present; an empty list means closed that day. */
export class WeekScheduleDto {
  @ApiProperty({ type: [TimeRangeDto] }) mon: TimeRangeDto[];
  @ApiProperty({ type: [TimeRangeDto] }) tue: TimeRangeDto[];
  @ApiProperty({ type: [TimeRangeDto] }) wed: TimeRangeDto[];
  @ApiProperty({ type: [TimeRangeDto] }) thu: TimeRangeDto[];
  @ApiProperty({ type: [TimeRangeDto] }) fri: TimeRangeDto[];
  @ApiProperty({ type: [TimeRangeDto] }) sat: TimeRangeDto[];
  @ApiProperty({ type: [TimeRangeDto] }) sun: TimeRangeDto[];
}

/** Documents the shape of the shared OpeningHours type for the OpenAPI document. */
export class OpeningHoursDto implements OpeningHours {
  @ApiProperty({ type: WeekScheduleDto }) days: WeekScheduleDto;
}
