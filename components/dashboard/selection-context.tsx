"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type SelectionContextValue = {
  selectMode: boolean;
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggleSelected: (id: string) => void;
  toggleSelectMode: () => void;
  clearSelection: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectMode = useCallback(() => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectMode(false);
  }, []);

  const value = useMemo<SelectionContextValue>(
    () => ({
      selectMode,
      selectedIds: Array.from(selectedIds),
      isSelected: (id: string) => selectedIds.has(id),
      toggleSelected,
      toggleSelectMode,
      clearSelection,
    }),
    [selectMode, selectedIds, toggleSelected, toggleSelectMode, clearSelection],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within a SelectionProvider");
  return ctx;
}
