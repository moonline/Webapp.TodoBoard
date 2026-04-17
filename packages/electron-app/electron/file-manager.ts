import { dialog } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import type { FileOpenResult } from "./types";
import type { BoardConfig } from "todoboard-core";

/**
 * Derives the config file path from a todo file path
 * Example: /home/user/work.txt -> /home/user/work.board.config.json
 */
export const deriveConfigPath = (todoPath: string): string => {
	const parsed = path.parse(todoPath);
	const configName = `${parsed.name}.board.config.json`;
	return path.join(parsed.dir, configName);
};

/**
 * Finds the config file for a given todo file.
 * Tries in order:
 *   1. <name>.board.config.json (e.g. todo.board.config.json)
 *   2. board.config.json (generic fallback in same directory)
 * Returns the path that exists, or the derived path if neither exists.
 */
export const findConfigPath = async (todoPath: string): Promise<string> => {
	const derived = deriveConfigPath(todoPath);

	try {
		await fs.access(derived);
		return derived;
	} catch {
		// Derived config not found, try generic fallback
	}

	const parsed = path.parse(todoPath);
	const genericPath = path.join(parsed.dir, "board.config.json");

	try {
		await fs.access(genericPath);
		return genericPath;
	} catch {
		// Generic config not found either, return derived path as default for future saves
	}

	return derived;
};

/**
 * Shows a native file picker dialog and reads the selected file
 * Also attempts to load the associated config file
 */
export const openFileDialog = async (): Promise<FileOpenResult | null> => {
	const result = await dialog.showOpenDialog({
		properties: ["openFile"],
		filters: [
			{ name: "Text Files", extensions: ["txt"] },
			{ name: "All Files", extensions: ["*"] },
		],
	});

	if (result.canceled || result.filePaths.length === 0) {
		return null;
	} else {
		const filePath = result.filePaths[0];
		const content = await fs.readFile(filePath, "utf-8");
		const fileName = path.basename(filePath);
		const configPath = await findConfigPath(filePath);

		let config: BoardConfig | null = null;
		try {
			const configContent = await fs.readFile(configPath, "utf-8");
			config = JSON.parse(configContent);
		} catch (error) {
			// Config file doesn't exist or is invalid - that's okay
			console.log(`No config found for ${filePath}, will use default`);
		}

		return {
			path: filePath,
			content,
			name: fileName,
			configPath,
			config,
		};
	}
};

/**
 * Saves content to a file, creating a backup first
 */
export const saveFile = async (filePath: string, content: string): Promise<void> => {
	try {
		// Create backup before overwriting
		try {
			await fs.access(filePath);
			const backupPath = `${filePath}.bak`;
			await fs.copyFile(filePath, backupPath);
		} catch {
			// File doesn't exist yet, no backup needed
		}

		// Write the file
		await fs.writeFile(filePath, content, "utf-8");
	} catch (error) {
		console.error(`Error saving file ${filePath}:`, error);
		throw error;
	}
};

/**
 * Reads a file and returns its content
 */
export const readFile = async (filePath: string): Promise<string> => {
	try {
		return await fs.readFile(filePath, "utf-8");
	} catch (error) {
		console.error(`Error reading file ${filePath}:`, error);
		throw error;
	}
};

/**
 * Shows a save dialog and returns the selected path
 */
export const showSaveDialog = async (defaultPath: string): Promise<string | null> => {
	const result = await dialog.showSaveDialog({
		defaultPath,
		filters: [
			{ name: "Text Files", extensions: ["txt"] },
			{ name: "JSON Files", extensions: ["json"] },
			{ name: "All Files", extensions: ["*"] },
		],
	});

	if (result.canceled) {
		return null;
	} else {
		return result.filePath || null;
	}
};

/**
 * Saves a board configuration file
 */
export const saveConfig = async (configPath: string, config: BoardConfig): Promise<void> => {
	try {
		const content = JSON.stringify(config, null, 2);
		await fs.writeFile(configPath, content, "utf-8");
	} catch (error) {
		console.error(`Error saving config ${configPath}:`, error);
		throw error;
	}
};

/**
 * Loads a board configuration file
 */
export const loadConfig = async (configPath: string): Promise<BoardConfig | null> => {
	try {
		const content = await fs.readFile(configPath, "utf-8");
		return JSON.parse(content);
	} catch (error) {
		// Config doesn't exist or is invalid
		return null;
	}
};

/**
 * Checks if a file exists
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};
