<template>
	<div class="board-view d-flex flex-column h-100">
		<Toolbar
			:filter="filter"
			:tasks="allTasks"
			:is-filter-collapsed="isFilterCollapsed"
			:show-file-input="showFileInput"
			:has-downloadable-tasks="tasks.length > 0"
			@load-file="showFileInput = true"
			@download="downloadTodos"
			@open-settings="showSettings = true"
			@toggle-filter="isFilterCollapsed = !isFilterCollapsed"
			@cancel-file-input="showFileInput = false"
			@update:filter="updateFilter"
			@file-upload="handleFileUpload"
		/>

		<SettingsModal
			:is-visible="showSettings"
			:board-config="boardConfig"
			@close="showSettings = false"
			@save="saveSettings"
		/>

		<TodoBoard :columns="visibleColumns" @create-sample-tasks="createSampleTasks" />
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
import Toolbar from "@/components/toolbar.vue";
import SettingsModal from "@/components/settings-modal.vue";
import TodoBoard from "@/components/todo-board.vue";

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

function saveSettings(config: BoardConfig): void {
	boardConfig.value = config;
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
</style>
