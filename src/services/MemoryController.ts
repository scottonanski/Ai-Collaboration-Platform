import { CollaborationState, ChatMessage, MemoryChunk } from "../collaborationTypes";

export class MemoryController {
  static getContext(state: CollaborationState, header: string): string {
    const strategic = (state.memory.strategicMemory || [])
      .map((c: any) => `## Summary\n${c.summary || c.content || 'No summary'}`)
      .join("\n\n");
    const working = state.memory.workingMemory
      .slice(-5)
      .map((m) => `${m.senderName}: ${m.message}`)
      .join("\n");
    return [header, strategic, working ? `### Recent Conversation\n${working}` : ""]
      .filter((s) => s.length > 0)
      .join("\n\n");
  }

  static compress(workingMemory: ChatMessage[]): {
    compressed: MemoryChunk;
    remaining: ChatMessage[];
  } {
    if (workingMemory.length < 5) {
      return {
        compressed: { summary: "", timestamp: Date.now() },
        remaining: workingMemory,
      };
    }

    const summaryContent = workingMemory
      .slice(0, workingMemory.length - 2)
      .map((m) => m.message)
      .join(" ");
    return {
      compressed: {
        summary: `Summarized: ${summaryContent.substring(0, 50)}...`,
        timestamp: Date.now(),
      },
      remaining: workingMemory.slice(-2),
    };
  }
}