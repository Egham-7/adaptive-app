"use client";

import { Key, Link as LinkIcon } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

// Cursor icon component
const CursorIcon = () => (
	<Logo
		brand="cursor"
		showText={false}
		imageWidth={40}
		imageHeight={40}
		className="h-10 w-10"
	/>
);

// Cline icon component
const ClineIcon = () => (
	<Logo
		brand="cline"
		showText={false}
		imageWidth={40}
		imageHeight={40}
		className="h-10 w-10"
	/>
);

// Kilo Code icon component
const KiloCodeIcon = () => (
	<Logo
		brand="kilo-code"
		showText={false}
		imageWidth={40}
		imageHeight={40}
		className="h-10 w-10"
	/>
);

// Roo Code icon component
const RooCodeIcon = () => (
	<Logo
		brand="roo-code"
		showText={false}
		imageWidth={40}
		imageHeight={40}
		className="h-10 w-10"
	/>
);

// Qwen icon component
const QwenIcon = () => (
	<Logo
		brand="qwen"
		showText={false}
		imageWidth={40}
		imageHeight={40}
		className="h-10 w-10"
	/>
);

// Claude Code icon component
const ClaudeCodeIcon = () => (
	<Logo
		brand="claude-code"
		showText={false}
		imageWidth={40}
		imageHeight={40}
		className="h-10 w-10"
	/>
);

// Adaptive icon component
const AdaptiveIcon = () => (
	<Logo
		brand="adaptive"
		showText={false}
		imageWidth={40}
		imageHeight={40}
		className="h-10 w-10"
	/>
);

// CrewAI icon component
const CrewAIIcon = () => (
	<Logo
		brand="crew-ai"
		showText={false}
		imageWidth={40}
		imageHeight={40}
		className="h-10 w-10"
	/>
);

// LlamaIndex icon component
const LlamaIndexIcon = () => (
	<Logo
		brand="llama-index"
		showText={false}
		imageWidth={40}
		imageHeight={40}
		className="h-10 w-10"
	/>
);

import NextLink from "next/link";
import { useMemo, useState } from "react";
import {
	SiCodeblocks,
	SiCodesandbox,
	SiCurl,
	SiGo,
	SiGoogle,
	SiJavascript,
	SiLangchain,
	SiOpenai,
	SiPython,
	SiRust,
	SiTypescript,
	SiVercel,
	SiX,
} from "react-icons/si";
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
	icon?: React.ComponentType<{ className?: string }>;
}

interface QuickstartStepDefinition {
	title: string;
	description?: string;
	bullets?: string[];
	code?: QuickstartCodeSnippet;
	codeVariants?: QuickstartCodeSnippet[];
}

interface DocQuickstart {
	id: string;
	title: string;
	docsUrl: string;
	summary: string;
	tip?: string;
	icon: React.ComponentType<{ className?: string }>;
	steps: QuickstartStepDefinition[];
	codeSamples?: QuickstartCodeSnippet[];
	notes?: string[];
}

