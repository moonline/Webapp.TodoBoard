<template>
	<div class="board-view d-flex flex-column h-100">
		<!-- Toolbar -->
		<div class="toolbar">
			<div class="toolbar-header">
				<h1 class="app-title">📋 TodoBoard</h1>
				<div class="action-buttons">
					<button
						@click="showFileInput = true"
						class="action-button primary"
						title="Load todo.txt"
					>
						<i class="bi bi-folder-plus"></i>
					</button>
					<button
						@click="downloadTodos"
						class="action-button secondary"
						:disabled="tasks.length === 0"
						title="Download"
					>
						<i class="bi bi-download"></i>
					</button>
					<button
						@click="showSettings = true"
						class="action-button secondary"
						title="Settings"
					>
						<i class="bi bi-gear"></i>
					</button>
					<button
						@click="isFilterCollapsed = !isFilterCollapsed"
						class="action-button secondary"
						:title="isFilterCollapsed ? 'Show Filters' : 'Hide Filters'"
					>
						<i
							:class="isFilterCollapsed ? 'bi bi-chevron-down' : 'bi bi-chevron-up'"
						></i>
					</button>
				</div>
			</div>

			<!-- File Input -->
			<div v-if="showFileInput" class="file-input-section">
				<div class="file-input-container">
					<input
						ref="fileInput"
						type="file"
						accept=".txt"
						@change="handleFileUpload"
						class="file-input"
					/>
					<button @click="showFileInput = false" class="cancel-button">
						<i class="bi bi-x"></i>
						Cancel
					</button>
				</div>
			</div>

			<filter-bar
				:filter="filter"
				:tasks="allTasks"
				:is-collapsed="isFilterCollapsed"
				@update:filter="updateFilter"
			/>
		</div>

		<!-- Settings Modal -->
		<div v-if="showSettings" class="modal-backdrop" @click="showSettings = false">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h5 class="modal-title">Board Settings</h5>
					<button @click="showSettings = false" class="btn-close"></button>
				</div>
				<div class="modal-body">
					<div class="mb-3">
						<label class="form-label">Column By:</label>
						<select v-model="boardConfig.columnBy" class="form-select">
							<option value="status">Status</option>
							<option value="priority">Priority</option>
							<option value="project">Project</option>
							<option value="context">Context</option>
						</select>
					</div>

					<div class="mb-3">
						<h6>Column Configuration:</h6>
						<div
							v-for="[key, column] in Object.entries(boardConfig.columns)"
							:key="key"
							class="border rounded p-3 mb-3"
						>
							<div class="row g-2">
								<div class="col-md-6">
									<label class="form-label small">Title:</label>
									<input
										v-model="column.title"
										type="text"
										class="form-control form-control-sm"
									/>
								</div>
								<div class="col-md-3">
									<label class="form-label small">Icon:</label>
									<input
										v-model="column.icon"
										type="text"
										class="form-control form-control-sm"
									/>
								</div>
								<div class="col-md-3">
									<label class="form-label small">Order:</label>
									<input
										v-model.number="column.order"
										type="number"
										class="form-control form-control-sm"
										min="0"
									/>
								</div>
							</div>

							<div class="row g-2 mt-2">
								<div class="col-md-4">
									<label class="form-label small">Color:</label>
									<input
										v-model="column.color"
										type="color"
										class="form-control form-control-color form-control-sm"
									/>
								</div>
								<div class="col-md-4">
									<label class="form-label small">Display:</label>
									<select
										v-model="column.displayBehavior"
										class="form-select form-select-sm"
									>
										<option value="always">Always Show</option>
										<option value="whenTasks">When Has Tasks</option>
										<option value="hide">Hide</option>
									</select>
								</div>
								<div class="col-md-4 d-flex align-items-end">
									<div class="form-check">
										<input
											:id="`visible-${key}`"
											v-model="column.visible"
											type="checkbox"
											class="form-check-input"
										/>
										<label
											:for="`visible-${key}`"
											class="form-check-label small"
										>
											Visible
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button @click="saveSettings" class="btn btn-primary">Save Settings</button>
					<button @click="showSettings = false" class="btn btn-secondary">Cancel</button>
				</div>
			</div>
		</div>

		<!-- Board -->
		<div class="board-container flex-grow-1 overflow-auto">
			<div v-if="tasks.length === 0" class="empty-board-state">
				<div class="empty-content">
					<div class="empty-icon">📋</div>
					<h3 class="empty-title">No tasks loaded</h3>
					<p class="empty-description">
						Upload a todo.txt file to get started, or create some sample tasks to see
						how it works
					</p>
					<button @click="createSampleTasks" class="sample-tasks-button">
						<i class="bi bi-plus-circle"></i>
						Create Sample Tasks
					</button>
				</div>
			</div>

			<div v-else class="board">
				<BoardColumnComponent
					v-for="column in visibleColumns"
					:key="column.id"
					:column="column"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { TodoTask, BoardColumn, BoardConfig, Filter } from "@/types/todo";
