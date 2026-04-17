import { ipcMain } from "electron";
import * as fileManager from "./file-manager";
import * as sessionManager from "./session-manager";
import type { SessionState } from "./types";
import type { BoardConfig } from "todoboard-core";

/**
 * Registers all IPC handlers for communication between main and renderer processes
 */
export const registerIPCHandlers = (): void => {
	// File operations
	ipcMain.handle("file:open", async () => {
		try {
			const result = await fileManager.openFileDialog();

			if (result) {
				// Add to session
				await sessionManager.addFileToSession(result.path, result.configPath);
			} else {
				// No file selected
			}

			return result;
		} catch (error) {
			console.error("Error in file:open handler:", error);
			throw error;
		}
	});

	ipcMain.handle("file:save", async (_event, filePath: string, content: string) => {
		try {
			await fileManager.saveFile(filePath, content);
		} catch (error) {
			console.error("Error in file:save handler:", error);
			throw error;
		}
	});

	ipcMain.handle("file:read", async (_event, filePath: string) => {
		try {
			return await fileManager.readFile(filePath);
		} catch (error) {
			console.error("Error in file:read handler:", error);
			throw error;
		}
	});

	ipcMain.handle("file:showSaveDialog", async (_event, defaultPath: string) => {
		try {
			return await fileManager.showSaveDialog(defaultPath);
		} catch (error) {
			console.error("Error in file:showSaveDialog handler:", error);
			throw error;
		}
	});

	ipcMain.handle("file:exists", async (_event, filePath: string) => {
		try {
			return await fileManager.fileExists(filePath);
		} catch (error) {
			console.error("Error in file:exists handler:", error);
			return false;
		}
	});

	// Config operations
	ipcMain.handle("config:save", async (_event, configPath: string, config: BoardConfig) => {
		try {
			await fileManager.saveConfig(configPath, config);
		} catch (error) {
			console.error("Error in config:save handler:", error);
			throw error;
		}
	});

	ipcMain.handle("config:load", async (_event, configPath: string) => {
		try {
			return await fileManager.loadConfig(configPath);
		} catch (error) {
			console.error("Error in config:load handler:", error);
			return null;
		}
	});

	// Session operations
	ipcMain.handle("session:get", async () => {
		try {
			return await sessionManager.loadSession();
		} catch (error) {
			console.error("Error in session:get handler:", error);
			throw error;
		}
	});

	ipcMain.handle("session:save", async (_event, sessionData: SessionState) => {
		try {
			await sessionManager.saveSession(sessionData);
		} catch (error) {
			console.error("Error in session:save handler:", error);
			throw error;
		}
	});

	ipcMain.handle("session:addFile", async (_event, filePath: string, configPath: string) => {
		try {
			await sessionManager.addFileToSession(filePath, configPath);
		} catch (error) {
			console.error("Error in session:addFile handler:", error);
			throw error;
		}
	});

	ipcMain.handle("session:removeFile", async (_event, filePath: string) => {
		try {
			await sessionManager.removeFileFromSession(filePath);
		} catch (error) {
			console.error("Error in session:removeFile handler:", error);
			throw error;
		}
	});

	ipcMain.handle("session:setActiveIndex", async (_event, index: number) => {
		try {
			await sessionManager.updateActiveFileIndex(index);
		} catch (error) {
			console.error("Error in session:setActiveIndex handler:", error);
			throw error;
		}
	});

	ipcMain.handle(
		"session:updateWindowBounds",
		async (_event, bounds: { x: number; y: number; width: number; height: number }) => {
			try {
				await sessionManager.updateWindowBounds(bounds);
			} catch (error) {
				console.error("Error in session:updateWindowBounds handler:", error);
				throw error;
			}
		}
	);

	console.log("IPC handlers registered successfully");
};
