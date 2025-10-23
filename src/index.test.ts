import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock environment variables
const mockEnv = {
  WRHS_NEXT_ENDPOINT: "https://test-warehouse.example.com",
  WRHS_NEXT_USERNAME: "test-user",
  WRHS_NEXT_PASSWORD: "test-pass",
};

// Mock the warehouse.ai-api-client
const mockObjectAPI = {
  get: vi.fn(),
  getHead: vi.fn(),
  listVersions: vi.fn(),
};

const mockEnvAPI = {
  list: vi.fn(),
  get: vi.fn(),
};

class MockWarehouseSDK {
  _request: any;
  constructor(config: any) {
    this._request = { config };
  }
}

class MockObjectAPI {
  constructor(_options: any) {}
  get = mockObjectAPI.get;
  getHead = mockObjectAPI.getHead;
  listVersions = mockObjectAPI.listVersions;
}

class MockEnvAPI {
  constructor(_options: any) {}
  list = mockEnvAPI.list;
  get = mockEnvAPI.get;
}

vi.mock("warehouse.ai-api-client", () => ({
  WarehouseSDK: MockWarehouseSDK,
  ObjectAPI: MockObjectAPI,
  EnvAPI: MockEnvAPI,
}));

// Mock dotenv
vi.mock("dotenv", () => ({
  default: {
    config: vi.fn(),
  },
}));

// Mock MCP SDK
const mockServerMethods = {
  setRequestHandler: vi.fn(),
  connect: vi.fn(),
};

class MockServer {
  setRequestHandler = mockServerMethods.setRequestHandler;
  connect = mockServerMethods.connect;
  constructor(_info: any, _options: any) {}
}

vi.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
  Server: MockServer,
}));

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn(),
}));

vi.mock("@modelcontextprotocol/sdk/types.js", () => ({
  ListToolsRequestSchema: "ListToolsRequestSchema",
  CallToolRequestSchema: "CallToolRequestSchema",
}));

