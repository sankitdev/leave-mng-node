import { configDotenv } from "dotenv";
configDotenv();
export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
