/**
 * Minimal constants for Kilo extension
 */

export const PROVIDER_KILO = "kilo" as const;

export const URL_KILO_TOS = "https://kilo.ai/terms";

export const KILO_POLL_INTERVAL_MS = 2000;
export const KILO_TOKEN_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Simple logger
export function createLogger(_name: string) {
	return {
		debug: (...args: unknown[]) => {
			if (process.env.LOG_LEVEL === "debug") {
				console.debug(`[${_name}]`, ...args);
			}
		},
		info: (...args: unknown[]) => console.info(`[${_name}]`, ...args),
		warn: (...args: unknown[]) => console.warn(`[${_name}]`, ...args),
		error: (...args: unknown[]) => console.error(`[${_name}]`, ...args),
	};
}
