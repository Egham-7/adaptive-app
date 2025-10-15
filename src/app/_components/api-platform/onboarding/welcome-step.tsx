import { ChevronRight, FolderPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface WelcomeStepProps {
	onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
	return (
		<Card className="border-2">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
					<Sparkles className="h-8 w-8 text-primary" />
				</div>
				<CardTitle className="text-2xl">Welcome to Adaptive API!</CardTitle>
				<CardDescription className="text-base">
					Your organization is ready. Let's create your first project to get
					started with our AI platform.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="rounded-lg bg-muted/50 p-4">
						<div className="flex items-start gap-3">
							<FolderPlus className="mt-1 h-6 w-6 text-primary" />
							<div>
								<h4 className="font-medium">What's a Project?</h4>
								<p className="text-muted-foreground text-sm">
									A project helps you organize your AI applications. Each
									project gets its own API keys, usage tracking, and analytics.
								</p>
							</div>
						</div>
					</div>
					<Button onClick={onContinue} className="w-full" size="lg">
						Create Your First Project
						<ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
