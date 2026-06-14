import { useState, useEffect, useCallback } from "react";

let toastId = 0;
let addToastGlobal = null;

export function toast(msg, type = "info") {
  if (addToastGlobal) addToastGlobal(msg, type);
}

export default function ToastContainer() {
  const [items, setItems] = useState([]);

  const add = useCallback((msg, type) => {
    const id = ++toastId;
    setItems((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastGlobal = add;
    return () => { addToastGlobal = null; };
  }, [add]);

  if (items.length === 0) return null;

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={`${colors[t.type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm animate-slide-in`}
          role="alert"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
