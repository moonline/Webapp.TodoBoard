<template>
	<div v-if="isVisible" class="modal-backdrop" @click="$emit('close')">
		<div class="modal-content" @click.stop>
			<div class="modal-header">
				<h5 class="modal-title">Board Settings</h5>
				<button @click="$emit('close')" class="btn-close"></button>
			</div>
			<div class="modal-body">
				<div class="mb-3">
					<label class="form-label">Column By:</label>
					<select v-model="localConfig.columnBy" class="form-select">
						<option value="status">Status</option>
						<option value="priority">Priority</option>
						<option value="project">Project</option>
						<option value="context">Context</option>
					</select>
				</div>

				<div class="mb-3">
					<h6>Column Configuration:</h6>
					<div
						v-for="[key, column] in Object.entries(localConfig.columns)"
						:key="key"
						class="border rounded p-3 mb-3"
					>
						<div class="row g-2">
							<div class="col-md-6">
								<label class="form-label small">Title:</label>
								<input
									v-model="column.title"
									type="text"
									class="form-control form-control-sm"
								/>
							</div>
							<div class="col-md-3">
								<label class="form-label small">Icon:</label>
								<input
									v-model="column.icon"
									type="text"
									class="form-control form-control-sm"
								/>
							</div>
							<div class="col-md-3">
								<label class="form-label small">Order:</label>
								<input
									v-model.number="column.order"
									type="number"
									class="form-control form-control-sm"
									min="0"
								/>
							</div>
						</div>

						<div class="row g-2 mt-2">
							<div class="col-md-4">
								<label class="form-label small">Color:</label>
								<input
									v-model="column.color"
									type="color"
									class="form-control form-control-color form-control-sm"
								/>
							</div>
							<div class="col-md-4">
								<label class="form-label small">Display:</label>
								<select
									v-model="column.displayBehavior"
									class="form-select form-select-sm"
								>
									<option value="always">Always Show</option>
									<option value="whenTasks">When Has Tasks</option>
									<option value="hide">Hide</option>
								</select>
							</div>
							<div class="col-md-4 d-flex align-items-end">
								<div class="form-check">
									<input
										:id="`visible-${key}`"
										v-model="column.visible"
										type="checkbox"
										class="form-check-input"
									/>
									<label :for="`visible-${key}`" class="form-check-label small">
										Visible
									</label>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button @click="saveSettings" class="btn btn-primary">Save Settings</button>
				<button @click="$emit('close')" class="btn btn-secondary">Cancel</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { BoardConfig } from "@/types/todo";

const props = defineProps<{
	isVisible: boolean;
	boardConfig: BoardConfig;
}>();

const emit = defineEmits<{
	close: [];
	save: [config: BoardConfig];
}>();

const localConfig = ref<BoardConfig>({ ...props.boardConfig });

watch(
	() => props.boardConfig,
	(newConfig) => {
		localConfig.value = { ...newConfig };
	},
	{ deep: true }
);

function saveSettings(): void {
	emit("save", { ...localConfig.value });
}
</script>

<style scoped>
.modal-backdrop {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1050;
}

.modal-content {
	background: white;
	border-radius: 0.375rem;
	max-width: 500px;
	width: 90%;
	max-height: 80vh;
	overflow: auto;
	box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
	padding: 1rem;
	border-bottom: 1px solid #dee2e6;
	display: flex;
	justify-content: between;
	align-items: center;
}

.modal-title {
	margin: 0;
	flex: 1;
}

.btn-close {
	background: none;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
	padding: 0;
	width: 1.5rem;
	height: 1.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-close:before {
	content: "×";
}

.modal-body {
	padding: 1rem;
}

.modal-footer {
	padding: 1rem;
	border-top: 1px solid #dee2e6;
	display: flex;
	gap: 0.5rem;
	justify-content: flex-end;
}
</style>
