<template>
	<div class="toolbar">
		<div class="toolbar-header">
			<h1 class="app-title">📋 TodoBoard</h1>
			<div class="action-buttons">
				<button
					@click="$emit('load-file')"
					class="action-button primary"
					title="Load todo.txt"
				>
					<i class="bi bi-folder-plus"></i>
				</button>
				<button
					@click="$emit('download')"
					class="action-button secondary"
					:disabled="!hasDownloadableTasks"
					title="Download"
				>
					<i class="bi bi-download"></i>
				</button>
				<button
					@click="$emit('open-settings')"
					class="action-button secondary"
					title="Settings"
				>
					<i class="bi bi-gear"></i>
				</button>
				<button
					@click="$emit('toggle-filter')"
					class="action-button secondary"
					:title="isFilterCollapsed ? 'Show Filters' : 'Hide Filters'"
				>
					<i :class="isFilterCollapsed ? 'bi bi-chevron-down' : 'bi bi-chevron-up'"></i>
				</button>
			</div>
		</div>

		<!-- File Input -->
		<div v-if="showFileInput" class="file-input-section">
			<div class="file-input-container">
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
		</div>

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

const props = defineProps<{
	filter: Filter;
	tasks: TodoTask[];
	isFilterCollapsed: boolean;
	showFileInput: boolean;
	hasDownloadableTasks: boolean;
}>();

const emit = defineEmits<{
	"load-file": [];
	download: [];
	"open-settings": [];
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
/* Toolbar Styling */
.toolbar {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.toolbar-header {
	padding: 16px 24px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20px;
}

.app-title {
	margin: 0;
	font-size: 24px;
	font-weight: 700;
	color: #2c3e50;
	display: flex;
	align-items: center;
	gap: 8px;
}

.action-buttons {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}

.action-button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 10px;
	border: none;
	border-radius: 8px;
	font-size: 18px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	text-decoration: none;
	width: 40px;
	height: 40px;
	position: relative;
}

.action-button i {
	font-size: 18px;
}

.action-button.primary {
	background: #0d6efd;
	color: white;
	box-shadow: 0 2px 4px rgba(13, 110, 253, 0.3);
}

.action-button.primary:hover {
	background: #0b5ed7;
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(13, 110, 253, 0.4);
}

.action-button.secondary {
	background: rgba(108, 117, 125, 0.1);
	color: #495057;
	border: 1px solid rgba(108, 117, 125, 0.2);
}

.action-button.secondary:hover:not(:disabled) {
	background: rgba(108, 117, 125, 0.15);
	transform: translateY(-1px);
}

.action-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none !important;
}

/* File Input Section */
.file-input-section {
	padding: 0 24px 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.file-input-container {
	display: flex;
	gap: 12px;
	align-items: center;
}

.file-input {
	flex: 1;
	padding: 10px 12px;
	border: 2px solid #e9ecef;
	border-radius: 8px;
	background: white;
	font-size: 13px;
	transition: all 0.2s ease-in-out;
}

.file-input:focus {
	outline: none;
	border-color: #0d6efd;
	box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.cancel-button {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 10px 16px;
	background: rgba(220, 53, 69, 0.1);
	color: #dc3545;
	border: 1px solid rgba(220, 53, 69, 0.2);
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
}

.cancel-button:hover {
	background: rgba(220, 53, 69, 0.15);
	transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
	.toolbar-header {
		padding: 12px 16px;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}

	.app-title {
		font-size: 20px;
	}

	.action-buttons {
		gap: 8px;
		width: 100%;
		justify-content: flex-start;
	}

	.action-button {
		padding: 8px;
		width: 36px;
		height: 36px;
		flex: 0 0 auto;
	}

	.action-button i {
		font-size: 16px;
	}

	.file-input-section {
		padding: 0 16px 12px;
	}
}
</style>
