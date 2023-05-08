import { AppState, BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import React, { ReactPortal, useCallback, useEffect, useRef, useState } from "react";
import useLayoutEffect from "../../../shared/useLayoutEffect";
import { Excalidraw } from "@excalidraw/excalidraw";
import { createPortal } from "react-dom";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { Cross2Icon, EnterFullScreenIcon, ExitFullScreenIcon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import classNames from "classnames";
import { ZenIcon } from "../../components/icons/ZenIcon";

export type ExcalidrawElementFragment = ExcalidrawElement;

type Props = {
  closeOnClickOutside?: boolean;
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements: ReadonlyArray<ExcalidrawElementFragment>;
  /**
   * The initial set of elements to draw into the scene
   */
  initialAppState: AppState;
  /**
   * The initial set of elements to draw into the scene
   */
  initialFiles: BinaryFiles;
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean;
  /**
   * Callback when closing and discarding the new changes
   */
  onClose: () => void;
  /**
   * Completely remove Excalidraw component
   */
  onDelete: () => void;
  /**
   * Callback when the save button is clicked
   */
  onSave: (elements: ReadonlyArray<ExcalidrawElementFragment>, appState: Partial<AppState>, files: BinaryFiles) => void;
};

export default function ExcalidrawModal({
  closeOnClickOutside = true,
  onSave,
  initialElements,
  initialAppState,
  initialFiles,
  isShown = false,
  onDelete,
  onClose,
}: Props): JSX.Element | null {
  const excalidrawModelRef = useRef<HTMLDivElement | null>(null);
  const excalidrawSceneRef = useRef<ExcalidrawImperativeAPI>(null);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] = useState<ReadonlyArray<ExcalidrawElementFragment>>(initialElements);
  const [files, setFiles] = useState<BinaryFiles>(initialFiles);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((current) => !current);
  }, [setIsFullscreen]);

  const toggleZenMode = useCallback(() => {
    setIsZenMode((current) => {
      return !current;
    });
  }, [setIsZenMode]);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;

    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (excalidrawModelRef.current !== null && !excalidrawModelRef.current?.contains(target) && closeOnClickOutside) {
        onDelete();
      }
    };

    if (excalidrawModelRef.current !== null) {
      modalOverlayElement = excalidrawModelRef.current?.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement?.addEventListener("click", clickOutsideHandler);
      }
    }

    return () => {
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener("click", clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onDelete]);

  const save = () => {
    if (elements.filter((el) => !el.isDeleted).length > 0) {
      const appState = excalidrawSceneRef.current?.getAppState();
      // We only need a subset of the appState
      const partialState: Partial<AppState> = {
        viewBackgroundColor: appState?.viewBackgroundColor,
        theme: appState?.theme,
        gridSize: appState?.gridSize,
        zoom: appState?.zoom,
        exportBackground: appState?.exportBackground,
        exportScale: appState?.exportScale,
        exportWithDarkMode: appState?.theme === "dark" || appState?.exportWithDarkMode,
        isLoading: appState?.isLoading,
        isBindingEnabled: appState?.isBindingEnabled,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
      };

      onSave(elements, partialState, files);
    } else {
      // delete node if the scene is empty
      onDelete();
    }
  };

  const discard = () => {
    if (elements.filter((el) => !el.isDeleted).length === 0) {
      // delete node if the scene is empty
      onDelete();
    } else {
      console.log("opening discard modal");
      setDiscardModalOpen(true);
    }
  };

  const onChange = (els: ReadonlyArray<ExcalidrawElementFragment>, _: AppState, fls: BinaryFiles) => {
    setElements(els);
    setFiles(fls);
  };

  if (!isShown) return null;

  // This is a hacky work-around for Excalidraw + Vite.
  // In DEV, Vite pulls this in fine, in prod it doesn't. It seems
  // like a module resolution issue with ESM vs CJS?
  const _Excalidraw = (Excalidraw.$$typeof != null ? Excalidraw : (Excalidraw as any).default) as typeof Excalidraw;

  console.log({ discardModalOpen });
  return (
    <>
      {discardModalOpen && (
        <DiscardModal
          onDiscard={() => {
            setDiscardModalOpen(false);
            onClose();
          }}
          onCancel={() => setDiscardModalOpen(false)}
          onSave={save}
        />
      )}

      <Dialog.Root
        open={isShown}
        onOpenChange={(open: boolean) => {
          console.log("open", open);
          if (!open) {
            console.log("discard");
            discard();
          }
        }}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/60 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content
            onEscapeKeyDown={discard}
            onInteractOutside={closeOnClickOutside ? discard : undefined}
            className={classNames(
              `data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] w-[90vw] flex flex-col
            max-w-[1600px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white pb-25px px-[25px]
            shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none`,
              {
                "w-[calc(100vw-20px)] max-w-[calc(100vw-20px)] h-[calc(100vh-20px)] max-w-[calc(100vh-20px)]":
                  isFullscreen,
                "w-[calc(85vw)] max-w-[calc(85vw)] h-[calc(80vh)] max-w-[calc(80vh)]": !isFullscreen,
              },
            )}>
            <nav
              className={classNames("flex justify-between items-center", {
                "py-3": !isZenMode,
                "py-0 pb-3": isZenMode,
              })}>
              <Dialog.Title
                className={classNames("text-mauve12 m-0 text-[17px] font-medium", {
                  "hidden": isZenMode,
                })}>
                Edit Excalidraw as you wish
              </Dialog.Title>

              <div
                className={classNames("flex items-center gap-3 z-10", {
                  "absolute top-1 md:top-7 right-3 md:right-36": isZenMode,
                })}>
                <button
                  className={classNames(
                    `
                  inline-flex h-8 w-8 appearance-none items-center justify-center rounded-full
                  focus:shadow-[0_0_0_2px] focus:outline-none border-2`,
                    {
                      "border-indigo-600 text-indigo-600 focus:shadow-violet7": !isZenMode,
                      "bg-slate-300 border-slate-300 text-white focus:shadow-slate-600": isZenMode,
                    },
                  )}
                  onClick={toggleZenMode}>
                  <ZenIcon />
                </button>

                <button
                  className="text-violet11 hover:bg-violet4 focus:shadow-violet7
              inline-flex h-8 w-8 appearance-none items-center justify-center rounded-full
              focus:shadow-[0_0_0_2px] focus:outline-none"
                  onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <ExitFullScreenIcon className="w-5 h-5" />
                  ) : (
                    <EnterFullScreenIcon className="w-5 h-5" />
                  )}
                </button>

                <Dialog.Close asChild>
                  <button
                    className="text-violet11 hover:bg-violet4 focus:shadow-violet7
              inline-flex h-8 w-8 appearance-none items-center justify-center rounded-full
              focus:shadow-[0_0_0_2px] focus:outline-none"
                    aria-label="Close">
                    <Cross2Icon className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
            </nav>
            <div
              className={classNames(`w-100 flex-1`, {
                "flex-1": isFullscreen,
              })}>
              <_Excalidraw
                onChange={onChange}
                ref={excalidrawSceneRef}
                initialData={{
                  appState: initialAppState || { isLoading: false },
                  files: initialFiles,
                  elements: initialElements,
                }}
              />
            </div>
            <div className="mt-[25px] py-3 flex justify-end">
              <Dialog.Close asChild>
                <button
                  onClick={save}
                  className="bg-indigo-600 text-indigo-100 hover:bg-indigo-500 transition-all focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none">
                  Save changes
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

type DiscardModalProps = {
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
};

function DiscardModal({ onCancel, onDiscard, onSave }: DiscardModalProps) {
  console.log("discard modal open");
  return (
    <Dialog.Root
      open={true}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onCancel();
        }
      }}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Confirm Exit</Dialog.Title>
          <Dialog.Description className="text-mauve11 text-center mt-[10px] mb-5 text-[15px] leading-normal">
            Are you sure you want to leave without saving your changes?
          </Dialog.Description>
          <div className="mt-[25px] flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="border-slate-900 border-2 text-slate-900 hover:bg-slate-900 transition-all hover:text-white focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none">
              Cancel
            </button>
            <button
              onClick={onDiscard}
              className="border-red-600 border-2 text-red-500 hover:bg-red-600 transition-all hover:text-white focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none">
              Discard Changes
            </button>
            <Dialog.Close asChild>
              <button
                onClick={onSave}
                className="bg-indigo-600 text-indigo-100 hover:bg-indigo-500 transition-all focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none">
                Save changes
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
              aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
