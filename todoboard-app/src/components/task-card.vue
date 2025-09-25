<template>
	<div class="card task-card mb-2" :class="{ completed: task.completed }">
		<div class="card-header p-2 d-flex justify-content-between align-items-center">
			<div>
				<span v-if="task.priority" class="badge bg-warning me-1">{{ task.priority }}</span>
				<span v-if="task.completed" class="badge bg-success">✓</span>
				<span v-if="task.dueDate" class="badge bg-info"
					>📅 {{ formatDate(task.dueDate) }}</span
				>
			</div>
		</div>

		<div class="card-body p-2">
			<p class="card-text mb-2">{{ task.description }}</p>

			<div v-if="task.projects.length > 0" class="mb-1">
				<span
					v-for="project in task.projects"
					:key="project"
					class="badge bg-secondary me-1"
				>
					+{{ project }}
				</span>
			</div>

			<div v-if="task.contexts.length > 0" class="mb-1">
				<span v-for="context in task.contexts" :key="context" class="badge bg-primary me-1">
					@{{ context }}
				</span>
			</div>

			<div v-if="Object.keys(task.tags).length > 0" class="mb-1">
				<span
					v-for="[key, value] in Object.entries(task.tags)"
					:key="key"
					class="badge bg-light text-dark me-1"
				>
					{{ key }}:{{ value }}
				</span>
			</div>
		</div>

		<div v-if="task.createdDate" class="card-footer p-2 text-muted small">
			Created: {{ formatDate(task.createdDate) }}
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TodoTask } from "@/types/todo";

defineProps<{
	task: TodoTask;
}>();

function formatDate(dateStr: string): string {
	try {
		return new Date(dateStr).toLocaleDateString();
	} catch {
		return dateStr;
	}
}
</script>

<style scoped>
.task-card {
	cursor: pointer;
	transition:
		transform 0.2s,
		box-shadow 0.2s;
}

.task-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-card.completed {
	opacity: 0.7;
}

.task-card.completed .card-text {
	text-decoration: line-through;
}
</style>
