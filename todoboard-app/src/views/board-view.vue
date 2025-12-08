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
				:is-compact-mode="isCompactMode"
				:has-downloadable-tasks="tasks.length > 0"
				@create-task="handleCreateTask"
				@download="tasksStore.downloadTasks"
				@clear-board="handleClearBoardRequest"
				@toggle-filter="uiStore.toggleFilterCollapse"
				@toggle-compact-mode="uiStore.toggleCompactMode"
				@update:filter="updateFilter"
				@file-upload="handleFileUpload"
			/>

			<TodoBoard
				:columns="visibleColumns"
				:is-compact-mode="isCompactMode"
				:active-task-id="activeTaskId"
				@create-sample-tasks="tasksStore.createSampleTasks"
				@edit-task="handleEditTask"
				@task-drop="handleTaskDrop"
				@update-priority="handleUpdatePriority"
				@toggle-task-active="handleToggleTaskActive"
			/>
		</div>

		<!-- Settings Tab Content -->
		<div v-show="activeTab === 'settings'" class="tab-content">
			<SettingsView :board-config="boardConfig" @save="saveSettings" />
		</div>

		<!-- Edit Task Modal -->
		<EditTaskModal
			:is-open="isEditModalOpen"
			:task="selectedTask"
			:mode="modalMode"
			@close="closeEditModal"
			@save="handleSaveTask"
			@create="handleCreateNewTask"
		/>

		<!-- Confirm Clear Board Modal -->
		<ConfirmModal
			:is-open="isConfirmClearOpen"
			title="Clear Board"
			message="Are you sure you want to clear the board? All tasks will be permanently deleted. This action cannot be undone."
			confirm-text="Clear Board"
			cancel-text="Cancel"
			variant="danger"
			@confirm="handleConfirmClear"
			@cancel="handleCancelClear"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { TodoTask, BoardColumn, BoardConfig, Filter } from "@/types/todo";
import { ColumnType } from "@/types/todo";
import { useTasks } from "@/composables/useTasks";
import { useUI } from "@/composables/useUI";
import { buildRawTodoText, parseTodoText } from "@/utils/todo-parser";
import CompactToolbar from "@/components/compact-toolbar.vue";
import SettingsView from "@/components/settings-view.vue";
import TodoBoard from "@/components/todo-board.vue";
import EditTaskModal from "@/components/edit-task-modal.vue";
import ConfirmModal from "@/components/confirm-modal.vue";

// Access global state via composables
const tasksStore = useTasks();
const uiStore = useUI();

// Destructure for easier access
const { allTasks, boardConfig, filter, tasks, sortTasksByConfig, updateTask } = tasksStore;
const { activeTab, isFilterCollapsed, isCompactMode, activeTaskId, setActiveTask } = uiStore;

// Edit task modal state
const isEditModalOpen = ref(false);
const selectedTask = ref<TodoTask | null>(null);
const modalMode = ref<"edit" | "create">("edit");

// Confirm clear board modal state
const isConfirmClearOpen = ref(false);

