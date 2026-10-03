import type { CitySeed } from '../types';
import { busan } from './busan';
import { incheon } from './incheon';
import { jeju } from './jeju';
import { seoul } from './seoul';

export { ADMIN_EMAIL, favorites, reviews, users } from './users';

export const cities: CitySeed[] = [seoul, busan, jeju, incheon];
