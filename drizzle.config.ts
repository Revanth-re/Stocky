import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  dialect: "mysql",
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "mysql://root:password@localhost:3306/kirana_saas",
  },
  strict: true,
  verbose: true,
});
