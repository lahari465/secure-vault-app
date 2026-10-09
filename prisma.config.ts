import { config } from "dotenv"
import { defineConfig } from "prisma/config"

// Next.js keeps secrets in .env.local; load it here too so the Prisma CLI sees them.
config({ path: [".env.local", ".env"], quiet: true })

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrations should use Neon's direct (non-pooled) connection when you set DIRECT_URL.
    // The URL is only needed by migrate commands, so `prisma generate` (run on
    // every npm install) works even before any database is configured.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
})
