/**
 * Kilo model fetching and mapping (OpenRouter-compatible format).
 */

import { PROVIDER_KILO } from "./constants";
import { logWarning } from "./util";

const KILO_API_BASE = process.env.KILO_API_URL || "https://api.kilo.ai";
export const KILO_GATEWAY_BASE = `${KILO_API_BASE}/api/gateway`;

// =============================================================================
// Fetch
// =============================================================================

interface ModelDefinition {
	id: string;
	name: string;
	reasoning?: boolean;
	input?: string[];
	cost?: { input: number; output: number; cacheRead: number; cacheWrite: number };
	contextWindow?: number;
	maxTokens?: number;
}

/**
 * Map OpenRouter-compatible model to our format (simplified version)
 */
function mapOpenRouterModel(m: Record<string, unknown>): ModelDefinition {
	const promptPrice = parseFloat((m.pricing as Record<string, unknown>)?.prompt as string ?? "0");
	const completionPrice = parseFloat((m.pricing as Record<string, unknown>)?.completion as string ?? "0");

	return {
		id: m.id as string,
		name: (m.name as string) || (m.id as string),
		reasoning: false,
		input: ((m.architecture as Record<string, unknown>)?.input_modalities as string[])?.includes("image")
			? ["text", "image"]
			: ["text"],
		cost: {
			input: promptPrice,
			output: completionPrice,
			cacheRead: 0,
			cacheWrite: 0,
		},
		contextWindow: (m.context_length as number) || 4096,
		maxTokens: (m.max_completion_tokens as number) || (m.top_provider as Record<string, unknown>)?.max_completion_tokens as number || 4096,
	};
}

/**
 * Minimal applyHidden - filter out hidden models
 */
function applyHidden(models: ModelDefinition[], _provider: string): ModelDefinition[] {
	// In a real implementation, this would check a hidden models list
	// For minimal extension, return as-is
	return models;
}

export async function fetchKiloModels(options?: {
	token?: string;
	freeOnly?: boolean;
}): Promise<ModelDefinition[]> {
	const apiKey = options?.token || process.env.KILO_API_KEY;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"User-Agent": "pi-kilo-extension",
	};
	
	if (apiKey) {
		headers["Authorization"] = `Bearer ${apiKey}`;
	}

	try {
		// Fetch from Kilo's OpenRouter-compatible endpoint
		const response = await fetch(`${KILO_GATEWAY_BASE}/models`, { headers });

		if (!response.ok) {
			logWarning("kilo-models", `Failed to fetch models: ${response.status}`);
			return getFallbackModels();
		}

		const data = await response.json() as { data?: Array<Record<string, unknown>> };
		const models = (data.data || []) as Array<Record<string, unknown>>;

		const mappedModels: ModelDefinition[] = models
			.filter((m) => {
				// Filter out image generation models
				const outputMods = (m.architecture as Record<string, unknown>)?.output_modalities as string[] || [];
				if (outputMods.includes("image")) return false;

				// Filter by pricing if freeOnly
				if (options?.freeOnly) {
					const prompt = parseFloat((m.pricing as Record<string, unknown>)?.prompt as string ?? "1");
					const completion = parseFloat((m.pricing as Record<string, unknown>)?.completion as string ?? "1");
					if (prompt !== 0 || completion !== 0) return false;
				}

				return true;
			})
			.map(mapOpenRouterModel);

		return applyHidden(mappedModels, PROVIDER_KILO);
	} catch (error) {
		logWarning("kilo-models", "Error fetching models", error);
		return getFallbackModels();
	}
}

/**
 * Fallback models if fetching fails
 */
function getFallbackModels(): ModelDefinition[] {
	return [
		{
			id: "kilo-auto/free",
			name: "Auto Free",
			reasoning: false,
			input: ["text"],
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			contextWindow: 256000,
			maxTokens: 10000,
		},
	];
}