const DEVELOPER_TOOL_QUICKSTARTS: DocQuickstart[] = [
	{
		id: "claude-code",
		title: "Claude Code",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/claude-code",
		summary: "Install the helper script and route every Claude Code request.",
		icon: ClaudeCodeIcon,
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
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/cursor",
		summary: "Treat Adaptive as an OpenAI-compatible provider inside Cursor.",
		icon: CursorIcon,
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
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/cline",
		summary:
			"Point the VS Code extension at Adaptive and leave the model blank.",
		icon: ClineIcon,
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
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/opencode",
		summary:
			"Register Adaptive once, then select the Intelligent Routing model.",
		icon: SiCodesandbox,
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
      "models": { "adaptive/auto": { "name": "adaptive/auto" } }
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
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/kilo-code",
		summary: "Use the OpenAI-compatible mode with your Adaptive key.",
		icon: KiloCodeIcon,
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
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/roo-code",
		summary:
			"Set Roo Code's provider to OpenAI Compatible and paste your Adaptive key.",
		icon: RooCodeIcon,
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
  "rooCode.model": "adaptive/auto"
}`,
				},
			},
		],
	},
	{
		id: "grok-cli",
		title: "Grok CLI",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/grok-cli",
		summary:
			"Bootstrap the CLI and route prompts through Adaptive in two commands.",
		icon: SiX,
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
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/gemini-cli",
		summary: "Install the CLI, set the Adaptive base URL, and start prompting.",
		icon: SiGoogle,
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
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/codex",
		summary: "Use the installer and keep the default model empty for routing.",
		icon: SiOpenai,
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
					content: `model = "adaptive/auto"
model_provider = "adaptive"`,
				},
			},
		],
	},
	{
		id: "qwen-code",
		title: "Qwen Code",
		docsUrl: "https://docs.llmadaptive.uk/developer-tools/qwen-code",
		summary:
			"Install Qwen Code with the helper script, then export OpenAI-compatible vars.",
		icon: QwenIcon,
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
		docsUrl: "https://docs.llmadaptive.uk/integrations/openai-sdk",
		summary: "Swap baseURL/apiKey and keep your existing OpenAI code.",
		icon: SiOpenai,
		steps: [
			{
				title: "Install",
				codeVariants: [
					{ label: "pnpm", language: "bash", content: "pnpm add openai" },
					{ label: "pip", language: "bash", content: "pip install openai" },
				],
			},
			{
				title: "Initialize client",
				codeVariants: [
					{
						label: "JavaScript/TypeScript",
						language: "javascript",
						content: `const openai = new OpenAI({
  apiKey: process.env.ADAPTIVE_API_KEY,
  baseURL: "https://api.llmadaptive.uk/v1",
});

await openai.chat.completions.create({
  model: "adaptive/auto",
  messages: [{ role: "user", content: "Hello!" }],
});`,
					},
					{
						label: "Python",
						language: "python",
						content: `from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("ADAPTIVE_API_KEY"),
    base_url="https://api.llmadaptive.uk/v1",
)

