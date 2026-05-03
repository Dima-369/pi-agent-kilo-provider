/**
 * Open browser utility
 */

export async function openBrowser(url: string): Promise<void> {
	const { exec } = await import("node:child_process");
	const platform = process.platform;

	return new Promise((resolve) => {
		if (platform === "darwin") {
			exec(`open "${url}"`);
		} else if (platform === "win32") {
			exec(`start "${url}"`);
		} else {
			exec(`xdg-open "${url}"`);
		}
		resolve();
	});
}
