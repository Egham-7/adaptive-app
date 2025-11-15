"use client";

import { Key, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { useMemo, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	CodeBlock,
	CodeBlockCode,
	CodeBlockGroup,
} from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateProjectApiKey } from "@/hooks/api_keys/use-create-project-api-key";
import { cn } from "@/lib/shared/utils";

interface QuickstartCodeSnippet {
	label: string;
	language: string;
	content: string;
}

interface QuickstartStepDefinition {
	title: string;
	description?: string;
	bullets?: string[];
	code?: QuickstartCodeSnippet;
}

interface DocQuickstart {
	id: string;
	title: string;
	logo: string;
	docsUrl: string;
	summary: string;
	tip?: string;
	steps: QuickstartStepDefinition[];
	codeSamples?: QuickstartCodeSnippet[];
	notes?: string[];
}

const DEVELOPER_TOOL_QUICKSTARTS: DocQuickstart[] = [
	{
		id: "claude-code",
		title: "Claude Code",
		logo: "/logos/claude-code",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/claude-code",
		summary: "Install the helper script and route every Claude Code request.",
		steps: [
			{
				title: "Run installer",
				code: {
					label: "Script",
					language: "bash",
					content: `curl -o claude-code.sh https://raw.githubusercontent.com/Egham-7/adaptive/main/scripts/installers/claude-code.sh
chmod +x claude-code.sh
./claude-code.sh`,
				},
			},
			{
				title: "Launch + verify",
				code: {
					label: "CLI",
					language: "bash",
					content: `claude
/status`,
				},
			},
		],
	},
	{
		id: "cursor",
		title: "Cursor",
		logo: "/logos/cursor",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/cursor",
		summary: "Treat Adaptive as an OpenAI-compatible provider inside Cursor.",
		steps: [
			{
				title: "Settings → Models → API Keys",
				description: "Enable OpenAI API Key and paste your Adaptive key.",
			},
			{
				title: "Override base URL",
				code: {
					label: "Base URL",
					language: "text",
					content: "https://api.llmadaptive.uk/v1",
				},
			},
		],
	},
	{
		id: "cline",
		title: "Cline",
		logo: "/logos/cline",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/cline",
		summary:
			"Point the VS Code extension at Adaptive and leave the model blank.",
		steps: [
			{
				title: "Install extension",
				description: "Search for “cline” in VS Code and open the panel.",
			},
			{
				title: "Enter connection info",
				description:
					"Provider: OpenAI Compatible · API Key: Adaptive key · Model: empty",
				code: {
					label: "settings.json",
					language: "json",
					content: `{
  "cline.provider": "openai-compatible",
  "cline.baseUrl": "https://api.llmadaptive.uk/v1",
  "cline.apiKey": "your-adaptive-api-key"
}`,
				},
			},
		],
	},
	{
		id: "opencode",
		title: "OpenCode",
		logo: "/logos/opencode",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/opencode",
		summary:
			"Register Adaptive once, then select the Intelligent Routing model.",
		steps: [
			{
				title: "Install + authenticate",
				code: {
					label: "CLI",
					language: "bash",
					content:
						"curl -fsSL https://raw.githubusercontent.com/Egham-7/adaptive/main/scripts/installers/opencode.sh | bash\nopencode auth login",
				},
			},
			{
				title: "Configure provider",
				code: {
					label: "opencode.json",
					language: "json",
					content: `{
  "provider": {
    "adaptive": {
      "options": { "baseURL": "https://api.llmadaptive.uk/v1" },
      "models": { "": { "name": "Intelligent Routing" } }
    }
  }
}`,
				},
			},
		],
	},
	{
		id: "kilo-code",
		title: "Kilo Code",
		logo: "/logos/kilo-code",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/kilo-code",
		summary: "Use the OpenAI-compatible mode with your Adaptive key.",
		steps: [
			{
				title: "Install plugin",
				description: "Grab Kilo Code from the VS Code marketplace.",
			},
			{
				title: "Add credentials",
				code: {
					label: "kilo-code settings",
					language: "json",
					content: `{
  "kiloCode": {
    "apiProvider": "openai-compatible",
    "baseUrl": "https://api.llmadaptive.uk/v1",
    "apiKey": "your-adaptive-api-key",
    "model": "adaptive/auto"
  }
}`,
				},
			},
		],
	},
	{
		id: "roo-code",
		title: "Roo Code",
		logo: "/logos/roo-code",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/roo-code",
		summary:
			"Set Roo Code’s provider to OpenAI Compatible and paste your Adaptive key.",
		steps: [
			{
				title: "Install extension",
				description: "Search for Roo Code and install it in VS Code.",
			},
			{
				title: "Configure API slot",
				code: {
					label: "settings.json",
					language: "json",
					content: `{
  "rooCode.provider": "openai-compatible",
  "rooCode.baseUrl": "https://api.llmadaptive.uk/v1",
  "rooCode.apiKey": "your-adaptive-api-key",
  "rooCode.model": ""
}`,
				},
			},
		],
	},
	{
		id: "grok-cli",
		title: "Grok CLI",
		logo: "/logos/grok-cli",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/grok-cli",
		summary:
			"Bootstrap the CLI and route prompts through Adaptive in two commands.",
		steps: [
			{
				title: "Run installer",
				code: {
					label: "Script",
					language: "bash",
					content:
						"curl -fsSL https://raw.githubusercontent.com/Egham-7/adaptive/main/scripts/installers/grok-cli.sh | bash",
				},
			},
			{
				title: "Smoke test",
				code: {
					label: "CLI",
					language: "bash",
					content: `grok --version
grok "Hello from Adaptive"`,
				},
			},
		],
	},
	{
		id: "gemini-cli",
		title: "Gemini CLI",
		logo: "/logos/gemini-cli",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/gemini-cli",
		summary: "Install the CLI, set the Adaptive base URL, and start prompting.",
		steps: [
			{
				title: "Install",
				code: {
					label: "Script",
					language: "bash",
					content:
						"curl -fsSL https://raw.githubusercontent.com/Egham-7/adaptive/main/scripts/installers/gemini-cli.sh | bash",
				},
			},
			{
				title: "Manual env (optional)",
				code: {
					label: "~/.bashrc",
					language: "bash",
					content: `export GEMINI_API_KEY="your-adaptive-api-key"
export GOOGLE_GEMINI_BASE_URL="https://api.llmadaptive.uk/v1beta"`,
				},
			},
		],
	},
	{
		id: "codex",
		title: "OpenAI Codex",
		logo: "/logos/codex",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/codex",
		summary: "Use the installer and keep the default model empty for routing.",
		steps: [
			{
				title: "Run installer",
				code: {
					label: "Script",
					language: "bash",
					content:
						"curl -fsSL https://raw.githubusercontent.com/Egham-7/adaptive/main/scripts/installers/codex.sh | bash",
				},
			},
			{
				title: "Optional config",
				code: {
					label: "~/.codex/config.toml",
					language: "toml",
					content: `model = ""
model_provider = "adaptive"`,
				},
			},
		],
	},
	{
		id: "qwen-code",
		title: "Qwen Code",
		logo: "/logos/qwen-code",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/qwen-code",
		summary:
			"Install Qwen Code with the helper script, then export OpenAI-compatible vars.",
		steps: [
			{
				title: "Run installer",
				code: {
					label: "Script",
					language: "bash",
					content:
						"curl -fsSL https://raw.githubusercontent.com/Egham-7/adaptive/main/scripts/installers/qwen-code.sh | bash",
				},
			},
			{
				title: "Manual env",
				code: {
					label: "~/.bashrc",
					language: "bash",
					content: `export OPENAI_API_KEY="your-adaptive-api-key"
export OPENAI_BASE_URL="https://api.llmadaptive.uk/v1"
export OPENAI_MODEL=""`,
				},
			},
		],
	},
];

