export interface TodoTask {
	id: string;
	raw: string;
	priority: string | null;
	completed: boolean;
	completedDate: string | null;
	createdDate: string | null;
	description: string;
	projects: string[];
	contexts: string[];
	tags: Record<string, string>;
	dueDate: string | null;
}

export type DisplayBehavior = "always" | "whenTasks" | "hide";

export enum ColumnType {
	Uncategorized = "uncategorized",
	Completed = "completed",
	Tag = "tag",
}

export interface BoardColumn {
	id: string;
	type: ColumnType;
	title: string;
	icon: string;
	color: string;
	visible: boolean;
	displayBehavior: DisplayBehavior;
	order: number;
	tagValue?: string; // For tag columns: the tag value to match
	tasks: TodoTask[];
}

export interface BoardConfig {
	groupingTag: string; // Tag to use for grouping tag columns (e.g., "status")
	sortBy: Array<{
		field: "priority" | "project" | "context" | "createdDate" | string;
		direction: "asc" | "desc";
	}>;
	columns: Record<string, Omit<BoardColumn, "tasks">>;
}

export interface Filter {
	projects: string[];
	contexts: string[];
	tags: Record<string, string>;
}
