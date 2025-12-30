import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import logger from "@/lib/logger";

export class MCPClient {
  private client: Client;
  private transport: SSEClientTransport;
  private url: string;

  constructor(url: string) {
    this.url = url;
    this.transport = new SSEClientTransport(new URL(url));
    this.client = new Client(
      {
        name: "mkchat-web-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    );
  }

  async connect() {
    logger.info(`Connecting to MCP Server: ${this.url}`);
    await this.client.connect(this.transport);
    logger.info(`Connected to MCP Server: ${this.url}`);
  }

  async getTools() {
    return this.client.listTools();
  }

  async callTool(name: string, args: any) {
    return this.client.callTool({
      name,
      arguments: args,
    });
  }

  async close() {
    await this.client.close();
  }
}
