<template>
	<div class="task-card" :class="{ completed: task.completed }">
		<!-- Priority and Status Indicators -->
		<div class="task-header">
			<div class="d-flex align-items-center gap-2">
				<span
					v-if="task.priority"
					class="priority-badge"
					:class="getPriorityClass(task.priority)"
				>
					{{ task.priority }}
				</span>
				<span v-if="task.completed" class="status-badge completed">
					<i class="bi bi-check-circle-fill"></i>
				</span>
				<span v-if="task.dueDate" class="due-date-badge">
					<i class="bi bi-calendar3"></i>
					{{ formatDate(task.dueDate) }}
				</span>
			</div>
		</div>

		<!-- Task Description -->
		<div class="task-content">
			<p class="task-description">{{ task.description }}</p>

			<!-- Tags Section -->
			<div v-if="hasAnyTags" class="tags-section">
				<!-- Projects -->
				<div v-if="task.projects.length > 0" class="tag-group">
					<span v-for="project in task.projects" :key="project" class="tag project-tag">
						<i class="bi bi-folder-plus"></i>
						{{ project }}
					</span>
				</div>

				<!-- Contexts -->
				<div v-if="task.contexts.length > 0" class="tag-group">
					<span v-for="context in task.contexts" :key="context" class="tag context-tag">
						<i class="bi bi-at"></i>
						{{ context }}
					</span>
				</div>

				<!-- Custom Tags -->
				<div v-if="Object.keys(task.tags).length > 0" class="tag-group">
					<span
						v-for="[key, value] in Object.entries(task.tags)"
						:key="key"
						class="tag custom-tag"
					>
						{{ key }}:{{ value }}
					</span>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div v-if="task.createdDate" class="task-footer">
			<span class="created-date">
				<i class="bi bi-clock"></i>
				{{ formatDate(task.createdDate) }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { TodoTask } from "@/types/todo";

const props = defineProps<{
	task: TodoTask;
}>();

const hasAnyTags = computed(() => {
	return (
		props.task.projects.length > 0 ||
		props.task.contexts.length > 0 ||
		Object.keys(props.task.tags).length > 0
	);
});

function formatDate(dateStr: string): string {
	try {
		return new Date(dateStr).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	} catch {
		return dateStr;
	}
}

function getPriorityClass(priority: string): string {
	switch (priority.toUpperCase()) {
		case "A":
			return "priority-high";
		case "B":
			return "priority-medium";
		case "C":
			return "priority-low";
		default:
			return "priority-default";
	}
}
</script>

<style scoped>
.task-card {
	background: #ffffff;
	border: 1px solid #e9ecef;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.task-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
	border-color: #dee2e6;
}

.task-card.completed {
	background: #f8f9fa;
	opacity: 0.8;
}

.task-card.completed .task-description {
	text-decoration: line-through;
	color: #6c757d;
}

/* Header Section */
.task-header {
	margin-bottom: 12px;
}

.priority-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.priority-high {
	background: #dc3545;
	color: white;
}

.priority-medium {
	background: #fd7e14;
	color: white;
}

.priority-low {
	background: #0dcaf0;
	color: white;
}

.priority-default {
	background: #6c757d;
	color: white;
}

.status-badge.completed {
	color: #198754;
	font-size: 16px;
}

.due-date-badge {
	background: #e3f2fd;
	color: #1976d2;
	padding: 4px 8px;
	border-radius: 6px;
	font-size: 11px;
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: 4px;
}

/* Content Section */
.task-content {
	margin-bottom: 12px;
}

.task-description {
	color: #212529;
	font-size: 14px;
	line-height: 1.5;
	margin: 0 0 12px 0;
	word-wrap: break-word;
}

/* Tags Section */
.tags-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.tag-group {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.tag {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 8px;
	border-radius: 8px;
	font-size: 11px;
	font-weight: 500;
	line-height: 1.2;
}

.project-tag {
	background: #e8f5e8;
	color: #2e7d32;
	border: 1px solid #c8e6c9;
}

.context-tag {
	background: #e3f2fd;
	color: #1976d2;
	border: 1px solid #bbdefb;
}

.custom-tag {
	background: #f3e5f5;
	color: #7b1fa2;
	border: 1px solid #e1bee7;
}

/* Footer Section */
.task-footer {
	padding-top: 8px;
	border-top: 1px solid #f1f3f4;
}

.created-date {
	color: #6c757d;
	font-size: 11px;
	display: flex;
	align-items: center;
	gap: 4px;
}

/* Bootstrap Icons Fallback */
.bi::before {
	vertical-align: -0.125em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.task-card {
		padding: 12px;
		margin-bottom: 8px;
	}

	.task-description {
		font-size: 13px;
	}

	.tag {
		font-size: 10px;
		padding: 3px 6px;
	}
}
</style>
