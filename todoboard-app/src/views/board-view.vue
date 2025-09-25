<template>
	<div class="board-view d-flex flex-column h-100">
		<!-- Toolbar -->
		<div class="toolbar bg-white border-bottom p-3">
			<div class="d-flex justify-content-between align-items-center mb-2">
				<h4 class="mb-0">📋 TodoBoard</h4>
				<div>
					<button @click="showFileInput = true" class="btn btn-primary btn-sm me-2">
						📁 Load todo.txt
					</button>
					<button
						@click="downloadTodos"
						class="btn btn-outline-primary btn-sm"
						:disabled="tasks.length === 0"
					>
						💾 Download
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

			<div v-else class="board d-flex gap-3 p-3" style="min-height: 100%">
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

	Object.entries(boardConfig.value.columns).forEach(([key, config]) => {
		if (config.visible) {
			const tasks = columnMap.get(key) || [];
			columns.push({
				...config,
				tasks: sortTasks(tasks),
			});
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
		const content = e.target?.result as string;
		allTasks.value = parseTodoText(content);
		saveTasks(boardId, allTasks.value);
		showFileInput.value = false;
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
	const sampleTodoText = `(A) Call Mom +family @home
x Write documentation +work @computer
(B) Buy groceries +personal @errands due:2024-01-15
x 2024-01-10 2024-01-08 Submit quarterly report +work @computer
Setup meeting with team +work @office status:todo
Review pull requests +work @computer status:doing
Deploy to production +work @computer status:done priority:high`;

	allTasks.value = parseTodoText(sampleTodoText);
	saveTasks(boardId, allTasks.value);
}

function updateFilter(newFilter: Filter): void {
	filter.value = newFilter;
	saveFilter(boardId, filter.value);
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
	min-width: max-content;
}

.board-container {
	background: #f8f9fa;
}
</style>
