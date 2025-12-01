<template>
	<div
		v-if="isOpen"
		class="modal fade show d-block"
		tabindex="-1"
		role="dialog"
		style="background-color: rgba(0, 0, 0, 0.5)"
		@click.self="handleCancel"
	>
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title d-flex align-items-center fw-semibold">
						<i :class="iconClass" style="font-size: 1.25rem"></i>
						{{ title }}
					</h5>
					<button
						type="button"
						class="btn-close"
						aria-label="Close"
						@click="handleCancel"
					></button>
				</div>
				<div class="modal-body">
					<p class="mb-0">{{ message }}</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" @click="handleCancel">
						{{ cancelText }}
					</button>
					<button type="button" :class="confirmButtonClass" @click="handleConfirm">
						{{ confirmText }}
					</button>
				</div>
			</div>
		</div>
	</div>
	<div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		isOpen: boolean;
		title?: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		variant?: "danger" | "warning" | "primary";
	}>(),
	{
		title: "Confirm Action",
		confirmText: "Confirm",
		cancelText: "Cancel",
		variant: "primary",
	}
);

const emit = defineEmits<{
	confirm: [];
	cancel: [];
}>();

const iconClass = computed(() => {
	switch (props.variant) {
		case "danger":
			return "bi bi-exclamation-triangle-fill text-danger me-2";
		case "warning":
			return "bi bi-exclamation-circle-fill text-warning me-2";
		default:
			return "bi bi-question-circle-fill text-primary me-2";
	}
});

const confirmButtonClass = computed(() => {
	return `btn btn-${props.variant}`;
});

function handleConfirm(): void {
	emit("confirm");
}

function handleCancel(): void {
	emit("cancel");
}
</script>
