<template>
	<div class="settings-view">
		<div class="settings-container">
			<h2 class="settings-title">Board Settings</h2>

			<!-- Columns Section -->
			<section class="settings-section">
				<h3 class="section-title">
					<i class="bi bi-columns-gap"></i>
					Columns
				</h3>

				<div class="section-content">
					<div class="form-group">
						<label class="form-label">Column By:</label>
						<select v-model="localConfig.columnBy" class="form-control">
							<option value="status">Status</option>
							<option value="priority">Priority</option>
							<option value="project">Project</option>
							<option value="context">Context</option>
						</select>
					</div>

					<div class="columns-list">
						<div
							v-for="[key, column] in Object.entries(localConfig.columns)"
							:key="key"
							class="column-config-card"
						>
							<div class="column-header">
								<span class="column-icon">{{ column.icon }}</span>
								<h4 class="column-name">{{ column.title }}</h4>
							</div>

							<div class="column-fields">
								<div class="form-row">
									<div class="form-group">
										<label class="form-label">Title:</label>
										<input
											v-model="column.title"
											type="text"
											class="form-control"
											placeholder="Column title"
										/>
									</div>

									<div class="form-group">
										<label class="form-label">Icon:</label>
										<input
											v-model="column.icon"
											type="text"
											class="form-control"
											placeholder="📋"
										/>
									</div>
								</div>

								<div class="form-row">
									<div class="form-group">
										<label class="form-label">Color:</label>
										<input
											v-model="column.color"
											type="color"
											class="form-control-color"
										/>
									</div>

									<div class="form-group">
										<label class="form-label">Order:</label>
										<input
											v-model.number="column.order"
											type="number"
											class="form-control"
											min="0"
										/>
									</div>

									<div class="form-group">
										<label class="form-label">Display:</label>
										<select
											v-model="column.displayBehavior"
											class="form-control"
										>
											<option value="always">Always Show</option>
											<option value="whenTasks">When Has Tasks</option>
											<option value="hide">Hide</option>
										</select>
									</div>
								</div>

								<div class="form-group">
									<label class="checkbox-label">
										<input
											v-model="column.visible"
											type="checkbox"
											class="form-checkbox"
										/>
										<span>Visible</span>
									</label>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Visibility Section -->
			<section class="settings-section">
				<h3 class="section-title">
					<i class="bi bi-eye"></i>
					Visibility
				</h3>

				<div class="section-content">
					<div class="visibility-options">
						<label class="checkbox-label">
							<input
								v-model="showCompletedTasks"
								type="checkbox"
								class="form-checkbox"
							/>
							<span>Show completed tasks</span>
						</label>

						<p class="option-description">
							When enabled, completed tasks will be displayed on the board
						</p>
					</div>
				</div>
			</section>

			<!-- Action Buttons -->
			<div class="settings-actions">
				<button @click="saveSettings" class="btn btn-primary">
					<i class="bi bi-check-circle"></i>
					Save Settings
				</button>
				<button @click="resetSettings" class="btn btn-secondary">
					<i class="bi bi-arrow-counterclockwise"></i>
					Reset to Defaults
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, toRaw } from "vue";
import type { BoardConfig } from "@/types/todo";
import { getDefaultBoardConfig } from "@/utils/storage";

const props = defineProps<{
	boardConfig: BoardConfig;
}>();

const emit = defineEmits<{
	save: [config: BoardConfig];
}>();

// Clone the board config - toRaw() unwraps Vue's reactive Proxy before cloning
const localConfig = ref<BoardConfig>(structuredClone(toRaw(props.boardConfig)));

// Future feature: Filter completed tasks
// TODO: Integrate with task filtering logic
const showCompletedTasks = ref(true);

watch(
	() => props.boardConfig,
	(newConfig) => {
		localConfig.value = structuredClone(toRaw(newConfig));
	},
	{ deep: true }
);

function saveSettings(): void {
	emit("save", structuredClone(toRaw(localConfig.value)));
}

function resetSettings(): void {
	if (confirm("Are you sure you want to reset all settings to defaults?")) {
		localConfig.value = getDefaultBoardConfig();
		saveSettings();
	}
}
</script>

<style scoped>
.settings-view {
	height: 100%;
	width: 100%;
	overflow-y: auto;
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.settings-container {
	max-width: 1400px;
	width: 100%;
	margin: 0 auto;
	padding: 40px 40px;
	box-sizing: border-box;
}

.settings-title {
	font-size: 28px;
	font-weight: 700;
	color: #2c3e50;
	margin: 0 0 30px 0;
}

/* Section Styling */
.settings-section {
	background: white;
	border-radius: 12px;
	padding: 24px;
	margin-bottom: 24px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 20px;
	font-weight: 600;
	color: #495057;
	margin: 0 0 20px 0;
	padding-bottom: 12px;
	border-bottom: 2px solid #e9ecef;
}

.section-title i {
	color: #0d6efd;
	font-size: 22px;
}

.section-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

/* Form Elements */
.form-group {
	display: flex;
	flex-direction: column;
	gap: 6px;
	flex: 1;
}

.form-label {
	font-size: 13px;
	font-weight: 600;
	color: #495057;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.form-control {
	padding: 10px 12px;
	border: 1px solid #dee2e6;
	border-radius: 6px;
	font-size: 14px;
	color: #495057;
	transition: border-color 0.2s ease;
}

.form-control:focus {
	outline: none;
	border-color: #0d6efd;
	box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.form-control-color {
	width: 80px;
	height: 40px;
	padding: 2px;
	border: 1px solid #dee2e6;
	border-radius: 6px;
	cursor: pointer;
}

.form-row {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}

.checkbox-label {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	color: #495057;
	cursor: pointer;
	user-select: none;
}

.form-checkbox {
	width: 18px;
	height: 18px;
	cursor: pointer;
	accent-color: #0d6efd;
}

/* Column Config Cards */
.columns-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin-top: 12px;
}

.column-config-card {
	border: 1px solid #e9ecef;
	border-radius: 8px;
	padding: 16px;
	background: #f8f9fa;
	transition: box-shadow 0.2s ease;
}

.column-config-card:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.column-header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 16px;
	padding-bottom: 12px;
	border-bottom: 1px solid #dee2e6;
}

.column-icon {
	font-size: 24px;
}

.column-name {
	font-size: 16px;
	font-weight: 600;
	color: #495057;
	margin: 0;
}

.column-fields {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

/* Visibility Options */
.visibility-options {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.option-description {
	margin: 0;
	padding-left: 26px;
	font-size: 13px;
	color: #6c757d;
	line-height: 1.5;
}

/* Action Buttons */
.settings-actions {
	display: flex;
	gap: 12px;
	justify-content: flex-start;
	margin-top: 30px;
}

.btn {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 24px;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn i {
	font-size: 16px;
}

.btn-primary {
	background: #0d6efd;
	color: white;
	box-shadow: 0 2px 4px rgba(13, 110, 253, 0.3);
}

.btn-primary:hover {
	background: #0b5ed7;
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(13, 110, 253, 0.4);
}

.btn-secondary {
	background: white;
	color: #6c757d;
	border: 1px solid #dee2e6;
}

.btn-secondary:hover {
	background: #f8f9fa;
	transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
	.settings-container {
		padding: 20px 16px;
	}

	.settings-title {
		font-size: 24px;
	}

	.section-title {
		font-size: 18px;
	}

	.form-row {
		flex-direction: column;
	}

	.settings-actions {
		flex-direction: column;
	}

	.btn {
		width: 100%;
		justify-content: center;
	}
}
</style>
