import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST || 'localhost',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log('MS SQL Connected');
  } catch (error) {
    console.error('DB Connection Failed:', error);
  }
};

export default sql;
