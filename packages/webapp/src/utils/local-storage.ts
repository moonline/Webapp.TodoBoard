import type { TodoTask, BoardConfig, Filter } from "todoboard-core";

const STORAGE_PREFIX = "todoboard";

export const saveTasks = (boardId: string, tasks: TodoTask[]): void => {
	localStorage.setItem(`${STORAGE_PREFIX}_tasks_${boardId}`, JSON.stringify(tasks));
};

export const loadTasks = (boardId: string): TodoTask[] => {
	const stored = localStorage.getItem(`${STORAGE_PREFIX}_tasks_${boardId}`);
	if (stored) {
		return JSON.parse(stored) as TodoTask[];
	} else {
		return [];
	}
};

export const saveBoardConfig = (boardId: string, config: BoardConfig): void => {
	localStorage.setItem(`${STORAGE_PREFIX}_config_${boardId}`, JSON.stringify(config));
};

export const loadBoardConfig = (boardId: string): BoardConfig | null => {
	const stored = localStorage.getItem(`${STORAGE_PREFIX}_config_${boardId}`);
	if (!stored) {
		return null;
	}

	try {
		const config = JSON.parse(stored) as BoardConfig;

		if (!config.groupingTag) {
			console.log("Migrating old board config to new structure");
			return null;
		}

		const hasOldColumns = Object.values(config.columns).some((column) => !column.type);
		if (hasOldColumns) {
			console.log("Old column structure detected, using default config");
			return null;
		}

		if (!config.metrics) {
			config.metrics = [];
		}

		if (config.showMetrics === undefined) {
			config.showMetrics = false;
		}

		return config;
	} catch (error) {
		console.error("Error loading board config:", error);
		return null;
	}
};

export const saveFilter = (boardId: string, filter: Filter): void => {
	localStorage.setItem(`${STORAGE_PREFIX}_filter_${boardId}`, JSON.stringify(filter));
};

export const loadFilter = (boardId: string): Filter => {
	const stored = localStorage.getItem(`${STORAGE_PREFIX}_filter_${boardId}`);
	if (stored) {
		return JSON.parse(stored) as Filter;
	} else {
		return { projects: [], contexts: [], tags: {} };
	}
};

export const clearBoard = (boardId: string): void => {
	localStorage.removeItem(`${STORAGE_PREFIX}_tasks_${boardId}`);
	localStorage.removeItem(`${STORAGE_PREFIX}_config_${boardId}`);
	localStorage.removeItem(`${STORAGE_PREFIX}_filter_${boardId}`);
};
