"use client";

import { SiOpenai, SiPython, SiJavascript, SiGoogle, SiAnthropic } from "react-icons/si";
import { FaTerminal } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockGroup,
} from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickstartExamplesProps {
  apiKey: string;
  className?: string;
  showTitle?: boolean;
  title?: string;
  description?: string;
}

const API_BASE_URL = "https://api.llmadaptive.uk/v1";

export function QuickstartExamples({
  apiKey,
  className = "",
  showTitle = true,
  title = "🚀 Quick Start",
  description = "Test your API key with these examples",
}: QuickstartExamplesProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      )}

      <Tabs defaultValue="chat-completions" className="w-full">
        <TooltipProvider>
          <TabsList className="grid w-full grid-cols-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="chat-completions">
                  <SiOpenai className="h-5 w-5" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>OpenAI</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="messages">
                  <SiAnthropic className="h-5 w-5" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Anthropic</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="gemini-chat">
                  <SiGoogle className="h-5 w-5" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gemini</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>
        </TooltipProvider>

        <TabsContent value="chat-completions" className="mt-4">
            <Tabs defaultValue="curl" className="w-full">
              <TooltipProvider>
                <TabsList className="grid w-full grid-cols-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="curl">
                        <FaTerminal className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>cURL</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="javascript">
                        <SiJavascript className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>JavaScript</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="python">
                        <SiPython className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Python</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsList>
              </TooltipProvider>

            <TabsContent value="curl" className="mt-4">
              <CodeBlock>
                <CodeBlockGroup className="border-b px-4 py-2">
                  <span className="font-medium text-sm">Test with cURL</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      bash
                    </Badge>
                    <CopyButton
                      content={`curl -X POST "${API_BASE_URL}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "",
    "messages": [
      {
        "role": "user", 
        "content": "Hello! How are you today?"
      }
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }'`}
                      copyMessage="cURL command copied!"
                    />
                  </div>
                </CodeBlockGroup>
                <CodeBlockCode
                  code={`curl -X POST "${API_BASE_URL}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "",
    "messages": [
      {
        "role": "user", 
        "content": "Hello! How are you today?"
      }
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }'`}
                  language="bash"
                />
              </CodeBlock>
            </TabsContent>

            <TabsContent value="javascript" className="mt-4">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium">
                    Install the OpenAI SDK:
                  </p>
                  <code className="mt-1 block text-muted-foreground text-sm">
                    npm install openai
                  </code>
                </div>
                <CodeBlock>
                  <CodeBlockGroup className="border-b px-4 py-2">
                    <span className="font-medium text-sm">
                      JavaScript/Node.js
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        javascript
                      </Badge>
                      <CopyButton
                        content={`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: '${apiKey}',
  baseURL: '${API_BASE_URL}',
});

async function main() {
  const completion = await client.chat.completions.create({
    messages: [
      { 
        role: 'user', 
        content: 'Hello! How are you today?' 
      }
    ],
    model: '',
    max_tokens: 150,
    temperature: 0.7,
  });

  console.log(completion.choices[0]);
}

main();`}
                        copyMessage="JavaScript code copied!"
                      />
                    </div>
                  </CodeBlockGroup>
                  <CodeBlockCode
                    code={`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: '${apiKey}',
  baseURL: '${API_BASE_URL}',
});

async function main() {
  const completion = await client.chat.completions.create({
    messages: [
      { 
        role: 'user', 
        content: 'Hello! How are you today?' 
      }
    ],
    model: '',
    max_tokens: 150,
    temperature: 0.7,
  });

  console.log(completion.choices[0]);
}

main();`}
                    language="javascript"
                  />
                </CodeBlock>
              </div>
            </TabsContent>

            <TabsContent value="python" className="mt-4">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium">
                    Install the OpenAI SDK:
                  </p>
                  <code className="mt-1 block text-muted-foreground text-sm">
                    pip install openai
                  </code>
                </div>
                <CodeBlock>
                  <CodeBlockGroup className="border-b px-4 py-2">
                    <span className="font-medium text-sm">Python</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        python
                      </Badge>
                      <CopyButton
                        content={`from openai import OpenAI

client = OpenAI(
    api_key="${apiKey}",
    base_url="${API_BASE_URL}"
)

completion = client.chat.completions.create(
    model="",
    messages=[
        {
            "role": "user",
            "content": "Hello! How are you today?"
        }
    ],
    max_tokens=150,
    temperature=0.7
)

print(completion.choices[0].message.content)`}
                        copyMessage="Python code copied!"
                      />
                    </div>
                  </CodeBlockGroup>
                  <CodeBlockCode
                    code={`from openai import OpenAI

client = OpenAI(
    api_key="${apiKey}",
    base_url="${API_BASE_URL}"
)

completion = client.chat.completions.create(
    model="",
    messages=[
        {
            "role": "user",
            "content": "Hello! How are you today?"
        }
    ],
    max_tokens=150,
    temperature=0.7
)

print(completion.choices[0].message.content)`}
                    language="python"
                  />
                </CodeBlock>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
            <Tabs defaultValue="curl" className="w-full">
              <TooltipProvider>
                <TabsList className="grid w-full grid-cols-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="curl">
                        <FaTerminal className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>cURL</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="javascript">
                        <SiJavascript className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>JavaScript</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="python">
                        <SiPython className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Python</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsList>
              </TooltipProvider>

            <TabsContent value="curl" className="mt-4">
              <CodeBlock>
                <CodeBlockGroup className="border-b px-4 py-2">
                  <span className="font-medium text-sm">
                    Anthropic Messages API
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      bash
                    </Badge>
                    <CopyButton
                      content={`curl -X POST "${API_BASE_URL}/messages" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "",
    "max_tokens": 150,
    "messages": [
      {
        "role": "user",
        "content": "Hello! How are you today?"
      }
    ]
  }'`}
                      copyMessage="cURL command copied!"
                    />
                  </div>
                </CodeBlockGroup>
                <CodeBlockCode
                  code={`curl -X POST "${API_BASE_URL}/messages" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "",
    "max_tokens": 150,
    "messages": [
      {
        "role": "user",
        "content": "Hello! How are you today?"
      }
    ]
  }'`}
                  language="bash"
                />
              </CodeBlock>
            </TabsContent>

            <TabsContent value="javascript" className="mt-4">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium">
                    Install the Anthropic SDK:
                  </p>
                  <code className="mt-1 block text-muted-foreground text-sm">
                    npm install @anthropic-ai/sdk
                  </code>
                </div>
                <CodeBlock>
                  <CodeBlockGroup className="border-b px-4 py-2">
                    <span className="font-medium text-sm">
                      JavaScript/Node.js
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        javascript
                      </Badge>
                      <CopyButton
                        content={`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: '${apiKey}',
  baseURL: '${API_BASE_URL}',
});

async function main() {
  const message = await client.messages.create({
    model: '',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: 'Hello! How are you today?'
      }
    ]
  });

  console.log(message.content[0]);
}

main();`}
                        copyMessage="JavaScript code copied!"
                      />
                    </div>
                  </CodeBlockGroup>
                  <CodeBlockCode
                    code={`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: '${apiKey}',
  baseURL: '${API_BASE_URL}',
});

async function main() {
  const message = await client.messages.create({
    model: '',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: 'Hello! How are you today?'
      }
    ]
  });

  console.log(message.content[0]);
}

main();`}
                    language="javascript"
                  />
                </CodeBlock>
              </div>
            </TabsContent>

            <TabsContent value="python" className="mt-4">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium">
                    Install the Anthropic SDK:
                  </p>
                  <code className="mt-1 block text-muted-foreground text-sm">
                    pip install anthropic
                  </code>
                </div>
                <CodeBlock>
                  <CodeBlockGroup className="border-b px-4 py-2">
                    <span className="font-medium text-sm">Python</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        python
                      </Badge>
                      <CopyButton
                        content={`import anthropic

client = anthropic.Anthropic(
    api_key="${apiKey}",
    base_url="${API_BASE_URL}"
)

message = client.messages.create(
    model="",
    max_tokens=150,
    messages=[
        {
            "role": "user",
            "content": "Hello! How are you today?"
        }
    ]
)

print(message.content[0].text)`}
                        copyMessage="Python code copied!"
                      />
                    </div>
                  </CodeBlockGroup>
                  <CodeBlockCode
                    code={`import anthropic

client = anthropic.Anthropic(
    api_key="${apiKey}",
    base_url="${API_BASE_URL}"
)

message = client.messages.create(
    model="",
    max_tokens=150,
    messages=[
        {
            "role": "user",
            "content": "Hello! How are you today?"
        }
    ]
)

print(message.content[0].text)`}
                    language="python"
                  />
                </CodeBlock>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="gemini-chat" className="mt-4">
            <Tabs defaultValue="curl" className="w-full">
              <TooltipProvider>
                <TabsList className="grid w-full grid-cols-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="curl">
                        <FaTerminal className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>cURL</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="javascript">
                        <SiJavascript className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>JavaScript</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="python">
                        <SiPython className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Python</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsList>
              </TooltipProvider>

            <TabsContent value="curl" className="mt-4">
              <CodeBlock>
                <CodeBlockGroup className="border-b px-4 py-2">
                  <span className="font-medium text-sm">
                    Gemini via OpenAI-compatible API
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      bash
                    </Badge>
                    <CopyButton
                      content={`curl -X POST "${API_BASE_URL}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "gemini-pro",
    "messages": [
      {
        "role": "user",
        "content": "Hello! How are you today?"
      }
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }'`}
                      copyMessage="cURL command copied!"
                    />
                  </div>
                </CodeBlockGroup>
                <CodeBlockCode
                  code={`curl -X POST "${API_BASE_URL}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "gemini-pro",
    "messages": [
      {
        "role": "user",
        "content": "Hello! How are you today?"
      }
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }'`}
                  language="bash"
                />
              </CodeBlock>
            </TabsContent>

            <TabsContent value="javascript" className="mt-4">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium">
                    Install the OpenAI SDK (Gemini uses OpenAI-compatible format):
                  </p>
                  <code className="mt-1 block text-muted-foreground text-sm">
                    npm install openai
                  </code>
                </div>
                <CodeBlock>
                  <CodeBlockGroup className="border-b px-4 py-2">
                    <span className="font-medium text-sm">
                      JavaScript/Node.js
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        javascript
                      </Badge>
                      <CopyButton
                        content={`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: '${apiKey}',
  baseURL: '${API_BASE_URL}',
});

async function main() {
  const completion = await client.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: 'Hello! How are you today?'
      }
    ],
    model: 'gemini-pro',
    max_tokens: 150,
    temperature: 0.7,
  });

  console.log(completion.choices[0]);
}

main();`}
                        copyMessage="JavaScript code copied!"
                      />
                    </div>
                  </CodeBlockGroup>
                  <CodeBlockCode
                    code={`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: '${apiKey}',
  baseURL: '${API_BASE_URL}',
});

async function main() {
  const completion = await client.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: 'Hello! How are you today?'
      }
    ],
    model: 'gemini-pro',
    max_tokens: 150,
    temperature: 0.7,
  });

  console.log(completion.choices[0]);
}

main();`}
                    language="javascript"
                  />
                </CodeBlock>
              </div>
            </TabsContent>

            <TabsContent value="python" className="mt-4">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium">
                    Install the OpenAI SDK (Gemini uses OpenAI-compatible format):
                  </p>
                  <code className="mt-1 block text-muted-foreground text-sm">
                    pip install openai
                  </code>
                </div>
                <CodeBlock>
                  <CodeBlockGroup className="border-b px-4 py-2">
                    <span className="font-medium text-sm">Python</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        python
                      </Badge>
                      <CopyButton
                        content={`from openai import OpenAI

client = OpenAI(
    api_key="${apiKey}",
    base_url="${API_BASE_URL}"
)

completion = client.chat.completions.create(
    model="gemini-pro",
    messages=[
        {
            "role": "user",
            "content": "Hello! How are you today?"
        }
    ],
    max_tokens=150,
    temperature=0.7
)

print(completion.choices[0].message.content)`}
                        copyMessage="Python code copied!"
                      />
                    </div>
                  </CodeBlockGroup>
                  <CodeBlockCode
                    code={`from openai import OpenAI

client = OpenAI(
    api_key="${apiKey}",
    base_url="${API_BASE_URL}"
)

completion = client.chat.completions.create(
    model="gemini-pro",
    messages=[
        {
            "role": "user",
            "content": "Hello! How are you today?"
        }
    ],
    max_tokens=150,
    temperature=0.7
)

print(completion.choices[0].message.content)`}
                    language="python"
                  />
                </CodeBlock>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

