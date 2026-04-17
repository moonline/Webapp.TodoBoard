import { computed } from "vue";
import type { ElectronAPI, FileOpenResult, SessionState } from "@/types/electron";
import type { BoardConfig } from "todoboard-core";

/**
 * Composable for interacting with Electron APIs
 * Provides a safe wrapper around window.electron with fallbacks for web mode
 */
export const useElectron = () => {
	const isElectron = computed(() => typeof window !== "undefined" && !!window.electron);

	const api = computed<ElectronAPI | null>(() => {
		if (isElectron.value) {
			return window.electron!;
		} else {
			return null;
		}
	});

	const openFile = async (): Promise<FileOpenResult | null> => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			return await api.value.openFile();
		}
	};

	const saveFile = async (path: string, content: string): Promise<void> => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			await api.value.saveFile(path, content);
		}
	};

	const readFile = async (path: string): Promise<string> => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			return await api.value.readFile(path);
		}
	};

	const showSaveDialog = async (defaultPath: string): Promise<string | null> => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			return await api.value.showSaveDialog(defaultPath);
		}
	};

	const saveConfig = async (path: string, config: BoardConfig): Promise<void> => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			await api.value.saveConfig(path, config);
		}
	};

	const loadConfig = async (path: string): Promise<BoardConfig | null> => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			return await api.value.loadConfig(path);
		}
	};

	const getSession = async (): Promise<SessionState> => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			return await api.value.getSession();
		}
	};

	const saveSession = async (data: SessionState): Promise<void> => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			await api.value.saveSession(data);
		}
	};

	const watchFile = (path: string, callback: (content: string) => void): void => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			api.value.watchFile(path, callback);
		}
	};

	const unwatchFile = (path: string): void => {
		if (!api.value) {
			throw new Error("Electron API not available");
		} else {
			api.value.unwatchFile(path);
		}
	};

	return {
		isElectron,
		openFile,
		saveFile,
		readFile,
		showSaveDialog,
		saveConfig,
		loadConfig,
		getSession,
		saveSession,
		watchFile,
		unwatchFile,
	};
};
