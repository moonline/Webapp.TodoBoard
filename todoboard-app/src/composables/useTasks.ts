import { provide, inject, ref, computed, type InjectionKey, type Ref, type ComputedRef } from "vue";
import type { TodoTask, BoardConfig, Filter } from "@/types/todo";
import { parseTodoText, serializeTodoTasks, buildRawTodoText } from "@/utils/todo-parser";
import {
	saveTasks,
	loadTasks,
	saveBoardConfig,
	loadBoardConfig,
	saveFilter,
	loadFilter,
	getDefaultBoardConfig,
} from "@/utils/storage";
import { downloadFile } from "@/utils/file-download";

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
	downloadTasks: () => Promise<void>;
	uploadBoardConfig: (file: File) => Promise<void>;
	downloadBoardConfig: () => Promise<void>;
	createSampleTasks: () => void;
	clearTasks: () => void;
	sortTasksByConfig: (tasks: TodoTask[], config: BoardConfig) => TodoTask[];
	updateTask: (taskId: string, rawText: string) => void;
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

	async function downloadTasks(): Promise<void> {
		const content = serializeTodoTasks(allTasks.value);
		await downloadFile(content, "todo.txt", "text/plain");
	}

	async function uploadBoardConfig(file: File): Promise<void> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const content = e.target?.result as string;
					if (content) {
						const parsedConfig = JSON.parse(content) as BoardConfig;
						// Validate that the parsed config has the required structure
						if (
							!parsedConfig.columns ||
							!parsedConfig.groupingTag ||
							!parsedConfig.sortBy
						) {
							throw new Error("Invalid board configuration file");
						}
						setBoardConfig(parsedConfig);
						resolve();
					} else {
						reject(new Error("No content in file"));
					}
				} catch (error) {
					console.error("Error parsing board config file:", error);
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

	async function downloadBoardConfig(): Promise<void> {
		const content = JSON.stringify(boardConfig.value, null, 2);
		await downloadFile(content, "board.config.json", "application/json");
	}

	function createSampleTasks(): void {
		const sampleTodoText = `(A) Call Mom +family @home status:planning
x Write documentation +work @computer
(B) Buy groceries +personal @errands due:2024-01-15 status:planning
x 2024-01-10 2024-01-08 Submit quarterly report +work @computer
Setup meeting with team +work @office status:doing
Review pull requests +work @computer status:doing
Design new feature +work @computer status:waiting
(C) Plan vacation +personal @home status:planning
Fix critical bug +work @computer status:doing priority:high
Wait for client feedback +work @email status:waiting`;

		setTasks(parseTodoText(sampleTodoText));
	}

	function clearTasks(): void {
		setTasks([]);
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

	function updateTask(taskId: string, rawText: string): void {
		const taskIndex = allTasks.value.findIndex((task) => task.id === taskId);
		if (taskIndex === -1) {
			return;
		}

		const originalTask = allTasks.value[taskIndex];

		// Parse the updated raw text to get the new task data
		const parsedTasks = parseTodoText(rawText);
		if (parsedTasks.length === 0) {
			return;
		}

		// Get the parsed task and preserve the original ID
		const updatedTask = parsedTasks[0];
		updatedTask.id = taskId;

		const currentDate = new Date().toISOString().split("T")[0];
		let needsRawRebuild = false;

		// Preserve or set the createdDate
		if (updatedTask.createdDate === null) {
			// If the new raw text doesn't have a createdDate, preserve the original or set current date
			if (originalTask.createdDate !== null) {
				updatedTask.createdDate = originalTask.createdDate;
			} else {
				updatedTask.createdDate = currentDate;
			}
			needsRawRebuild = true;
		}

		// Handle completion date when task is marked as completed
		if (updatedTask.completed && !updatedTask.completedDate) {
			// Task is marked as completed but has no completion date - add today's date
			updatedTask.completedDate = currentDate;
			needsRawRebuild = true;
		}

		// Handle completion date when task is unmarked as completed
		if (!updatedTask.completed && updatedTask.completedDate) {
			// Task is not completed but has a completion date - remove it
			updatedTask.completedDate = null;
			needsRawRebuild = true;
		}

		// Rebuild raw text if we modified any dates
		if (needsRawRebuild) {
			updatedTask.raw = buildRawTodoText(updatedTask);
		}

		// Update the task in the array
		const updatedTasks = [...allTasks.value];
		updatedTasks[taskIndex] = updatedTask;
		setTasks(updatedTasks);
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
		uploadBoardConfig,
		downloadBoardConfig,
		createSampleTasks,
		clearTasks,
		sortTasksByConfig,
		updateTask,
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
