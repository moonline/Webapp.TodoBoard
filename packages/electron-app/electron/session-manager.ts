import { app } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import type { SessionState } from "./types";

const SESSION_FILE_NAME = "session.json";

/**
 * Gets the path to the session file in the user data directory
 */
const getSessionFilePath = (): string => {
	const userDataPath = app.getPath("userData");
	return path.join(userDataPath, SESSION_FILE_NAME);
};

/**
 * Gets the default session state
 */
const getDefaultSession = (): SessionState => {
	return {
		openFiles: [],
		activeFileIndex: -1,
		windowBounds: {
			x: 0,
			y: 0,
			width: 1200,
			height: 800,
		},
	};
};

/**
 * Loads the session state from disk
 */
export const loadSession = async (): Promise<SessionState> => {
	try {
		const sessionPath = getSessionFilePath();
		const content = await fs.readFile(sessionPath, "utf-8");
		const session = JSON.parse(content) as SessionState;

		// Validate session structure
		if (!session.openFiles || !Array.isArray(session.openFiles)) {
			console.log("Invalid session structure, using default");
			return getDefaultSession();
		} else {
			return session;
		}
	} catch (error) {
		// Session file doesn't exist or is corrupted
		console.log("No session found, using default");
		return getDefaultSession();
	}
};

/**
 * Saves the session state to disk
 */
export const saveSession = async (session: SessionState): Promise<void> => {
	try {
		const sessionPath = getSessionFilePath();
		const content = JSON.stringify(session, null, 2);

		// Ensure the userData directory exists
		const userDataPath = app.getPath("userData");
		await fs.mkdir(userDataPath, { recursive: true });

		await fs.writeFile(sessionPath, content, "utf-8");
	} catch (error) {
		console.error("Error saving session:", error);
		throw error;
	}
};

/**
 * Adds a file to the session
 */
export const addFileToSession = async (filePath: string, configPath: string): Promise<void> => {
	const session = await loadSession();

	// Check if file is already in session
	const existingIndex = session.openFiles.findIndex((file) => file.path === filePath);

	if (existingIndex === -1) {
		// Add new file
		session.openFiles.push({
			path: filePath,
			configPath,
			lastModified: Date.now(),
		});
		session.activeFileIndex = session.openFiles.length - 1;
	} else {
		// Update existing file and make it active
		session.openFiles[existingIndex].lastModified = Date.now();
		session.activeFileIndex = existingIndex;
	}

	await saveSession(session);
};

/**
 * Removes a file from the session
 */
export const removeFileFromSession = async (filePath: string): Promise<void> => {
	const session = await loadSession();

	const index = session.openFiles.findIndex((file) => file.path === filePath);

	if (index !== -1) {
		session.openFiles.splice(index, 1);

		// Adjust active index
		if (session.activeFileIndex >= session.openFiles.length) {
			session.activeFileIndex = Math.max(0, session.openFiles.length - 1);
		} else {
			// Keep current index
		}

		// If no files left, reset to -1
		if (session.openFiles.length === 0) {
			session.activeFileIndex = -1;
		} else {
			// Keep current active index
		}

		await saveSession(session);
	} else {
		// File not found in session, no action needed
	}
};

/**
 * Updates the active file index in the session
 */
export const updateActiveFileIndex = async (index: number): Promise<void> => {
	const session = await loadSession();

	if (index >= 0 && index < session.openFiles.length) {
		session.activeFileIndex = index;
		await saveSession(session);
	} else {
		// Invalid index, no action taken
	}
};

/**
 * Updates the window bounds in the session
 */
export const updateWindowBounds = async (bounds: {
	x: number;
	y: number;
	width: number;
	height: number;
}): Promise<void> => {
	const session = await loadSession();
	session.windowBounds = bounds;
	await saveSession(session);
};

/**
 * Clears the session (removes all files)
 */
export const clearSession = async (): Promise<void> => {
	await saveSession(getDefaultSession());
};
