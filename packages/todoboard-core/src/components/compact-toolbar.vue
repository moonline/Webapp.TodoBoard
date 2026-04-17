<template>
	<div class="compact-toolbar-wrapper">
		<!-- Single-line toolbar -->
		<div class="compact-toolbar">
			<slot name="toolbar-start"></slot>
			<button
				@click="$emit('create-task')"
				class="toolbar-button success"
				title="Create new task"
			>
				<i class="bi bi-plus-circle"></i>
				<span class="button-text">Create Task</span>
			</button>
			<button
				@click="handleClearBoard"
				class="toolbar-button danger"
				:disabled="!hasDownloadableTasks"
				title="Clear board"
			>
				<i class="bi bi-trash"></i>
				<span class="button-text">Clear Board</span>
			</button>

			<!-- Toggle Switches -->
			<div class="form-check form-switch ms-auto mb-0">
				<input
					class="form-check-input"
					type="checkbox"
					role="switch"
					id="filterToggle"
					:checked="!isFilterCollapsed"
					@change="$emit('toggle-filter')"
				/>
				<label class="form-check-label toggle-label" for="filterToggle">
					Show Filters
				</label>
			</div>

			<div class="form-check form-switch mb-0">
				<input
					class="form-check-input"
					type="checkbox"
					role="switch"
					id="metricsToggle"
					:checked="showMetrics"
					@change="$emit('toggle-metrics')"
				/>
				<label class="form-check-label toggle-label" for="metricsToggle">
					Show Metrics
				</label>
			</div>

			<div class="form-check form-switch mb-0">
				<input
					class="form-check-input"
					type="checkbox"
					role="switch"
					id="compactToggle"
					:checked="isCompactMode"
					@change="$emit('toggle-compact-mode')"
				/>
				<label class="form-check-label toggle-label" for="compactToggle">
					Compact Mode
				</label>
			</div>
		</div>

		<!-- Filter Bar (collapsible) -->
		<filter-bar
			:filter="filter"
			:tasks="tasks"
			:is-collapsed="isFilterCollapsed"
			@update:filter="$emit('update:filter', $event)"
		/>
	</div>
</template>

<script setup lang="ts">
import type { Filter, TodoTask } from "../types/todo";
import FilterBar from "./filter-bar.vue";

defineProps<{
	filter: Filter;
	tasks: TodoTask[];
	isFilterCollapsed: boolean;
	isCompactMode: boolean;
	hasDownloadableTasks: boolean;
	showMetrics: boolean;
}>();

const emit = defineEmits<{
	"create-task": [];
	"toggle-metrics": [];
	"clear-board": [];
	"toggle-filter": [];
	"toggle-compact-mode": [];
	"update:filter": [filter: Filter];
}>();

function handleClearBoard(): void {
	emit("clear-board");
}
</script>

<style scoped>
.compact-toolbar-wrapper {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.compact-toolbar {
	padding: 12px 20px;
	display: flex;
	gap: 8px;
	align-items: center;
}

.toolbar-button {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 14px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
	background: white;
	color: #495057;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.toolbar-button:hover:not(:disabled) {
	background: #f8f9fa;
	border-color: rgba(0, 0, 0, 0.15);
	transform: translateY(-1px);
}

.toolbar-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.toolbar-button.primary {
	background: #0d6efd;
	color: white;
	border-color: #0d6efd;
}

.toolbar-button.primary:hover {
	background: #0b5ed7;
	border-color: #0b5ed7;
}

.toolbar-button.success {
	background: #198754;
	color: white;
	border-color: #198754;
}

.toolbar-button.success:hover {
	background: #157347;
	border-color: #157347;
}

.toolbar-button.active {
	background: #0d6efd;
	color: white;
	border-color: #0d6efd;
}

.toolbar-button.active:hover {
	background: #0b5ed7;
	border-color: #0b5ed7;
}

.toolbar-button i {
	font-size: 14px;
}

.button-text {
	white-space: nowrap;
}

/* Toggle Switches */
.form-check {
	padding-left: 3.5em;
	display: flex;
	align-items: center;
}

.form-check-input {
	width: 3rem !important;
	height: 1.75rem !important;
}

.toggle-label {
	font-size: 13px;
	font-weight: 500;
	color: #495057;
	user-select: none;
	padding: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
	.compact-toolbar {
		padding: 10px 16px;
		gap: 6px;
		flex-wrap: wrap;
	}

	.button-text {
		display: none;
	}

	.toolbar-button {
		padding: 8px 10px;
	}

	.toggle-label {
		display: none;
	}
}
</style>
