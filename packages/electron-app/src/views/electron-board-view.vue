<template>
	<div class="electron-board-view d-flex flex-column h-100">
		<!-- File Tabs Bar -->
		<div class="file-tabs-bar">
			<div class="file-tabs">
				<div
					v-for="(file, index) in openFiles"
					:key="file.path"
					@click="setActiveFile(index)"
					:class="['file-tab', { active: activeFileIndex === index }]"
					:title="file.path"
					role="button"
					tabindex="0"
					@keydown.enter="setActiveFile(index)"
				>
					<span class="file-tab-name">
						{{ file.name }}
						<span v-if="file.isDirty" class="dirty-indicator">*</span>
					</span>
					<button
						@click.stop="closeFile(index)"
						class="file-tab-close"
						title="Close file"
					>
						<i class="bi bi-x"></i>
					</button>
				</div>
				<button @click="handleOpenFile" class="file-tab-add" title="Open file">
					<i class="bi bi-plus-lg"></i>
				</button>
			</div>
		</div>

		<!-- Board per open file -->
		<div v-if="openFiles.length > 0" class="board-container flex-grow-1">
			<template v-for="(file, index) in openFiles" :key="file.path">
				<div v-show="activeFileIndex === index" class="h-100">
					<TodoBoardCore
						:initial-tasks="file.tasks"
						:initial-config="file.config"
						:initial-filter="file.filter"
						:hooks="file.hooks"
					>
						<template v-if="file.isUsingDefaultConfig" #settings-banner>
							<div
								class="alert alert-info d-flex align-items-center mb-3"
								role="alert"
							>
								<i class="bi bi-info-circle me-2"></i>
								No board config file found. Using default settings. Save settings to
								create a config file.
							</div>
						</template>
					</TodoBoardCore>
				</div>
			</template>
		</div>

		<!-- Empty state -->
		<div
			v-else
			class="empty-state d-flex flex-column align-items-center justify-content-center flex-grow-1"
		>
			<i class="bi bi-folder2-open empty-icon"></i>
			<h2>No files open</h2>
			<p class="text-muted">Click the + button above or use File &gt; Open to get started</p>
			<button @click="handleOpenFile" class="btn btn-primary">
				<i class="bi bi-folder2-open me-2"></i>
				Open File
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
	TodoBoardCore,
	parseTodoText,
	serializeTodoTasks,
	getDefaultBoardConfig,
	cloneBoardConfig,
} from "todoboard-core";
import type { TodoTask, BoardConfig, Filter, CoreHooks } from "todoboard-core";
import { useElectron } from "@/composables/useElectron";
import type { SessionFile } from "@/types/electron";

interface OpenFile {
	path: string;
	configPath: string;
	name: string;
	tasks: TodoTask[];
	config: BoardConfig;
	filter: Filter;
	hooks: CoreHooks;
	isDirty: boolean;
	isUsingDefaultConfig: boolean;
}

const SAVE_DEBOUNCE_MS = 500;

const electron = useElectron();
const openFiles = ref<OpenFile[]>([]);
const activeFileIndex = ref(-1);

// Per-file debounce timers for saving
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

const debouncedSave = (filePath: string, saveFn: () => Promise<void>): void => {
	const existing = saveTimers.get(filePath);
	if (existing) {
		clearTimeout(existing);
	}

	saveTimers.set(
		filePath,
		setTimeout(async () => {
			saveTimers.delete(filePath);
			try {
				await saveFn();
			} catch (error) {
				console.error("Debounced save failed:", error);
			}
		}, SAVE_DEBOUNCE_MS)
	);
};

const extractFileName = (filePath: string): string => {
	const parts = filePath.replace(/\\/g, "/").split("/");
	return parts[parts.length - 1] || filePath;
};

