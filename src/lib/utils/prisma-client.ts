import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Declare a global type for `prisma` to avoid conflicts in development
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (!global.prisma) {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }

  // Initialize a connection pool
  const pool = new Pool({ connectionString });

  // Create a Prisma adapter using the connection pool
  const adapter = new PrismaPg(pool, {
    schema: "public",
  });

  // Initialize Prisma Client with the adapter
  global.prisma = new PrismaClient({ adapter });
}

prisma = global.prisma;

export default prisma;
