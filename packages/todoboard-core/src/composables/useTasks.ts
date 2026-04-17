import { provide, inject, ref, computed, type InjectionKey, type Ref, type ComputedRef } from "vue";
import type { TodoTask, BoardConfig, Filter } from "../types/todo";
import type { CoreHooks } from "../types/core-hooks";
import { parseTodoText, buildRawTodoText } from "../utils/todo-parser";

export interface TasksState {
	allTasks: Readonly<Ref<TodoTask[]>>;
	boardConfig: Readonly<Ref<BoardConfig>>;
	filter: Readonly<Ref<Filter>>;
	tasks: ComputedRef<TodoTask[]>;
}

export interface TasksActions {
	setTasks: (tasks: TodoTask[]) => Promise<void>;
	setTasksInternal: (tasks: TodoTask[]) => void;
	setBoardConfig: (config: BoardConfig) => Promise<void>;
	setBoardConfigInternal: (config: BoardConfig) => void;
	setFilter: (filter: Filter) => Promise<void>;
	setFilterInternal: (filter: Filter) => void;
	createSampleTasks: () => void;
	clearTasks: () => void;
	sortTasksByConfig: (tasks: TodoTask[], config: BoardConfig) => TodoTask[];
	updateTask: (taskId: string, rawText: string) => Promise<void>;
}

export interface TasksContext extends TasksState, TasksActions {}

const TasksSymbol: InjectionKey<TasksContext> = Symbol("tasks");

/**
 * Provider composable - Use this in TodoBoardCore.vue
 */
export const provideTasks = (hooks: CoreHooks): TasksContext => {
	const allTasks = ref<TodoTask[]>([]);
	const boardConfig = ref<BoardConfig>({
		groupingTag: "status",
		sortBy: [{ field: "priority", direction: "asc" }],
		columns: {},
		metrics: [],
		showMetrics: false,
	});
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

	// Internal setters - update refs without triggering hooks (used when shell pushes data in)
	const setTasksInternal = (tasks: TodoTask[]): void => {
		allTasks.value = tasks;
	};

	const setBoardConfigInternal = (config: BoardConfig): void => {
		boardConfig.value = config;
	};

	const setFilterInternal = (newFilter: Filter): void => {
		filter.value = newFilter;
	};

	// Public setters - update refs AND call hooks for shell persistence
	const setTasks = async (tasks: TodoTask[]): Promise<void> => {
		allTasks.value = tasks;
		await hooks.onTasksChanged(tasks);
	};

	const setBoardConfig = async (config: BoardConfig): Promise<void> => {
		boardConfig.value = config;
		await hooks.onConfigChanged(config);
	};

	const setFilter = async (newFilter: Filter): Promise<void> => {
		filter.value = newFilter;
		await hooks.onFilterChanged(newFilter);
	};

	const createSampleTasks = (): void => {
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
	};

	const clearTasks = (): void => {
		setTasks([]);
	};

	const sortTasksByConfig = (tasks: TodoTask[], config: BoardConfig): TodoTask[] => {
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
				} else if (aValue > bValue) {
					return sort.direction === "asc" ? 1 : -1;
				} else {
					// Values are equal, continue to next sort criterion
				}
			}
			return 0;
		});
	};

	const updateTask = async (taskId: string, rawText: string): Promise<void> => {
		const taskIndex = allTasks.value.findIndex((task) => task.id === taskId);
		if (taskIndex === -1) {
			// Task not found, no action
		} else {
			const originalTask = allTasks.value[taskIndex];
			const parsedTasks = parseTodoText(rawText);
			if (parsedTasks.length === 0) {
				// No tasks parsed, no action
			} else {
				const updatedTask = parsedTasks[0];
				updatedTask.id = taskId;

				const currentDate = new Date().toISOString().split("T")[0];
				let needsRawRebuild = false;

				if (updatedTask.createdDate === null) {
					if (originalTask.createdDate !== null) {
						updatedTask.createdDate = originalTask.createdDate;
					} else {
						updatedTask.createdDate = currentDate;
					}
					needsRawRebuild = true;
				} else {
					// Created date exists
				}

				if (updatedTask.completed && !updatedTask.completedDate) {
					updatedTask.completedDate = currentDate;
					needsRawRebuild = true;
				} else {
					// Completion date already set or task not completed
				}

				if (!updatedTask.completed && updatedTask.completedDate) {
					updatedTask.completedDate = null;
					needsRawRebuild = true;
				} else {
					// Completion state is consistent
				}

				if (needsRawRebuild) {
					updatedTask.raw = buildRawTodoText(updatedTask);
				} else {
					// No raw text rebuild needed
				}

				const updatedTasks = [...allTasks.value];
				updatedTasks[taskIndex] = updatedTask;
				await setTasks(updatedTasks);
			}
		}
	};

	const context: TasksContext = {
		allTasks: allTasks as Readonly<Ref<TodoTask[]>>,
		boardConfig: boardConfig as Readonly<Ref<BoardConfig>>,
		filter: filter as Readonly<Ref<Filter>>,
		tasks,
		setTasks,
		setTasksInternal,
		setBoardConfig,
		setBoardConfigInternal,
		setFilter,
		setFilterInternal,
		createSampleTasks,
		clearTasks,
		sortTasksByConfig,
		updateTask,
	};

	provide(TasksSymbol, context);

	return context;
};

/**
 * Consumer composable - Use this in any component that needs task state
 */
export const useTasks = (): TasksContext => {
	const context = inject(TasksSymbol);

	if (!context) {
		throw new Error(
			"useTasks must be used within a component tree that has called provideTasks"
		);
	}

	return context;
};
