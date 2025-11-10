import { createContext, useContext, useState, useEffect, useRef } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const didInit = useRef(false);

  // -----------------------------------------
  // Core active view (overview, files, editor, domaincss, etc.)
  // -----------------------------------------
  const [view, setView] = useState(() => {
    try {
      const saved = localStorage.getItem("finaglerView");
      // Never auto-restore editor view
      if (saved === "editor" || saved === "undefined" || !saved) {
        return "overview";
      }
      return saved;
    } catch {
      return "overview";
    }
  });

  // -----------------------------------------
  // File editing context (always ephemeral)
  // -----------------------------------------
  const [activeFile, setActiveFile] = useState(null);

  // -----------------------------------------
  // Ensure we start in a clean state on first mount
  // -----------------------------------------
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      setActiveFile(null);
      // Force out of editor view if localStorage lied
      if (view === "editor" || view === "undefined" || !view) {
        setView("overview");
      }
    }
  }, [view]);

  // -----------------------------------------
  // Persist only safe views
  // -----------------------------------------
  useEffect(() => {
    try {
      if (view !== "editor") {
        localStorage.setItem("finaglerView", view);
      }
    } catch {
      /* ignore */
    }
  }, [view]);

  // -----------------------------------------
  // Clear active file whenever returning to list view
  // -----------------------------------------
  useEffect(() => {
    if (view === "files" && activeFile !== null) {
      setActiveFile(null);
    }
  }, [view]);

  // -----------------------------------------
  // Other UI state
  // -----------------------------------------
  const [overlay, setOverlay] = useState(null);
  const [theme, setTheme] = useState("dark");

  return (
    <UIContext.Provider
      value={{
        view,
        setView,
        activeFile,
        setActiveFile,
        overlay,
        setOverlay,
        theme,
        setTheme,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
