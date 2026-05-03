/**
 * Provider helper functions for Kilo extension
 */

import { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { ProviderModelConfig } from "@mariozechner/pi-coding-agent";

export interface StoredModels {
	free: ProviderModelConfig[];
	all: ProviderModelConfig[];
}

export function enhanceWithCI(models: ProviderModelConfig[]): ProviderModelConfig[] {
	// In a real implementation, this would add CI (Cline Integration) metadata
	// For minimal extension, just return as-is
	return models;
}

export function createReRegister(
	pi: ExtensionAPI,
	config: {
		providerId: string;
		baseUrl: string;
		apiKey: string;
		headers?: Record<string, string>;
	},
) {
	return (models: ProviderModelConfig[]) => {
		pi.registerProvider(config.providerId, {
			baseUrl: config.baseUrl,
			apiKey: config.apiKey,
			api: "openai-completions" as const,
			headers: config.headers,
			models: enhanceWithCI(models),
		});
	};
}

export function createCtxReRegister(
	_ctx: { pi: ExtensionAPI; modelRegistry: { authStorage: Map<string, unknown> } },
	config: {
		providerId: string;
		baseUrl: string;
		apiKey: string;
		headers?: Record<string, string>;
	},
) {
	const pi = _ctx.pi;
	return (models: ProviderModelConfig[]) => {
		pi.registerProvider(config.providerId, {
			baseUrl: config.baseUrl,
			apiKey: config.apiKey,
			api: "openai-completions" as const,
			headers: config.headers,
			models: enhanceWithCI(models),
		});
	};
}
