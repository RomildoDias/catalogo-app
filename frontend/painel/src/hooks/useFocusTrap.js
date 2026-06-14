import { useEffect, useRef } from "react";

export default function useFocusTrap(open) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    const el = ref.current;
    if (!el) return;

    const focusable =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const prev = document.activeElement;

    const handler = (e) => {
      if (e.key !== "Tab") return;
      const nodes = el.querySelectorAll(focusable);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    el.addEventListener("keydown", handler);

    const timer = setTimeout(() => {
      const firstFocusable = el.querySelector(focusable);
      if (firstFocusable) firstFocusable.focus();
    }, 50);

    return () => {
      el.removeEventListener("keydown", handler);
      clearTimeout(timer);
      if (prev && prev.focus) prev.focus();
    };
  }, [open]);

  return ref;
}
