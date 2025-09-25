import { TaskList, type Task } from "todo-txt-ts";
import type { TodoTask } from "@/types/todo";

function formatDateToString(date: Date): string {
	return date.toISOString().split("T")[0];
}

export function parseTodoText(todoText: string): TodoTask[] {
	const taskList = TaskList.parse(todoText);

	return taskList.items.map((task: Task, index: number) => {
		const tags: Record<string, string> = {};

		// Copy all fields as tags
		if (task.fields) {
			for (const [key, value] of Object.entries(task.fields)) {
				tags[key] = String(value);
			}
		}

		const dueDate = task.dueDate ? formatDateToString(task.dueDate) : null;

		return {
			id: `task-${index}-${Date.now()}`,
			raw: task.raw || "",
			priority: task.priority || null,
			completed: task.isComplete || false,
			completedDate: task.completionDate ? formatDateToString(task.completionDate) : null,
			createdDate: task.creationDate ? formatDateToString(task.creationDate) : null,
			description: task.body || "",
			projects: task.projects || [],
			contexts: task.contexts || [],
			tags,
			dueDate,
		};
	});
}

export function serializeTodoTasks(tasks: TodoTask[]): string {
	return tasks.map((task) => task.raw).join("\n");
}

export function getColumnValue(task: TodoTask, columnBy: string): string {
	switch (columnBy) {
		case "priority":
			return task.priority || "none";
		case "project":
			return task.projects[0] || "none";
		case "context":
			return task.contexts[0] || "none";
		case "status":
			return task.tags.status || (task.completed ? "done" : "todo");
		default:
			if (columnBy.includes(":")) {
				const [key] = columnBy.split(":");
				return task.tags[key] || "none";
			}
			return task.tags[columnBy] || "none";
	}
}
