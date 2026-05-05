/**
 * Kilo Provider Extension (MINIMAL)
 *
 * Provides access to 300+ AI models via the Kilo Gateway (OpenRouter-compatible).
 * This is a minimal extension extracted from pi-free.
 */

import type { Api, Model, OAuthCredentials } from "@mariozechner/pi-ai";
import {
	ExtensionAPI,
	ProviderModelConfig,
} from "@mariozechner/pi-coding-agent";
import {
	createLogger,
	PROVIDER_KILO,
	URL_KILO_TOS,
} from "./constants";
import { isFreeModel, registerWithGlobalToggle } from "./registry";
import { cleanModelName, logWarning } from "./util";
import {
	createCtxReRegister,
	createReRegister,
	enhanceWithCI,
	StoredModels,
} from "./provider-helper";
import { loginKilo, refreshKiloToken } from "./kilo-auth";
import { fetchKiloModels, KILO_GATEWAY_BASE } from "./kilo-models";

const _logger = createLogger("kilo-extension");

export default async function (pi: ExtensionAPI) {
	// Try to fetch ALL models at startup (like Cline/OpenRouter)
	// If no API key, this will return free models only
	let allModels: ProviderModelConfig[] = [];
	let freeModels: ProviderModelConfig[] = [];

	try {
		// Fetch all models (returns free-only if no auth, all if auth available)
		allModels = await fetchKiloModels({ freeOnly: false });
		// Derive free list using isFreeModel with allModels for detection
		freeModels = allModels.filter((m) =>
			isFreeModel({ ...m, provider: PROVIDER_KILO }, allModels),
		);
	} catch (error) {
		logWarning("kilo", "Failed to fetch models at startup", error);
		// Fallback: try to fetch just free models
		try {
			freeModels = await fetchKiloModels({ freeOnly: true });
		} catch (e) {
			logWarning("kilo", "Failed to fetch free models", e);
		}
	}

	// State tracking
	let showPaidModels = false;
	let currentModels = freeModels;

	// Shared model storage for global toggle
	const stored: StoredModels = { free: freeModels, all: allModels };

	// Create re-register function
	const reRegister = createReRegister(pi, {
		providerId: PROVIDER_KILO,
		baseUrl: KILO_GATEWAY_BASE,
		apiKey: "KILO_API_KEY",
		headers: {
			"X-KILOCODE-EDITORNAME": "Pi",
		},
	});

	// Register with global toggle system
	registerWithGlobalToggle(
		PROVIDER_KILO,
		stored,
		reRegister,
		!!process.env.KILO_API_KEY,
	);

	// OAuth config for Kilo
	const oauthConfig = {
		name: "Kilo",
		login: async (callbacks: any) => {
			const cred = await loginKilo(callbacks);
			try {
				// Fetch all models with the new token
				const newModels = await fetchKiloModels({
					token: cred.access,
					freeOnly: false,
				});
				allModels = newModels;
				stored.all = allModels;
				freeModels = allModels.filter((m) =>
					isFreeModel({ ...m, provider: PROVIDER_KILO }, allModels),
				);
				stored.free = freeModels;

				// Update global toggle registration with new lists
				const globalReRegister = createReRegister(pi, {
					providerId: PROVIDER_KILO,
					baseUrl: KILO_GATEWAY_BASE,
					apiKey: "KILO_API_KEY",
					headers: {
						"X-KILOCODE-EDITORNAME": "Pi",
					},
				});
				registerWithGlobalToggle(PROVIDER_KILO, stored, globalReRegister, true);

				// If paid mode is enabled, show all models
				if (showPaidModels) {
					currentModels = allModels;
					globalReRegister(allModels);
				}
			} catch (error) {
				logWarning("kilo", "Failed to fetch models after login", error);
			}
			return cred;
		},
		refreshToken: refreshKiloToken,
		getApiKey: (cred: OAuthCredentials) => cred.access,
		modifyModels: (models: Model<Api>[], _cred: OAuthCredentials) => {
			if (!showPaidModels || allModels.length === 0) {
				return models;
			}
			const template = models.find((m) => m.provider === PROVIDER_KILO);
			if (!template) return models;
			const nonKilo = models.filter((m) => m.provider !== PROVIDER_KILO);
			const fullModels = allModels.map((m) => ({
				...template,
				id: m.id,
				name: cleanModelName(m.name),
				reasoning: m.reasoning,
				input: m.input,
				cost: m.cost,
				contextWindow: m.contextWindow,
				maxTokens: m.maxTokens,
			}));
			return [...nonKilo, ...fullModels];
		},
	};

	// Register initial provider (default to free models)
	pi.registerProvider(PROVIDER_KILO, {
		baseUrl: KILO_GATEWAY_BASE,
		apiKey: "KILO_API_KEY",
		api: "openai-completions" as const,
		headers: {
			"X-KILOCODE-EDITORNAME": "Pi",
			"User-Agent": "pi-kilo-extension",
		},
		models: enhanceWithCI(currentModels),
		oauth: oauthConfig,
	});

	// Per-provider toggle command
	pi.registerCommand("toggle-kilo", {
		description: "Toggle between free and all Kilo models",
		handler: async (_args: string, ctx) => {
			showPaidModels = !showPaidModels;

			// Determine which models to show
			const modelsToShow =
				showPaidModels && allModels.length > 0 ? allModels : freeModels;

			currentModels = modelsToShow;
			reRegister(modelsToShow);

			const freeCount = freeModels.length;
			const paidCount = allModels.length - freeCount;

			if (showPaidModels && allModels.length > 0) {
				ctx.ui.notify(
					`kilo: showing all ${allModels.length} models (${freeCount} free, ${paidCount} paid)`,
					"info",
				);
			} else {
				ctx.ui.notify(
					`kilo: showing ${freeCount} free models (${paidCount} paid hidden)`,
					"info",
				);
			}
		},
	});

	// Refresh models on session start if authenticated
	pi.on("session_start", async (_event, ctx) => {
		const cred = ctx.modelRegistry.authStorage.get(PROVIDER_KILO);

		if (cred?.type === "oauth") {
			try {
				const newModels = await fetchKiloModels({
					token: cred.access,
					freeOnly: false,
				});
				allModels = newModels;
				stored.all = allModels;
				freeModels = allModels.filter((m) =>
					isFreeModel({ ...m, provider: PROVIDER_KILO }, allModels),
				);
				stored.free = freeModels;

				// Update global toggle registration
				const ctxReRegister = createCtxReRegister(ctx as any, {
					providerId: PROVIDER_KILO,
					baseUrl: KILO_GATEWAY_BASE,
					apiKey: "KILO_API_KEY",
					headers: {
						"X-KILOCODE-EDITORNAME": "Pi",
					},
				});
				registerWithGlobalToggle(PROVIDER_KILO, stored, ctxReRegister, true);

				// Apply current view mode
				if (showPaidModels) {
					ctxReRegister(allModels);
				}
			} catch (error) {
				logWarning("kilo", "Failed to refresh models at session start", error);
			}
		}
	});
}