import { parseTodoText, serializeTodoTasks, getColumnValue } from "@/utils/todo-parser";
import {
	saveTasks,
	loadTasks,
	saveBoardConfig,
	loadBoardConfig,
	saveFilter,
	loadFilter,
	getDefaultBoardConfig,
} from "@/utils/storage";
import BoardColumnComponent from "@/components/board-column.vue";
import FilterBar from "@/components/filter-bar.vue";

const boardId = "main";
const showFileInput = ref(false);
const showSettings = ref(false);
const fileInput = ref<HTMLInputElement>();
const isFilterCollapsed = ref(false);

const allTasks = ref<TodoTask[]>([]);
const boardConfig = ref<BoardConfig>(getDefaultBoardConfig());
const filter = ref<Filter>({ projects: [], contexts: [], tags: {} });

const tasks = computed(() => {
	let filtered = allTasks.value;

	if (filter.value.projects.length > 0) {
		filtered = filtered.filter((task) =>
			filter.value.projects.some((project) => task.projects.includes(project))
		);
	}

	if (filter.value.contexts.length > 0) {
		filtered = filtered.filter((task) =>
			filter.value.contexts.some((context) => task.contexts.includes(context))
		);
	}

	if (Object.keys(filter.value.tags).length > 0) {
		filtered = filtered.filter((task) =>
			Object.entries(filter.value.tags).every(([key, value]) => task.tags[key] === value)
		);
	}

	return filtered;
});

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
					tasks: sortTasks(columnTasks),
				});
			}
		}
	});

	return columns.sort((a, b) => a.order - b.order);
});

function sortTasks(tasks: TodoTask[]): TodoTask[] {
	return [...tasks].sort((a, b) => {
		for (const sort of boardConfig.value.sortBy) {
			let aValue: string = "";
			let bValue: string = "";

			switch (sort.field) {
				case "priority":
					aValue = a.priority || "Z";
					bValue = b.priority || "Z";
					break;
				case "project":
					aValue = a.projects[0] || "";
					bValue = b.projects[0] || "";
					break;
				case "context":
					aValue = a.contexts[0] || "";
					bValue = b.contexts[0] || "";
					break;
				case "createdDate":
					aValue = a.createdDate || "";
					bValue = b.createdDate || "";
					break;
				default:
					aValue = a.tags[sort.field] || "";
					bValue = b.tags[sort.field] || "";
			}

			if (aValue < bValue) {
				return sort.direction === "asc" ? -1 : 1;
			}
			if (aValue > bValue) {
				return sort.direction === "asc" ? 1 : -1;
			}
		}
		return 0;
	});
}

function handleFileUpload(event: Event): void {
	const file = (event.target as HTMLInputElement).files?.[0];
	if (!file) {
		return;
	}

	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const content = e.target?.result as string;
			if (content) {
				console.log("File content loaded:", content.substring(0, 200) + "...");
				const parsedTasks = parseTodoText(content);
				console.log("Parsed tasks:", parsedTasks);
				allTasks.value = parsedTasks;
				saveTasks(boardId, allTasks.value);
				showFileInput.value = false;
				// Reset the file input so the same file can be loaded again
				if (fileInput.value) {
					fileInput.value.value = "";
				}
			} else {
				console.error("No content in file");
			}
		} catch (error) {
			console.error("Error parsing file:", error);
		}
	};
	reader.onerror = (error) => {
		console.error("Error reading file:", error);
	};
	reader.readAsText(file);
}

