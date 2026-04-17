<template>
	<div class="app">
		<div class="container-fluid p-0">
			<router-view />
		</div>
	</div>
</template>

<script setup lang="ts"></script>

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
