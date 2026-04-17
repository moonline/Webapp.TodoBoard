import type { TodoTask, BoardConfig, Filter } from "./todo";

export interface CoreHooks {
	onTasksChanged: (tasks: TodoTask[]) => Promise<void>;
	onConfigChanged: (config: BoardConfig) => Promise<void>;
	onFilterChanged: (filter: Filter) => Promise<void>;
}