const INTEGRATION_QUICKSTARTS: DocQuickstart[] = [
	{
		id: "openai-sdk",
		title: "OpenAI SDK",
		logo: "/logos/openai",
		docsUrl: "https://docs.llmadaptive.uk/integrations/openai-sdk",
		summary: "Swap baseURL/apiKey and keep your existing OpenAI code.",
		steps: [
			{
				title: "Install",
				code: { label: "pnpm", language: "bash", content: "pnpm add openai" },
			},
			{
				title: "Initialize client",
				code: {
					label: "JS",
					language: "javascript",
					content: `const openai = new OpenAI({
  apiKey: process.env.ADAPTIVE_API_KEY,
  baseURL: "https://api.llmadaptive.uk/v1",
});

await openai.chat.completions.create({
  model: "",
  messages: [{ role: "user", content: "Hello!" }],
});`,
				},
			},
			{
				title: "cURL alternative",
				code: {
					label: "cURL",
					language: "bash",
					content: `curl -X POST "https://api.llmadaptive.uk/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "adaptive/auto",
    "messages": [
      { "role": "user", "content": "Hello! How are you today?" }
    ]
  }'`,
				},
			},
			{
				title: "Select Model example",
				code: {
					label: "JavaScript",
					language: "javascript",
					content: `const response = await fetch("https://api.llmadaptive.uk/v1/select-model", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: "Summarize this support ticket.",
    candidates: [
      { provider: "openai", model: "gpt-4o-mini" },
      { provider: "anthropic", model: "claude-3-5-sonnet" }
    ]
  })
});

const decision = await response.json();
console.log(decision.selected_model);`,
				},
			},
		],
	},
	{
		id: "vercel-ai",
		title: "Vercel AI SDK",
		logo: "/logos/vercel",
		docsUrl: "https://docs.llmadaptive.uk/integrations/vercel-ai-sdk",
		summary: "Wrap the OpenAI provider with Adaptive credentials.",
		steps: [
			{
				title: "Install packages",
				code: {
					label: "pnpm",
					language: "bash",
					content: "pnpm add ai @ai-sdk/openai zod",
				},
			},
			{
				title: "Route handler",
				code: {
					label: "TS",
					language: "typescript",
					content: `const model = openai({
  apiKey: process.env.ADAPTIVE_API_KEY!,
  baseURL: "https://api.llmadaptive.uk/v1",
})("");

return streamText({ model, messages });`,
				},
			},
		],
	},
	{
		id: "langchain",
		title: "LangChain",
		logo: "/logos/langchain",
		docsUrl: "https://docs.llmadaptive.uk/integrations/langchain",
		summary: "ChatOpenAI works unchanged—just point base_url at Adaptive.",
		steps: [
			{
				title: "Install adapters",
				code: {
					label: "pip",
					language: "bash",
					content: "pip install langchain langchain-openai",
				},
			},
			{
				title: "Create LLM",
				code: {
					label: "Python",
					language: "python",
					content: `llm = ChatOpenAI(
    api_key="your-adaptive-api-key",
    base_url="https://api.llmadaptive.uk/v1",
    model="adaptive/auto"
)
llm.invoke("Explain RAG")`,
				},
			},
		],
	},
	{
		id: "langgraph",
		title: "LangGraph",
		logo: "/logos/langgraph",
		docsUrl: "https://docs.llmadaptive.uk/integrations/langgraph",
		summary: "Use the same ChatOpenAI client inside state graphs.",
		steps: [
			{
				title: "Install",
				code: {
					label: "pip",
					language: "bash",
					content: "pip install langgraph langchain-openai",
				},
			},
			{
				title: "Wire the node",
				code: {
					label: "Python",
					language: "python",
					content: `model = ChatOpenAI(
    api_key="your-adaptive-api-key",
    base_url="https://api.llmadaptive.uk/v1",
    model="adaptive/auto"
)
workflow.add_node("agent", lambda state: {"messages": [model.invoke(state["messages"])]})`,
				},
			},
		],
	},
	{
		id: "llamaindex",
		title: "LlamaIndex",
		logo: "/logos/llamaindex",
		docsUrl: "https://docs.llmadaptive.uk/integrations/llamaindex",
		summary: "Set the OpenAI LLM/embedding clients to the Adaptive base.",
		steps: [
			{
				title: "Install",
				code: {
					label: "pip",
					language: "bash",
					content:
						"pip install llama-index-llms-openai llama-index-embeddings-openai",
				},
			},
			{
				title: "Configure",
				code: {
					label: "Python",
					language: "python",
					content: `llm = OpenAI(
    model="adaptive/auto",
    api_base="https://api.llmadaptive.uk/v1",
    api_key="your-adaptive-api-key",
)
Settings.llm = llm`,
				},
			},
		],
	},
	{
		id: "crewai",
		title: "CrewAI",
		logo: "/logos/crewai",
		docsUrl: "https://docs.llmadaptive.uk/integrations/crewai",
		summary: "Give CrewAI an Adaptive-backed LLM and run agents as usual.",
		steps: [
			{
				title: "Install",
				code: {
					label: "pip",
					language: "bash",
					content: "pip install crewai crewai-tools",
				},
			},
			{
				title: "Create LLM",
				code: {
					label: "Python",
					language: "python",
					content: `llm = LLM(
    model="adaptive/auto",
    api_key="your-adaptive-api-key",
    base_url="https://api.llmadaptive.uk/v1"
)`,
				},
			},
		],
	},
];
interface ConnectSheetProps {
	projectId: number;
}

