# Warehouse.ai MCP Server

An MCP (Model Context Protocol) server that exposes Warehouse.ai API endpoints as tools for use with AI assistants like Cursor.

## What is MCP?

MCP (Model Context Protocol) allows AI assistants to interact with external systems through standardized tools. This server makes your Warehouse.ai API accessible to AI assistants, enabling them to fetch data on your behalf.

## Features

- 📦 **Query package versions** - Check which versions are deployed in dev, test, or production
- 🔍 **List available versions** - See all published versions of any package
- 🌍 **Discover environments** - Find out where packages are deployed
- 📊 **Get environment details** - View environment-specific configurations
- 🔄 **Compare deployments** - Easily compare what's in different environments

## Available Tools

### `get_object`

Fetches object data from the Warehouse API.

**Parameters:**

- `name` (string, required): The name of the object to retrieve
- `env` (string, required): The environment (e.g., development, staging, production)
- `acceptedVariants` (array, optional): Array of accepted variants (e.g., ['en-US', 'en-GB'])
- `version` (string, optional): Specific version of the object (e.g., '1.0.0')

### `get_head`

Fetches head information for a specific name and environment (metadata without full object download).

**Parameters:**

- `name` (string, required): The name of the object
- `env` (string, required): The environment (e.g., development, staging, production)

### `list_versions`

Lists all available versions for a specific package.

**Parameters:**

- `name` (string, required): The name of the package (e.g., '@ux/application-sidebar')

### `list_environments`

Lists all environments where a specific package is deployed.

**Parameters:**

- `name` (string, required): The name of the package (e.g., '@ux/application-sidebar')

### `get_environment_details`

Fetches detailed information about a package in a specific environment, including metadata and configuration.

**Parameters:**

- `name` (string, required): The name of the package (e.g., '@ux/application-sidebar')
- `env` (string, required): The environment (e.g., development, staging, production)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-org/wrhs-next-mcp.git
   cd wrhs-next-mcp
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the project:**

   ```bash
   npm run build
   ```

4. **Configure Cursor:**

   Add the following to your Cursor MCP settings (**Settings... → Cursor Settings → Tools & MCP**):

   ```json
   {
     "mcpServers": {
       "wrhs-api": {
         "command": "node",
         "args": ["/absolute/path/to/wrhs-next-mcp/dist/index.js"],
         "env": {
           "WRHS_NEXT_ENDPOINT": "https://your-warehouse-api.com",
           "WRHS_NEXT_USERNAME": "your-username",
           "WRHS_NEXT_PASSWORD": "your-password"
         }
       }
     }
   }
   ```

   **Important:** Replace `/absolute/path/to/wrhs-next-mcp` with the actual path where you cloned the repo.

5. **Restart Cursor** to load the MCP server.

### Updating to Latest Version

```bash
cd wrhs-next-mcp
git pull
npm install
npm run build
# Restart Cursor
```

## Development

### Prerequisites

- Node.js 24+
- npm
- Access to Warehouse.ai API

### Local Development Setup

1. Clone and install dependencies (see above)

2. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:

   ```
   WRHS_NEXT_ENDPOINT=https://your-warehouse-api.com
   WRHS_NEXT_USERNAME=your-username
   WRHS_NEXT_PASSWORD=your-password
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

### Building

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Testing

### Method 1: MCP Inspector (Recommended for Development)

Install the MCP Inspector globally:

```bash
npm install -g @modelcontextprotocol/inspector
```

Run the inspector:

```bash
mcp-inspector node dist/index.js
```

This opens a web UI where you can:

- See all available tools
- Test tool calls with different parameters
- View responses in real-time

### Method 2: Testing in Cursor

1. Ensure the server is configured in Cursor (see Installation)
2. Restart Cursor
3. Check MCP connection status in **Settings... → Cursor Settings → Tools & MCP**
4. Test by asking Cursor:
   - "Use the wrhs-api to get object named 'test'"
   - "Fetch head information for 'myapp' in 'production' environment"

### Method 3: Log-Based Debugging

Add `console.error()` statements in `src/index.ts` for debugging. These logs appear in Cursor's MCP logs.

### Unit Tests & Code Quality

For information about unit testing, linting, and code quality tools, see **[TESTING.md](TESTING.md)**.

Quick commands:

```bash
npm test              # Run unit tests
npm run test:coverage # Run with coverage
npm run lint          # Check code quality
npm run validate      # Run all checks
```

## Project Structure

```
wrhs-next-mcp/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variable template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## How It Works

1. **Server Lifecycle**: The MCP server runs as a subprocess started by Cursor. It:
   - Starts when Cursor opens
   - Stays alive while Cursor is running
   - Terminates when Cursor closes

2. **Communication**: Uses stdio (standard input/output) to communicate with Cursor

3. **Authentication**: Credentials are passed via environment variables in the Cursor config

4. **API Client**: Uses the existing `warehouse.ai-api-client` npm package to interact with the warehouse API

## Troubleshooting

### "Server not found" error

- **Cause**: Incorrect path in Cursor config
- **Fix**: Use absolute path (run `pwd` in project directory) and ensure it points to `dist/index.js`

### "Authentication errors"

- **Cause**: Invalid credentials
- **Fix**: Verify `WRHS_NEXT_USERNAME` and `WRHS_NEXT_PASSWORD` in Cursor MCP config

### "No tools showing up"

- **Cause**: Build failed or server crashed
- **Fix**:
  1. Run `npm run build` and check for errors
  2. Check Cursor's MCP logs (**Settings... → Cursor Settings → Tools & MCP**)

### "Changes not reflecting"

- **Cause**: Server not reloaded
- **Fix**: After code changes, run `npm run build` then restart Cursor

### Missing `warehouse.ai-api-client` package

- **Cause**: Package not installed or not accessible
- **Fix**: Ensure the package is available in your npm registry or install it from your internal source

## Security Notes

⚠️ **Never commit credentials to version control!**

- Real credentials should only exist in:
  - Local `.env` files (git-ignored)
  - Individual Cursor MCP configs (per team member)
- The `.env.example` file should only contain placeholders
- Each team member uses their own credentials

## Future Enhancements

- [ ] Add write operations (POST, PUT, DELETE)
- [ ] Response caching for improved performance
- [ ] Better error messages for the AI
- [ ] Request/response logging for debugging
- [ ] Support for additional API endpoints
- [ ] Rate limiting and retry logic

## Contributing

1. Make changes in `src/`
2. Build: `npm run build`
3. Test with MCP Inspector or Cursor
4. Submit pull request

## License

ISC

## Support

For issues or questions:

- Check the [Troubleshooting](#troubleshooting) section
- Review MCP logs in Cursor settings

**Resources:**

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP SDK GitHub](https://github.com/modelcontextprotocol/sdk)
