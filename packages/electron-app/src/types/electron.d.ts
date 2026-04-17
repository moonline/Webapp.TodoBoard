import type { BoardConfig } from "todoboard-core";

export interface FileOpenResult {
	path: string;
	content: string;
	name: string;
	configPath: string;
	config: BoardConfig | null;
}

export interface SessionFile {
	path: string;
	configPath: string;
	lastModified: number;
}

export interface SessionState {
	openFiles: SessionFile[];
	activeFileIndex: number;
	windowBounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}

export interface ElectronAPI {
	// File operations
	openFile: () => Promise<FileOpenResult>;
	saveFile: (path: string, content: string) => Promise<void>;
	readFile: (path: string) => Promise<string>;
	showSaveDialog: (defaultPath: string) => Promise<string | null>;

	// Config operations
	saveConfig: (path: string, config: BoardConfig) => Promise<void>;
	loadConfig: (path: string) => Promise<BoardConfig | null>;

	// Session management
	getSession: () => Promise<SessionState>;
	saveSession: (data: SessionState) => Promise<void>;

	// File watching
	watchFile: (path: string, callback: (content: string) => void) => void;
	unwatchFile: (path: string) => void;
}

declare global {
	interface Window {
		electron?: ElectronAPI;
	}
}