export function ConnectSheet({ projectId }: ConnectSheetProps) {
	const [apiKeyName, setApiKeyName] = useState("");
	const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const createApiKey = useCreateProjectApiKey();

	const handleCreateApiKey = async () => {
		if (!apiKeyName.trim()) {
			return;
		}

		createApiKey.mutate(
			{
				projectId,
				name: apiKeyName,
				expires_at: null,
			},
			{
				onSuccess: (data) => {
					if (data.key) {
						setCreatedApiKey(data.key);
						setShowCreateForm(false);
						setApiKeyName("");
					}
				},
			},
		);
	};

	const _displayApiKey = createdApiKey || "YOUR_API_KEY";

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="default" size="sm">
					<LinkIcon className="mr-2 h-4 w-4" />
					Connect
				</Button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="w-full overflow-y-auto sm:max-w-3xl"
			>
				<SheetHeader className="px-6 pt-6">
					<SheetTitle>Connect to Adaptive API</SheetTitle>
					<SheetDescription>
						Choose your preferred provider format and copy the integration
						examples below. All endpoints are compatible with their respective
						SDK formats.
					</SheetDescription>
				</SheetHeader>

				<div className="max-w-full space-y-4 px-6 pb-6">
					{/* API Key Creation Section */}
					<div className="space-y-3 rounded-lg border bg-muted/30 p-4">
						{!showCreateForm && !createdApiKey && (
							<Button
								onClick={() => setShowCreateForm(true)}
								variant="outline"
								size="sm"
								className="w-full"
							>
								<Key className="mr-2 h-4 w-4" />
								Create API Key (Optional)
							</Button>
						)}

						{showCreateForm && (
							<div className="space-y-3">
								<div className="space-y-2">
									<Label htmlFor="api-key-name">API Key Name</Label>
									<Input
										id="api-key-name"
										placeholder="e.g., My Integration Key"
										value={apiKeyName}
										onChange={(e) => setApiKeyName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleCreateApiKey();
											}
										}}
									/>
								</div>
								<div className="flex gap-2">
									<Button
										onClick={handleCreateApiKey}
										disabled={!apiKeyName.trim() || createApiKey.isPending}
										size="sm"
										className="flex-1"
									>
										{createApiKey.isPending ? "Creating..." : "Create Key"}
									</Button>
									<Button
										onClick={() => setShowCreateForm(false)}
										variant="outline"
										size="sm"
									>
										Cancel
									</Button>
								</div>
							</div>
						)}

						{createdApiKey && (
							<p className="font-medium text-green-600 text-sm dark:text-green-400">
								✓ API Key created! The examples below are now autofilled with
								your key.
							</p>
						)}
					</div>
					<DocsQuickstartSection
						title="Developer Tools"
						description="Configure local IDE agents and CLIs with your Adaptive API key."
						cards={DEVELOPER_TOOL_QUICKSTARTS}
					/>
					<DocsQuickstartSection
						title="Integrations"
						description="Follow the official integration quickstarts pulled directly from the docs."
						cards={INTEGRATION_QUICKSTARTS}
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
}

