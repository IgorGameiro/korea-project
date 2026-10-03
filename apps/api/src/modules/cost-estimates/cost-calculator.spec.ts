import { calculateTripCost, type DailyCosts } from './cost-calculator';

const costs: DailyCosts = {
  lodgingPerRoomPerNightKRW: 100_000,
  foodPerPersonPerDayKRW: 30_000,
  transportPerPersonPerDayKRW: 10_000,
  activitiesPerPersonPerDayKRW: 20_000,
};

describe('calculateTripCost', () => {
  it('1 person, 1 day: one room and the minimum of one night', () => {
    const trip = calculateTripCost(costs, 1, 1);

    expect([trip.rooms, trip.nights]).toEqual([1, 1]);
    expect(trip.breakdown).toEqual({
      lodging: 100_000,
      food: 30_000,
      transport: 10_000,
      activities: 20_000,
    });
    expect(trip.total).toBe(160_000);
    expect(trip.perDay).toBe(160_000);
    expect(trip.perPerson).toBe(160_000);
  });

  it('an odd number of people rounds rooms up (3 people -> 2 rooms)', () => {
    const trip = calculateTripCost(costs, 3, 4);

    expect([trip.rooms, trip.nights]).toEqual([2, 3]);
    expect(trip.breakdown.lodging).toBe(2 * 100_000 * 3);
    expect(trip.breakdown.food).toBe(3 * 30_000 * 4);
  });

  it('two people share a single room', () => {
    expect(calculateTripCost(costs, 2, 3).rooms).toBe(1);
  });

  it('a 2-day trip has one night (days - 1)', () => {
    expect(calculateTripCost(costs, 2, 2).nights).toBe(1);
  });

  it('total is the sum of the breakdown; averages divide it by days and people', () => {
    const trip = calculateTripCost(costs, 5, 7);
    const sum = Object.values(trip.breakdown).reduce((a, b) => a + b, 0);

    expect(trip.total).toBe(sum);
    expect(trip.perDay).toBeCloseTo(sum / 7);
    expect(trip.perPerson).toBeCloseTo(sum / 5);
  });

  it('handles the largest allowed trip (20 people, 30 days)', () => {
    const trip = calculateTripCost(costs, 20, 30);

    expect([trip.rooms, trip.nights]).toEqual([10, 29]);
    expect(trip.breakdown.lodging).toBe(10 * 100_000 * 29);
  });

  it.each([
    [0, 1],
    [1, 0],
    [1.5, 2],
    [2, -1],
  ])('rejects people=%p days=%p', (people, days) => {
    expect(() => calculateTripCost(costs, people, days)).toThrow(RangeError);
  });
});
