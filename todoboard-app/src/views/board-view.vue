<template>
	<div class="board-view d-flex flex-column h-100">
		<!-- Toolbar -->
		<div class="toolbar bg-white border-bottom p-3">
			<div class="d-flex justify-content-end align-items-center mb-2">
				<div>
					<button @click="showFileInput = true" class="btn btn-primary btn-sm me-2">
						📁 Load todo.txt
					</button>
					<button
						@click="downloadTodos"
						class="btn btn-outline-primary btn-sm me-2"
						:disabled="tasks.length === 0"
					>
						💾 Download
					</button>
					<button @click="showSettings = true" class="btn btn-outline-secondary btn-sm">
						⚙️ Settings
					</button>
				</div>
			</div>

			<!-- File Input -->
			<div v-if="showFileInput" class="mb-3">
				<input
					ref="fileInput"
					type="file"
					accept=".txt"
					@change="handleFileUpload"
					class="form-control"
				/>
				<button
					@click="showFileInput = false"
					class="btn btn-sm btn-outline-secondary mt-1"
				>
					Cancel
				</button>
			</div>

			<filter-bar :filter="filter" :tasks="allTasks" @update:filter="updateFilter" />
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
			<div v-if="tasks.length === 0" class="text-center py-5">
				<h5 class="text-muted">No tasks loaded</h5>
				<p class="text-muted">
					Upload a todo.txt file to get started, or create some sample tasks
				</p>
				<button @click="createSampleTasks" class="btn btn-primary">
					Create Sample Tasks
				</button>
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
}

.board {
	display: flex;
	flex-wrap: nowrap;
	overflow-x: auto;
	min-height: 100%;
	gap: 1rem;
	padding: 1rem;
}

.board-container {
	background: #f8f9fa;
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
