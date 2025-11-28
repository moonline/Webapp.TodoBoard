/**
 * Downloads content as a file using the File System Access API.
 * Prompts the user to choose a location and allows overwriting existing files.
 *
 * @param content - The content to download
 * @param suggestedName - The suggested filename
 * @param mimeType - The MIME type of the file
 * @throws Error if the API is not supported or user cancels
 */
export async function downloadFileWithPicker(
	content: string,
	suggestedName: string,
	mimeType = "text/plain"
): Promise<void> {
	if (!("showSaveFilePicker" in window)) {
		throw new Error("File System Access API is not supported");
	}

	// Determine file extension from suggested name
	const extension = suggestedName.includes(".") ? "." + suggestedName.split(".").pop() : ".txt";

	// Show save file picker dialog
	const handle = await (window as any).showSaveFilePicker({
		suggestedName,
		types: [
			{
				description: "Text Files",
				accept: { [mimeType]: [extension] },
			},
		],
	});

	// Create a writable stream and write the content
	const writable = await handle.createWritable();
	await writable.write(content);
	await writable.close();
}

/**
 * Downloads content as a file using the legacy download method.
 * Automatically downloads without prompting the user.
 *
 * @param content - The content to download
 * @param suggestedName - The suggested filename
 * @param mimeType - The MIME type of the file
 */
export function downloadFileLegacy(
	content: string,
	suggestedName: string,
	mimeType = "text/plain"
): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = suggestedName;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Downloads content as a file using the File System Access API if available,
 * with fallback to traditional download method.
 *
 * @param content - The content to download
 * @param suggestedName - The suggested filename
 * @param mimeType - The MIME type of the file
 */
export async function downloadFile(
	content: string,
	suggestedName: string,
	mimeType = "text/plain"
): Promise<void> {
	try {
		await downloadFileWithPicker(content, suggestedName, mimeType);
	} catch (error) {
		// User cancelled the picker or API not supported
		if ((error as Error).name === "AbortError") {
			// User cancelled, don't download
			return;
		}
		// API not supported or other error, fall back to legacy download
		downloadFileLegacy(content, suggestedName, mimeType);
	}
}
