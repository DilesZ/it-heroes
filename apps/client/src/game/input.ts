const keys = new Set<string>();
const pressed = new Set<string>();
const mouseNdc = { x: 0, y: 0 };
const mbuttons = new Set<number>();

const GAME_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "KeyQ",
  "KeyE",
  "KeyR",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Escape",
  "Tab",
]);

let cleanup: (() => void) | null = null;

export function initInput(dom: HTMLElement) {
  if (cleanup) return cleanup;

  const onDown = (e: KeyboardEvent) => {
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    if (!keys.has(e.code)) pressed.add(e.code);
    keys.add(e.code);
  };
  const onUp = (e: KeyboardEvent) => keys.delete(e.code);
  const onBlur = () => {
    keys.clear();
    pressed.clear();
  };
  const onMouseMove = (e: MouseEvent) => {
    const rect = dom.getBoundingClientRect();
    mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };
  const onContextMenu = (e: Event) => e.preventDefault();
  const onMouseDown = (e: MouseEvent) => {
    mbuttons.add(e.button);
    if (e.button !== 0) e.preventDefault();
  };
  const onMouseUp = (e: MouseEvent) => mbuttons.delete(e.button);

  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  window.addEventListener("blur", onBlur);
  dom.addEventListener("mousemove", onMouseMove);
  dom.addEventListener("contextmenu", onContextMenu);
  dom.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);

  cleanup = () => {
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", onBlur);
    dom.removeEventListener("mousemove", onMouseMove);
    dom.removeEventListener("contextmenu", onContextMenu);
    dom.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    cleanup = null;
  };
  return cleanup;
}

export const input = {
  isDown: (code: string) => keys.has(code),
  isMouseDown: (button: number) => mbuttons.has(button),
  consumePress: (code: string) => {
    const had = pressed.has(code);
    pressed.delete(code);
    return had;
  },
  clearPresses: () => pressed.clear(),
  mouseNdc,
};
