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
	tagValue?: string;
	tasks: TodoTask[];
}

export type AggregationMethod = "sum" | "count" | "average" | "median" | "min" | "max";

export interface AggregationMetric {
	id: string;
	name: string;
	tag: string;
	method: AggregationMethod;
	order: number;
}

export interface BoardConfig {
	groupingTag: string;
	sortBy: Array<{
		field: "priority" | "project" | "context" | "createdDate" | string;
		direction: "asc" | "desc";
	}>;
	columns: Record<string, Omit<BoardColumn, "tasks">>;
	metrics: AggregationMetric[];
	showMetrics: boolean;
}

export interface Filter {
	projects: string[];
	contexts: string[];
	tags: Record<string, string>;
}
