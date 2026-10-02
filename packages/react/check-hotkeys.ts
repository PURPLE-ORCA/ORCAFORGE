import assert from "node:assert/strict";
import { matchesHotkey } from "./src/hooks/useHotkey";

class TestElement extends EventTarget {
	constructor(
		readonly isContentEditable = false,
		readonly formControl = false,
	) {
		super();
	}

	closest() {
		return this.formControl ? this : null;
	}
}

Object.defineProperty(globalThis, "HTMLElement", { value: TestElement });

function keydown(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
	return {
		key: "d",
		defaultPrevented: false,
		repeat: false,
		isComposing: false,
		metaKey: false,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		composedPath: () => [new TestElement()],
		...overrides,
	} as KeyboardEvent;
}

// Main path: bare D, Caps Lock, and Cmd/Ctrl+K match their own shortcuts.
assert(matchesHotkey(keydown(), "d"));
assert(matchesHotkey(keydown({ key: "D" }), "d"));
for (const modifier of ["metaKey", "ctrlKey"] as const) {
	assert(
		matchesHotkey(keydown({ key: "k", [modifier]: true }), "k", { mod: true }),
	);
}
assert(
	matchesHotkey(
		keydown({
			key: "k",
			metaKey: true,
			composedPath: () => [new TestElement(false, true)],
		}),
		"k",
		{ mod: true, allowInEditable: true },
	),
);

// Critical failure path: typing and unrelated/handled key events do nothing.
const blockedEvents: Partial<KeyboardEvent>[] = [
	{ key: "k" },
	{ repeat: true },
	{ defaultPrevented: true },
	{ isComposing: true },
	{ metaKey: true },
	{ ctrlKey: true },
	{ altKey: true },
	{ shiftKey: true },
	{ composedPath: () => [new TestElement(true)] },
	{ composedPath: () => [new TestElement(false, true)] },
];
for (const overrides of blockedEvents) {
	assert(!matchesHotkey(keydown(overrides), "d"));
}
assert(!matchesHotkey(keydown({ key: "k" }), "k", { mod: true }));
assert(
	!matchesHotkey(keydown({ key: "k", metaKey: true, ctrlKey: true }), "k", {
		mod: true,
	}),
);

console.log(
	"Hotkey checks passed: matching, modifiers, and typing safeguards.",
);
