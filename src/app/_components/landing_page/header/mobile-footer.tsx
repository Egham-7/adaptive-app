import { GitHubStarsButton } from "@/components/animate-ui/buttons/github-stars";

export function MobileFooter() {
	return (
		<div className="flex w-full flex-col gap-3 lg:hidden">
			<GitHubStarsButton
				username="Egham-7"
				repo="adaptive"
				formatted={true}
				className="h-10 w-full justify-center text-xs"
			/>
		</div>
	);
}