interface DocsQuickstartSectionProps {
	title: string;
	description: string;
	cards: DocQuickstart[];
}

function DocsQuickstartSection({
	title,
	description,
	cards,
}: DocsQuickstartSectionProps) {
	const [selectedId, setSelectedId] = useState(() => cards[0]?.id ?? "");
	const selectedCard = useMemo(() => {
		if (cards.length === 0) return null;
		return cards.find((card) => card.id === selectedId) ?? cards[0];
	}, [cards, selectedId]);

	if (!selectedCard) {
		return null;
	}

	return (
		<Accordion type="single" collapsible defaultValue="section">
			<AccordionItem
				value="section"
				className="rounded-2xl border bg-background/80 shadow-sm"
			>
				<AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
					<div className="text-left">
						<p className="font-semibold text-base">{title}</p>
						<p className="text-muted-foreground text-sm">{description}</p>
					</div>
				</AccordionTrigger>
				<AccordionContent className="border-t px-4 py-4">
					<div className="space-y-4">
						<div className="flex flex-wrap gap-3">
							{cards.map((card) => {
								const isActive = selectedCard?.id === card.id;
								return (
									<button
										key={card.id}
										type="button"
										onClick={() => setSelectedId(card.id)}
										aria-pressed={isActive}
										className={cn(
											"flex h-14 w-14 items-center justify-center rounded-2xl border bg-card p-2 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
											isActive
												? "border-primary shadow-md"
												: "opacity-70 hover:opacity-100",
										)}
									>
										<Image
											src={card.logo}
											alt={card.title}
											width={40}
											height={40}
											className="h-10 w-10 object-contain"
										/>
										<span className="sr-only">{card.title}</span>
									</button>
								);
							})}
						</div>

						<div className="space-y-4 rounded-xl border bg-muted/30 p-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<h4 className="font-semibold text-base">
										{selectedCard.title}
									</h4>
									<p className="text-muted-foreground text-sm">
										{selectedCard.summary}
									</p>
								</div>
								{selectedCard.docsUrl && (
									<Button variant="outline" size="sm" asChild>
										<NextLink
											href={selectedCard.docsUrl}
											target="_blank"
											rel="noreferrer"
										>
											View docs
										</NextLink>
									</Button>
								)}
							</div>

							{selectedCard.tip && (
								<div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
									{selectedCard.tip}
								</div>
							)}

							<div className="space-y-3">
								{selectedCard.steps.map((step) => (
									<div
										key={`${selectedCard.id}-${step.title}`}
										className="space-y-2 rounded-lg border bg-card/40 p-3"
									>
										<div>
											<p className="font-medium text-sm">{step.title}</p>
											{step.description && (
												<p className="text-muted-foreground text-sm">
													{step.description}
												</p>
											)}
										</div>
										{step.bullets && (
											<ul className="list-disc space-y-1 pl-5 text-muted-foreground text-xs">
												{step.bullets.map((bullet) => (
													<li key={bullet}>{bullet}</li>
												))}
											</ul>
										)}
										{step.code && (
											<CodeBlock>
												<CodeBlockGroup className="flex items-center justify-between border-b px-4 py-2">
													<span className="font-medium text-sm">
														{step.code.label}
													</span>
													<div className="flex items-center gap-2">
														<Badge
															variant="secondary"
															className="text-xs capitalize"
														>
															{step.code.language}
														</Badge>
														<CopyButton
															content={step.code.content}
															copyMessage="Snippet copied!"
														/>
													</div>
												</CodeBlockGroup>
												<CodeBlockCode
													code={step.code.content}
													language={step.code.language}
												/>
											</CodeBlock>
										)}
									</div>
								))}
							</div>

							{selectedCard.codeSamples &&
								selectedCard.codeSamples.length > 0 && (
									<div className="space-y-3">
										{selectedCard.codeSamples.map((sample) => (
											<CodeBlock key={`${selectedCard.id}-${sample.label}`}>
												<CodeBlockGroup className="flex items-center justify-between border-b px-4 py-2">
													<span className="font-medium text-sm">
														{sample.label}
													</span>
													<div className="flex items-center gap-2">
														<Badge
															variant="secondary"
															className="text-xs capitalize"
														>
															{sample.language}
														</Badge>
														<CopyButton
															content={sample.content}
															copyMessage="Snippet copied!"
														/>
													</div>
												</CodeBlockGroup>
												<CodeBlockCode
													code={sample.content}
													language={sample.language}
												/>
											</CodeBlock>
										))}
									</div>
								)}

							{selectedCard.notes && selectedCard.notes.length > 0 && (
								<ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
									{selectedCard.notes.map((note) => (
										<li key={note}>{note}</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
