import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";
import { defineWorkspace } from "vitest/config";

// Two test projects:
// - "node": the existing pure-TS/unit tests (parsing, models, ...).
// - "client": component tests that mount Svelte components into jsdom. These
//   need the browser build of Svelte, so they use the plain svelte() plugin
//   (not sveltekit(), which forces the SSR build) plus the browser conditions.
export default defineWorkspace([
	{
		extends: "./vite.config.ts",
		test: {
			name: "node",
			include: ["src/**/*.{test,spec}.{js,ts}"],
			exclude: ["src/**/*.client.{test,spec}.{js,ts}"],
		},
	},
	{
		plugins: [svelte()],
		resolve: {
			conditions: ["browser"],
			alias: {
				$lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
			},
		},
		test: {
			name: "client",
			environment: "jsdom",
			include: ["src/**/*.client.{test,spec}.{js,ts}"],
		},
	},
]);