const visibleColumns = computed(() => {
	const columnMap = new Map<string, TodoTask[]>();

	// Initialize all configured columns with empty arrays
	Object.keys(boardConfig.value.columns).forEach((key) => {
		columnMap.set(key, []);
	});

	// Track which tasks have been assigned to columns
	const assignedTaskIds = new Set<string>();

	// Distribute tasks into columns
	tasks.value.forEach((task) => {
		// Check if task belongs to completed column
		if (task.completed) {
			const completedColumn = Object.entries(boardConfig.value.columns).find(
				([, config]) => config.type === "completed"
			);
			if (completedColumn) {
				const completedTasks = columnMap.get(completedColumn[0]);
				if (completedTasks) {
					completedTasks.push(task);
					assignedTaskIds.add(task.id);
				}
			}
			return;
		}

		// Check if task belongs to a tag column
		const groupingTagValue = task.tags[boardConfig.value.groupingTag];
		if (groupingTagValue) {
			const matchingColumn = Object.entries(boardConfig.value.columns).find(
				([, config]) => config.type === "tag" && config.tagValue === groupingTagValue
			);
			if (matchingColumn) {
				const matchingTasks = columnMap.get(matchingColumn[0]);
				if (matchingTasks) {
					matchingTasks.push(task);
					assignedTaskIds.add(task.id);
				}
				return;
			}
		}

		// If task doesn't match any column, add to uncategorized
		if (!assignedTaskIds.has(task.id)) {
			const uncategorizedColumn = Object.entries(boardConfig.value.columns).find(
				([, config]) => config.type === "uncategorized"
			);
			if (uncategorizedColumn) {
				const uncategorizedTasks = columnMap.get(uncategorizedColumn[0]);
				if (uncategorizedTasks) {
					uncategorizedTasks.push(task);
				}
			}
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

function handleCreateTask(): void {
	modalMode.value = "create";
	selectedTask.value = null;
	isEditModalOpen.value = true;
}

function handleEditTask(task: TodoTask): void {
	modalMode.value = "edit";
	selectedTask.value = task;
	isEditModalOpen.value = true;
}

function closeEditModal(): void {
	isEditModalOpen.value = false;
	selectedTask.value = null;
	modalMode.value = "edit";
}

function handleSaveTask(taskId: string, rawText: string): void {
	updateTask(taskId, rawText);
	closeEditModal();
}

function handleCreateNewTask(rawText: string): void {
	const existingTasks = allTasks.value;
	const newTasks = [...existingTasks, ...parseTodoText(rawText)];
	tasksStore.setTasks(newTasks);
	closeEditModal();
}

function handleTaskDrop(task: TodoTask, targetColumn: BoardColumn): void {
	// Create a copy of the task to modify
	const modifiedTask = { ...task };

	// Get today's date for completion date if needed
	const today = new Date().toISOString().split("T")[0];

	// Modify task based on the target column type
	switch (targetColumn.type) {
		case ColumnType.Tag:
			// Set the grouping tag to the column's tag value
			if (targetColumn.tagValue) {
				modifiedTask.tags = { ...modifiedTask.tags };
				modifiedTask.tags[boardConfig.value.groupingTag] = targetColumn.tagValue;
			}
			// Unmark as completed if it was completed
			if (modifiedTask.completed) {
				modifiedTask.completed = false;
				modifiedTask.completedDate = null;
			}
			break;

		case ColumnType.Completed:
			// Mark task as completed
			modifiedTask.completed = true;
			modifiedTask.completedDate = today;
			// Remove the grouping tag
			modifiedTask.tags = { ...modifiedTask.tags };
			delete modifiedTask.tags[boardConfig.value.groupingTag];
			break;

		case ColumnType.Uncategorized:
			// Remove the grouping tag
			modifiedTask.tags = { ...modifiedTask.tags };
			delete modifiedTask.tags[boardConfig.value.groupingTag];
			// Unmark as completed if it was completed
			if (modifiedTask.completed) {
				modifiedTask.completed = false;
				modifiedTask.completedDate = null;
			}
			break;
	}

	// Rebuild the raw todo.txt format and update the task
	const newRawText = buildRawTodoText(modifiedTask);
	updateTask(task.id, newRawText);
}

function handleUpdatePriority(task: TodoTask, newPriority: string | null): void {
	// Create a copy of the task to modify
	const modifiedTask = { ...task, priority: newPriority };

	// Rebuild the raw todo.txt format and update the task
	const newRawText = buildRawTodoText(modifiedTask);
	updateTask(task.id, newRawText);
}

function handleClearBoardRequest(): void {
	isConfirmClearOpen.value = true;
}

function handleConfirmClear(): void {
	tasksStore.clearTasks();
	isConfirmClearOpen.value = false;
}

function handleCancelClear(): void {
	isConfirmClearOpen.value = false;
}

function handleToggleTaskActive(task: TodoTask): void {
	// If clicking the same task, deactivate it; otherwise, set it as active
	if (activeTaskId.value === task.id) {
		setActiveTask(null);
	} else {
		setActiveTask(task.id);
	}
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
	align-items: center;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.app-title {
	margin: 0;
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
	border-bottom: none;
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
