<template>
	<div v-if="isOpen" class="edit-modal-overlay" @click.self="handleCancel">
		<div class="edit-modal-dialog">
			<div class="edit-modal-header">
				<h2 class="modal-title">
					<i :class="mode === 'create' ? 'bi bi-plus-square' : 'bi bi-pencil-square'"></i>
					{{ mode === "create" ? "Create Task" : "Edit Task" }}
				</h2>
				<button @click="handleCancel" class="close-button" aria-label="Close">
					<i class="bi bi-x-lg"></i>
				</button>
			</div>

			<div class="edit-modal-body">
				<div class="form-group">
					<label for="task-text" class="form-label">
						Task (todo.txt format)
						<span class="help-text">Edit the raw todo.txt format below</span>
					</label>
					<textarea
						id="task-text"
						v-model="editedText"
						class="form-control"
						rows="5"
						placeholder="(A) Example task +project @context due:2024-01-15"
						@keydown.ctrl.enter="handleSave"
						@keydown.meta.enter="handleSave"
					></textarea>
				</div>

				<div class="help-section">
					<p class="help-title">
						<i class="bi bi-info-circle"></i>
						Todo.txt Format Guide
					</p>
					<ul class="help-list">
						<li><code>(A)</code> - Priority (A, B, C)</li>
						<li><code>x</code> - Completed task prefix</li>
						<li><code>+project</code> - Project tag</li>
						<li><code>@context</code> - Context tag</li>
						<li><code>key:value</code> - Custom tags</li>
						<li><code>due:YYYY-MM-DD</code> - Due date</li>
					</ul>
				</div>
			</div>

			<div class="edit-modal-footer">
				<button @click="handleCancel" class="button button-secondary">
					<i class="bi bi-x-circle"></i>
					Cancel
				</button>
				<button
					@click="handleSave"
					class="button button-primary"
					:disabled="!editedText.trim()"
				>
					<i class="bi bi-check-circle"></i>
					{{ mode === "create" ? "Create Task" : "Save Changes" }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { TodoTask } from "@/types/todo";

const props = withDefaults(
	defineProps<{
		isOpen: boolean;
		task: TodoTask | null;
		mode?: "edit" | "create";
	}>(),
	{
		mode: "edit",
	}
);

const emit = defineEmits<{
	close: [];
	save: [taskId: string, rawText: string];
	create: [rawText: string];
}>();

const editedText = ref("");

// Watch for task changes and update the edited text
watch(
	() => props.task,
	(newTask) => {
		if (newTask) {
			editedText.value = newTask.raw;
		} else {
			editedText.value = "";
		}
	},
	{ immediate: true }
);

// Clear text when switching to create mode
watch(
	() => props.mode,
	(newMode) => {
		if (newMode === "create") {
			editedText.value = "";
		}
	}
);

function handleCancel(): void {
	emit("close");
	editedText.value = "";
}

function handleSave(): void {
	if (!editedText.value.trim()) {
		return;
	}

	if (props.mode === "create") {
		emit("create", editedText.value.trim());
	} else if (props.task) {
		emit("save", props.task.id, editedText.value.trim());
	}
}
</script>

<style scoped>
.edit-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1050;
	padding: 20px;
}

.edit-modal-dialog {
	background: white;
	border-radius: 16px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	max-width: 600px;
	width: 100%;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
	animation: modalSlideIn 0.2s ease-out;
}

@keyframes modalSlideIn {
	from {
		opacity: 0;
		transform: translateY(-20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.edit-modal-header {
	padding: 24px 24px 20px;
	border-bottom: 1px solid #e9ecef;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.modal-title {
	margin: 0;
	font-size: 20px;
	font-weight: 600;
	color: #2c3e50;
	display: flex;
	align-items: center;
	gap: 10px;
}

.modal-title i {
	color: #0d6efd;
}

.close-button {
	background: none;
	border: none;
	color: #6c757d;
	font-size: 18px;
	cursor: pointer;
	padding: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	transition: all 0.2s ease;
}

.close-button:hover {
	background: #f8f9fa;
	color: #495057;
}

.edit-modal-body {
	padding: 24px;
	flex: 1;
	overflow-y: auto;
}

.form-group {
	margin-bottom: 20px;
}

.form-label {
	display: block;
	margin-bottom: 8px;
	font-weight: 500;
	color: #495057;
	font-size: 14px;
}

.help-text {
	display: block;
	font-size: 12px;
	color: #6c757d;
	font-weight: 400;
	margin-top: 4px;
}

.form-control {
	width: 100%;
	padding: 12px;
	border: 1px solid #dee2e6;
	border-radius: 8px;
	font-size: 14px;
	font-family: "Courier New", monospace;
	line-height: 1.5;
	transition: all 0.2s ease;
	resize: vertical;
}

.form-control:focus {
	outline: none;
	border-color: #0d6efd;
	box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.help-section {
	background: #f8f9fa;
	border: 1px solid #e9ecef;
	border-radius: 8px;
	padding: 16px;
}

.help-title {
	margin: 0 0 12px 0;
	font-size: 13px;
	font-weight: 600;
	color: #495057;
	display: flex;
	align-items: center;
	gap: 6px;
}

.help-title i {
	color: #0d6efd;
}

.help-list {
	margin: 0;
	padding-left: 20px;
	font-size: 12px;
	color: #6c757d;
	line-height: 1.8;
}

.help-list code {
	background: white;
	padding: 2px 6px;
	border-radius: 4px;
	border: 1px solid #dee2e6;
	font-family: "Courier New", monospace;
	font-size: 11px;
	color: #d63384;
}

.edit-modal-footer {
	padding: 20px 24px;
	border-top: 1px solid #e9ecef;
	display: flex;
	gap: 12px;
	justify-content: flex-end;
}

.button {
	padding: 10px 20px;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 8px;
	border: none;
}

.button-secondary {
	background: white;
	color: #6c757d;
	border: 1px solid #dee2e6;
}

.button-secondary:hover {
	background: #f8f9fa;
	border-color: #adb5bd;
	color: #495057;
}

.button-primary {
	background: #0d6efd;
	color: white;
	border: 1px solid #0d6efd;
}

.button-primary:hover:not(:disabled) {
	background: #0b5ed7;
	border-color: #0b5ed7;
}

.button-primary:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
	.edit-modal-dialog {
		max-width: 100%;
		max-height: 100vh;
		border-radius: 0;
		margin: 0;
	}

	.edit-modal-header,
	.edit-modal-body,
	.edit-modal-footer {
		padding: 16px;
	}

	.modal-title {
		font-size: 18px;
	}

	.form-control {
		font-size: 13px;
	}

	.button {
		padding: 8px 16px;
		font-size: 13px;
	}
}
</style>
