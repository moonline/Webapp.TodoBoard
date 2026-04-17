<template>
	<div class="settings-view">
		<div class="settings-container">
			<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
				<h2 class="settings-title m-0">Board Settings</h2>
				<div class="d-flex gap-2">
					<slot name="settings-actions"></slot>
				</div>
			</div>

			<slot name="settings-banner"></slot>

			<!-- Columns Section -->
			<section class="settings-section">
				<h3 class="section-title">
					<i class="bi bi-columns-gap"></i>
					Columns
				</h3>

				<div class="section-content">
					<div class="form-group">
						<label class="form-label">Grouping Tag:</label>
						<input
							v-model="localConfig.groupingTag"
							type="text"
							class="form-control"
							placeholder="e.g., status, priority, phase"
						/>
						<p class="field-description">
							Tag used to group tasks into columns (e.g., "status", "priority")
						</p>
					</div>

					<div class="columns-list">
						<div
							v-for="[key, column] in sortedColumns"
							:key="key"
							class="column-config-card"
						>
							<div class="column-header">
								<span class="column-icon">{{ column.icon }}</span>
								<h4 class="column-name">
									{{ column.title }}
									<span class="column-type-badge">{{
										getColumnTypeLabel(column.type)
									}}</span>
								</h4>
								<button
									v-if="column.type === ColumnType.Tag"
									@click="removeColumn(key)"
									class="btn-remove-column"
									title="Remove column"
								>
									<i class="bi bi-trash"></i>
								</button>
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

								<div v-if="column.type === ColumnType.Tag" class="form-row">
									<div class="form-group">
										<label class="form-label">Tag Value:</label>
										<input
											v-model="column.tagValue"
											type="text"
											class="form-control"
											placeholder="e.g., planning, doing"
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

					<button @click="addTagColumn" class="btn btn-add-column">
						<i class="bi bi-plus-circle"></i>
						Add Tag Column
					</button>
				</div>
			</section>

			<!-- Task Order Section -->
			<section class="settings-section">
				<h3 class="section-title">
					<i class="bi bi-sort-down"></i>
					Task Order
				</h3>

				<div class="section-content">
					<div class="form-group">
						<label class="form-label">Order By:</label>
						<select v-model="taskOrderType" class="form-control">
							<option value="priority">Priority</option>
							<option value="tag">Tag</option>
							<option value="createdDate">Created Date</option>
						</select>
						<p class="field-description">
							Defines how tasks are ordered within each column
						</p>
					</div>

					<div v-if="taskOrderType === 'tag'" class="form-group">
						<label class="form-label">Order Tag:</label>
						<input
							v-model="orderTag"
							type="text"
							class="form-control"
							placeholder="e.g., priority, importance"
						/>
						<p class="field-description">Which tag to use for ordering tasks</p>
					</div>

					<div class="form-group">
						<label class="form-label">Direction:</label>
						<select v-model="orderDirection" class="form-control">
							<option value="asc">Ascending</option>
							<option value="desc">Descending</option>
						</select>
					</div>
				</div>
			</section>

			<!-- Aggregation Metrics Section -->
			<section class="settings-section">
				<h3 class="section-title">
					<i class="bi bi-calculator"></i>
					Aggregation Metrics
				</h3>

				<div class="section-content">
					<p class="field-description mb-3">
						Define metrics to calculate aggregated values from task tags in each column
					</p>

					<div class="d-flex flex-column gap-3 mt-3">
						<div
							v-for="(metric, index) in sortedMetrics"
							:key="metric.id"
							class="border rounded p-3 bg-light"
						>
							<div class="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom">
								<h4 class="mb-0 flex-grow-1 fw-semibold fs-6 text-secondary">
									{{ metric.name || "New Metric" }}
								</h4>
								<div class="btn-group btn-group-sm" role="group">
									<button
										@click="moveMetricUp(index)"
										:disabled="index === 0"
										class="btn btn-outline-secondary"
										title="Move up"
									>
										<i class="bi bi-chevron-up"></i>
									</button>
									<button
										@click="moveMetricDown(index)"
										:disabled="index === sortedMetrics.length - 1"
										class="btn btn-outline-secondary"
										title="Move down"
									>
										<i class="bi bi-chevron-down"></i>
									</button>
								</div>
								<button
									@click="removeMetric(metric.id)"
									class="btn btn-sm btn-outline-danger"
									title="Remove metric"
								>
									<i class="bi bi-trash"></i>
								</button>
							</div>

							<div class="row g-2">
								<div class="col-md-6">
									<label class="form-label">Name:</label>
									<input
										v-model="metric.name"
										type="text"
										class="form-control"
										placeholder="e.g., Total Points, Task Count"
									/>
								</div>

								<div class="col-md-6">
									<label class="form-label">Tag:</label>
									<input
										v-model="metric.tag"
										type="text"
										class="form-control"
										placeholder="e.g., points, effort"
									/>
								</div>

								<div class="col-md-12">
									<label class="form-label">Aggregation Method:</label>
									<select v-model="metric.method" class="form-control">
										<option value="sum">Sum</option>
										<option value="count">Count</option>
										<option value="average">Average</option>
										<option value="median">Median</option>
										<option value="min">Minimum</option>
										<option value="max">Maximum</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<button @click="addMetric" class="btn btn-add-column">
						<i class="bi bi-plus-circle"></i>
						Add Metric
					</button>
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
import { ref, watch, computed } from "vue";
import type { BoardConfig, AggregationMetric } from "../types/todo";
import { ColumnType } from "../types/todo";
import { getDefaultBoardConfig, cloneBoardConfig } from "../utils/storage";

