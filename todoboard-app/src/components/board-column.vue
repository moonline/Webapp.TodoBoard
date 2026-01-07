<template>
	<div class="board-column">
		<div
			class="column-header p-2"
			:style="{
				backgroundColor: column.color || '#f8f9fa',
				'--text-color': getTextColor(column.color || '#f8f9fa'),
			}"
		>
			<div class="header-content d-flex align-items-center justify-content-between">
				<div class="column-title-section">
					<span class="column-icon">{{ column.icon }}</span>
					<h6
						class="column-title"
						:style="{ color: getTextColor(column.color || '#f8f9fa') }"
					>
						{{ column.title }}
					</h6>
				</div>
				<div
					class="task-count-badge"
					:style="{
						color: getTextColor(column.color || '#f8f9fa'),
						background:
							getTextColor(column.color || '#f8f9fa') === '#000000'
								? 'rgba(0, 0, 0, 0.1)'
								: 'rgba(255, 255, 255, 0.2)',
						borderColor:
							getTextColor(column.color || '#f8f9fa') === '#000000'
								? 'rgba(0, 0, 0, 0.15)'
								: 'rgba(255, 255, 255, 0.3)',
					}"
				>
					{{ column.tasks.length }}
				</div>
			</div>

			<!-- Metrics Display -->
			<div v-if="columnMetrics.length > 0" class="d-flex flex-column gap-1 mt-2 px-1">
				<div
					v-for="metric in columnMetrics"
					:key="metric.id"
					class="d-flex justify-content-between align-items-center"
					style="font-size: 10px"
					:style="{
						color: getTextColor(column.color || '#f8f9fa'),
					}"
				>
					<span class="opacity-75">{{ metric.name }}:</span>
					<span class="fw-semibold" style="font-variant-numeric: tabular-nums">{{
						metric.formattedValue
					}}</span>
				</div>
			</div>
		</div>

		<div
			class="column-content p-2"
			:class="{ 'drag-over': isDragOver }"
			@dragover.prevent="handleDragOver"
			@dragleave="handleDragLeave"
			@drop="handleDrop"
		>
			<div v-if="column.tasks.length === 0" class="empty-state">
				<div class="empty-icon">{{ column.icon }}</div>
				<p class="empty-message">No tasks yet</p>
			</div>
			<task-card
				v-for="task in column.tasks"
				:key="task.id"
				:task="task"
				:is-compact-mode="isCompactMode"
				:is-active="activeTaskId === task.id"
				@edit="$emit('edit-task', task)"
				@update-priority="(newPriority) => $emit('update-priority', task, newPriority)"
				@toggle-active="$emit('toggle-task-active', task)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { BoardColumn, TodoTask, AggregationMetric } from "@/types/todo";
import { calculateMetrics, type MetricResult } from "@/utils/metrics";
import TaskCard from "./task-card.vue";

const props = defineProps<{
	column: BoardColumn;
	isCompactMode: boolean;
	activeTaskId: string | null;
	metrics?: AggregationMetric[];
	showMetrics?: boolean;
}>();

// Calculate metrics for this column's tasks
const columnMetrics = computed((): MetricResult[] => {
	if (!props.metrics || !props.showMetrics || props.metrics.length === 0) {
		return [];
	}
	// Sort metrics by order before calculating
	const sortedMetrics = [...props.metrics].sort((a, b) => a.order - b.order);
	return calculateMetrics(sortedMetrics, props.column.tasks);
});

const emit = defineEmits<{
	"edit-task": [task: TodoTask];
	"task-drop": [task: TodoTask, column: BoardColumn];
	"update-priority": [task: TodoTask, newPriority: string | null];
	"toggle-task-active": [task: TodoTask];
}>();

const isDragOver = ref(false);

function handleDragOver(event: DragEvent): void {
	if (!event.dataTransfer) {
		return;
	}

	event.dataTransfer.dropEffect = "move";
	isDragOver.value = true;
}

function handleDragLeave(): void {
	isDragOver.value = false;
}

function handleDrop(event: DragEvent): void {
	event.preventDefault();
	isDragOver.value = false;

	if (!event.dataTransfer) {
		return;
	}

	try {
		const taskData = event.dataTransfer.getData("application/json");
		const task = JSON.parse(taskData) as TodoTask;
		emit("task-drop", task, props.column);
	} catch (error) {
		console.error("Error parsing dropped task data:", error);
	}
}

function getTextColor(backgroundColor: string): string {
	// Convert hex to RGB
	const hex = backgroundColor.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	// Calculate luminance using the relative luminance formula
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	// Return black for light backgrounds, white for dark backgrounds
	return luminance > 0.6 ? "#000000" : "#ffffff";
}
</script>

<style scoped>
.board-column {
	min-width: 250px;
	max-width: 280px;
	flex: 1;
	background: #ffffff;
	border-radius: 16px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	overflow: hidden;
	transition: all 0.2s ease-in-out;
}

.board-column:hover {
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Column Header */
.column-header {
	position: relative;
}

.column-header::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 1px;
	background: linear-gradient(
		90deg,
		transparent 0%,
		rgba(255, 255, 255, 0.3) 50%,
		transparent 100%
	);
}

.column-title-section {
	display: flex;
	align-items: center;
	gap: 8px;
}

.column-icon {
	font-size: 18px;
	line-height: 1;
}

.column-title {
	font-size: 14px;
	font-weight: 600;
	margin: 0;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	letter-spacing: 0.3px;
}

.task-count-badge {
	padding: 4px 8px;
	border-radius: 12px;
	font-size: 12px;
	font-weight: 600;
	min-width: 24px;
	text-align: center;
	backdrop-filter: blur(10px);
	border: 1px solid;
}

/* Column Content */
.column-content {
	background: #ffffff;
	height: calc(100vh - 240px);
	overflow-y: auto;
	scrollbar-width: thin;
	scrollbar-color: #e9ecef transparent;
	transition: background-color 0.2s ease-in-out;
}

.column-content.drag-over {
	background: #f0f8ff;
	box-shadow: inset 0 0 0 2px #0d6efd;
}

.column-content::-webkit-scrollbar {
	width: 6px;
}

.column-content::-webkit-scrollbar-track {
	background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
	background: #e9ecef;
	border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
	background: #dee2e6;
}

/* Empty State */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 32px 16px;
	text-align: center;
	min-height: 120px;
}

.empty-icon {
	font-size: 32px;
	opacity: 0.3;
	margin-bottom: 8px;
}

.empty-message {
	color: #9ca3af;
	font-size: 13px;
	margin: 0;
	font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.board-column {
		min-width: 220px;
		max-width: 240px;
	}

	.column-content {
		height: calc(100vh - 200px);
	}

	.column-title {
		font-size: 13px;
	}

	.task-count-badge {
		font-size: 11px;
		padding: 3px 6px;
	}
}
</style>
