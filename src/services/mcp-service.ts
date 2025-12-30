import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import logger from "@/lib/logger";
import { MCPClient } from "@/lib/mcp/client";
import { prisma } from "@/lib/prisma";

export interface EnrichedTool extends Tool {
  serverId: string;
}

export class MCPService {
  /**
   * Discovers tools from all enabled MCP servers for a given assistant.
   * Returns a list of tools with their source serverId.
   */
  async getToolsForAssistant(assistantId: string): Promise<EnrichedTool[]> {
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      include: {
        mcpServers: {
          include: {
            server: true, // Fetch the actual server details
          },
        },
      },
    });

    if (!assistant) {
      logger.warn(`Assistant ${assistantId} not found`);
      return [];
    }

    const tools: EnrichedTool[] = [];

    // Parallelize discovery?
    const promises = assistant.mcpServers.map(async (rel) => {
      const { server } = rel;
      if (!server.enabled) return;

      let client: MCPClient | null = null;
      try {
        client = new MCPClient(server.url);
        await client.connect();

        const result = await client.getTools();
        const serverTools = result.tools.map((t) => ({
          ...t,
          serverId: server.id,
        }));
        tools.push(...serverTools);
      } catch (err) {
        logger.error(
          { err, serverId: server.id, url: server.url },
          "Failed to list tools from MCP server",
        );
      } finally {
        if (client) {
          await client
            .close()
            .catch((e) => logger.error({ e }, "Error closing MCP client"));
        }
      }
    });

    await Promise.all(promises);
    return tools;
  }

  /**
   * Executes a specific tool on the corresponding MCP server.
   */
  // biome-ignore lint/suspicious/noExplicitAny: MCP 工具参数是动态的，由具体工具定义
  async executeTool(serverId: string, toolName: string, args: any) {
    const server = await prisma.mCPServer.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new Error(`MCP Server ${serverId} not found`);
    }

    const client = new MCPClient(server.url);
    try {
      await client.connect();
      const result = await client.callTool(toolName, args);
      return result;
    } catch (err) {
      logger.error({ err, serverId, toolName }, "Failed to execute tool");
      throw err;
    } finally {
      await client.close().catch(() => {});
    }
  }
}

export const mcpService = new MCPService();
