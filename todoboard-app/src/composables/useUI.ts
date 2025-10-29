import { provide, inject, ref, type InjectionKey, type Ref } from "vue";

export interface UIState {
	showSettings: Readonly<Ref<boolean>>;
	showFileInput: Readonly<Ref<boolean>>;
	isFilterCollapsed: Readonly<Ref<boolean>>;
}

export interface UIActions {
	openSettings: () => void;
	closeSettings: () => void;
	openFileInput: () => void;
	closeFileInput: () => void;
	toggleFilterCollapse: () => void;
	setFilterCollapsed: (collapsed: boolean) => void;
}

export interface UIContext extends UIState, UIActions {}

const UISymbol: InjectionKey<UIContext> = Symbol("ui");

/**
 * Provider composable - Use this in the root component (App.vue)
 */
export function provideUI() {
	// Modal/Dialog State
	const showSettings = ref(false);
	const showFileInput = ref(false);

	// Layout State
	const isFilterCollapsed = ref(false);

	// Modal Actions
	function openSettings(): void {
		showSettings.value = true;
	}

	function closeSettings(): void {
		showSettings.value = false;
	}

	function openFileInput(): void {
		showFileInput.value = true;
	}

	function closeFileInput(): void {
		showFileInput.value = false;
	}

	// Layout Actions
	function toggleFilterCollapse(): void {
		isFilterCollapsed.value = !isFilterCollapsed.value;
	}

	function setFilterCollapsed(collapsed: boolean): void {
		isFilterCollapsed.value = collapsed;
	}

	const context: UIContext = {
		// State - consumers should use actions to mutate, not direct assignment
		showSettings: showSettings as Readonly<Ref<boolean>>,
		showFileInput: showFileInput as Readonly<Ref<boolean>>,
		isFilterCollapsed: isFilterCollapsed as Readonly<Ref<boolean>>,
		// Actions
		openSettings,
		closeSettings,
		openFileInput,
		closeFileInput,
		toggleFilterCollapse,
		setFilterCollapsed,
	};

	provide(UISymbol, context);

	return context;
}

/**
 * Consumer composable - Use this in any component that needs UI state
 */
export function useUI(): UIContext {
	const context = inject(UISymbol);

	if (!context) {
		throw new Error("useUI must be used within a component tree that has called provideUI");
	}

	return context;
}