response = client.chat.completions.create(
    model="adaptive/auto",
    messages=[{"role": "user", "content": "Hello!"}]
)`,
					},
					{
						label: "cURL",
						language: "bash",
						content: `curl -X POST "https://api.llmadaptive.uk/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "adaptive/auto",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`,
					},
				],
			},
		],
	},
	{
		id: "vercel-ai",
		title: "Vercel AI SDK",
		docsUrl: "https://docs.llmadaptive.uk/integrations/vercel-ai-sdk",
		summary: "Wrap the OpenAI provider with Adaptive credentials.",
		icon: SiVercel,
		steps: [
			{
				title: "Install packages",
				codeVariants: [
					{
						label: "pnpm",
						language: "bash",
						content: "pnpm add ai @ai-sdk/openai zod",
					},
					{
						label: "npm",
						language: "bash",
						content: "npm install ai @ai-sdk/openai zod",
					},
					{
						label: "yarn",
						language: "bash",
						content: "yarn add ai @ai-sdk/openai zod",
					},
				],
			},
			{
				title: "Route handler",
				codeVariants: [
					{
						label: "JavaScript/TypeScript",
						language: "javascript",
						content: `const model = openai({
  apiKey: process.env.ADAPTIVE_API_KEY,
  baseURL: "https://api.llmadaptive.uk/v1",
})("");

return streamText({ model, messages });`,
					},
				],
			},
		],
	},
	{
		id: "langchain",
		title: "LangChain",
		docsUrl: "https://docs.llmadaptive.uk/integrations/langchain",
		summary: "ChatOpenAI works unchanged—just point base_url at Adaptive.",
		icon: SiLangchain,
		steps: [
			{
				title: "Install adapters",
				codeVariants: [
					{
						label: "pip",
						language: "bash",
						content: "pip install langchain langchain-openai",
					},
					{
						label: "npm",
						language: "bash",
						content: "npm install langchain @langchain/openai",
					},
				],
			},
			{
				title: "Create LLM",
				codeVariants: [
					{
						label: "Python",
						language: "python",
						content: `llm = ChatOpenAI(
    api_key="your-adaptive-api-key",
    base_url="https://api.llmadaptive.uk/v1",
    model="adaptive/auto"
)
llm.invoke("Explain RAG")`,
					},
					{
						label: "JavaScript/TypeScript",
						language: "javascript",
						content: `const { ChatOpenAI } = require("@langchain/openai");

const llm = new ChatOpenAI({
  openAIApiKey: "your-adaptive-api-key",
  configuration: {
    baseURL: "https://api.llmadaptive.uk/v1",
  },
  modelName: "adaptive/auto",
});

await llm.invoke("Explain RAG");`,
					},
					{
						label: "cURL",
						language: "bash",
						content: `curl -X POST "https://api.llmadaptive.uk/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "adaptive/auto",
    "messages": [
      {"role": "user", "content": "Explain RAG"}
    ]
  }'`,
					},
				],
			},
		],
	},
	{
		id: "langgraph",
		title: "LangGraph",
		docsUrl: "https://docs.llmadaptive.uk/integrations/langgraph",
		summary: "Use the same ChatOpenAI client inside state graphs.",
		icon: SiLangchain,
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
				codeVariants: [
					{
						label: "Python",
						language: "python",
						content: `model = ChatOpenAI(
    api_key="your-adaptive-api-key",
    base_url="https://api.llmadaptive.uk/v1",
    model="adaptive/auto"
)
workflow.add_node("agent", lambda state: {"messages": [model.invoke(state["messages"])]})`,
					},
					{
						label: "cURL",
						language: "bash",
						content: `curl -X POST "https://api.llmadaptive.uk/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "adaptive/auto",
    "messages": [
      {"role": "user", "content": "Hello from LangGraph!"}
    ]
  }'`,
					},
				],
			},
		],
	},
	{
		id: "llamaindex",
		title: "LlamaIndex",
		docsUrl: "https://docs.llmadaptive.uk/integrations/llamaindex",
		summary: "Set the OpenAI LLM/embedding clients to the Adaptive base.",
		icon: LlamaIndexIcon,
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
				codeVariants: [
					{
						label: "Python",
						language: "python",
						content: `llm = OpenAI(
    model="adaptive/auto",
    api_base="https://api.llmadaptive.uk/v1",
    api_key="your-adaptive-api-key",
)
Settings.llm = llm`,
					},
					{
						label: "cURL",
						language: "bash",
						content: `curl -X POST "https://api.llmadaptive.uk/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "adaptive/auto",
    "messages": [
      {"role": "user", "content": "Hello from LlamaIndex!"}
    ]
  }'`,
					},
				],
			},
		],
	},
	{
		id: "crewai",
		title: "CrewAI",
		docsUrl: "https://docs.llmadaptive.uk/integrations/crewai",
		summary: "Give CrewAI an Adaptive-backed LLM and run agents as usual.",
		icon: CrewAIIcon,
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
				codeVariants: [
					{
						label: "Python",
						language: "python",
						content: `llm = LLM(
    model="adaptive/auto",
    api_key="your-adaptive-api-key",
    base_url="https://api.llmadaptive.uk/v1"
)`,
					},
					{
						label: "cURL",
						language: "bash",
						content: `curl -X POST "https://api.llmadaptive.uk/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "adaptive/auto",
    "messages": [
      {"role": "user", "content": "Hello from CrewAI!"}
    ]
  }'`,
					},
				],
			},
		],
	},
	{
		id: "adaptive-router",
		title: "Adaptive Router",
		docsUrl: "https://docs.llmadaptive.uk/integrations/adaptive-router",
		summary:
			"Get intelligent model selection without inference. Provider-agnostic design works with any models, providers, or infrastructure.",
		icon: AdaptiveIcon,
		steps: [
			{
				title: "Select Model",
				description:
					"Choose the best model for your specific use case by providing available models and prompt.",
				codeVariants: [
					{
						label: "JavaScript/TypeScript",
						language: "javascript",
						content: `const response = await fetch("https://api.llmadaptive.uk/v1/select-model", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    models: ["openai/gpt-4o-mini", "anthropic/claude-3-5-sonnet", "gemini/gemini-1.5-flash"],
    prompt: "Summarize this support ticket."
  })
});

const decision = await response.json();
console.log(decision.selected_model);`,
					},
					{
						label: "Python",
						language: "python",
						content: `import requests

response = requests.post(
    "https://api.llmadaptive.uk/v1/select-model",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "models": ["openai/gpt-4o-mini", "anthropic/claude-3-5-sonnet", "gemini/gemini-1.5-flash"],
        "prompt": "Summarize this support ticket."
    }
)

decision = response.json()
print(decision["selected_model"])`,
					},
					{
						label: "cURL",
						language: "bash",
						content: `curl -X POST "https://api.llmadaptive.uk/v1/select-model" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "models": ["openai/gpt-4o-mini", "anthropic/claude-3-5-sonnet", "gemini/gemini-1.5-flash"],
    "prompt": "Summarize this support ticket."
  }'`,
					},
				],
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
						defaultOpen={true}
						showLanguageToggle={false}
					/>
					<DocsQuickstartSection
						title="Integrations"
						description="Follow the official integration quickstarts pulled directly from the docs."
						cards={INTEGRATION_QUICKSTARTS}
						defaultOpen={false}
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
	defaultOpen?: boolean;
	showLanguageToggle?: boolean;
}

function DocsQuickstartSection({
	title,
	description,
	cards,
	defaultOpen = false,
	showLanguageToggle = true,
}: DocsQuickstartSectionProps) {
	const [selectedId, setSelectedId] = useState(() => cards[0]?.id ?? "");
	const [selectedLanguage, setSelectedLanguage] =
		useState<string>("javascript");

	const selectedCard = useMemo(() => {
		if (cards.length === 0) return null;
		return cards.find((card) => card.id === selectedId) ?? cards[0];
	}, [cards, selectedId]);

	const availableLanguages = useMemo(() => {
		if (!selectedCard) return [];

		const languages = new Set<string>();
		selectedCard.steps.forEach((step) => {
			if (step.codeVariants) {
				step.codeVariants.forEach((variant) => {
					languages.add(variant.language);
				});
			} else if (step.code) {
				languages.add(step.code.language);
			}
		});

		selectedCard.codeSamples?.forEach((sample) => {
			languages.add(sample.language);
		});

		return Array.from(languages).sort();
	}, [selectedCard]);

	const getLanguageIcon = (language: string) => {
		const iconMap: Record<
			string,
			React.ComponentType<{ className?: string }>
		> = {
			javascript: SiJavascript,
			python: SiPython,
			typescript: SiTypescript,
			go: SiGo,
			rust: SiRust,
			bash: SiCurl,
			curl: SiCurl,
		};
		return iconMap[language] || SiJavascript;
	};

	if (!selectedCard) {
		return null;
	}

	return (
		<Accordion
			type="single"
			collapsible
			defaultValue={defaultOpen ? "section" : undefined}
		>
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
						<TooltipProvider>
							<div className="flex flex-wrap gap-3">
								{cards.map((card) => {
									const isActive = selectedCard?.id === card.id;
									return (
										<Tooltip key={card.id}>
											<TooltipTrigger asChild>
												<button
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
													<card.icon className="h-10 w-10" />
													<span className="sr-only">{card.title}</span>
												</button>
											</TooltipTrigger>
											<TooltipContent>
												<p>{card.title}</p>
											</TooltipContent>
										</Tooltip>
									);
								})}
							</div>
						</TooltipProvider>

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

							{availableLanguages.length > 1 && showLanguageToggle && (
								<div className="flex flex-wrap gap-3 border-b pb-2">
									{availableLanguages.map((language) => {
										const IconComponent = getLanguageIcon(language);
										const isActive = selectedLanguage === language;
										return (
											<button
												key={language}
												type="button"
												onClick={() => setSelectedLanguage(language)}
												aria-pressed={isActive}
												className={cn(
													"flex h-10 w-10 items-center justify-center rounded-lg border bg-card p-2 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
													isActive
														? "border-primary shadow-md"
														: "opacity-70 hover:opacity-100",
												)}
											>
												<IconComponent className="h-5 w-5" />
												<span className="sr-only">{language}</span>
											</button>
										);
									})}
								</div>
							)}

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
										{(() => {
											const codeToShow = step.codeVariants
												? step.codeVariants.find(
														(variant) => variant.language === selectedLanguage,
													) || step.codeVariants[0]
												: step.code;

											if (!codeToShow) return null;

											return (
												<CodeBlock>
													<CodeBlockGroup className="flex items-center justify-between border-b px-4 py-2">
														<span className="font-medium text-sm">
															{codeToShow.label}
														</span>
														<div className="flex items-center gap-2">
															<Badge
																variant="secondary"
																className="text-xs capitalize"
															>
																{codeToShow.language}
															</Badge>
															<CopyButton
																content={codeToShow.content}
																copyMessage="Snippet copied!"
															/>
														</div>
													</CodeBlockGroup>
													<CodeBlockCode
														code={codeToShow.content}
														language={codeToShow.language}
													/>
												</CodeBlock>
											);
										})()}
									</div>
								))}
							</div>

							{selectedCard.codeSamples &&
								selectedCard.codeSamples.length > 0 && (
									<div className="space-y-3">
										{selectedCard.codeSamples
											.filter((sample) => sample.language === selectedLanguage)
											.map((sample) => (
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
