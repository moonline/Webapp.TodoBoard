<template>
	<TodoBoardCore
		:initial-tasks="tasks"
		:initial-config="config"
		:initial-filter="filter"
		:hooks="hooks"
	>
		<template #toolbar-start>
			<button @click="openFilePicker" class="toolbar-button primary" title="Load todo.txt">
				<i class="bi bi-folder-plus"></i>
				<span class="button-text">Load</span>
			</button>
			<button
				@click="handleDownloadTasks"
				class="toolbar-button"
				:disabled="tasks.length === 0"
				title="Download todo.txt"
			>
				<i class="bi bi-download"></i>
				<span class="button-text">Download</span>
			</button>
		</template>

		<template #settings-actions>
			<button @click="openConfigFilePicker" class="btn btn-primary" title="Import config">
				<i class="bi bi-upload me-2"></i>
				Import
			</button>
			<button @click="handleExportConfig" class="btn btn-success" title="Export config">
				<i class="bi bi-download me-2"></i>
				Export
			</button>
		</template>
	</TodoBoardCore>

	<!-- Hidden File Inputs -->
	<input ref="fileInput" type="file" accept=".txt" @change="handleFileUpload" class="d-none" />
	<input
		ref="configFileInput"
		type="file"
		accept=".json"
		@change="handleConfigFileUpload"
		class="d-none"
	/>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
	TodoBoardCore,
	parseTodoText,
	serializeTodoTasks,
	getDefaultBoardConfig,
} from "todoboard-core";
import type { TodoTask, BoardConfig, Filter, CoreHooks } from "todoboard-core";
import {
	saveTasks,
	loadTasks,
	saveBoardConfig,
	loadBoardConfig,
	saveFilter,
	loadFilter,
} from "@/utils/local-storage";
import { downloadFile } from "@/utils/file-download";

const BOARD_ID = "main";

const tasks = ref<TodoTask[]>([]);
const config = ref<BoardConfig>(getDefaultBoardConfig());
const filter = ref<Filter>({ projects: [], contexts: [], tags: {} });

const fileInput = ref<HTMLInputElement>();
const configFileInput = ref<HTMLInputElement>();

const hooks: CoreHooks = {
	onTasksChanged: async (newTasks: TodoTask[]): Promise<void> => {
		tasks.value = newTasks;
		saveTasks(BOARD_ID, newTasks);
	},
	onConfigChanged: async (newConfig: BoardConfig): Promise<void> => {
		config.value = newConfig;
		saveBoardConfig(BOARD_ID, newConfig);
	},
	onFilterChanged: async (newFilter: Filter): Promise<void> => {
		filter.value = newFilter;
		saveFilter(BOARD_ID, newFilter);
	},
};

onMounted(() => {
	tasks.value = loadTasks(BOARD_ID);

	const savedConfig = loadBoardConfig(BOARD_ID);
	if (savedConfig) {
		config.value = savedConfig;
	} else {
		saveBoardConfig(BOARD_ID, config.value);
	}

	filter.value = loadFilter(BOARD_ID);
});

const openFilePicker = (): void => {
	fileInput.value?.click();
};

const openConfigFilePicker = (): void => {
	configFileInput.value?.click();
};

const handleFileUpload = (event: Event): void => {
	const inputElement = event.target as HTMLInputElement;
	const file = inputElement.files?.[0];
	if (!file) {
		return;
	}

	const reader = new FileReader();
	reader.onload = (readEvent) => {
		const content = readEvent.target?.result as string;
		if (content) {
			const parsedTasks = parseTodoText(content);
			tasks.value = parsedTasks;
			saveTasks(BOARD_ID, parsedTasks);
		}
	};
	reader.readAsText(file);

	// Reset input so the same file can be loaded again
	inputElement.value = "";
};

const handleConfigFileUpload = (event: Event): void => {
	const inputElement = event.target as HTMLInputElement;
	const file = inputElement.files?.[0];
	if (!file) {
		return;
	}

	const reader = new FileReader();
	reader.onload = (readEvent) => {
		try {
			const content = readEvent.target?.result as string;
			if (content) {
				const parsedConfig = JSON.parse(content) as BoardConfig;
				if (!parsedConfig.columns || !parsedConfig.groupingTag || !parsedConfig.sortBy) {
					alert("Invalid board configuration file.");
				} else {
					config.value = parsedConfig;
					saveBoardConfig(BOARD_ID, parsedConfig);
				}
			}
		} catch (error) {
			console.error("Error importing config:", error);
			alert(
				"Error importing configuration file. Please ensure it's a valid board.config.json file."
			);
		}
	};
	reader.readAsText(file);

	inputElement.value = "";
};

const handleDownloadTasks = async (): Promise<void> => {
	const content = serializeTodoTasks(tasks.value);
	await downloadFile(content, "todo.txt", "text/plain");
};

const handleExportConfig = async (): Promise<void> => {
	const content = JSON.stringify(config.value, null, 2);
	await downloadFile(content, "board.config.json", "application/json");
};
</script>

<style scoped>
.toolbar-button {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 14px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
	background: white;
	color: #495057;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.toolbar-button:hover:not(:disabled) {
	background: #f8f9fa;
	border-color: rgba(0, 0, 0, 0.15);
	transform: translateY(-1px);
}

.toolbar-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.toolbar-button.primary {
	background: #0d6efd;
	color: white;
	border-color: #0d6efd;
}

.toolbar-button.primary:hover {
	background: #0b5ed7;
	border-color: #0b5ed7;
}

.toolbar-button i {
	font-size: 14px;
}

.button-text {
	white-space: nowrap;
}

@media (max-width: 768px) {
	.button-text {
		display: none;
	}

	.toolbar-button {
		padding: 8px 10px;
	}
}
</style>
