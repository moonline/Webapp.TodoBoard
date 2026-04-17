import type { BoardConfig } from "todoboard-core";

export interface FileOpenResult {
	path: string;
	content: string;
	name: string;
	configPath: string;
	config: BoardConfig | null;
}

export interface SessionState {
	openFiles: Array<{
		path: string;
		configPath: string;
		lastModified: number;
	}>;
	activeFileIndex: number;
	windowBounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}
