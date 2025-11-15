"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	CodeBlock,
	CodeBlockCode,
	CodeBlockGroup,
	CodeBlockLanguageSelector,
} from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import { cn } from "@/lib/shared/utils";

interface QuickstartExamplesProps {
	apiKey: string;
	className?: string;
	showTitle?: boolean;
	title?: string;
	description?: string;
}

type ProviderId = "openai" | "anthropic" | "gemini" | "select-model";
type EndpointId =
	| "chat-completions"
	| "messages"
	| "gemini-chat"
	| "select-model";

interface ProviderCard {
	id: ProviderId;
	name: string;
	description: string;
	logo: string;
	endpoints: EndpointId[];
}

interface EndpointMeta {
	label: string;
	description: string;
}

interface Language {
	id: "curl" | "javascript" | "python";
	name: string;
	badge: string;
}

interface CodeExample {
	title: string;
	installNote?: {
		text: string;
		command: string;
	};
	code: (apiKey: string, apiBaseUrl: string) => string;
	language: string;
}

type EndpointExamples = Record<Language["id"], CodeExample>;

const API_BASE_URL = env.NEXT_PUBLIC_ADAPTIVE_API_BASE_URL;

const PROVIDERS: ProviderCard[] = [
	{
		id: "openai",
		name: "OpenAI",
		description: "GPT-4o, o1, and mini models via chat completions.",
		logo: "/logos/openai.webp",
		endpoints: ["chat-completions"],
	},
	{
		id: "anthropic",
		name: "Anthropic",
		description: "Claude 3.5 models through the Messages API.",
		logo: "/logos/anthropic.jpeg",
		endpoints: ["messages"],
	},
	{
		id: "gemini",
		name: "Gemini",
		description: "Gemini 2.5 Pro via Google AI Studio.",
		logo: "/logos/google.svg",
		endpoints: ["gemini-chat"],
	},
	{
		id: "select-model",
		name: "Adaptive Router",
		description: "Automatically select the best provider per request.",
		logo: "/logos/adaptive-dark.png",
		endpoints: ["select-model"],
	},
];

const ENDPOINT_DETAILS: Record<EndpointId, EndpointMeta> = {
	"chat-completions": {
		label: "Chat Completions",
		description: "POST /v1/chat/completions",
	},
	messages: {
		label: "Messages",
		description: "POST /v1/messages",
	},
	"gemini-chat": {
		label: "Gemini Native",
		description: "POST /v1beta/models/gemini-2.5-pro:generateContent",
	},
	"select-model": {
		label: "Select Model",
		description: "POST /v1/select-model",
	},
};

const LANGUAGES: Language[] = [
	{ id: "curl", name: "cURL", badge: "bash" },
	{ id: "javascript", name: "JavaScript", badge: "javascript" },
	{ id: "python", name: "Python", badge: "python" },
];

