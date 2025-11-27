import { TaskList, type Task } from "todo-txt-ts";
import type { TodoTask } from "@/types/todo";

function formatDateToString(date: Date): string {
	return date.toISOString().split("T")[0];
}

export function parseTodoText(todoText: string): TodoTask[] {
	const taskList = TaskList.parse(todoText);
	const currentDate = formatDateToString(new Date());

	return taskList.items.map((task: Task, index: number) => {
		const tags: Record<string, string> = {};

		// Copy all fields as tags
		if (task.fields) {
			for (const [key, value] of Object.entries(task.fields)) {
				tags[key] = String(value);
			}
		}

		const dueDate = task.dueDate ? formatDateToString(task.dueDate) : null;
		const createdDate = task.creationDate ? formatDateToString(task.creationDate) : currentDate;

		const todoTask: TodoTask = {
			id: `task-${index}-${Date.now()}`,
			raw: task.raw || "",
			priority: task.priority || null,
			completed: task.isComplete || false,
			completedDate: task.completionDate ? formatDateToString(task.completionDate) : null,
			createdDate,
			description: task.body || "",
			projects: task.projects || [],
			contexts: task.contexts || [],
			tags,
			dueDate,
		};

		// Rebuild raw text if we had to set the createdDate
		if (task.creationDate === null) {
			todoTask.raw = buildRawTodoText(todoTask);
		}

		return todoTask;
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

export function buildRawTodoText(task: TodoTask): string {
	const parts: string[] = [];

	// Completion marker
	if (task.completed) {
		parts.push("x");
	}

	// Priority
	if (task.priority && !task.completed) {
		parts.push(`(${task.priority})`);
	}

	// Completion date (only if completed)
	if (task.completed && task.completedDate) {
		parts.push(task.completedDate);
	}

	// Creation date
	if (task.createdDate) {
		parts.push(task.createdDate);
	}

	// Description
	parts.push(task.description);

	// Projects
	task.projects.forEach((project) => {
		parts.push(`+${project}`);
	});

	// Contexts
	task.contexts.forEach((context) => {
		parts.push(`@${context}`);
	});

	// Tags (exclude 'due' since we handle it separately)
	Object.entries(task.tags).forEach(([key, value]) => {
		if (key !== "due") {
			parts.push(`${key}:${value}`);
		}
	});

	// Due date
	if (task.dueDate) {
		parts.push(`due:${task.dueDate}`);
	}

	return parts.join(" ");
}
