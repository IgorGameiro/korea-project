import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type CostTier,
  DEFAULT_CURRENCY_BY_LOCALE,
  type DisplayCurrency,
  type Locale,
  type Paginated,
} from '@korea-project/shared';
import { paginate } from '../../common/dto';
import { CitiesService } from '../cities/cities.service';
import { BASE_CURRENCY, ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { calculateTripCost } from './cost-calculator';
import { type CostEstimateRow, CostEstimatesRepository } from './cost-estimates.repository';
import type {
  CostCalculationDto,
  CostEstimateDto,
  CreateCostEstimateDto,
  MoneyDto,
  UpdateCostEstimateDto,
} from './dto/cost-estimate.dto';

export interface CalculateInput {
  citySlug: string;
  people: number;
  days: number;
  tier: CostTier;
  currency?: DisplayCurrency;
}

const estimateNotFound = () =>
  new NotFoundException({
    code: 'COST_ESTIMATE_NOT_FOUND',
    message: 'No cost estimate for this city and travel style',
  });

const toDto = (row: CostEstimateRow): CostEstimateDto => ({
  id: row.id,
  cityId: row.cityId,
  tier: row.tier,
  lodgingPerRoomPerNightKRW: row.lodgingPerRoomPerNightKRW,
  foodPerPersonPerDayKRW: row.foodPerPersonPerDayKRW,
  transportPerPersonPerDayKRW: row.transportPerPersonPerDayKRW,
  activitiesPerPersonPerDayKRW: row.activitiesPerPersonPerDayKRW,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

/**
 * Trip cost calculator plus admin management of the per-city daily costs.
 * The arithmetic lives in calculateTripCost (pure); this service only gathers its inputs
 * (estimate, exchange rate) and converts the result. No HTTP objects are involved.
 */
@Injectable()
export class CostEstimatesService {
  constructor(
    private readonly repository: CostEstimatesRepository,
    private readonly cities: CitiesService,
    private readonly exchangeRates: ExchangeRatesService,
  ) {}

  async calculate(input: CalculateInput, locale: Locale): Promise<CostCalculationDto> {
    const currency = input.currency ?? DEFAULT_CURRENCY_BY_LOCALE[locale];
    const city = await this.cities.findBySlug(input.citySlug, locale);
    const [estimate, rate] = await Promise.all([
      this.repository.findByCityAndTier(city.id, input.tier),
      this.exchangeRates.getRate(currency),
    ]);
    if (!estimate) throw estimateNotFound();

    const trip = calculateTripCost(estimate, input.people, input.days);
    const money = (krw: number): MoneyDto => ({
      krw: Math.round(krw),
      amount: ExchangeRatesService.convert(krw, rate.rate),
    });

    return {
      city: { slug: city.slug, name: city.name, locale: city.locale },
      people: input.people,
      days: input.days,
      nights: trip.nights,
      rooms: trip.rooms,
      tier: input.tier,
      currency,
      exchangeRate: {
        base: BASE_CURRENCY,
        currency,
        rate: rate.rate,
        updatedAt: rate.updatedAt,
      },
      breakdown: {
        lodging: money(trip.breakdown.lodging),
        food: money(trip.breakdown.food),
        transport: money(trip.breakdown.transport),
        activities: money(trip.breakdown.activities),
      },
      total: money(trip.total),
      perDay: money(trip.perDay),
      perPerson: money(trip.perPerson),
    };
  }

  // ----- Admin -----

  async list(query: {
    cityId?: string;
    page: number;
    limit: number;
    skip: number;
  }): Promise<Paginated<CostEstimateDto>> {
    const { rows, total } = await this.repository.list(
      { cityId: query.cityId },
      { skip: query.skip, take: query.limit },
    );
    return paginate(rows.map(toDto), total, query);
  }

  async findById(id: string): Promise<CostEstimateDto> {
    const row = await this.repository.findById(id);
    if (!row) throw estimateNotFound();
    return toDto(row);
  }

  async create(dto: CreateCostEstimateDto): Promise<CostEstimateDto> {
    await this.cities.assertExists(dto.cityId);
    return toDto(await this.repository.create(dto));
  }

  async update(id: string, dto: UpdateCostEstimateDto): Promise<CostEstimateDto> {
    return toDto(await this.repository.update(id, dto));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
