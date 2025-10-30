<template>
	<div class="compact-toolbar-wrapper">
		<!-- Single-line toolbar -->
		<div class="compact-toolbar">
			<button
				@click="$emit('load-file')"
				class="toolbar-button primary"
				title="Load todo.txt"
			>
				<i class="bi bi-folder-plus"></i>
				<span class="button-text">Load</span>
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

		<!-- File Input (shown when active) -->
		<div v-if="showFileInput" class="file-input-section">
			<input
				ref="fileInput"
				type="file"
				accept=".txt"
				@change="handleFileUpload"
				class="file-input"
			/>
			<button @click="$emit('cancel-file-input')" class="cancel-button">
				<i class="bi bi-x"></i>
				Cancel
			</button>
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
import { ref } from "vue";
import type { Filter, TodoTask } from "@/types/todo";
import FilterBar from "./filter-bar.vue";

defineProps<{
	filter: Filter;
	tasks: TodoTask[];
	isFilterCollapsed: boolean;
	showFileInput: boolean;
	hasDownloadableTasks: boolean;
}>();

const emit = defineEmits<{
	"load-file": [];
	download: [];
	"toggle-filter": [];
	"cancel-file-input": [];
	"update:filter": [filter: Filter];
	"file-upload": [event: Event];
}>();

const fileInput = ref<HTMLInputElement>();

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

.toolbar-button i {
	font-size: 14px;
}

.button-text {
	white-space: nowrap;
}

/* File Input Section */
.file-input-section {
	padding: 0 20px 12px;
	display: flex;
	gap: 8px;
	align-items: center;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.file-input {
	flex: 1;
	padding: 8px 12px;
	border: 1px solid #dee2e6;
	border-radius: 6px;
	background: white;
	font-size: 13px;
	transition: border-color 0.2s ease;
}

.file-input:focus {
	outline: none;
	border-color: #0d6efd;
}

.cancel-button {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 8px 14px;
	background: white;
	color: #dc3545;
	border: 1px solid #dc3545;
	border-radius: 6px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.cancel-button:hover {
	background: #dc3545;
	color: white;
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