const createHooksForFile = (filePath: string, fileIndex: () => number): CoreHooks => ({
	onTasksChanged: async (tasks: TodoTask[]) => {
		const idx = fileIndex();
		if (idx >= 0 && idx < openFiles.value.length) {
			openFiles.value[idx].tasks = tasks;
			openFiles.value[idx].isDirty = true;
			debouncedSave(filePath, () => saveFileContent(idx));
		}
	},
	onConfigChanged: async (config: BoardConfig) => {
		const idx = fileIndex();
		if (idx >= 0 && idx < openFiles.value.length) {
			openFiles.value[idx].config = config;
			openFiles.value[idx].isDirty = true;
			openFiles.value[idx].isUsingDefaultConfig = false;
			debouncedSave(filePath + ":config", () => saveFileConfig(idx));
		}
	},
	onFilterChanged: async (_filter: Filter) => {
		const idx = fileIndex();
		if (idx >= 0 && idx < openFiles.value.length) {
			openFiles.value[idx].filter = _filter;
		}
	},
});

const saveFileContent = async (index: number): Promise<void> => {
	const file = openFiles.value[index];
	if (!file) {
		return;
	}

	try {
		const content = serializeTodoTasks(file.tasks);
		await electron.saveFile(file.path, content);
		openFiles.value[index].isDirty = false;
	} catch (error) {
		console.error("Failed to save file:", error);
	}
};

const saveFileConfig = async (index: number): Promise<void> => {
	const file = openFiles.value[index];
	if (!file) {
		return;
	}

	try {
		// cloneBoardConfig unwraps Vue reactive Proxies into a plain object,
		// which is required for Electron's IPC structured clone serialization
		await electron.saveConfig(file.configPath, cloneBoardConfig(file.config));
	} catch (error) {
		console.error("Failed to save config:", error);
	}
};

const handleOpenFile = async (): Promise<void> => {
	try {
		const result = await electron.openFile();
		if (!result) {
			return;
		}

		// Check if file is already open
		const existingIndex = openFiles.value.findIndex((f) => f.path === result.path);
		if (existingIndex >= 0) {
			activeFileIndex.value = existingIndex;
			return;
		}

		const tasks = parseTodoText(result.content);
		const isUsingDefaultConfig = result.config === null;
		const config = result.config || getDefaultBoardConfig();
		const filter: Filter = { projects: [], contexts: [], tags: {} };

		const newIndex = openFiles.value.length;
		const hooks = createHooksForFile(result.path, () => {
			return openFiles.value.findIndex((f) => f.path === result.path);
		});

		openFiles.value.push({
			path: result.path,
			configPath: result.configPath,
			name: result.name,
			tasks,
			config,
			filter,
			hooks,
			isDirty: false,
			isUsingDefaultConfig,
		});

		activeFileIndex.value = newIndex;

		// Watch file for external changes
		electron.watchFile(result.path, (content: string) => {
			const idx = openFiles.value.findIndex((f) => f.path === result.path);
			if (idx >= 0) {
				openFiles.value[idx].tasks = parseTodoText(content);
			}
		});

		saveSession();
	} catch (error) {
		console.error("Error opening file:", error);
	}
};

const setActiveFile = (index: number): void => {
	activeFileIndex.value = index;
	saveSession();
};

const closeFile = (index: number): void => {
	const file = openFiles.value[index];
	if (file) {
		electron.unwatchFile(file.path);
		// Clear any pending debounced saves for this file
		const taskTimer = saveTimers.get(file.path);
		if (taskTimer) {
			clearTimeout(taskTimer);
			saveTimers.delete(file.path);
		}
		const configTimer = saveTimers.get(file.path + ":config");
		if (configTimer) {
			clearTimeout(configTimer);
			saveTimers.delete(file.path + ":config");
		}
	}

	openFiles.value.splice(index, 1);

	if (activeFileIndex.value >= openFiles.value.length) {
		activeFileIndex.value = openFiles.value.length - 1;
	} else if (activeFileIndex.value > index) {
		activeFileIndex.value -= 1;
	}

	saveSession();
};

const saveSession = async (): Promise<void> => {
	try {
		const sessionFiles: SessionFile[] = openFiles.value.map((f) => ({
			path: f.path,
			configPath: f.configPath,
			lastModified: Date.now(),
		}));

		await electron.saveSession({
			openFiles: sessionFiles,
			activeFileIndex: activeFileIndex.value,
			windowBounds: { x: 0, y: 0, width: 1200, height: 800 },
		});
	} catch (error) {
		console.error("Failed to save session:", error);
	}
};

