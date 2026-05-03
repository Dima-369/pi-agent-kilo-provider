/**
 * Minimal registry functions for Kilo extension
 */

import type { ProviderModelConfig } from "@mariozechner/pi-coding-agent";

export function isFreeModel(
	model: { id: string; provider: string; cost?: { input: number; output: number } },
	_allModels?: ProviderModelConfig[],
): boolean {
	// Simple heuristic: model is free if cost is 0 or it has "free" in the id
	if (model.cost && (model.cost.input > 0 || model.cost.output > 0)) {
		return false;
	}
	return model.id.toLowerCase().includes("free") || 
	       model.id.toLowerCase().includes(":free");
}

export function registerWithGlobalToggle(
	_providerId: string,
	_stored: { free: ProviderModelConfig[]; all: ProviderModelConfig[] },
	_reRegister: (models: ProviderModelConfig[]) => void,
	_hasAuth: boolean,
) {
	// Placeholder for global toggle integration
	// In a full implementation, this would register with pi's global toggle system
}