const props = defineProps<{
	boardConfig: BoardConfig;
}>();

const emit = defineEmits<{
	save: [config: BoardConfig];
}>();

// Clone the board config to avoid mutating the original
const localConfig = ref<BoardConfig>(cloneBoardConfig(props.boardConfig));

// Computed property to get columns sorted by order
const sortedColumns = computed(() => {
	return Object.entries(localConfig.value.columns).sort(
		([, columnA], [, columnB]) => columnA.order - columnB.order
	);
});

// Computed property to get metrics sorted by order
const sortedMetrics = computed(() => {
	return [...(localConfig.value.metrics || [])].sort((a, b) => a.order - b.order);
});

// Task ordering computed properties
const taskOrderType = computed({
	get(): string {
		if (localConfig.value.sortBy.length === 0) {
			return "priority";
		}
		return localConfig.value.sortBy[0].field;
	},
	set(value: string): void {
		if (localConfig.value.sortBy.length === 0) {
			localConfig.value.sortBy.push({ field: value, direction: "asc" });
		} else {
			localConfig.value.sortBy[0].field = value;
		}
	},
});

const orderTag = computed({
	get(): string {
		if (
			localConfig.value.sortBy.length > 0 &&
			localConfig.value.sortBy[0].field !== "priority" &&
			localConfig.value.sortBy[0].field !== "createdDate"
		) {
			return localConfig.value.sortBy[0].field;
		}
		return "";
	},
	set(value: string): void {
		if (localConfig.value.sortBy.length > 0 && taskOrderType.value === "tag") {
			localConfig.value.sortBy[0].field = value;
		}
	},
});

const orderDirection = computed({
	get(): "asc" | "desc" {
		if (localConfig.value.sortBy.length === 0) {
			return "asc";
		}
		return localConfig.value.sortBy[0].direction;
	},
	set(value: "asc" | "desc"): void {
		if (localConfig.value.sortBy.length === 0) {
			localConfig.value.sortBy.push({ field: "priority", direction: value });
		} else {
			localConfig.value.sortBy[0].direction = value;
		}
	},
});

watch(
	() => props.boardConfig,
	(newConfig) => {
		localConfig.value = cloneBoardConfig(newConfig);
	},
	{ deep: true }
);

