// diag_openai.ts

import { config } from "dotenv";
config(); // Load environment variables

import OpenAI from "openai";
import { generateGardeningTip } from "./server/services/openai";

async function runDiagnostics() {
  console.log("Running OpenAI Diagnostics...");

  // 1. Check for OPENAI_API_KEY
  console.log("\n1. Checking for OPENAI_API_KEY environment variable...");
  if (process.env.OPENAI_API_KEY) {
    console.log("   ✅ OPENAI_API_KEY found.");
  } else {
    console.error("   ❌ OPENAI_API_KEY not found. Please set this environment variable.");
    return; // Exit if key is not found
  }

  // 2. Attempt to connect to OpenAI and list models
  console.log("\n2. Testing connection to OpenAI by listing models...");
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    await openai.models.list();
    console.log("   ✅ Successfully connected to OpenAI.");
  } catch (error) {
    console.error("   ❌ Failed to connect to OpenAI.");
    if (error instanceof OpenAI.APIError) {
      console.error("      OpenAI API Error:", error.status, error.message, error.code, error.type);
    } else {
      console.error("      Error:", error);
    }
    return; // Exit if connection fails
  }

  // 3. Test the generateGardeningTip function with mock data
  console.log("\n3. Testing generateGardeningTip function...");
  try {
    const mockRequest = {
      category: "Testing",
      season: "Any",
      skillLevel: "Beginner",
    };
    console.log("   - Calling generateGardeningTip with mock data:", mockRequest);
    const tip = await generateGardeningTip(mockRequest);
    console.log("   ✅ generateGardeningTip function executed successfully.");
    console.log("   - Received tip:", tip.title);
  } catch (error) {
    console.error("   ❌ generateGardeningTip function failed.");
    console.error("      Error:", error);
  }

  console.log("\nDiagnostics complete.");
}

runDiagnostics();
