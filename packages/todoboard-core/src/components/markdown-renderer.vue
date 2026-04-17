<template>
	<div v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import MarkdownIt from "markdown-it";

const props = defineProps<{
	content: string;
}>();

// Initialize markdown-it instance once (outside computed)
const md = new MarkdownIt({
	html: false, // Disable HTML tags for security
	breaks: true, // Convert \n to <br>
	linkify: true, // Auto-convert URLs to links
	typographer: true, // Enable smart quotes and other typographic replacements
});

const renderedContent = computed(() => {
	if (!props.content) {
		return "";
	}

	// Replace escaped newlines (\\n) with actual newlines for markdown rendering
	const unescaped = props.content.replace(/\\n/g, "\n");
	return md.render(unescaped);
});
</script>