function downloadTodos(): void {
	const content = serializeTodoTasks(allTasks.value);
	const blob = new Blob([content], { type: "text/plain" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = "todo.txt";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function createSampleTasks(): void {
	const sampleTodoText = `(A) Call Mom +family @home status:todo
x Write documentation +work @computer
(B) Buy groceries +personal @errands due:2024-01-15 status:todo
x 2024-01-10 2024-01-08 Submit quarterly report +work @computer
Setup meeting with team +work @office status:doing
Review pull requests +work @computer status:doing
Deploy to production +work @computer status:done
(C) Plan vacation +personal @home status:todo
Fix critical bug +work @computer status:doing priority:high`;

	allTasks.value = parseTodoText(sampleTodoText);
	saveTasks(boardId, allTasks.value);
}

function updateFilter(newFilter: Filter): void {
	filter.value = newFilter;
	saveFilter(boardId, filter.value);
}

function saveSettings(): void {
	saveBoardConfig(boardId, boardConfig.value);
	showSettings.value = false;
}

onMounted(() => {
	allTasks.value = loadTasks(boardId);

	const savedConfig = loadBoardConfig(boardId);
	if (savedConfig) {
		boardConfig.value = savedConfig;
	} else {
		saveBoardConfig(boardId, boardConfig.value);
	}

	filter.value = loadFilter(boardId);
});
</script>

<style scoped>
.board-view {
	height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.board {
	display: flex;
	flex-wrap: nowrap;
	overflow-x: auto;
	min-height: 100%;
	gap: 20px;
	padding: 20px;
	scrollbar-width: thin;
	scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.board::-webkit-scrollbar {
	height: 8px;
}

.board::-webkit-scrollbar-track {
	background: transparent;
}

.board::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.3);
	border-radius: 4px;
}

.board::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.4);
}

.board-container {
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	position: relative;
}

/* Toolbar Styling */
.toolbar {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.toolbar-header {
	padding: 16px 24px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20px;
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

.action-buttons {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}

.action-button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 10px;
	border: none;
	border-radius: 8px;
	font-size: 18px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	text-decoration: none;
	width: 40px;
	height: 40px;
	position: relative;
}

.action-button i {
	font-size: 18px;
}

.action-button.primary {
	background: #0d6efd;
	color: white;
	box-shadow: 0 2px 4px rgba(13, 110, 253, 0.3);
}

.action-button.primary:hover {
	background: #0b5ed7;
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(13, 110, 253, 0.4);
}

.action-button.secondary {
	background: rgba(108, 117, 125, 0.1);
	color: #495057;
	border: 1px solid rgba(108, 117, 125, 0.2);
}

.action-button.secondary:hover:not(:disabled) {
	background: rgba(108, 117, 125, 0.15);
	transform: translateY(-1px);
}

.action-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none !important;
}

/* File Input Section */
.file-input-section {
	padding: 0 24px 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.file-input-container {
	display: flex;
	gap: 12px;
	align-items: center;
}

.file-input {
	flex: 1;
	padding: 10px 12px;
	border: 2px solid #e9ecef;
	border-radius: 8px;
	background: white;
	font-size: 13px;
	transition: all 0.2s ease-in-out;
}

.file-input:focus {
	outline: none;
	border-color: #0d6efd;
	box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.cancel-button {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 10px 16px;
	background: rgba(220, 53, 69, 0.1);
	color: #dc3545;
	border: 1px solid rgba(220, 53, 69, 0.2);
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
}

.cancel-button:hover {
	background: rgba(220, 53, 69, 0.15);
	transform: translateY(-1px);
}

/* Empty State */
.empty-board-state {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 60vh;
	padding: 40px;
}

.empty-content {
	text-align: center;
	max-width: 400px;
}

.empty-icon {
	font-size: 64px;
	margin-bottom: 24px;
	opacity: 0.6;
}

.empty-title {
	color: #495057;
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 12px;
}

.empty-description {
	color: #6c757d;
	font-size: 16px;
	line-height: 1.5;
	margin-bottom: 32px;
}

.sample-tasks-button {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 12px 24px;
	background: #198754;
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
}

.sample-tasks-button:hover {
	background: #157347;
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(25, 135, 84, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
	.toolbar-header {
		padding: 12px 16px;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}

	.app-title {
		font-size: 20px;
	}

	.action-buttons {
		gap: 8px;
		width: 100%;
		justify-content: flex-start;
	}

	.action-button {
		padding: 8px;
		width: 36px;
		height: 36px;
		flex: 0 0 auto;
	}

	.action-button i {
		font-size: 16px;
	}

	.file-input-section {
		padding: 0 16px 12px;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.empty-title {
		font-size: 20px;
	}

	.empty-description {
		font-size: 14px;
		margin-bottom: 24px;
	}
}

.modal-backdrop {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1050;
}

.modal-content {
	background: white;
	border-radius: 0.375rem;
	max-width: 500px;
	width: 90%;
	max-height: 80vh;
	overflow: auto;
	box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
	padding: 1rem;
	border-bottom: 1px solid #dee2e6;
	display: flex;
	justify-content: between;
	align-items: center;
}

.modal-title {
	margin: 0;
	flex: 1;
}

.btn-close {
	background: none;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
	padding: 0;
	width: 1.5rem;
	height: 1.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-close:before {
	content: "×";
}

.modal-body {
	padding: 1rem;
}

.modal-footer {
	padding: 1rem;
	border-top: 1px solid #dee2e6;
	display: flex;
	gap: 0.5rem;
	justify-content: flex-end;
}
</style>
