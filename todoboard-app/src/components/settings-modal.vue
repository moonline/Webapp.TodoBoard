<template>
	<div v-if="isVisible" class="modal-backdrop" @click="$emit('close')">
		<div class="modal-content" @click.stop>
			<div class="modal-header">
				<h5 class="modal-title">Board Settings</h5>
				<button @click="$emit('close')" class="btn-close"></button>
			</div>
			<div class="modal-body">
				<div class="mb-3">
					<label class="form-label">Grouping Tag:</label>
					<input
						v-model="localConfig.groupingTag"
						type="text"
						class="form-control form-control-sm"
						placeholder="e.g., status, priority, phase"
					/>
				</div>

				<div class="mb-3">
					<h6>Column Configuration:</h6>
					<div
						v-for="[key, column] in sortedColumns"
						:key="key"
						class="border rounded p-3 mb-3"
					>
						<div class="d-flex align-items-center mb-2">
							<span class="me-2">{{ column.icon }}</span>
							<strong>{{ column.title }}</strong>
							<span class="badge bg-secondary ms-2">{{
								getColumnTypeLabel(column.type)
							}}</span>
							<button
								v-if="column.type === ColumnType.Tag"
								@click="removeColumn(key)"
								class="btn btn-sm btn-outline-danger ms-auto"
								title="Remove column"
							>
								×
							</button>
						</div>

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

						<div v-if="column.type === ColumnType.Tag" class="row g-2 mt-2">
							<div class="col-md-12">
								<label class="form-label small">Tag Value:</label>
								<input
									v-model="column.tagValue"
									type="text"
									class="form-control form-control-sm"
									placeholder="e.g., planning, doing"
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

					<button @click="addTagColumn" class="btn btn-sm btn-success">
						+ Add Tag Column
					</button>
				</div>

				<div class="mb-3">
					<h6>Task Order:</h6>
					<div class="row g-2">
						<div class="col-md-6">
							<label class="form-label small">Order By:</label>
							<select v-model="taskOrderType" class="form-select form-select-sm">
								<option value="priority">Priority</option>
								<option value="tag">Tag</option>
								<option value="createdDate">Created Date</option>
							</select>
						</div>
						<div class="col-md-6">
							<label class="form-label small">Direction:</label>
							<select v-model="orderDirection" class="form-select form-select-sm">
								<option value="asc">Ascending</option>
								<option value="desc">Descending</option>
							</select>
						</div>
					</div>
					<div v-if="taskOrderType === 'tag'" class="row g-2 mt-2">
						<div class="col-md-12">
							<label class="form-label small">Order Tag:</label>
							<input
								v-model="orderTag"
								type="text"
								class="form-control form-control-sm"
								placeholder="e.g., priority, importance"
							/>
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
import { ref, watch, computed } from "vue";
import type { BoardConfig } from "@/types/todo";
import { ColumnType } from "@/types/todo";

const props = defineProps<{
	isVisible: boolean;
	boardConfig: BoardConfig;
}>();

const emit = defineEmits<{
	close: [];
	save: [config: BoardConfig];
}>();

const localConfig = ref<BoardConfig>({ ...props.boardConfig });

const sortedColumns = computed(() => {
	return Object.entries(localConfig.value.columns).sort(
		([, columnA], [, columnB]) => columnA.order - columnB.order
	);
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
		localConfig.value = { ...newConfig };
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
