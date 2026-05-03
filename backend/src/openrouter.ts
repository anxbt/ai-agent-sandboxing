// @ts-nocheck

import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";
import type { ChatResponse, Message as ChatMessage } from "@openrouter/sdk";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
dotenv.config({ path: "../.env" });

const openRouter = new OpenRouter({
  apiKey: process.env.open_router_key ?? ""
});


type ChatMessage = {
  role: "user" | "assistant" | "tool" | "system";
  content: string | null;
  toolCallId?: string;
  toolCalls?: any[];
};


interface ToolResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}


const TOOL_MAPPING = {
  run_code: runInSandbox,
};
const csvContent = `date,product,region,units_sold,revenue,cost
2024-01-05,Shoes,North,120,60000,36000
2024-01-12,Bags,North,80,40000,16000`;

const messages:ChatMessage[] = [
    {
      role: "system",
      content: `You must always use the run_code tool before answering.
Do not answer from your own knowledge when code execution is available.
Only give the final answer after tool output has been returned.`,
    },
    {
      role: "user",
      content: `You are a data analyst. Analyze the following CSV data to answer the user's question.
      
CSV Data:
${csvContent}

User Question: ${"What were the total units sold and total revenue"}

Important:
- Always use run_code to actually execute code and get real answers
- Never use plt.show(); save charts to /output/chart.png (or chart1.png, chart2.png etc.)
- If you create a chart, write it with plt.savefig('/output/chart.png')
- Use pandas for data manipulation, matplotlib for charts
- Print your findings clearly with print()
- If your code fails, read the error and fix it`,
    },
  ];
const tools = [
  {
    type: "function",
    function: {
    name: "run_code",
    description:
      "Executes Python code in a secure Docker sandbox. Returns stdout, stderr, and base64-encoded images for any PNG files saved to /output/",
    input_schema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description:
            "Python code to execute. Save charts with plt.savefig('/output/chart.png')",
        },
        reasoning: {
          type: "string",
          description: "What this code does and why",
        },
      },
      required: ["code", "reasoning"],
    },
    },
  },
];




async function runInSandbox(args:{code:string, reasoning: string}) :Promise<string> {
  const outputDir = `/tmp/sandbox_${Date.now()}`;
  fs.mkdirSync(outputDir, { recursive: true });


  // Write code to a temp file (avoids shell escaping nightmares)
  const codeFile = path.join(outputDir, "script.py");
  fs.writeFileSync(codeFile, args.code);

  const dockerCommand = [
    `docker run --rm`,
    `--mount type=bind,source=${codeFile},target=/app/script.py`,
    `--mount type=bind,source=${outputDir},target=/output`,
    `my-python-app`,
    `sh -lc "python -m py_compile /app/script.py && python /app/script.py"`,
  ].join(" ");

   return new Promise((resolve)=>{
    exec(dockerCommand,(err,stdout,stderr)=>{
      const imageFiles = fs.existsSync(outputDir)
        ? fs.readdirSync(outputDir).filter((fileName) => fileName.toLowerCase().endsWith(".png"))
        : [];

      const images = imageFiles.map((fileName) => ({
        fileName,
        base64: fs.readFileSync(path.join(outputDir, fileName), { encoding: "base64" }),
      }));

      const result = {
         exitCode: err ? (err as any).code ?? 1 : 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        images,
      };
      resolve(JSON.stringify(result));
      console.log("the result is =>" + JSON.stringify(result))
      
    })
   })
}

async function callLLM(messages: ChatMessage[]): Promise<ChatResponse> {
  const result = await openRouter.chat.send({
    chatRequest: {
      model: 'google/gemini-2.5-flash-lite',
      tools,
      messages,
      stream: false,
    },
  });

  messages.push(result.choices[0].message);
  return result;
}

async function getToolResponse(response: Response): Promise<Message> {
  const toolCall = response.choices[0].message.toolCalls[0];
  const toolName = toolCall.function.name;
  const toolArgs = JSON.parse(toolCall.function.arguments);

  // Look up the correct tool locally, and call it with the provided arguments
  // Other tools can be added without changing the agentic loop
  const toolResult = await TOOL_MAPPING[toolName](toolArgs);

  return {
    role: 'tool',
    toolCallId: toolCall.id,
    content: toolResult,
  };
}

async function runAgent(messages: ChatMessage[], maxIterations = 10) {
  let hasExecutedTool = false;

  for (let i = 0; i < maxIterations; i++) {
    const res: ChatResponse = await openRouter.chat.send({
      chatRequest: {
        model: 'google/gemini-2.5-flash-lite',
        tools,
        messages,
        tool_choice: {
          type: "function",
          function: { name: "run_code" },
        },
        stream: false,
      }
    });

    const assistantMsg = res.choices[0].message;
    messages.push(assistantMsg);

    // If model requested tools, execute them sequentially
    const toolCalls = assistantMsg.toolCalls ?? [];
    if (toolCalls.length) {
      for (const tc of toolCalls) {
        const toolName = tc.function.name;
        const toolArgs = JSON.parse(tc.function.arguments || '{}');
        const toolOut = await TOOL_MAPPING[toolName](toolArgs);
        // append tool result as a 'tool' role message (string content)
        messages.push({ role: 'tool', toolCallId: tc.id, content: toolOut });
        hasExecutedTool = true;
      }
      continue; // let the model reason about tool results
    }

    // Only accept a direct answer after at least one sandbox execution.
    if (hasExecutedTool && assistantMsg.content && assistantMsg.content.trim().length) {
      return assistantMsg.content;
    }

    // assistant content was null/empty, or it answered too early — try again
  }

  // fallback: return last tool stdout if available
  const lastTool = [...messages].reverse().find(m => m.role === 'tool' && m.content);
  return lastTool ? lastTool.content : 'No final answer after retries';
}


const finalAnswer = await runAgent(messages, 10);
console.log(finalAnswer);




