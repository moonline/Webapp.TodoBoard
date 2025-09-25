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

export interface BoardColumn {
	id: string;
	title: string;
	icon: string;
	color?: string;
	visible: boolean;
	displayBehavior: DisplayBehavior;
	order: number;
	tasks: TodoTask[];
}

export interface BoardConfig {
	columnBy: "priority" | "project" | "context" | "status";
	customColumnKey?: string;
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
