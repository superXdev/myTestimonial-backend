import * as dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from "sequelize";

// create connection
const db = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_CONNECTION,
    logging: false,
    dialectOptions: {
    ssl: {
      require: process.env.DB_SSL,
      rejectUnauthorized: false
    }
  }
});

export default db;