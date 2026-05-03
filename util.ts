/**
 * Utility functions for Kilo extension
 */

export function cleanModelName(name: string): string {
	return name
		.replace(/^kilo\//, "")
		.replace(/\//g, " / ")
		.trim();
}

export function logWarning(source: string, message: string, error?: unknown) {
	console.warn(`[${source}] ${message}`, error ? error : "");
}
