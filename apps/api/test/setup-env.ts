// Runs in every e2e test file before AppModule loads, so ConfigModule sees the test DATABASE_URL.
import { loadTestEnv } from './test-database';

loadTestEnv();
