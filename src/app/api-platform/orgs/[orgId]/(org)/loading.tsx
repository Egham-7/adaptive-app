export default function Loading() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				{/* Rotating spinner */}
				<div className="relative">
					<div className="h-12 w-12 rounded-full border-2 border-white/10" />
					<div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-emerald-500" />
				</div>
				<p className="text-white/50 text-sm">Loading...</p>
			</div>
		</div>
	);
}
