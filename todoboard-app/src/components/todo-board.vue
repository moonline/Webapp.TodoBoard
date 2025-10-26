<template>
	<div class="board-container flex-grow-1 overflow-auto">
		<div v-if="columns.length === 0" class="empty-board-state">
			<div class="empty-content">
				<div class="empty-icon">📋</div>
				<h3 class="empty-title">No tasks loaded</h3>
				<p class="empty-description">
					Upload a todo.txt file to get started, or create some sample tasks to see how it
					works
				</p>
				<button @click="$emit('create-sample-tasks')" class="sample-tasks-button">
					<i class="bi bi-plus-circle"></i>
					Create Sample Tasks
				</button>
			</div>
		</div>

		<div v-else class="board">
			<BoardColumnComponent v-for="column in columns" :key="column.id" :column="column" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type { BoardColumn } from "@/types/todo";
import BoardColumnComponent from "./board-column.vue";

defineProps<{
	columns: BoardColumn[];
}>();

defineEmits<{
	"create-sample-tasks": [];
}>();
</script>

<style scoped>
.board-container {
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	position: relative;
}

.board {
	display: flex;
	flex-wrap: nowrap;
	overflow-x: auto;
	min-height: 100%;
	gap: 20px;
	padding: 20px;
	scrollbar-width: thin;
	scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.board::-webkit-scrollbar {
	height: 8px;
}

.board::-webkit-scrollbar-track {
	background: transparent;
}

.board::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.3);
	border-radius: 4px;
}

.board::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.4);
}

/* Empty State */
.empty-board-state {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 60vh;
	padding: 40px;
}

.empty-content {
	text-align: center;
	max-width: 400px;
}

.empty-icon {
	font-size: 64px;
	margin-bottom: 24px;
	opacity: 0.6;
}

.empty-title {
	color: #495057;
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 12px;
}

.empty-description {
	color: #6c757d;
	font-size: 16px;
	line-height: 1.5;
	margin-bottom: 32px;
}

.sample-tasks-button {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 12px 24px;
	background: #198754;
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
}

.sample-tasks-button:hover {
	background: #157347;
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(25, 135, 84, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.empty-title {
		font-size: 20px;
	}

	.empty-description {
		font-size: 14px;
		margin-bottom: 24px;
	}
}
</style>
