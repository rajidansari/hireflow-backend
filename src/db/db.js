import { Pool } from 'pg';
import { config } from '../config/index.js';

const isSSLRequired = config.nodeEnv === 'development' ? false : true;

const pool = new Pool({
  connectionString: config.db.url,
  ...(isSSLRequired &&  {
    ssl: {
      rejectUnauthorized: false
    }
  }),
});


export default pool;