const CODE_EXAMPLES: Record<EndpointId, EndpointExamples> = {
	"chat-completions": {
		curl: {
			title: "Test with cURL",
			code: (apiKey, apiBaseUrl) => `curl -X POST "${apiBaseUrl}/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "gpt-4o-mini",
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
  baseURL: '${apiBaseUrl}/v1',
});

async function main() {
  const completion = await client.chat.completions.create({
    messages: [
      { 
        role: 'user', 
        content: 'Hello! How are you today?' 
      }
    ],
    model: 'gpt-4o-mini',
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
    base_url="${apiBaseUrl}/v1"
)

completion = client.chat.completions.create(
    model="gpt-4o-mini",
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
			code: (apiKey, apiBaseUrl) => `curl -X POST "${apiBaseUrl}/v1/messages" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "claude-3-5-sonnet",
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
  baseURL: '${apiBaseUrl}/v1',
});

async function main() {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet',
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
    base_url="${apiBaseUrl}/v1"
)

message = client.messages.create(
    model="claude-3-5-sonnet",
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
			code: (apiKey, apiBaseUrl) => `curl -X POST "${apiBaseUrl}/v1beta/models/gemini-2.5-pro:generateContent" \\
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
    '${apiBaseUrl}/v1beta/models/gemini-2.5-pro:generateContent',
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
	"select-model": {
		curl: {
			title: "Adaptive Select Model",
			code: (apiKey, apiBaseUrl) => `curl -X POST "${apiBaseUrl}/v1/select-model" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "prompt": "Summarize the latest product update for enterprise customers.",
    "candidates": [
      {
        "provider": "openai",
        "model": "gpt-4o-mini"
      },
      {
        "provider": "anthropic",
        "model": "claude-3-5-sonnet"
      },
      {
        "provider": "google-ai-studio",
        "model": "gemini-2.0-flash"
      }
    ],
    "constraints": {
      "max_latency_ms": 1200,
      "budget_usd": 0.05
    }
  }'`,
			language: "bash",
		},
		javascript: {
			title: "JavaScript/Node.js",
			code: (apiKey, apiBaseUrl) => `const response = await fetch(
  "${apiBaseUrl}/v1/select-model",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer ${apiKey}",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: "Choose the best model for a financial analysis request.",
      candidates: [
        { provider: "openai", model: "gpt-4o-mini" },
        { provider: "anthropic", model: "claude-3-5-sonnet" },
        { provider: "google-ai-studio", model: "gemini-2.0-pro" }
      ],
      metadata: {
        cost_bias: 0.5,
        max_latency_ms: 1200
      }
    })
  }
);

const routerDecision = await response.json();
console.log(routerDecision.selected_model);`,
			language: "javascript",
		},
		python: {
			title: "Python",
			code: (apiKey, apiBaseUrl) => `import requests

payload = {
    "prompt": "Pick the fastest model for summarizing support tickets.",
    "candidates": [
        {"provider": "openai", "model": "gpt-4o-mini"},
        {"provider": "anthropic", "model": "claude-3-5-sonnet"},
        {"provider": "google-ai-studio", "model": "gemini-2.0-flash"}
    ],
    "metadata": {
        "cost_bias": 0.4,
        "max_latency_ms": 1000
    }
}

response = requests.post(
    "${apiBaseUrl}/v1/select-model",
    headers={
        "Authorization": "Bearer ${apiKey}",
        "Content-Type": "application/json"
    },
    json=payload
)

print(response.json())`,
			language: "python",
		},
	},
};

const DEFAULT_PROVIDER_ID = (PROVIDERS[0]?.id ?? "openai") as ProviderId;
const DEFAULT_ENDPOINT_ID = (
	PROVIDERS[0]?.endpoints[0] ?? "chat-completions"
) as EndpointId;
const DEFAULT_LANGUAGE_ID = (LANGUAGES[0]?.id ?? "curl") as Language["id"];

