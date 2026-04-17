import { provide, inject, ref, type InjectionKey, type Ref } from "vue";

export type ActiveTab = "board" | "settings";

export interface UIState {
	activeTab: Readonly<Ref<ActiveTab>>;
	isFilterCollapsed: Readonly<Ref<boolean>>;
	isCompactMode: Readonly<Ref<boolean>>;
	activeTaskId: Readonly<Ref<string | null>>;
}

export interface UIActions {
	setActiveTab: (tab: ActiveTab) => void;
	toggleFilterCollapse: () => void;
	setFilterCollapsed: (collapsed: boolean) => void;
	toggleCompactMode: () => void;
	setCompactMode: (compact: boolean) => void;
	setActiveTask: (taskId: string | null) => void;
}

export interface UIContext extends UIState, UIActions {}

const UISymbol: InjectionKey<UIContext> = Symbol("ui");

/**
 * Provider composable - Use this in TodoBoardCore.vue
 */
export const provideUI = (): UIContext => {
	const activeTab = ref<ActiveTab>("board");
	const isFilterCollapsed = ref(true);
	const isCompactMode = ref(false);
	const activeTaskId = ref<string | null>(null);

	const setActiveTab = (tab: ActiveTab): void => {
		activeTab.value = tab;
	};

	const toggleFilterCollapse = (): void => {
		isFilterCollapsed.value = !isFilterCollapsed.value;
	};

	const setFilterCollapsed = (collapsed: boolean): void => {
		isFilterCollapsed.value = collapsed;
	};

	const toggleCompactMode = (): void => {
		isCompactMode.value = !isCompactMode.value;
		if (!isCompactMode.value) {
			activeTaskId.value = null;
		} else {
			// Compact mode enabled
		}
	};

	const setCompactMode = (compact: boolean): void => {
		isCompactMode.value = compact;
		if (!compact) {
			activeTaskId.value = null;
		} else {
			// Compact mode enabled
		}
	};

	const setActiveTask = (taskId: string | null): void => {
		activeTaskId.value = taskId;
	};

	const context: UIContext = {
		activeTab: activeTab as Readonly<Ref<ActiveTab>>,
		isFilterCollapsed: isFilterCollapsed as Readonly<Ref<boolean>>,
		isCompactMode: isCompactMode as Readonly<Ref<boolean>>,
		activeTaskId: activeTaskId as Readonly<Ref<string | null>>,
		setActiveTab,
		toggleFilterCollapse,
		setFilterCollapsed,
		toggleCompactMode,
		setCompactMode,
		setActiveTask,
	};

	provide(UISymbol, context);

	return context;
};

/**
 * Consumer composable - Use this in any component that needs UI state
 */
export const useUI = (): UIContext => {
	const context = inject(UISymbol);

	if (!context) {
		throw new Error("useUI must be used within a component tree that has called provideUI");
	}

	return context;
};
