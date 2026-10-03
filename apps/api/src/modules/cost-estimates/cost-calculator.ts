/** Daily cost assumptions of a city for one travel style, in KRW. */
export interface DailyCosts {
  lodgingPerRoomPerNightKRW: number;
  foodPerPersonPerDayKRW: number;
  transportPerPersonPerDayKRW: number;
  activitiesPerPersonPerDayKRW: number;
}

export interface TripCost {
  rooms: number;
  nights: number;
  /** Totals per category for the whole trip, in KRW. */
  breakdown: { lodging: number; food: number; transport: number; activities: number };
  total: number;
  /** total / days (not rounded). */
  perDay: number;
  /** total / people (not rounded). */
  perPerson: number;
}

/**
 * Trip cost, as specified (docs/SPEC.md §6). Pure: no I/O, no rounding of the inputs.
 * - rooms = ceil(people / 2)            (two people share a room)
 * - nights = days - 1, at least 1        (a one-day trip still books a night)
 * - lodging = rooms × price per room per night × nights
 * - food / transport / activities = people × daily cost × days
 */
export function calculateTripCost(costs: DailyCosts, people: number, days: number): TripCost {
  if (!Number.isInteger(people) || people < 1) {
    throw new RangeError('people must be a positive integer');
  }
  if (!Number.isInteger(days) || days < 1) {
    throw new RangeError('days must be a positive integer');
  }

  const rooms = Math.ceil(people / 2);
  const nights = Math.max(days - 1, 1);
  const breakdown = {
    lodging: rooms * costs.lodgingPerRoomPerNightKRW * nights,
    food: people * costs.foodPerPersonPerDayKRW * days,
    transport: people * costs.transportPerPersonPerDayKRW * days,
    activities: people * costs.activitiesPerPersonPerDayKRW * days,
  };
  const total = breakdown.lodging + breakdown.food + breakdown.transport + breakdown.activities;
  return { rooms, nights, breakdown, total, perDay: total / days, perPerson: total / people };
}
