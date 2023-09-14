import { DataSource } from "typeorm";
import { URL } from "./models/url";
import { Account } from "./models/account";

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "shorty",
    password: process.env.DB_PASS || "shorty",
    database: process.env.DB_NAME || "shorty",
    synchronize: true,
    logging: true,
    entities: [Account, URL],
    subscribers: [],
    migrations: [],
});

// Singleton database connection
export const db = AppDataSource;
