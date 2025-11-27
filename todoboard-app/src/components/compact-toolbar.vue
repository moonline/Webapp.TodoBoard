<template>
	<div class="compact-toolbar-wrapper">
		<!-- Single-line toolbar -->
		<div class="compact-toolbar">
			<button @click="openFilePicker" class="toolbar-button primary" title="Load todo.txt">
				<i class="bi bi-folder-plus"></i>
				<span class="button-text">Load</span>
			</button>
			<button
				@click="$emit('create-task')"
				class="toolbar-button success"
				title="Create new task"
			>
				<i class="bi bi-plus-circle"></i>
				<span class="button-text">Create Task</span>
			</button>
			<button
				@click="$emit('download')"
				class="toolbar-button"
				:disabled="!hasDownloadableTasks"
				title="Download todo.txt"
			>
				<i class="bi bi-download"></i>
				<span class="button-text">Download</span>
			</button>
			<button
				@click="$emit('toggle-filter')"
				class="toolbar-button"
				:title="isFilterCollapsed ? 'Show Filters' : 'Hide Filters'"
			>
				<i :class="isFilterCollapsed ? 'bi bi-chevron-down' : 'bi bi-chevron-up'"></i>
				<span class="button-text">{{ isFilterCollapsed ? "Show" : "Hide" }} Filters</span>
			</button>
		</div>

		<!-- Hidden File Input -->
		<input
			ref="fileInput"
			type="file"
			accept=".txt"
			@change="handleFileUpload"
			class="hidden-file-input"
		/>

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
import { ref } from "vue";
import type { Filter, TodoTask } from "@/types/todo";
import FilterBar from "./filter-bar.vue";

defineProps<{
	filter: Filter;
	tasks: TodoTask[];
	isFilterCollapsed: boolean;
	hasDownloadableTasks: boolean;
}>();

const emit = defineEmits<{
	"create-task": [];
	download: [];
	"toggle-filter": [];
	"update:filter": [filter: Filter];
	"file-upload": [event: Event];
}>();

const fileInput = ref<HTMLInputElement>();

function openFilePicker(): void {
	fileInput.value?.click();
}

function handleFileUpload(event: Event): void {
	emit("file-upload", event);
	// Reset the file input so the same file can be loaded again
	if (fileInput.value) {
		fileInput.value.value = "";
	}
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

.toolbar-button i {
	font-size: 14px;
}

.button-text {
	white-space: nowrap;
}

/* Hidden File Input */
.hidden-file-input {
	display: none;
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
}
</style>
