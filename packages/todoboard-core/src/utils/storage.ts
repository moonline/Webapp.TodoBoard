import type { BoardConfig } from "../types/todo";
import { ColumnType } from "../types/todo";
import { toRaw } from "vue";

/**
 * Deep clone a BoardConfig object, unwrapping all Vue Proxy objects
 */
export const cloneBoardConfig = (config: BoardConfig): BoardConfig => {
	return JSON.parse(JSON.stringify(toRaw(config)));
};

export const getDefaultBoardConfig = (): BoardConfig => {
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
};
