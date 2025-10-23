# Quick Start Guide

## Immediate Next Steps

### 1. Add to Cursor (Right Now!)

Open Cursor Settings → Features → Model Context Protocol and add this configuration:

```json
{
  "mcpServers": {
    "wrhs-api": {
      "command": "node",
      "args": ["/Users/sgore/work/ghec/sgore-godaddy/wrhs-next-mcp/dist/index.js"],
      "env": {
        "WRHS_NEXT_ENDPOINT": "https://your-warehouse-api.com",
        "WRHS_NEXT_USERNAME": "your-username",
        "WRHS_NEXT_PASSWORD": "your-password"
      }
    }
  }
}
```

**Replace with your actual:**
- WRHS_NEXT_ENDPOINT
- WRHS_NEXT_USERNAME  
- WRHS_NEXT_PASSWORD

### 2. Restart Cursor

Close and reopen Cursor completely.

### 3. Test It

In Cursor, try asking:
- "Use the wrhs-api to get object named 'test' in 'development' environment"
- "Fetch head information for 'myapp' in 'dev' environment"

### 4. Verify Connection

Go to Cursor Settings → Features → Model Context Protocol and check if "wrhs-api" shows as connected.

---

## Testing with MCP Inspector (Optional)

For debugging and testing without Cursor:

```bash
# Install inspector globally (one time)
npm install -g @modelcontextprotocol/inspector

# Set environment variables and run
export WRHS_NEXT_ENDPOINT="https://your-warehouse-api.com"
export WRHS_NEXT_USERNAME="your-username"
export WRHS_NEXT_PASSWORD="your-password"

# Launch inspector
mcp-inspector node /Users/sgore/work/ghec/sgore-godaddy/wrhs-next-mcp/dist/index.js
```

This opens a web UI at http://localhost:5173 where you can test the tools interactively.

---

## Making Changes

```bash
# 1. Edit files in src/
vim src/index.ts

# 2. Rebuild
npm run build

# 3. Restart Cursor to reload the server
```

---

## Sharing with Your Team

### Option 1: GitHub (Recommended)

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial MCP server setup"
   git remote add origin https://github.com/your-org/wrhs-next-mcp.git
   git push -u origin main
   ```

2. Team members clone and setup:
   ```bash
   git clone https://github.com/your-org/wrhs-next-mcp.git
   cd wrhs-next-mcp
   npm install
   npm run build
   ```

3. Each team member adds to their Cursor config with their own path and credentials.

### Option 2: Internal NPM (If Available)

See main README.md for publishing instructions.

---

## Common Issues

**"warehouse.ai-api-client not found"**
- Make sure the package is accessible in your npm registry
- Check package.json dependencies

**"Server not connecting"**
- Verify absolute path in Cursor config
- Check credentials are correct
- Look at Cursor's MCP logs for errors

**"Changes not appearing"**
- Run `npm run build` after changes
- Completely restart Cursor (not just reload window)

---

## Files Overview

- `src/index.ts` - Main server code (edit this to add features)
- `dist/index.js` - Built file (generated, don't edit)
- `package.json` - Dependencies and scripts
- `.env.example` - Template for local credentials (optional)
- `README.md` - Full documentation

---

## What You've Built

✅ TypeScript MCP server  
✅ Two working tools: `get_object` (with variants & version support) and `get_head`  
✅ Basic authentication support  
✅ Ready to use in Cursor  
✅ Easy to share with team  
✅ Extensible for future endpoints  

You're done! 🎉

