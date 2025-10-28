"use client";

import {
  SiOpenai,
  SiPython,
  SiJavascript,
  SiGoogle,
  SiAnthropic,
} from "react-icons/si";
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
import { env } from "@/env";
import { type IconType } from "react-icons";

interface QuickstartExamplesProps {
  apiKey: string;
  className?: string;
  showTitle?: boolean;
  title?: string;
  description?: string;
}

const API_BASE_URL = env.NEXT_PUBLIC_ADAPTIVE_API_BASE_URL;

// Provider configuration
interface Provider {
  id: string;
  name: string;
  icon: IconType;
}

const PROVIDERS: Provider[] = [
  { id: "chat-completions", name: "OpenAI", icon: SiOpenai },
  { id: "messages", name: "Anthropic", icon: SiAnthropic },
  { id: "gemini-chat", name: "Gemini", icon: SiGoogle },
];

// Language configuration
interface Language {
  id: string;
  name: string;
  icon: IconType;
  badge: string;
}

const LANGUAGES: Language[] = [
  { id: "curl", name: "cURL", icon: FaTerminal, badge: "bash" },
  {
    id: "javascript",
    name: "JavaScript",
    icon: SiJavascript,
    badge: "javascript",
  },
  { id: "python", name: "Python", icon: SiPython, badge: "python" },
];

// Code example configuration
interface CodeExample {
  title: string;
  installNote?: {
    text: string;
    command: string;
  };
  code: (apiKey: string, apiBaseUrl: string) => string;
  language: string;
}

type CodeExamples = {
  [provider: string]: {
    [language: string]: CodeExample;
  };
};

const getCodeExamples = (): CodeExamples => ({
  "chat-completions": {
    curl: {
      title: "Test with cURL",
      code: (
        apiKey,
        apiBaseUrl,
      ) => `curl -X POST "${apiBaseUrl}/chat/completions" \\
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
  }'`,
      language: "bash",
    },
    javascript: {
      title: "JavaScript/Node.js",
      installNote: {
        text: "Install the OpenAI SDK:",
        command: "npm install openai",
      },
      code: (apiKey, apiBaseUrl) => `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: '${apiKey}',
  baseURL: '${apiBaseUrl}',
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

main();`,
      language: "javascript",
    },
    python: {
      title: "Python",
      installNote: {
        text: "Install the OpenAI SDK:",
        command: "pip install openai",
      },
      code: (apiKey, apiBaseUrl) => `from openai import OpenAI

client = OpenAI(
    api_key="${apiKey}",
    base_url="${apiBaseUrl}"
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

print(completion.choices[0].message.content)`,
      language: "python",
    },
  },
  messages: {
    curl: {
      title: "Anthropic Messages API",
      code: (apiKey, apiBaseUrl) => `curl -X POST "${apiBaseUrl}/messages" \\
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
  }'`,
      language: "bash",
    },
    javascript: {
      title: "JavaScript/Node.js",
      installNote: {
        text: "Install the Anthropic SDK:",
        command: "npm install @anthropic-ai/sdk",
      },
      code: (apiKey, apiBaseUrl) => `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: '${apiKey}',
  baseURL: '${apiBaseUrl}',
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

main();`,
      language: "javascript",
    },
    python: {
      title: "Python",
      installNote: {
        text: "Install the Anthropic SDK:",
        command: "pip install anthropic",
      },
      code: (apiKey, apiBaseUrl) => `import anthropic

client = anthropic.Anthropic(
    api_key="${apiKey}",
    base_url="${apiBaseUrl}"
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

print(message.content[0].text)`,
      language: "python",
    },
  },
  "gemini-chat": {
    curl: {
      title: "Gemini Native API",
      code: (
        apiKey,
        apiBaseUrl,
      ) => `curl -X POST "${apiBaseUrl}/v1beta/models/gemini-2.5-pro:generateContent" \\
  -H "Content-Type: application/json" \\
  -H "x-goog-api-key: ${apiKey}" \\
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Hello! How are you today?"
          }
        ]
      }
    ],
    "config": {
      "temperature": 0.7,
      "maxOutputTokens": 150
    }
  }'`,
      language: "bash",
    },
    javascript: {
      title: "JavaScript/Node.js",
      installNote: {
        text: "Use native Gemini API format with fetch:",
        command: "No SDK installation required",
      },
      code: (apiKey, apiBaseUrl) => `const response = await fetch(
  '${apiBaseUrl}/v1beta/models/gemini-2.5-pro:generateContent',
  {
    method: 'POST',
    headers: {
      'x-goog-api-key': '${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Hello! How are you today?' }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 150
      }
    })
  }
);

const data = await response.json();
console.log(data.candidates[0].content.parts[0].text);`,
      language: "javascript",
    },
    python: {
      title: "Python",
      installNote: {
        text: "Use native Gemini API format with requests:",
        command: "pip install requests",
      },
      code: (apiKey, apiBaseUrl) => `import requests

response = requests.post(
    '${apiBaseUrl}/v1beta/models/intelligent-routing:generateContent',
    headers={
        'x-goog-api-key': '${apiKey}',
        'Content-Type': 'application/json'
    },
    json={
        'contents': [
            {
                'role': 'user',
                'parts': [
                    {'text': 'Hello! How are you today?'}
                ]
            }
        ],
        'config': {
            'temperature': 0.7,
            'maxOutputTokens': 150
        }
    }
)

data = response.json()
print(data['candidates'][0]['content']['parts'][0]['text'])`,
      language: "python",
    },
  },
});

export function QuickstartExamples({
  apiKey,
  className = "",
  showTitle = true,
  title = "🚀 Quick Start",
  description = "Test your API key with these examples",
}: QuickstartExamplesProps) {
  const codeExamples = getCodeExamples();

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
          <TabsList className="flex w-full gap-1">
            {PROVIDERS.map((provider) => (
              <Tooltip key={provider.id}>
                <TooltipTrigger asChild>
                  <TabsTrigger value={provider.id}>
                    <provider.icon className="h-5 w-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{provider.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TabsList>
        </TooltipProvider>

        {PROVIDERS.map((provider) => (
          <TabsContent key={provider.id} value={provider.id} className="mt-4">
            <Tabs defaultValue="curl" className="w-full">
              <TooltipProvider>
                <TabsList className="flex w-full gap-1">
                  {LANGUAGES.map((language) => (
                    <Tooltip key={language.id}>
                      <TooltipTrigger asChild>
                        <TabsTrigger value={language.id}>
                          <language.icon className="h-4 w-4" />
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{language.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TabsList>
              </TooltipProvider>

              {LANGUAGES.map((language) => {
                const example = codeExamples[provider.id]?.[language.id];
                if (!example) return null;

                const code = example.code(apiKey, API_BASE_URL);

                return (
                  <TabsContent
                    key={language.id}
                    value={language.id}
                    className="mt-4"
                  >
                    <div className="space-y-4">
                      {example.installNote && (
                        <div className="rounded-lg border bg-muted/50 p-3">
                          <p className="text-sm font-medium">
                            {example.installNote.text}
                          </p>
                          <code className="mt-1 block text-muted-foreground text-sm">
                            {example.installNote.command}
                          </code>
                        </div>
                      )}
                      <CodeBlock>
                        <CodeBlockGroup className="border-b px-4 py-2">
                          <span className="font-medium text-sm">
                            {example.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {language.badge}
                            </Badge>
                            <CopyButton
                              content={code}
                              copyMessage={`${language.name} code copied!`}
                            />
                          </div>
                        </CodeBlockGroup>
                        <CodeBlockCode
                          code={code}
                          language={example.language}
                        />
                      </CodeBlock>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
