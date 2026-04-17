import type { AggregationMetric, TodoTask, AggregationMethod } from "../types/todo";

export interface MetricResult {
	id: string;
	name: string;
	value: number | null;
	formattedValue: string;
}

/**
 * Calculate a single aggregation metric for a list of tasks
 */
export function calculateMetric(metric: AggregationMetric, tasks: TodoTask[]): MetricResult {
	// For count method, count all tag occurrences (numeric or not)
	// For other methods, only extract numeric values
	const values =
		metric.method === "count"
			? extractAllTagValues(tasks, metric.tag)
			: extractNumericValues(tasks, metric.tag);
	const value = aggregateValues(values, metric.method);

	return {
		id: metric.id,
		name: metric.name,
		value,
		formattedValue: formatMetricValue(value, metric.method),
	};
}

/**
 * Calculate all metrics for a list of tasks
 */
export function calculateMetrics(metrics: AggregationMetric[], tasks: TodoTask[]): MetricResult[] {
	return metrics.map((metric) => calculateMetric(metric, tasks));
}

/**
 * Extract all tag values (for counting, regardless of whether they're numeric)
 */
function extractAllTagValues(tasks: TodoTask[], tagKey: string): number[] {
	const values: number[] = [];

	for (const task of tasks) {
		const tagValue = task.tags[tagKey];
		if (tagValue !== undefined) {
			// For count, we just need to track that the tag exists
			// The actual value doesn't matter, we use 1 as a placeholder
			values.push(1);
		}
	}

	return values;
}

/**
 * Extract numeric values from task tags
 */
function extractNumericValues(tasks: TodoTask[], tagKey: string): number[] {
	const values: number[] = [];

	for (const task of tasks) {
		const tagValue = task.tags[tagKey];
		if (tagValue !== undefined) {
			const numValue = parseFloat(tagValue);
			if (!isNaN(numValue)) {
				values.push(numValue);
			}
		}
	}

	return values;
}

/**
 * Aggregate values using the specified method
 */
function aggregateValues(values: number[], method: AggregationMethod): number | null {
	if (values.length === 0) {
		return null;
	}

	switch (method) {
		case "sum":
			return values.reduce((sum, val) => sum + val, 0);

		case "count":
			return values.length;

		case "average":
			return values.reduce((sum, val) => sum + val, 0) / values.length;

		case "median":
			const sorted = [...values].sort((a, b) => a - b);
			const mid = Math.floor(sorted.length / 2);
			if (sorted.length % 2 === 0) {
				return (sorted[mid - 1] + sorted[mid]) / 2;
			} else {
				return sorted[mid];
			}

		case "min":
			return Math.min(...values);

		case "max":
			return Math.max(...values);

		default:
			return null;
	}
}

/**
 * Format metric value for display
 */
function formatMetricValue(value: number | null, method: AggregationMethod): string {
	if (value === null) {
		return "-";
	}

	// For count, always show as integer
	if (method === "count") {
		return value.toString();
	}

	// For other methods, show up to 2 decimal places
	if (Number.isInteger(value)) {
		return value.toString();
	}

	return value.toFixed(2);
}
