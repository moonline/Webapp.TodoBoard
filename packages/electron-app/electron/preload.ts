import { contextBridge, ipcRenderer } from "electron";
import type { SessionState } from "./types";
import type { BoardConfig } from "todoboard-core";

/**
 * Preload script that exposes a safe Electron API to the renderer process
 * This runs in an isolated context with access to Node.js and Electron APIs
 */

interface ElectronAPI {
	openFile: () => Promise<unknown>;
	saveFile: (path: string, content: string) => Promise<void>;
	readFile: (path: string) => Promise<string>;
	showSaveDialog: (defaultPath: string) => Promise<string | null>;
	saveConfig: (path: string, config: BoardConfig) => Promise<void>;
	loadConfig: (path: string) => Promise<BoardConfig | null>;
	getSession: () => Promise<SessionState>;
	saveSession: (data: SessionState) => Promise<void>;
	watchFile: (path: string, callback: (content: string) => void) => void;
	unwatchFile: (path: string) => void;
}

const electronAPI: ElectronAPI = {
	// File operations
	openFile: () => ipcRenderer.invoke("file:open"),
	saveFile: (path: string, content: string) => ipcRenderer.invoke("file:save", path, content),
	readFile: (path: string) => ipcRenderer.invoke("file:read", path),
	showSaveDialog: (defaultPath: string) => ipcRenderer.invoke("file:showSaveDialog", defaultPath),

	// Config operations
	saveConfig: (path: string, config: BoardConfig) =>
		ipcRenderer.invoke("config:save", path, config),
	loadConfig: (path: string) => ipcRenderer.invoke("config:load", path),

	// Session management
	getSession: () => ipcRenderer.invoke("session:get"),
	saveSession: (data: SessionState) => ipcRenderer.invoke("session:save", data),

	// File watching (placeholder - not fully implemented yet)
	watchFile: (path: string, callback: (content: string) => void) => {
		ipcRenderer.on(`file:changed:${path}`, (_event, content: string) => {
			callback(content);
		});
	},
	unwatchFile: (path: string) => {
		ipcRenderer.removeAllListeners(`file:changed:${path}`);
	},
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld("electron", electronAPI);

// Listen for menu events and forward to renderer
ipcRenderer.on("menu:open-file", () => {
	window.postMessage({ type: "menu:open-file" }, "*");
});

ipcRenderer.on("menu:close-tab", () => {
	window.postMessage({ type: "menu:close-tab" }, "*");
});

console.log("Preload script loaded successfully");