function getColumnTypeLabel(type: ColumnType): string {
	switch (type) {
		case ColumnType.Uncategorized:
			return "Uncategorized";
		case ColumnType.Completed:
			return "Completed";
		case ColumnType.Tag:
			return "Tag";
		default:
			return "";
	}
}

function addTagColumn(): void {
	const newColumnId = `tag-${Date.now()}`;
	const maxOrder = Math.max(
		...Object.values(localConfig.value.columns).map((col) => col.order),
		0
	);

	localConfig.value.columns[newColumnId] = {
		id: newColumnId,
		type: ColumnType.Tag,
		title: "New Column",
		icon: "📌",
		color: "#6c757d",
		visible: true,
		displayBehavior: "always",
		order: maxOrder + 1,
		tagValue: "",
	};
}

function removeColumn(columnId: string): void {
	if (confirm("Are you sure you want to remove this column?")) {
		delete localConfig.value.columns[columnId];
	}
}

function saveSettings(): void {
	emit("save", cloneBoardConfig(localConfig.value));
}

function resetSettings(): void {
	if (confirm("Are you sure you want to reset all settings to defaults?")) {
		localConfig.value = getDefaultBoardConfig();
		saveSettings();
	}
}

function addMetric(): void {
	if (!localConfig.value.metrics) {
		localConfig.value.metrics = [];
	}

	const maxOrder = Math.max(...localConfig.value.metrics.map((m) => m.order), -1);

	const newMetric: AggregationMetric = {
		id: `metric-${Date.now()}`,
		name: "",
		tag: "",
		method: "sum",
		order: maxOrder + 1,
	};

	localConfig.value.metrics.push(newMetric);
}

function removeMetric(metricId: string): void {
	if (confirm("Are you sure you want to remove this metric?")) {
		localConfig.value.metrics = localConfig.value.metrics.filter((m) => m.id !== metricId);
	}
}

function moveMetricUp(index: number): void {
	if (index === 0) return;

	const metrics = sortedMetrics.value;
	const currentMetric = metrics[index];
	const previousMetric = metrics[index - 1];

	// Swap orders
	const tempOrder = currentMetric.order;
	currentMetric.order = previousMetric.order;
	previousMetric.order = tempOrder;
}

function moveMetricDown(index: number): void {
	const metrics = sortedMetrics.value;
	if (index === metrics.length - 1) return;

	const currentMetric = metrics[index];
	const nextMetric = metrics[index + 1];

	// Swap orders
	const tempOrder = currentMetric.order;
	currentMetric.order = nextMetric.order;
	nextMetric.order = tempOrder;
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
	flex-wrap: wrap;
}

.column-icon {
	font-size: 24px;
}

.column-name {
	font-size: 16px;
	font-weight: 600;
	color: #495057;
	margin: 0;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}

.column-fields {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.field-description {
	margin: 4px 0 0 0;
	font-size: 12px;
	color: #6c757d;
	line-height: 1.4;
}

.column-type-badge {
	display: inline-block;
	margin-left: 8px;
	padding: 2px 8px;
	font-size: 11px;
	font-weight: 500;
	color: #495057;
	background: #e9ecef;
	border-radius: 4px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.btn-remove-column {
	margin-left: auto;
	padding: 6px 12px;
	background: transparent;
	border: 1px solid #dc3545;
	border-radius: 6px;
	color: #dc3545;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 4px;
}

.btn-remove-column:hover {
	background: #dc3545;
	color: white;
}

.btn-remove-column i {
	font-size: 14px;
}

.btn-add-column {
	margin-top: 16px;
	background: #198754;
	color: white;
	box-shadow: 0 2px 4px rgba(25, 135, 84, 0.3);
}

.btn-add-column:hover {
	background: #157347;
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(25, 135, 84, 0.4);
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

	.settings-actions .btn {
		width: 100%;
		justify-content: center;
	}
}
</style>
