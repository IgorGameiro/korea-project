// Runs in every e2e test file before AppModule loads, so ConfigModule sees the test environment.
import { loadTestEnv } from './test-database';

loadTestEnv();

// The suites hit /auth/* far more than the production limit (10/min) allows. Forced (not `??=`):
// globalSetup already loaded .env into this process, so the production values are present here.
process.env.THROTTLE_LIMIT = '100000';
process.env.THROTTLE_AUTH_LIMIT = '100000';
process.env.THROTTLE_SEARCH_LIMIT = '100000';
