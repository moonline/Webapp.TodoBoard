import type { BoardConfig, TodoTask, Filter } from "@/types/todo";
import { ColumnType } from "@/types/todo";
import { toRaw } from "vue";

const STORAGE_PREFIX = "todoboard";

/**
 * Deep clone a BoardConfig object, unwrapping all Vue Proxy objects
 * Uses JSON serialization for a simple, safe deep clone
 */
export function cloneBoardConfig(config: BoardConfig): BoardConfig {
	return JSON.parse(JSON.stringify(toRaw(config)));
}

export function saveTasks(boardId: string, tasks: TodoTask[]): void {
	localStorage.setItem(`${STORAGE_PREFIX}_tasks_${boardId}`, JSON.stringify(tasks));
}

export function loadTasks(boardId: string): TodoTask[] {
	const stored = localStorage.getItem(`${STORAGE_PREFIX}_tasks_${boardId}`);
	return stored ? JSON.parse(stored) : [];
}

export function saveBoardConfig(boardId: string, config: BoardConfig): void {
	localStorage.setItem(`${STORAGE_PREFIX}_config_${boardId}`, JSON.stringify(config));
}

export function loadBoardConfig(boardId: string): BoardConfig | null {
	const stored = localStorage.getItem(`${STORAGE_PREFIX}_config_${boardId}`);
	if (!stored) {
		return null;
	}

	try {
		const config = JSON.parse(stored) as BoardConfig;

		// Migrate old config to new structure
		if (!config.groupingTag) {
			// Old config detected, migrate to new structure
			console.log("Migrating old board config to new structure");
			return null; // Return null to force using default config
		}

		// Ensure all columns have required fields
		const hasOldColumns = Object.values(config.columns).some((column) => !column.type);
		if (hasOldColumns) {
			console.log("Old column structure detected, using default config");
			return null;
		}

		// Migrate config without metrics
		if (!config.metrics) {
			config.metrics = [];
		}

		// Migrate config without showMetrics
		if (config.showMetrics === undefined) {
			config.showMetrics = false;
		}

		return config;
	} catch (error) {
		console.error("Error loading board config:", error);
		return null;
	}
}

export function saveFilter(boardId: string, filter: Filter): void {
	localStorage.setItem(`${STORAGE_PREFIX}_filter_${boardId}`, JSON.stringify(filter));
}

export function loadFilter(boardId: string): Filter {
	const stored = localStorage.getItem(`${STORAGE_PREFIX}_filter_${boardId}`);
	return stored ? JSON.parse(stored) : { projects: [], contexts: [], tags: {} };
}

export function clearBoard(boardId: string): void {
	localStorage.removeItem(`${STORAGE_PREFIX}_tasks_${boardId}`);
	localStorage.removeItem(`${STORAGE_PREFIX}_config_${boardId}`);
	localStorage.removeItem(`${STORAGE_PREFIX}_filter_${boardId}`);
}

export function getDefaultBoardConfig(): BoardConfig {
	return {
		groupingTag: "status",
		sortBy: [{ field: "priority", direction: "asc" }],
		columns: {
			uncategorized: {
				id: "uncategorized",
				type: ColumnType.Uncategorized,
				title: "Uncategorized",
				icon: "❓",
				color: "#6c757d",
				visible: true,
				displayBehavior: "whenTasks",
				order: 0,
			},
			planning: {
				id: "planning",
				type: ColumnType.Tag,
				title: "Planning",
				icon: "📋",
				color: "#fd7e14",
				visible: true,
				displayBehavior: "always",
				order: 1,
				tagValue: "planning",
			},
			waiting: {
				id: "waiting",
				type: ColumnType.Tag,
				title: "Waiting",
				icon: "⏳",
				color: "#dc3545",
				visible: true,
				displayBehavior: "always",
				order: 2,
				tagValue: "waiting",
			},
			doing: {
				id: "doing",
				type: ColumnType.Tag,
				title: "Doing",
				icon: "⚡",
				color: "#0d6efd",
				visible: true,
				displayBehavior: "always",
				order: 3,
				tagValue: "doing",
			},
			completed: {
				id: "completed",
				type: ColumnType.Completed,
				title: "Completed",
				icon: "✅",
				color: "#20b2aa",
				visible: true,
				displayBehavior: "whenTasks",
				order: 4,
			},
		},
		metrics: [],
		showMetrics: false,
	};
}
