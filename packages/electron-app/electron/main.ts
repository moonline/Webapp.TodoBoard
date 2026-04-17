import { app, BrowserWindow } from "electron";
import * as path from "path";
import { registerIPCHandlers } from "./ipc-handlers";
import { createApplicationMenu } from "./menu";
import { loadSession, updateWindowBounds } from "./session-manager";

let mainWindow: BrowserWindow | null = null;

const isDevelopment = !app.isPackaged;

/**
 * Creates the main application window
 */
const createWindow = async (): Promise<void> => {
	// Load saved session to restore window bounds
	const session = await loadSession();
	const { windowBounds } = session;

	mainWindow = new BrowserWindow({
		width: windowBounds.width || 1200,
		height: windowBounds.height || 800,
		x: windowBounds.x || undefined,
		y: windowBounds.y || undefined,
		icon: path.join(__dirname, "../../icon-todoboard-512.png"),
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(__dirname, "../preload/index.js"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false,
		},
		title: "TodoBoard",
		backgroundColor: "#ffffff",
	});

	// Save window bounds when they change
	mainWindow.on("resize", () => {
		if (mainWindow) {
			const bounds = mainWindow.getBounds();
			updateWindowBounds(bounds).catch((error) =>
				console.error("Error updating window bounds:", error)
			);
		} else {
			// Window is null
		}
	});

	mainWindow.on("move", () => {
		if (mainWindow) {
			const bounds = mainWindow.getBounds();
			updateWindowBounds(bounds).catch((error) =>
				console.error("Error updating window bounds:", error)
			);
		} else {
			// Window is null
		}
	});

	// Load the app
	if (isDevelopment) {
		// In development, load from Vite dev server
		const rendererUrl = process.env.ELECTRON_RENDERER_URL || "http://localhost:5174";
		await mainWindow.loadURL(rendererUrl);
		mainWindow.webContents.openDevTools();
	} else {
		// In production, load from built files
		await mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
	}

	// Create application menu
	createApplicationMenu(mainWindow);

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
};

/**
 * Initialize the application
 */
const initialize = async (): Promise<void> => {
	// Register IPC handlers before creating window
	registerIPCHandlers();

	// Create window when Electron is ready
	await app.whenReady();
	await createWindow();

	// On macOS, re-create window when dock icon is clicked and no windows are open
	app.on("activate", async () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			await createWindow();
		} else {
			// Windows already exist
		}
	});
};

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	} else {
		// On macOS, keep app running
	}
});

// Handle app quit
app.on("before-quit", async () => {
	// Save final window state
	if (mainWindow) {
		const bounds = mainWindow.getBounds();
		await updateWindowBounds(bounds);
	} else {
		// No window to save
	}
});

// Start the application
initialize().catch((error) => {
	console.error("Failed to initialize application:", error);
	app.quit();
});
