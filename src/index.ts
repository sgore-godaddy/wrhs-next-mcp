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
let EnvAPI: any;
try {
  // @ts-ignore - warehouse.ai-api-client doesn't have TypeScript definitions
  const module = await import("warehouse.ai-api-client");
  WarehouseSDK = module.WarehouseSDK || module.default?.WarehouseSDK;
  ObjectAPI = module.ObjectAPI || module.default?.ObjectAPI;
  EnvAPI = module.EnvAPI || module.default?.EnvAPI;
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
// on subsequent calls, so we directly instantiate ObjectAPI and EnvAPI
const objectAPI = new ObjectAPI({ request: sdk._request });
const envAPI = new EnvAPI({ request: sdk._request });

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
          "Fetches complete object data from the Warehouse API, including the full package contents. Use this when you need the actual package data/files. For just checking versions, use get_head instead as it's more efficient.\n\n" +
          "Use this tool to retrieve information about a specific object by name, environment, and optionally version and accepted variants.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the package/object to retrieve (e.g., '@ux/application-sidebar')",
            },
            env: {
              type: "string",
              description: "The environment: use 'development' for dev, 'staging' for test, or 'production' for prod",
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
              description: "Optional specific version of the object (e.g., '1.0.0'). If not provided, returns the latest version.",
            },
          },
          required: ["name", "env"],
        },
      },
      {
        name: "get_head",
        description:
          "Fetches version information from the Warehouse API for a specific package and environment. This is the PRIMARY TOOL to use when users ask about warehouse versions.\n\n" +
          "USE THIS TOOL when users ask questions like:\n" +
          "- 'What is the warehouse version for [package]?'\n" +
          "- 'What version of [package] is in wrhs?'\n" +
          "- 'Tell me which version of [package] is available in dev/prod/staging'\n" +
          "- 'What is in warehouse for [package]?'\n\n" +
          "Returns headVersion (current deployed version) and latestVersion without downloading the full package data, making it much faster than get_object for version checks.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the package/object (e.g., '@ux/application-sidebar')",
            },
            env: {
              type: "string",
              description: "The environment: use 'development' for dev, 'staging' for test, or 'production' for prod",
            },
          },
          required: ["name", "env"],
        },
      },
      {
        name: "list_versions",
        description:
          "Lists all available versions for a specific package in Warehouse. This is useful for version discovery and history.\n\n" +
          "USE THIS TOOL when users ask questions like:\n" +
          "- 'What versions of [package] are available?'\n" +
          "- 'Show me all versions of [package]'\n" +
          "- 'What is the version history for [package]?'\n" +
          "- 'List versions of [package]'\n\n" +
          "Returns a list of all versions that have been published for the package.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the package/object (e.g., '@ux/application-sidebar')",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "list_environments",
        description:
          "Lists all environments where a specific package is deployed in Warehouse.\n\n" +
          "USE THIS TOOL when users ask questions like:\n" +
          "- 'Where is [package] deployed?'\n" +
          "- 'What environments have [package]?'\n" +
          "- 'Show me all environments for [package]'\n" +
          "- 'Is [package] in production?'\n\n" +
          "Returns a list of all environments (development, staging, production, etc.) where the package exists.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the package/object (e.g., '@ux/application-sidebar')",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "get_environment_details",
        description:
          "Fetches detailed information about a package in a specific environment, including metadata and configuration.\n\n" +
          "USE THIS TOOL when users ask questions like:\n" +
          "- 'Show me details about [package] in [environment]'\n" +
          "- 'What is the configuration for [package] in prod?'\n" +
          "- 'Give me environment-specific info for [package]'\n\n" +
          "Returns detailed environment-specific metadata, configuration, and status information.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the package/object (e.g., '@ux/application-sidebar')",
            },
            env: {
              type: "string",
              description: "The environment: use 'development' for dev, 'staging' for test, or 'production' for prod",
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
    } else if (name === "list_versions") {
      const { name: objectName } = args as { name: string };

      if (!objectName) {
        throw new Error("name is required");
      }

      // Call the API client method
      const response = await objectAPI.listVersions({
        name: objectName,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } else if (name === "list_environments") {
      const { name: objectName } = args as { name: string };

      if (!objectName) {
        throw new Error("name is required");
      }

      // Call the API client method
      const response = await envAPI.list({
        name: objectName,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } else if (name === "get_environment_details") {
      const { name: objectName, env } = args as { name: string; env: string };

      if (!objectName || !env) {
        throw new Error("Both name and env are required");
      }

      // Call the API client method
      const response = await envAPI.get({
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

