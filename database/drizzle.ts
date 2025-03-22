import config from "@/lib/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(config.env.databaseUrl);
console.log(sql);
export const db = drizzle({ client: sql, casing: "snake_case" });
