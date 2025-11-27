import { provide, inject, ref, type InjectionKey, type Ref } from "vue";

export type ActiveTab = "board" | "settings";

export interface UIState {
	activeTab: Readonly<Ref<ActiveTab>>;
	isFilterCollapsed: Readonly<Ref<boolean>>;
}

export interface UIActions {
	setActiveTab: (tab: ActiveTab) => void;
	toggleFilterCollapse: () => void;
	setFilterCollapsed: (collapsed: boolean) => void;
}

export interface UIContext extends UIState, UIActions {}

const UISymbol: InjectionKey<UIContext> = Symbol("ui");

/**
 * Provider composable - Use this in the root component (App.vue)
 */
export function provideUI() {
	// Tab State
	const activeTab = ref<ActiveTab>("board");

	// UI State
	const isFilterCollapsed = ref(true);

	// Tab Actions
	function setActiveTab(tab: ActiveTab): void {
		activeTab.value = tab;
	}

	// UI Actions
	function toggleFilterCollapse(): void {
		isFilterCollapsed.value = !isFilterCollapsed.value;
	}

	function setFilterCollapsed(collapsed: boolean): void {
		isFilterCollapsed.value = collapsed;
	}

	const context: UIContext = {
		// State - consumers should use actions to mutate, not direct assignment
		activeTab: activeTab as Readonly<Ref<ActiveTab>>,
		isFilterCollapsed: isFilterCollapsed as Readonly<Ref<boolean>>,
		// Actions
		setActiveTab,
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
