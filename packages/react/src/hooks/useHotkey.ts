"use client";

import { useEffect } from "react";

export type HotkeyOptions = {
	enabled?: boolean;
	mod?: boolean;
	allowInEditable?: boolean;
};

export function matchesHotkey(
	event: KeyboardEvent,
	key: string,
	{ mod = false, allowInEditable = false }: HotkeyOptions = {},
) {
	if (
		event.defaultPrevented ||
		event.repeat ||
		event.isComposing ||
		event.altKey ||
		event.shiftKey ||
		event.key.toLowerCase() !== key.toLowerCase() ||
		(mod ? event.metaKey === event.ctrlKey : event.metaKey || event.ctrlKey)
	) {
		return false;
	}

	return (
		allowInEditable ||
		!event
			.composedPath()
			.some(
				(target) =>
					target instanceof HTMLElement &&
					(target.isContentEditable ||
						target.closest('input, textarea, select, [role="textbox"]')),
			)
	);
}

export function useHotkey(
	key: string,
	callback: (event: KeyboardEvent) => void,
	{ enabled = true, mod = false, allowInEditable = false }: HotkeyOptions = {},
) {
	useEffect(() => {
		if (!enabled) return;

		function onKeyDown(event: KeyboardEvent) {
			if (!matchesHotkey(event, key, { mod, allowInEditable })) return;
			event.preventDefault();
			callback(event);
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [key, callback, enabled, mod, allowInEditable]);
}

/* HOW TO USE
useHotkey("d", toggleTheme, { enabled: themeShortcutEnabled });
useHotkey("k", openCommandPalette, { mod: true, allowInEditable: true });

Mount each shortcut once. Bare character shortcuts must be disableable or
remappable. Modifier shortcuts accept either Cmd or Ctrl, never both together.
*/