describe("Warehouse MCP Server", () => {
  beforeEach(() => {
    // Set up environment variables
    process.env.WRHS_NEXT_ENDPOINT = mockEnv.WRHS_NEXT_ENDPOINT;
    process.env.WRHS_NEXT_USERNAME = mockEnv.WRHS_NEXT_USERNAME;
    process.env.WRHS_NEXT_PASSWORD = mockEnv.WRHS_NEXT_PASSWORD;

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    delete process.env.WRHS_NEXT_ENDPOINT;
    delete process.env.WRHS_NEXT_USERNAME;
    delete process.env.WRHS_NEXT_PASSWORD;
  });

  describe("Tool Registration", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      vi.resetModules();

      // Set environment variables before import
      process.env.WRHS_NEXT_ENDPOINT = mockEnv.WRHS_NEXT_ENDPOINT;
      process.env.WRHS_NEXT_USERNAME = mockEnv.WRHS_NEXT_USERNAME;
      process.env.WRHS_NEXT_PASSWORD = mockEnv.WRHS_NEXT_PASSWORD;

      // Dynamic import to trigger module initialization
      await import("./index.js");
    });

    it("should register ListToolsRequestSchema handler", () => {
      expect(mockServerMethods.setRequestHandler).toHaveBeenCalledWith(
        "ListToolsRequestSchema",
        expect.any(Function)
      );
    });

    it("should register CallToolRequestSchema handler", () => {
      expect(mockServerMethods.setRequestHandler).toHaveBeenCalledWith(
        "CallToolRequestSchema",
        expect.any(Function)
      );
    });

    it("should register 5 tools", async () => {
      // Get the ListToolsRequestSchema handler
      const listToolsHandler = mockServerMethods.setRequestHandler.mock.calls.find(
        (call) => call[0] === "ListToolsRequestSchema"
      )?.[1];

      expect(listToolsHandler).toBeDefined();

      const result = await listToolsHandler();
      expect(result.tools).toHaveLength(5);
    });

    it("should register tools with correct names", async () => {
      const listToolsHandler = mockServerMethods.setRequestHandler.mock.calls.find(
        (call) => call[0] === "ListToolsRequestSchema"
      )?.[1];

      const result = await listToolsHandler();
      const toolNames = result.tools.map((tool: any) => tool.name);

      expect(toolNames).toEqual([
        "get_object",
        "get_head",
        "list_versions",
        "list_environments",
        "get_environment_details",
      ]);
    });
  });

  describe("Tool Handlers", () => {
    let callToolHandler: any;

    beforeEach(async () => {
      vi.clearAllMocks();
      // Force module reload
      vi.resetModules();

      // Set environment variables before import
      process.env.WRHS_NEXT_ENDPOINT = mockEnv.WRHS_NEXT_ENDPOINT;
      process.env.WRHS_NEXT_USERNAME = mockEnv.WRHS_NEXT_USERNAME;
      process.env.WRHS_NEXT_PASSWORD = mockEnv.WRHS_NEXT_PASSWORD;

      await import("./index.js");

      callToolHandler = mockServerMethods.setRequestHandler.mock.calls.find(
        (call) => call[0] === "CallToolRequestSchema"
      )?.[1];
    });

    describe("get_object", () => {
      it("should call objectAPI.get with correct parameters", async () => {
        mockObjectAPI.get.mockResolvedValue({ data: "test-data" });

        const request = {
          params: {
            name: "get_object",
            arguments: {
              name: "@ux/test-package",
              env: "development",
            },
          },
        };

        const result = await callToolHandler(request);

        expect(mockObjectAPI.get).toHaveBeenCalledWith({
          name: "@ux/test-package",
          env: "development",
        });
        expect(result.content[0].text).toContain("test-data");
      });

      it("should handle optional parameters", async () => {
        mockObjectAPI.get.mockResolvedValue({ data: "test-data" });

        const request = {
          params: {
            name: "get_object",
            arguments: {
              name: "@ux/test-package",
              env: "production",
              version: "1.0.0",
              acceptedVariants: ["en-US"],
            },
          },
        };

        await callToolHandler(request);

        expect(mockObjectAPI.get).toHaveBeenCalledWith({
          name: "@ux/test-package",
          env: "production",
          version: "1.0.0",
          acceptedVariants: ["en-US"],
        });
      });

      it("should return error when name is missing", async () => {
        const request = {
          params: {
            name: "get_object",
            arguments: {
              env: "development",
            },
          },
        };

        const result = await callToolHandler(request);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("Both name and env are required");
      });
    });

    describe("get_head", () => {
      it("should call objectAPI.getHead with correct parameters", async () => {
        mockObjectAPI.getHead.mockResolvedValue({
          headVersion: "1.0.0",
          latestVersion: "1.0.0",
        });

        const request = {
          params: {
            name: "get_head",
            arguments: {
              name: "@ux/test-package",
              env: "production",
            },
          },
        };

        const result = await callToolHandler(request);

        expect(mockObjectAPI.getHead).toHaveBeenCalledWith({
          name: "@ux/test-package",
          env: "production",
        });
        expect(result.content[0].text).toContain("headVersion");
      });

      it("should return error when parameters are missing", async () => {
        const request = {
          params: {
            name: "get_head",
            arguments: {
              name: "@ux/test-package",
            },
          },
        };

        const result = await callToolHandler(request);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("Both name and env are required");
      });
    });

    describe("list_versions", () => {
      it("should call objectAPI.listVersions with correct parameters", async () => {
        mockObjectAPI.listVersions.mockResolvedValue([
          { version: "1.0.0", environments: ["development"] },
          { version: "1.0.1", environments: ["production"] },
        ]);

        const request = {
          params: {
            name: "list_versions",
            arguments: {
              name: "@ux/test-package",
            },
          },
        };

        const result = await callToolHandler(request);

        expect(mockObjectAPI.listVersions).toHaveBeenCalledWith({
          name: "@ux/test-package",
        });
        expect(result.content[0].text).toContain("1.0.0");
        expect(result.content[0].text).toContain("1.0.1");
      });

      it("should return error when name is missing", async () => {
        const request = {
          params: {
            name: "list_versions",
            arguments: {},
          },
        };

        const result = await callToolHandler(request);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("name is required");
      });
    });

    describe("list_environments", () => {
      it("should call envAPI.list with correct parameters", async () => {
        mockEnvAPI.list.mockResolvedValue([
          { name: "@ux/test-package", env: "development" },
          { name: "@ux/test-package", env: "production" },
        ]);

        const request = {
          params: {
            name: "list_environments",
            arguments: {
              name: "@ux/test-package",
            },
          },
        };

        const result = await callToolHandler(request);

        expect(mockEnvAPI.list).toHaveBeenCalledWith({
          name: "@ux/test-package",
        });
        expect(result.content[0].text).toContain("development");
        expect(result.content[0].text).toContain("production");
      });
    });

    describe("get_environment_details", () => {
      it("should call envAPI.get with correct parameters", async () => {
        mockEnvAPI.get.mockResolvedValue({
          name: "@ux/test-package",
          env: "production",
          config: { key: "value" },
        });

        const request = {
          params: {
            name: "get_environment_details",
            arguments: {
              name: "@ux/test-package",
              env: "production",
            },
          },
        };

        const result = await callToolHandler(request);

        expect(mockEnvAPI.get).toHaveBeenCalledWith({
          name: "@ux/test-package",
          env: "production",
        });
        expect(result.content[0].text).toContain("production");
      });
    });

    describe("Error Handling", () => {
      it("should handle API errors gracefully", async () => {
        mockObjectAPI.getHead.mockRejectedValue(new Error("API Error"));

        const request = {
          params: {
            name: "get_head",
            arguments: {
              name: "@ux/test-package",
              env: "production",
            },
          },
        };

        const result = await callToolHandler(request);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("API Error");
      });

      it("should handle unknown tool names", async () => {
        const request = {
          params: {
            name: "unknown_tool",
            arguments: {},
          },
        };

        const result = await callToolHandler(request);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("Unknown tool");
      });
    });
  });

  describe("SDK Initialization", () => {
    it("should load without errors when environment variables are set", async () => {
      // If this doesn't throw, the SDK initialized successfully
      await expect(import("./index.js")).resolves.toBeDefined();
    });

    it("should have ObjectAPI methods available", async () => {
      await import("./index.js");

      // Verify the mock methods exist
      expect(mockObjectAPI.get).toBeDefined();
      expect(mockObjectAPI.getHead).toBeDefined();
      expect(mockObjectAPI.listVersions).toBeDefined();
    });

    it("should have EnvAPI methods available", async () => {
      await import("./index.js");

      // Verify the mock methods exist
      expect(mockEnvAPI.list).toBeDefined();
      expect(mockEnvAPI.get).toBeDefined();
    });
  });
});
