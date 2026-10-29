"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface FilePreviewState {
  file: File | null;
  count: number;
  multiple: boolean;
}

interface FilePreviewContextValue extends FilePreviewState {
  registerFile: (file: File | null, count: number, multiple: boolean) => void;
  setOpenPicker: (open: (() => void) | null) => void;
  openPicker: () => void;
}

const FilePreviewContext = createContext<FilePreviewContextValue | null>(null);

/** Read the shared selected-file preview state, or null outside the tool shell. */
export function useFilePreview(): FilePreviewContextValue | null {
  return useContext(FilePreviewContext);
}

export function FilePreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FilePreviewState>({
    file: null,
    count: 0,
    multiple: false,
  });
  const pickerRef = useRef<(() => void) | null>(null);

  const registerFile = useCallback(
    (file: File | null, count: number, multiple: boolean) => {
      setState((current) => {
        if (
          current.file === file &&
          current.count === count &&
          current.multiple === multiple
        ) {
          return current;
        }
        return { file, count, multiple };
      });
    },
    [],
  );

  const setOpenPicker = useCallback((open: (() => void) | null) => {
    pickerRef.current = open;
  }, []);

  const openPicker = useCallback(() => {
    pickerRef.current?.();
  }, []);

  const value = useMemo(
    () => ({ ...state, registerFile, setOpenPicker, openPicker }),
    [state, registerFile, setOpenPicker, openPicker],
  );

  return (
    <FilePreviewContext.Provider value={value}>
      {children}
    </FilePreviewContext.Provider>
  );
}
