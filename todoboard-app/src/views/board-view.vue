<template>
	<div class="board-view d-flex flex-column h-100">
		<Toolbar
			:filter="filter"
			:tasks="allTasks"
			:is-filter-collapsed="isFilterCollapsed"
			:show-file-input="showFileInput"
			:has-downloadable-tasks="tasks.length > 0"
			@load-file="uiStore.openFileInput"
			@download="tasksStore.downloadTasks"
			@open-settings="uiStore.openSettings"
			@toggle-filter="uiStore.toggleFilterCollapse"
			@cancel-file-input="uiStore.closeFileInput"
			@update:filter="updateFilter"
			@file-upload="handleFileUpload"
		/>

		<SettingsModal
			:is-visible="showSettings"
			:board-config="boardConfig"
			@close="uiStore.closeSettings"
			@save="saveSettings"
		/>

		<TodoBoard :columns="visibleColumns" @create-sample-tasks="tasksStore.createSampleTasks" />
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { TodoTask, BoardColumn, BoardConfig, Filter } from "@/types/todo";
import { getColumnValue } from "@/utils/todo-parser";
import { useTasks } from "@/composables/useTasks";
import { useUI } from "@/composables/useUI";
import Toolbar from "@/components/toolbar.vue";
import SettingsModal from "@/components/settings-modal.vue";
import TodoBoard from "@/components/todo-board.vue";

// Access global state via composables
const tasksStore = useTasks();
const uiStore = useUI();

const fileInput = ref<HTMLInputElement>();

// Destructure for easier access
const { allTasks, boardConfig, filter, tasks, sortTasksByConfig } = tasksStore;
const { showSettings, showFileInput, isFilterCollapsed } = uiStore;

const visibleColumns = computed(() => {
	const columnMap = new Map<string, TodoTask[]>();

	// Initialize all configured columns with empty arrays
	Object.keys(boardConfig.value.columns).forEach((key) => {
		columnMap.set(key, []);
	});

	// Distribute tasks into columns
	tasks.value.forEach((task) => {
		const columnValue = getColumnValue(task, boardConfig.value.columnBy);
		if (!columnMap.has(columnValue)) {
			columnMap.set(columnValue, []);
		}
		const existingTasks = columnMap.get(columnValue);
		if (existingTasks) {
			existingTasks.push(task);
		}
	});

	const columns: BoardColumn[] = [];

	// Create columns based on visibility and display behavior
	Object.entries(boardConfig.value.columns).forEach(([key, config]) => {
		if (config.visible) {
			const columnTasks = columnMap.get(key) || [];
			const shouldShow =
				config.displayBehavior === "always" ||
				(config.displayBehavior === "whenTasks" && columnTasks.length > 0);

			if (shouldShow) {
				columns.push({
					...config,
					tasks: sortTasksByConfig(columnTasks, boardConfig.value),
				});
			}
		}
	});

	return columns.sort((a, b) => a.order - b.order);
});

async function handleFileUpload(event: Event): Promise<void> {
	const file = (event.target as HTMLInputElement).files?.[0];
	if (!file) {
		return;
	}

	try {
		await tasksStore.uploadFile(file);
		uiStore.closeFileInput();
		// Reset the file input so the same file can be loaded again
		if (fileInput.value) {
			fileInput.value.value = "";
		}
	} catch (error) {
		console.error("Error uploading file:", error);
	}
}

function updateFilter(newFilter: Filter): void {
	tasksStore.setFilter(newFilter);
}

function saveSettings(config: BoardConfig): void {
	tasksStore.setBoardConfig(config);
	uiStore.closeSettings();
}
</script>

<style scoped>
.board-view {
	height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
