<template>
	<div
		class="task-card p-2"
		:class="{
			completed: task.completed,
			dragging: isDragging,
			compact: isCompactMode && !isActive,
		}"
		draggable="true"
		@dragstart="handleDragStart"
		@dragend="handleDragEnd"
		@click="handleCardClick"
	>
		<!-- Priority and Status Indicators -->
		<div
			class="task-header pb-2 mb-1 border-bottom d-flex justify-content-between align-items-center"
		>
			<div class="d-flex align-items-center gap-2">
				<div v-if="task.priority" class="priority-container">
					<span class="priority-badge" :class="getPriorityClass(task.priority)">
						{{ task.priority }}
					</span>
					<div class="priority-controls">
						<button
							@click.stop="handleRaisePriority"
							class="priority-button"
							:disabled="!canRaisePriority"
							title="Raise priority"
						>
							<i class="bi bi-caret-up-fill"></i>
						</button>
						<button
							@click.stop="handleLowerPriority"
							class="priority-button"
							:disabled="!canLowerPriority"
							title="Lower priority"
						>
							<i class="bi bi-caret-down-fill"></i>
						</button>
					</div>
				</div>
				<span v-if="task.completed" class="status-badge completed">
					<i class="bi bi-check-circle-fill"></i>
				</span>
				<span v-if="task.dueDate" class="due-date-badge">
					<i class="bi bi-calendar3"></i>
					{{ formatDate(task.dueDate) }}
				</span>
			</div>
			<button @click.stop="$emit('edit')" class="edit-button py-0 px-2" title="Edit task">
				<i class="bi bi-pencil"></i>
			</button>
		</div>

		<!-- Task Description -->
		<div class="task-content">
			<div class="task-description">
				<MarkdownRenderer :content="task.description" />
			</div>

			<!-- Tags Section -->
			<div v-if="hasAnyTags && showTags" class="tags-section">
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
		<div
			v-if="(task.createdDate || task.completedDate) && (!isCompactMode || isActive)"
			class="task-footer d-flex justify-content-between align-items-center gap-2 pt-2 border-top"
		>
			<span
				v-if="task.createdDate"
				class="text-secondary small d-flex align-items-center gap-1"
			>
				<i class="bi bi-clock"></i>
				{{ formatDate(task.createdDate) }}
			</span>
			<span
				v-if="task.completedDate"
				class="text-success small d-flex align-items-center gap-1"
			>
				<i class="bi bi-check-circle"></i>
				{{ formatDate(task.completedDate) }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { TodoTask } from "../types/todo";
import MarkdownRenderer from "./markdown-renderer.vue";

const props = withDefaults(
	defineProps<{
		task: TodoTask;
		isCompactMode?: boolean;
		isActive?: boolean;
	}>(),
	{
		isCompactMode: false,
		isActive: false,
	}
);

const emit = defineEmits<{
	edit: [];
	updatePriority: [newPriority: string | null];
	"toggle-active": [];
}>();

const isDragging = ref(false);

function handleDragStart(event: DragEvent): void {
	if (!event.dataTransfer) {
		return;
	}

	isDragging.value = true;
	event.dataTransfer.effectAllowed = "move";
	event.dataTransfer.setData("application/json", JSON.stringify(props.task));
}

function handleDragEnd(): void {
	isDragging.value = false;
}

const hasAnyTags = computed(() => {
	return (
		props.task.projects.length > 0 ||
		props.task.contexts.length > 0 ||
		Object.keys(props.task.tags).length > 0
	);
});

const showTags = computed(() => {
	// Show tags if not in compact mode, or if this task is active
	return !props.isCompactMode || props.isActive;
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

const canRaisePriority = computed(() => {
	if (!props.task.priority) {
		return false;
	}
	const currentCharCode = props.task.priority.toUpperCase().charCodeAt(0);
	return currentCharCode > 65; // Can raise if priority is not 'A'
});

const canLowerPriority = computed(() => {
	if (!props.task.priority) {
		return false;
	}
	const currentCharCode = props.task.priority.toUpperCase().charCodeAt(0);
	return currentCharCode < 90; // Can lower if priority is not 'Z'
});

function handleRaisePriority(): void {
	if (!props.task.priority || !canRaisePriority.value) {
		return;
	}
	const currentCharCode = props.task.priority.toUpperCase().charCodeAt(0);
	const newPriority = String.fromCharCode(currentCharCode - 1);
	emit("updatePriority", newPriority);
}

function handleLowerPriority(): void {
	if (!props.task.priority || !canLowerPriority.value) {
		return;
	}
	const currentCharCode = props.task.priority.toUpperCase().charCodeAt(0);
	const newPriority = String.fromCharCode(currentCharCode + 1);
	emit("updatePriority", newPriority);
}

function handleCardClick(): void {
	// Only emit toggle-active if in compact mode
	if (props.isCompactMode) {
		emit("toggle-active");
	}
}
</script>

<style scoped>
.task-card {
	background: #ffffff;
	border: 1px solid #e9ecef;
	border-radius: 12px;
	margin-bottom: 12px;
	cursor: grab;
	transition: all 0.2s ease-in-out;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.task-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
	border-color: #dee2e6;
}

.task-card.dragging {
	opacity: 0.5;
	cursor: grabbing;
	transform: rotate(3deg);
}

.task-card.completed {
	background: #f8f9fa;
	opacity: 0.8;
}

.task-card.completed .task-description {
	text-decoration: line-through;
	color: #6c757d;
}

/* Compact Mode */
.task-card.compact {
	cursor: pointer;
}

.task-card.compact .task-description {
	position: relative;
	max-height: 1.5em;
	overflow: hidden;
	line-height: 1.5;
}

.task-card.compact .task-description::after {
	content: "...";
	position: absolute;
	right: 0;
	bottom: 0;
	padding-left: 2.5rem;
	background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%);
}

/* Header Section */
.edit-button {
	background: transparent;
	border: none;
	color: #6c757d;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 6px;
	transition: all 0.2s ease;
	opacity: 0;
}

.task-card:hover .edit-button {
	opacity: 1;
}

.edit-button:hover {
	background: #f8f9fa;
	color: #0d6efd;
}

.priority-container {
	display: flex;
	align-items: center;
	gap: 6px;
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

.priority-controls {
	display: flex;
	flex-direction: column;
	gap: 2px;
	opacity: 0;
	transition: opacity 0.2s ease;
}

.task-card:hover .priority-controls {
	opacity: 1;
}

.priority-button {
	background: transparent;
	border: none;
	color: #6c757d;
	cursor: pointer;
	padding: 0;
	width: 16px;
	height: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 3px;
	transition: all 0.2s ease;
	font-size: 10px;
}

.priority-button:hover:not(:disabled) {
	background: #f8f9fa;
	color: #0d6efd;
}

.priority-button:disabled {
	opacity: 0.3;
	cursor: not-allowed;
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
	border-top-color: #f1f3f4;
}

/* Bootstrap Icons Fallback */
.bi::before {
	vertical-align: -0.125em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.task-card {
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
