<template>
	<div class="filter-bar">
		<div class="filter-container">
			<div class="filter-group">
				<div class="filter-item">
					<label class="filter-label">
						<i class="bi bi-folder-plus"></i>
						Project
					</label>
					<select
						v-model="localFilter.projects[0]"
						class="filter-select"
						@change="updateFilter"
					>
						<option value="">All Projects</option>
						<option
							v-for="project in availableProjects"
							:key="project"
							:value="project"
						>
							{{ project }}
						</option>
					</select>
				</div>

				<div class="filter-item">
					<label class="filter-label">
						<i class="bi bi-at"></i>
						Context
					</label>
					<select
						v-model="localFilter.contexts[0]"
						class="filter-select"
						@change="updateFilter"
					>
						<option value="">All Contexts</option>
						<option
							v-for="context in availableContexts"
							:key="context"
							:value="context"
						>
							{{ context }}
						</option>
					</select>
				</div>

				<div class="filter-item">
					<label class="filter-label">
						<i class="bi bi-tags"></i>
						Tag
					</label>
					<select v-model="selectedTagKey" class="filter-select" @change="updateFilter">
						<option value="">Select Tag</option>
						<option v-for="tag in availableTags" :key="tag" :value="tag">
							{{ tag }}
						</option>
					</select>
				</div>
			</div>

			<div class="filter-actions">
				<button @click="clearFilters" class="clear-button" :disabled="!hasActiveFilters">
					<i class="bi bi-x-circle"></i>
					Clear Filters
				</button>
			</div>
		</div>

		<!-- Active Filters Display -->
		<div v-if="hasActiveFilters" class="active-filters">
			<span class="active-filters-label">Active filters:</span>
			<div class="filter-tags">
				<span
					v-if="localFilter.projects[0]"
					class="filter-tag project-filter"
					@click="clearProjectFilter"
				>
					<i class="bi bi-folder-plus"></i>
					{{ localFilter.projects[0] }}
					<i class="bi bi-x"></i>
				</span>
				<span
					v-if="localFilter.contexts[0]"
					class="filter-tag context-filter"
					@click="clearContextFilter"
				>
					<i class="bi bi-at"></i>
					{{ localFilter.contexts[0] }}
					<i class="bi bi-x"></i>
				</span>
				<span
					v-for="[key, value] in Object.entries(localFilter.tags)"
					:key="key"
					class="filter-tag custom-filter"
					@click="clearTagFilter(key)"
				>
					{{ key }}:{{ value }}
					<i class="bi bi-x"></i>
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Filter, TodoTask } from "@/types/todo";

const props = defineProps<{
	filter: Filter;
	tasks: TodoTask[];
}>();

const emit = defineEmits<{
	"update:filter": [filter: Filter];
}>();

const localFilter = ref<Filter>({ ...props.filter });
const selectedTagKey = ref("");

const availableProjects = computed(() => {
	const projects = new Set<string>();
	props.tasks.forEach((task) => {
		task.projects.forEach((project) => projects.add(project));
	});
	return Array.from(projects).sort();
});

const availableContexts = computed(() => {
	const contexts = new Set<string>();
	props.tasks.forEach((task) => {
		task.contexts.forEach((context) => contexts.add(context));
	});
	return Array.from(contexts).sort();
});

const availableTags = computed(() => {
	const tags = new Set<string>();
	props.tasks.forEach((task) => {
		Object.keys(task.tags).forEach((tag) => tags.add(tag));
	});
	return Array.from(tags).sort();
});

const hasActiveFilters = computed(() => {
	return (
		localFilter.value.projects.length > 0 ||
		localFilter.value.contexts.length > 0 ||
		Object.keys(localFilter.value.tags).length > 0
	);
});

function updateFilter(): void {
	emit("update:filter", { ...localFilter.value });
}

function clearFilters(): void {
	localFilter.value = { projects: [], contexts: [], tags: {} };
	selectedTagKey.value = "";
	updateFilter();
}

function clearProjectFilter(): void {
	localFilter.value.projects = [];
	updateFilter();
}

function clearContextFilter(): void {
	localFilter.value.contexts = [];
	updateFilter();
}

function clearTagFilter(tagKey: string): void {
	delete localFilter.value.tags[tagKey];
	updateFilter();
}

watch(
	() => props.filter,
	(newFilter) => {
		localFilter.value = { ...newFilter };
	},
	{ deep: true }
);
</script>

<style scoped>
.filter-bar {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	border-bottom: 1px solid #e9ecef;
	padding: 20px 24px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-container {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 20px;
	flex-wrap: wrap;
}

.filter-group {
	display: flex;
	align-items: flex-end;
	gap: 16px;
	flex: 1;
	min-width: 0;
}

.filter-item {
	flex: 1;
	min-width: 160px;
}

.filter-label {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	font-weight: 600;
	color: #495057;
	margin-bottom: 6px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.filter-label i {
	font-size: 11px;
	opacity: 0.7;
}

.filter-select {
	width: 100%;
	padding: 8px 12px;
	border: 2px solid #e9ecef;
	border-radius: 8px;
	background: #ffffff;
	font-size: 13px;
	color: #495057;
	transition: all 0.2s ease-in-out;
	appearance: none;
	background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
	background-position: right 8px center;
	background-repeat: no-repeat;
	background-size: 16px;
	padding-right: 32px;
}

.filter-select:focus {
	outline: none;
	border-color: #0d6efd;
	box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.filter-select:hover {
	border-color: #dee2e6;
}

.filter-actions {
	display: flex;
	align-items: center;
}

.clear-button {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 16px;
	background: #ffffff;
	border: 2px solid #e9ecef;
	border-radius: 8px;
	color: #6c757d;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
}

.clear-button:hover:not(:disabled) {
	background: #f8f9fa;
	border-color: #dee2e6;
	color: #495057;
}

.clear-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Active Filters */
.active-filters {
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid #f1f3f4;
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.active-filters-label {
	font-size: 12px;
	font-weight: 600;
	color: #6c757d;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.filter-tags {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

.filter-tag {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 6px 10px;
	border-radius: 12px;
	font-size: 11px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	border: 1px solid transparent;
}

.filter-tag:hover {
	transform: translateY(-1px);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-filter {
	background: #e8f5e8;
	color: #2e7d32;
	border-color: #c8e6c9;
}

.project-filter:hover {
	background: #dcedc8;
}

.context-filter {
	background: #e3f2fd;
	color: #1976d2;
	border-color: #bbdefb;
}

.context-filter:hover {
	background: #bbdefb;
}

.custom-filter {
	background: #f3e5f5;
	color: #7b1fa2;
	border-color: #e1bee7;
}

.custom-filter:hover {
	background: #e1bee7;
}

.filter-tag i:last-child {
	margin-left: 4px;
	opacity: 0.6;
	font-size: 10px;
}

.filter-tag:hover i:last-child {
	opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
	.filter-bar {
		padding: 16px;
	}

	.filter-container {
		flex-direction: column;
		align-items: stretch;
		gap: 16px;
	}

	.filter-group {
		flex-direction: column;
		gap: 12px;
	}

	.filter-item {
		min-width: auto;
	}

	.active-filters {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
}
</style>
