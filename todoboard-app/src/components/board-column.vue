<template>
	<div class="board-column">
		<div
			class="column-header p-3 border-bottom"
			:style="{ backgroundColor: column.color || '#f8f9fa' }"
		>
			<h5 class="mb-0 text-white">
				<span class="me-2">{{ column.icon }}</span>
				{{ column.title }}
				<span class="badge bg-dark bg-opacity-25 ms-2">{{ column.tasks.length }}</span>
			</h5>
		</div>

		<div class="column-content p-2" style="height: calc(100vh - 200px); overflow-y: auto">
			<div v-if="column.tasks.length === 0" class="text-muted text-center py-4">
				No tasks in this column
			</div>
			<task-card v-for="task in column.tasks" :key="task.id" :task="task" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type { BoardColumn } from "@/types/todo";
import TaskCard from "./task-card.vue";

defineProps<{
	column: BoardColumn;
}>();
</script>

<style scoped>
.board-column {
	min-width: 250px;
	max-width: 280px;
	flex: 1;
	background: #f8f9fa;
	border: 1px solid #dee2e6;
	border-radius: 0.375rem;
}

.column-header {
	/* Background color is set via inline style for customization */
}

.column-content {
	background: #ffffff;
}
</style>
