import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
		build: {
			outDir: "dist-electron/main",
			rollupOptions: {
				input: {
					index: resolve(__dirname, "electron/main.ts"),
				},
			},
		},
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
		build: {
			outDir: "dist-electron/preload",
			rollupOptions: {
				input: {
					index: resolve(__dirname, "electron/preload.ts"),
				},
			},
		},
	},
	renderer: {
		root: ".",
		plugins: [vue()],
		resolve: {
			alias: {
				"@": resolve(__dirname, "src"),
			},
		},
		build: {
			outDir: "dist",
			rollupOptions: {
				input: resolve(__dirname, "index.html"),
			},
		},
		server: {
			port: 5174,
		},
	},
});
