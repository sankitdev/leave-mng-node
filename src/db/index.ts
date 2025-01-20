import { drizzle } from "drizzle-orm/neon-serverless";
import { DATABASE_URL } from "../config/config.ts";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const db = drizzle(DATABASE_URL); //Datbase Connection (Neon)
