<template>
	<div class="board-view d-flex flex-column h-100">
		<!-- Header with Title and Tabs -->
		<div class="board-header">
			<h1 class="app-title">📋 TodoBoard</h1>
			<div class="tabs">
				<button
					@click="uiStore.setActiveTab('board')"
					:class="['tab-button', { active: activeTab === 'board' }]"
				>
					<i class="bi bi-kanban"></i>
					Board
				</button>
				<button
					@click="uiStore.setActiveTab('settings')"
					:class="['tab-button', { active: activeTab === 'settings' }]"
				>
					<i class="bi bi-gear"></i>
					Settings
				</button>
			</div>
		</div>

		<!-- Board Tab Content -->
		<div v-show="activeTab === 'board'" class="tab-content">
			<CompactToolbar
				:filter="filter"
				:tasks="allTasks"
				:is-filter-collapsed="isFilterCollapsed"
				:show-file-input="showFileInput"
				:has-downloadable-tasks="tasks.length > 0"
				@load-file="uiStore.openFileInput"
				@download="tasksStore.downloadTasks"
				@toggle-filter="uiStore.toggleFilterCollapse"
				@cancel-file-input="uiStore.closeFileInput"
				@update:filter="updateFilter"
				@file-upload="handleFileUpload"
			/>

			<TodoBoard
				:columns="visibleColumns"
				@create-sample-tasks="tasksStore.createSampleTasks"
			/>
		</div>

		<!-- Settings Tab Content -->
		<div v-show="activeTab === 'settings'" class="tab-content">
			<SettingsView :board-config="boardConfig" @save="saveSettings" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { TodoTask, BoardColumn, BoardConfig, Filter } from "@/types/todo";
import { getColumnValue } from "@/utils/todo-parser";
import { useTasks } from "@/composables/useTasks";
import { useUI } from "@/composables/useUI";
import CompactToolbar from "@/components/compact-toolbar.vue";
import SettingsView from "@/components/settings-view.vue";
import TodoBoard from "@/components/todo-board.vue";

// Access global state via composables
const tasksStore = useTasks();
const uiStore = useUI();

// Destructure for easier access
const { allTasks, boardConfig, filter, tasks, sortTasksByConfig } = tasksStore;
const { activeTab, showFileInput, isFilterCollapsed } = uiStore;

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
		// File input is reset in compact-toolbar component
	} catch (error) {
		console.error("Error uploading file:", error);
	}
}

function updateFilter(newFilter: Filter): void {
	tasksStore.setFilter(newFilter);
}

function saveSettings(config: BoardConfig): void {
	tasksStore.setBoardConfig(config);
	// Optionally switch back to board view after saving
	// uiStore.setActiveTab('board');
}
</script>

<style scoped>
.board-view {
	height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	flex-direction: column;
}

/* Header with Title and Tabs */
.board-header {
	background: rgba(255, 255, 255, 0.98);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid #dee2e6;
	padding: 16px 24px 0;
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.app-title {
	margin: 0 0 12px 0;
	font-size: 24px;
	font-weight: 700;
	color: #2c3e50;
	display: flex;
	align-items: center;
	gap: 8px;
}

.tabs {
	display: flex;
	gap: 4px;
	margin-bottom: -1px;
}

.tab-button {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 20px;
	border: 1px solid transparent;
	border-bottom: 1px solid #dee2e6;
	border-radius: 8px 8px 0 0;
	background: transparent;
	color: #6c757d;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
}

.tab-button i {
	font-size: 16px;
}

.tab-button:hover:not(.active) {
	background: rgba(0, 0, 0, 0.03);
	color: #495057;
	border-color: rgba(0, 0, 0, 0.08);
	border-bottom-color: #dee2e6;
}

.tab-button.active {
	background: white;
	color: #0d6efd;
	border-color: #dee2e6;
	border-bottom-color: white;
	z-index: 1;
}

.tab-button.active:hover {
	color: #0b5ed7;
}

/* Tab Content */
.tab-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
	.board-header {
		padding: 12px 16px;
		flex-direction: column;
		gap: 12px;
		align-items: flex-start;
	}

	.app-title {
		font-size: 20px;
	}

	.tabs {
		width: 100%;
	}

	.tab-button {
		flex: 1;
		justify-content: center;
		padding: 8px 16px;
		font-size: 13px;
	}
}
</style>