const restoreSession = async (): Promise<void> => {
	try {
		const session = await electron.getSession();
		if (!session || session.openFiles.length === 0) {
			return;
		}

		for (const sessionFile of session.openFiles) {
			try {
				const content = await electron.readFile(sessionFile.path);
				const config = await electron.loadConfig(sessionFile.configPath);
				const tasks = parseTodoText(content);
				const filter: Filter = { projects: [], contexts: [], tags: {} };

				const hooks = createHooksForFile(sessionFile.path, () => {
					return openFiles.value.findIndex((f) => f.path === sessionFile.path);
				});

				openFiles.value.push({
					path: sessionFile.path,
					configPath: sessionFile.configPath,
					name: extractFileName(sessionFile.path),
					tasks,
					config: config || getDefaultBoardConfig(),
					filter,
					hooks,
					isDirty: false,
					isUsingDefaultConfig: config === null,
				});

				electron.watchFile(sessionFile.path, (newContent: string) => {
					const idx = openFiles.value.findIndex((f) => f.path === sessionFile.path);
					if (idx >= 0) {
						openFiles.value[idx].tasks = parseTodoText(newContent);
					}
				});
			} catch (error) {
				console.error(`Failed to restore file ${sessionFile.path}:`, error);
			}
		}

		if (session.activeFileIndex >= 0 && session.activeFileIndex < openFiles.value.length) {
			activeFileIndex.value = session.activeFileIndex;
		} else if (openFiles.value.length > 0) {
			activeFileIndex.value = 0;
		}
	} catch (error) {
		console.error("Failed to restore session:", error);
	}
};

onMounted(() => {
	restoreSession();
});

onUnmounted(() => {
	openFiles.value.forEach((file) => {
		electron.unwatchFile(file.path);
	});
	// Clear all pending debounced saves
	saveTimers.forEach((timer) => clearTimeout(timer));
	saveTimers.clear();
});
</script>

<style scoped>
.electron-board-view {
	height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	flex-direction: column;
}

.board-container {
	overflow: hidden;
}

/* File Tabs */
.file-tabs-bar {
	background: rgba(255, 255, 255, 0.95);
	border-bottom: 1px solid #dee2e6;
	padding: 8px 16px 0;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.file-tabs {
	display: flex;
	gap: 4px;
	margin-bottom: -1px;
	overflow-x: auto;
	overflow-y: hidden;
}

.file-tab {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 12px;
	border: 1px solid transparent;
	border-bottom: 1px solid #dee2e6;
	border-radius: 6px 6px 0 0;
	background: rgba(0, 0, 0, 0.02);
	color: #6c757d;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s ease;
	white-space: nowrap;
	min-width: 80px;
	max-width: 200px;
}

.file-tab:hover:not(.active) {
	background: rgba(0, 0, 0, 0.05);
	color: #495057;
	border-color: rgba(0, 0, 0, 0.08);
	border-bottom-color: #dee2e6;
}

.file-tab.active {
	background: white;
	color: #2c3e50;
	border-color: #dee2e6;
	border-bottom: none;
	z-index: 1;
}

.file-tab-name {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.dirty-indicator {
	color: #dc3545;
	font-weight: bold;
	margin-left: 2px;
}

.file-tab-close {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	padding: 0;
	border: none;
	border-radius: 4px;
	background: transparent;
	color: #6c757d;
	font-size: 18px;
	cursor: pointer;
	transition: all 0.15s ease;
	flex-shrink: 0;
}

.file-tab-close:hover {
	background: rgba(220, 53, 69, 0.1);
	color: #dc3545;
}

.file-tab-add {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	padding: 0;
	border: 1px solid transparent;
	border-radius: 6px;
	background: rgba(13, 110, 253, 0.08);
	color: #0d6efd;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.15s ease;
	flex-shrink: 0;
	margin-left: 4px;
}

.file-tab-add:hover {
	background: rgba(13, 110, 253, 0.15);
	border-color: rgba(13, 110, 253, 0.2);
}

/* Empty State */
.empty-state {
	color: rgba(255, 255, 255, 0.9);
}

.empty-icon {
	font-size: 64px;
	margin-bottom: 16px;
	opacity: 0.7;
}

.empty-state h2 {
	font-weight: 600;
	margin-bottom: 8px;
}

.empty-state .text-muted {
	color: rgba(255, 255, 255, 0.6) !important;
	margin-bottom: 24px;
}
</style>
