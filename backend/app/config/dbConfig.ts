import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  development: {
    COSMOSDB_USER: process.env.DEV_COSMOSDB_USER,
    COSMOSDB_PASSWORD: process.env.DEV_COSMOSDB_PASSWORD,
    COSMOSDB_DBNAME: process.env.DEV_COSMOSDB_DBNAME,
    COSMOSDB_HOST: process.env.DEV_COSMOSDB_HOST,
    COSMOSDB_PORT: process.env.DEV_COSMOSDB_PORT,
  },
  production: {
    COSMOSDB_USER: process.env.PROD_COSMOSDB_USER,
    COSMOSDB_PASSWORD: process.env.PROD_COSMOSDB_PASSWORD,
    COSMOSDB_DBNAME: process.env.PROD_COSMOSDB_DBNAME,
    COSMOSDB_HOST: process.env.PROD_COSMOSDB_HOST,
    COSMOSDB_PORT: process.env.PROD_COSMOSDB_PORT,
  },
};

export default dbConfig;
