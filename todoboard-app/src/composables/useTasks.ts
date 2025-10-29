import { provide, inject, ref, computed, type InjectionKey, type Ref, type ComputedRef } from "vue";
import type { TodoTask, BoardConfig, Filter } from "@/types/todo";
import { parseTodoText, serializeTodoTasks } from "@/utils/todo-parser";
import {
	saveTasks,
	loadTasks,
	saveBoardConfig,
	loadBoardConfig,
	saveFilter,
	loadFilter,
	getDefaultBoardConfig,
} from "@/utils/storage";

export interface TasksState {
	allTasks: Readonly<Ref<TodoTask[]>>;
	boardConfig: Readonly<Ref<BoardConfig>>;
	filter: Readonly<Ref<Filter>>;
	tasks: ComputedRef<TodoTask[]>;
}

export interface TasksActions {
	loadTasksFromStorage: () => void;
	loadBoardConfigFromStorage: () => void;
	loadFilterFromStorage: () => void;
	setTasks: (tasks: TodoTask[]) => void;
	setBoardConfig: (config: BoardConfig) => void;
	setFilter: (filter: Filter) => void;
	uploadFile: (file: File) => Promise<void>;
	downloadTasks: () => void;
	createSampleTasks: () => void;
	sortTasksByConfig: (tasks: TodoTask[], config: BoardConfig) => TodoTask[];
}

export interface TasksContext extends TasksState, TasksActions {}

const TasksSymbol: InjectionKey<TasksContext> = Symbol("tasks");

/**
 * Provider composable - Use this in the root component (App.vue)
 */
export function provideTasks(boardId = "main") {
	// State
	const allTasks = ref<TodoTask[]>([]);
	const boardConfig = ref<BoardConfig>(getDefaultBoardConfig());
	const filter = ref<Filter>({ projects: [], contexts: [], tags: {} });

	// Computed - filtered tasks based on current filter
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

	// Actions
	function loadTasksFromStorage(): void {
		allTasks.value = loadTasks(boardId);
	}

	function loadBoardConfigFromStorage(): void {
		const savedConfig = loadBoardConfig(boardId);
		if (savedConfig) {
			boardConfig.value = savedConfig;
		} else {
			saveBoardConfig(boardId, boardConfig.value);
		}
	}

	function loadFilterFromStorage(): void {
		filter.value = loadFilter(boardId);
	}

	function setTasks(tasks: TodoTask[]): void {
		allTasks.value = tasks;
		saveTasks(boardId, tasks);
	}

	function setBoardConfig(config: BoardConfig): void {
		boardConfig.value = config;
		saveBoardConfig(boardId, config);
	}

	function setFilter(newFilter: Filter): void {
		filter.value = newFilter;
		saveFilter(boardId, newFilter);
	}

	async function uploadFile(file: File): Promise<void> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const content = e.target?.result as string;
					if (content) {
						console.log("File content loaded:", content.substring(0, 200) + "...");
						const parsedTasks = parseTodoText(content);
						console.log("Parsed tasks:", parsedTasks);
						setTasks(parsedTasks);
						resolve();
					} else {
						reject(new Error("No content in file"));
					}
				} catch (error) {
					console.error("Error parsing file:", error);
					reject(error);
				}
			};

			reader.onerror = (error) => {
				console.error("Error reading file:", error);
				reject(error);
			};

			reader.readAsText(file);
		});
	}

	function downloadTasks(): void {
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

		setTasks(parseTodoText(sampleTodoText));
	}

	function sortTasksByConfig(tasks: TodoTask[], config: BoardConfig): TodoTask[] {
		return [...tasks].sort((a, b) => {
			for (const sort of config.sortBy) {
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

	const context: TasksContext = {
		// State - consumers should use actions to mutate, not direct assignment
		allTasks: allTasks as Readonly<Ref<TodoTask[]>>,
		boardConfig: boardConfig as Readonly<Ref<BoardConfig>>,
		filter: filter as Readonly<Ref<Filter>>,
		tasks,
		// Actions
		loadTasksFromStorage,
		loadBoardConfigFromStorage,
		loadFilterFromStorage,
		setTasks,
		setBoardConfig,
		setFilter,
		uploadFile,
		downloadTasks,
		createSampleTasks,
		sortTasksByConfig,
	};

	provide(TasksSymbol, context);

	return context;
}

/**
 * Consumer composable - Use this in any component that needs task state
 */
export function useTasks(): TasksContext {
	const context = inject(TasksSymbol);

	if (!context) {
		throw new Error(
			"useTasks must be used within a component tree that has called provideTasks"
		);
	}

	return context;
}
