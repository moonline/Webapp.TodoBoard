<template>
	<div class="filter-bar bg-light p-3 border-bottom">
		<div class="row g-2 align-items-center">
			<div class="col-md-3">
				<label class="form-label small">Project:</label>
				<select
					v-model="localFilter.projects[0]"
					class="form-select form-select-sm"
					@change="updateFilter"
				>
					<option value="">All Projects</option>
					<option v-for="project in availableProjects" :key="project" :value="project">
						+{{ project }}
					</option>
				</select>
			</div>

			<div class="col-md-3">
				<label class="form-label small">Context:</label>
				<select
					v-model="localFilter.contexts[0]"
					class="form-select form-select-sm"
					@change="updateFilter"
				>
					<option value="">All Contexts</option>
					<option v-for="context in availableContexts" :key="context" :value="context">
						@{{ context }}
					</option>
				</select>
			</div>

			<div class="col-md-3">
				<label class="form-label small">Tag:</label>
				<select
					v-model="selectedTagKey"
					class="form-select form-select-sm"
					@change="updateFilter"
				>
					<option value="">Select Tag</option>
					<option v-for="tag in availableTags" :key="tag" :value="tag">
						{{ tag }}
					</option>
				</select>
			</div>

			<div class="col-md-3">
				<button @click="clearFilters" class="btn btn-outline-secondary btn-sm">
					Clear Filters
				</button>
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

function updateFilter(): void {
	emit("update:filter", { ...localFilter.value });
}

function clearFilters(): void {
	localFilter.value = { projects: [], contexts: [], tags: {} };
	selectedTagKey.value = "";
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
