import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
dotenv.config({ path: "../.env" });

const openrouter = new OpenRouter({
  apiKey: process.env.open_router_key ?? ""
});

function extractPythonCode(raw: string): string {
  const fencedMatch = raw.match(/```(?:python)?\s*([\s\S]*?)```/i);
  const code = fencedMatch ? fencedMatch[1] : raw;
  return `${code.trim()}\n`;
}

const stream = await openrouter.chat.send({
  chatRequest: {
    model: "google/gemini-2.5-flash-lite",
    messages: [
      {
        role: "user",
        content: `Write a simple Python hello world program.

Rules:

- Output only raw Python code

- No markdown

- No explanations` 
       
      }
    ],
    stream: true
  }
});

let rawResponse = "";
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    rawResponse += content;
  }
}

const pythonCode = extractPythonCode(rawResponse);
const outputPath = path.resolve(process.cwd(), "llm.py");
fs.writeFileSync(outputPath, pythonCode);

exec(`

cd .. &&  docker build -t my-python-app . && docker run  my-python-app

`, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
  }
  if (stderr) {
    console.error(stderr);
  }
  if (stdout) {
    console.log(stdout);
  }
});