export function QuickstartExamples({
	apiKey,
	className = "",
	showTitle = true,
	title = "🚀 Quick Start",
	description = "Test your API key with these examples",
}: QuickstartExamplesProps) {
	const [selectedProviderId, setSelectedProviderId] =
		useState<ProviderId>(DEFAULT_PROVIDER_ID);
	const [selectedEndpointId, setSelectedEndpointId] =
		useState<EndpointId>(DEFAULT_ENDPOINT_ID);
	const [languageSelections, setLanguageSelections] = useState<
		Partial<Record<EndpointId, Language["id"]>>
	>({});

	useEffect(() => {
		const provider = PROVIDERS.find((entry) => entry.id === selectedProviderId);
		const fallbackEndpoint = provider?.endpoints[0];

		if (
			provider &&
			!provider.endpoints.includes(selectedEndpointId) &&
			fallbackEndpoint
		) {
			setSelectedEndpointId(fallbackEndpoint);
		}
	}, [selectedProviderId, selectedEndpointId]);

	const selectedProvider = useMemo(
		() => PROVIDERS.find((entry) => entry.id === selectedProviderId),
		[selectedProviderId],
	);

	return (
		<div className={cn("space-y-6", className)}>
			{showTitle && (
				<div>
					<h3 className="font-semibold text-lg">{title}</h3>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
			)}

			<div className="space-y-3">
				<p className="text-muted-foreground text-sm">
					Pick the provider format to preview integration snippets.
				</p>
				<div className="grid gap-3 md:grid-cols-2">
					{PROVIDERS.map((provider) => {
						const isActive = provider.id === selectedProviderId;

						return (
							<button
								key={provider.id}
								type="button"
								aria-pressed={isActive}
								onClick={() => setSelectedProviderId(provider.id)}
								className={cn(
									"flex w-full items-start gap-3 rounded-xl border bg-background p-4 text-left transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
									isActive
										? "border-primary shadow-lg"
										: "hover:border-primary/40 hover:shadow-sm",
								)}
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
									<Image
										src={provider.logo}
										alt={`${provider.name} logo`}
										width={32}
										height={32}
										className="h-8 w-8 object-contain"
									/>
								</div>
								<div>
									<p className="font-semibold text-sm">{provider.name}</p>
									<p className="text-muted-foreground text-xs">
										{provider.description}
									</p>
								</div>
							</button>
						);
					})}
				</div>
			</div>

				{selectedProvider && selectedProvider.endpoints.length > 0 && (
					<div className="space-y-4 rounded-xl border bg-card/50 p-4 sm:p-6">
						<div className="flex w-full flex-wrap gap-2">
							{selectedProvider.endpoints.map((endpointId) => {
								const endpointMeta = ENDPOINT_DETAILS[endpointId];
								const isActive = selectedEndpointId === endpointId;
								return (
									<button
										key={endpointId}
										type="button"
										onClick={() => setSelectedEndpointId(endpointId)}
										aria-pressed={isActive}
										className={cn(
											"flex min-w-[180px] flex-1 flex-col items-start gap-1 rounded-lg border bg-background px-3 py-2 text-left transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
											isActive
												? "border-primary bg-primary/5"
												: "hover:border-primary/40",
										)}
									>
										<span className="font-medium text-sm">
											{endpointMeta.label}
										</span>
										<span className="text-muted-foreground text-xs">
											{endpointMeta.description}
										</span>
									</button>
								);
							})}
						</div>

						{selectedProvider.endpoints.map((endpointId) => {
							if (endpointId !== selectedEndpointId) return null;

						const endpointExamples = CODE_EXAMPLES[endpointId];
						if (!endpointExamples) {
							return (
								<div key={endpointId} className="mt-6">
									<p className="text-muted-foreground text-sm">
										Examples for this endpoint are coming soon.
									</p>
									</div>
								);
							}

							const availableLanguages = LANGUAGES.filter((language) =>
								Boolean(endpointExamples[language.id]),
							);
							const fallbackLanguageId =
								availableLanguages[0]?.id ?? DEFAULT_LANGUAGE_ID;
							const storedLanguageId = languageSelections[endpointId];
							const activeLanguageId =
								storedLanguageId && endpointExamples[storedLanguageId]
									? storedLanguageId
									: fallbackLanguageId;
							const example =
								endpointExamples[activeLanguageId] ||
								endpointExamples[fallbackLanguageId];

							if (!example) {
								return (
									<div key={endpointId} className="mt-6">
										<p className="text-muted-foreground text-sm">
											Examples for this endpoint are coming soon.
										</p>
									</div>
								);
							}

							const code = example.code(apiKey, API_BASE_URL);
							const languageMeta =
								(
									LANGUAGES.find(
										(language) => language.id === activeLanguageId,
									) ??
									availableLanguages[0] ??
									LANGUAGES[0]
								) as Language;

							return (
								<div key={endpointId} className="space-y-4">
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
										<CodeBlockGroup className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2">
											<div>
												<span className="font-medium text-sm">
													{example.title}
												</span>
												<p className="text-muted-foreground text-xs">
													{ENDPOINT_DETAILS[endpointId]?.description}
												</p>
											</div>
											<div className="flex flex-wrap items-center gap-2">
												<CodeBlockLanguageSelector
													options={availableLanguages.map((language) => ({
														id: language.id,
														label: language.name,
													}))}
													value={activeLanguageId}
													onChange={(id) =>
														setLanguageSelections((prev) => ({
															...prev,
															[endpointId]: id as Language["id"],
														}))
													}
												/>
												<Badge variant="secondary" className="text-xs capitalize">
													{languageMeta.badge}
												</Badge>
												<CopyButton
													content={code}
													copyMessage={`${languageMeta.name} code copied!`}
												/>
											</div>
										</CodeBlockGroup>
										<CodeBlockCode code={code} language={example.language} />
									</CodeBlock>
								</div>
							);
						})}
					</div>
				)}
		</div>
	);
}
