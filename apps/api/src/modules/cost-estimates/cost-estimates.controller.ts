import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Locale } from '@korea-project/shared';
import { Public } from '../../common/decorators';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { CostEstimatesService } from './cost-estimates.service';
import { CalculateCostDto, CostCalculationDto } from './dto/cost-estimate.dto';

@ApiTags('cost-estimates')
@Public()
@Controller('cost-estimates')
export class CostEstimatesController {
  constructor(private readonly costs: CostEstimatesService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiLocale()
  @ApiOperation({
    summary: 'Estimate the cost of a trip',
    description:
      'rooms = ceil(people / 2); nights = max(days - 1, 1); lodging = rooms × nightly rate × nights; ' +
      'food, transport and activities = people × daily cost × days. Amounts in KRW and in `currency`.',
  })
  @ApiOkResponse({ type: CostCalculationDto })
  @ApiNotFoundResponse({ description: 'CITY_NOT_FOUND or COST_ESTIMATE_NOT_FOUND' })
  calculate(
    @Body() dto: CalculateCostDto,
    @RequestLocale() locale: Locale,
  ): Promise<CostCalculationDto> {
    return this.costs.calculate(dto, locale);
  }
}
