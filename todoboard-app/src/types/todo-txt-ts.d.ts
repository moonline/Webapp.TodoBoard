declare module "todo-txt-ts" {
	export interface ITask {
		isComplete: boolean;
		projects: string[];
		contexts: string[];
		dueDate?: Date;
		completionDate?: Date;
		creationDate?: Date;
		priority?: string;
		fields: Record<string, string>;
		body: string;
		raw?: string;
		index?: number;
	}

	export class Task {
		constructor(s?: string);
		isComplete: boolean;
		projects: string[];
		contexts: string[];
		dueDate?: Date;
		completionDate?: Date;
		creationDate?: Date;
		priority?: string;
		fields: Record<string, string>;
		body: string;
		raw?: string;
		index?: number;
	}

	export class TaskList {
		lineEnding: string;
		items: Task[];
		constructor(s?: string);
		load(s: string): void;
		push(task: Task): void;
		remove(task: Task): void;
		sort(...sortOptions: any[]): void;
		stringify(): string;
		static parse(s: string): TaskList;
	}
}
