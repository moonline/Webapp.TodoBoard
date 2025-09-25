<template>
	<div class="board-column">
		<div class="column-header p-3 bg-light border-bottom">
			<h5 class="mb-0">
				<span class="me-2">{{ column.icon }}</span>
				{{ column.title }}
				<span class="badge bg-secondary ms-2">{{ column.tasks.length }}</span>
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
import TaskCard from "./TaskCard.vue";

defineProps<{
	column: BoardColumn;
}>();
</script>

<style scoped>
.board-column {
	min-width: 300px;
	background: #f8f9fa;
	border: 1px solid #dee2e6;
	border-radius: 0.375rem;
}

.column-header {
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.column-content {
	background: #ffffff;
}
</style>
