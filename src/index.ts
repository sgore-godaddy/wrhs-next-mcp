#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import the warehouse.ai API client
// Since it doesn't have TypeScript types, we'll use 'any'
let WarehouseSDK: any;
let ObjectAPI: any;
try {
  // @ts-ignore - warehouse.ai-api-client doesn't have TypeScript definitions
  const module = await import("warehouse.ai-api-client");
  WarehouseSDK = module.WarehouseSDK || module.default?.WarehouseSDK;
  ObjectAPI = module.ObjectAPI || module.default?.ObjectAPI;
} catch (error) {
  console.error("Failed to import warehouse.ai-api-client:", error);
  process.exit(1);
}

// Get configuration from environment variables
const WRHS_NEXT_ENDPOINT = process.env.WRHS_NEXT_ENDPOINT || "";
const WRHS_NEXT_USERNAME = process.env.WRHS_NEXT_USERNAME || "";
const WRHS_NEXT_PASSWORD = process.env.WRHS_NEXT_PASSWORD || "";

if (!WRHS_NEXT_ENDPOINT || !WRHS_NEXT_USERNAME || !WRHS_NEXT_PASSWORD) {
  console.error("Error: Missing required environment variables.");
  console.error("Please set WRHS_NEXT_ENDPOINT, WRHS_NEXT_USERNAME, and WRHS_NEXT_PASSWORD");
  process.exit(1);
}

// Initialize the API client
const sdk = new WarehouseSDK({
  baseUrl: WRHS_NEXT_ENDPOINT,
  username: WRHS_NEXT_USERNAME,
  password: WRHS_NEXT_PASSWORD,
});

// Workaround: The warehouse.ai-api-client has a bug where object() returns undefined
// on subsequent calls, so we directly instantiate ObjectAPI
const objectAPI = new ObjectAPI({ request: sdk._request });

// Create MCP server
const server = new Server(
  {
    name: "wrhs-api",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_object",
        description:
          "Fetches object data from the Warehouse API. Use this to retrieve information about a specific object by name, environment, and optionally version and accepted variants.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the object to retrieve",
            },
            env: {
              type: "string",
              description: "The environment (e.g., development, staging, production)",
            },
            acceptedVariants: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Optional array of accepted variants (e.g., ['en-US', 'en-GB'])",
            },
            version: {
              type: "string",
              description: "Optional version of the object (e.g., '1.0.0')",
            },
          },
          required: ["name", "env"],
        },
      },
      {
        name: "get_head",
        description:
          "Fetches head information from the Warehouse API for a specific name and environment. Use this to get the latest version metadata without downloading the full object.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the object",
            },
            env: {
              type: "string",
              description: "The environment (e.g., development, staging, production)",
            },
          },
          required: ["name", "env"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_object") {
      const { 
        name: objectName, 
        env, 
        acceptedVariants, 
        version 
      } = args as { 
        name: string; 
        env: string; 
        acceptedVariants?: string[]; 
        version?: string;
      };
      
      if (!objectName || !env) {
        throw new Error("Both name and env are required");
      }

      // Call the API client method
      const params: any = { name: objectName, env };
      if (acceptedVariants) params.acceptedVariants = acceptedVariants;
      if (version) params.version = version;
      
      const response = await objectAPI.get(params);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } else if (name === "get_head") {
      const { name: objectName, env } = args as { name: string; env: string };

      if (!objectName || !env) {
        throw new Error("Both name and env are required");
      }

      // Call the API client method
      const response = await objectAPI.getHead({
        name: objectName,
        env,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message || "Unknown error occurred"}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Warehouse MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

