import dotenv from "dotenv";
import mongoose from "mongoose";
import envConfigs from "../config/dbConfig";

dotenv.config();

const env: string = process.env.NODE_ENV || "development";
const config = envConfigs[env as keyof typeof envConfigs];

const explicitUri = process.env.MONGODB_URI;

function connect(): void {
  if (explicitUri) {
    mongoose
      .connect(explicitUri)
      .then(() => console.log("Database connection successful"))
      .catch((err: Error) =>
        console.error("Database connection failed:", err.message)
      );
    return;
  }

  if (!config?.COSMOSDB_HOST || !config?.COSMOSDB_DBNAME) {
    console.error(
      "Database is not configured. Set MONGODB_URI or the DEV_/PROD_COSMOSDB_* variables. See .env.example."
    );
    return;
  }

  const port = config.COSMOSDB_PORT || "27017";
  const tls = process.env.MONGODB_TLS === "true";
  const query = tls ? "?ssl=true&replicaSet=globaldb" : "";
  const connectionString = `mongodb://${config.COSMOSDB_HOST}:${port}/${config.COSMOSDB_DBNAME}${query}`;
  const options: mongoose.ConnectOptions = {};

  if (config.COSMOSDB_USER) {
    options.auth = {
      username: config.COSMOSDB_USER,
      password: config.COSMOSDB_PASSWORD,
    };
  }
  if (tls) {
    options.retryWrites = false;
  }

  mongoose
    .connect(connectionString, options)
    .then(() => console.log("Database connection successful"))
    .catch((err: Error) =>
      console.error("Database connection failed:", err.message)
    );
}

connect();
