<template>
	<div class="app">
		<div class="container-fluid p-0">
			<router-view />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { provideTasks } from "@/composables/useTasks";
import { provideUI } from "@/composables/useUI";

// Provide global state to all child components
const tasks = provideTasks("main");
provideUI();

// Load initial data from localStorage
onMounted(() => {
	tasks.loadTasksFromStorage();
	tasks.loadBoardConfigFromStorage();
	tasks.loadFilterFromStorage();
});
</script>

<style scoped>
.app {
	height: 100vh;
	display: flex;
	flex-direction: column;
}

.container-fluid {
	flex: 1;
	overflow: hidden;
}
</style>
