/**
 * Migration Script: Migrate API Keys from Prisma DB to Go Backend
 * 
 * This script migrates existing API key data from the Prisma PostgreSQL database
 * to the Go backend database (ClickHouse).
 * 
 * Usage:
 *   pnpm tsx scripts/migrate-api-keys-to-go.ts
 * 
 * Environment Variables Required:
 *   - DATABASE_URL: Prisma PostgreSQL connection string
 *   - GO_BACKEND_URL: Go backend API URL (default: http://localhost:8080)
 *   - BATCH_SIZE: Number of concurrent migrations (default: 10)
 */

import { PrismaClient } from "../prisma/generated";
import type { ApiKey, Project } from "../prisma/generated";

const prisma = new PrismaClient();
const GO_BACKEND_URL = process.env.GO_BACKEND_URL || "http://localhost:8080";
const BATCH_SIZE = Number.parseInt(process.env.BATCH_SIZE || "10", 10);

type ApiKeyWithProject = ApiKey & {
  project: Project | null;
};

interface MigrationResult {
  success: boolean;
  keyName: string;
  keyPrefix: string;
  error?: string;
}

async function migrateApiKey(apiKey: ApiKeyWithProject): Promise<MigrationResult> {
  try {
    const response = await fetch(`${GO_BACKEND_URL}/admin/api-keys/migrate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiKey),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return {
      success: true,
      keyName: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
    };
  } catch (error) {
    return {
      success: false,
      keyName: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function migrateInBatches(apiKeys: ApiKeyWithProject[]): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];
  
  for (let i = 0; i < apiKeys.length; i += BATCH_SIZE) {
    const batch = apiKeys.slice(i, i + BATCH_SIZE);
    console.log(`🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(apiKeys.length / BATCH_SIZE)} (${batch.length} keys)...`);
    
    const batchResults = await Promise.all(batch.map(migrateApiKey));
    results.push(...batchResults);
    
    const batchSuccess = batchResults.filter(r => r.success).length;
    console.log(`   ✅ ${batchSuccess}/${batch.length} migrated successfully\n`);
  }
  
  return results;
}

async function migrateApiKeys() {
  console.log("🔄 Starting API key migration from Prisma to Go backend...");
  console.log(`   Batch size: ${BATCH_SIZE} concurrent migrations\n`);

  try {
    const apiKeys = await prisma.apiKey.findMany({
      include: {
        project: true,
      },
    });

    console.log(`📊 Found ${apiKeys.length} API keys to migrate\n`);

    if (apiKeys.length === 0) {
      console.log("✅ No API keys to migrate. Exiting.");
      return;
    }

    const startTime = Date.now();
    const results = await migrateInBatches(apiKeys);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    const errors = results.filter(r => !r.success);

    console.log("=".repeat(60));
    console.log("📈 Migration Summary:");
    console.log(`   Total API keys: ${apiKeys.length}`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   🚀 Rate: ${(apiKeys.length / Number.parseFloat(duration)).toFixed(1)} keys/sec`);
    console.log("=".repeat(60));

    if (errors.length > 0) {
      console.log("\n❌ Errors encountered:");
      for (const error of errors) {
        console.log(`   - ${error.keyName} (${error.keyPrefix}): ${error.error}`);
      }
    }

    if (successCount === apiKeys.length) {
      console.log("\n✅ All API keys migrated successfully!");
      console.log("\n⚠️  NEXT STEPS:");
      console.log("   1. Verify the migrated data in the Go backend database");
      console.log("   2. Create a Prisma migration to remove the ApiKey model");
      console.log("   3. Update the application code to use Go API exclusively");
    } else {
      console.log("\n⚠️  Some migrations failed. Please review errors and retry.");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateApiKeys();
