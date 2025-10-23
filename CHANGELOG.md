# Changelog

## [Updated] - October 23, 2025

### Changed - SDK Integration Update

**Updated to use correct `warehouse.ai-api-client` SDK pattern**

#### Code Changes

1. **SDK Initialization** (`src/index.ts`)
   - Changed from generic client initialization to proper `WarehouseSDK` class
   - Updated import: `const { WarehouseSDK } = require('warehouse.ai-api-client')`
   - SDK initialization now uses: `new WarehouseSDK({ baseUrl, username, password })`

2. **API Method Calls**
   - Updated `get_object` to use `sdk.object().get()` with proper parameters
   - Updated `get_head` to use `sdk.object().getHead()` with proper parameters

3. **Enhanced get_object Tool**
   - Now accepts `env` parameter (required)
   - Added optional `acceptedVariants` array parameter for locale support
   - Added optional `version` parameter for specific version retrieval
   - Example: `sdk.object().get({ name, env, acceptedVariants: ['en-US'], version: '1.0.0' })`

#### Environment Variable Renaming

Changed all environment variable names for better clarity:

| Old Name | New Name |
|----------|----------|
| `API_BASE_URL` | `WRHS_NEXT_ENDPOINT` |
| `API_USERNAME` | `WRHS_NEXT_USERNAME` |
| `API_PASSWORD` | `WRHS_NEXT_PASSWORD` |

**Updated in:**
- `src/index.ts` - Main server code
- `.env.example` - Configuration template
- `README.md` - All occurrences in documentation
- `QUICKSTART.md` - Quick start examples
- `IMPLEMENTATION_SUMMARY.md` - Implementation guide

#### Documentation Updates

All documentation now reflects:
- Correct SDK usage pattern
- New environment variable names
- Enhanced `get_object` parameters
- Updated example commands to include required `env` parameter

#### Breaking Changes

⚠️ **Action Required for Existing Users:**

1. **Update Cursor MCP Configuration:**
   Replace old environment variable names with new ones:
   ```json
   {
     "mcpServers": {
       "wrhs-api": {
         "command": "node",
         "args": ["/path/to/wrhs-next-mcp/dist/index.js"],
         "env": {
           "WRHS_NEXT_ENDPOINT": "https://your-warehouse-api.com",
           "WRHS_NEXT_USERNAME": "your-username",
           "WRHS_NEXT_PASSWORD": "your-password"
         }
       }
     }
   }
   ```

2. **Update get_object Calls:**
   The `get_object` tool now requires both `name` AND `env` parameters:
   - Old: "Get object named 'test'"
   - New: "Get object named 'test' in 'development' environment"

3. **Rebuild and Restart:**
   ```bash
   npm run build
   # Restart Cursor
   ```

#### Technical Details

- Build size: 4.67 KB (increased from 3.68 KB due to enhanced parameters)
- Added `@ts-ignore` comment for `warehouse.ai-api-client` import (package lacks TS definitions)
- All linter errors resolved
- Build successfully tested

---

## [Initial] - October 23, 2025

### Added

- Initial MCP server implementation for Warehouse.ai API
- Two tools: `get_object` and `get_head`
- TypeScript setup with tsup (zero-config bundler)
- Basic authentication support
- Comprehensive documentation (README, QUICKSTART, IMPLEMENTATION_SUMMARY)
- Environment variable configuration
- Git repository initialization

