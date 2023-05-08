import React, { useCallback, useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorTheme } from "../../../components/Editor/theme";
import { createPortal } from "react-dom";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_NORMAL,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { getDOMRangeRect } from "../../../helpers/getDOMRangeRect";
import { setFloatingElementPosition } from "../../../helpers/setFloatingElementPosition";
import { mergeRegister } from "@lexical/utils";
import { useAtomValue } from "jotai";
import { activeTextFormattingStatesAtom } from "../../hooks/useTextFormattingStates";
import { CLOSE_FLOATING_TOOLBAR_COMMAND } from "./commands";

export interface FloatingToolbarPluginProps {
  anchorElem: HTMLElement;
  children: React.ReactNode;
}

const FloatingToolbarContainer = ({
  children,
  theme,
  editor,
  anchorElem,
}: {
  children: React.ReactNode;
  theme: EditorTheme;
  editor: LexicalEditor;
  anchorElem: HTMLElement;
}) => {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const movementThreshold = 6; // Set a threshold for minimum movement in pixels
  let initialPosition = { x: 0, y: 0 };

  function mouseDownListener(e: MouseEvent) {
    initialPosition = { x: e.clientX, y: e.clientY };
  }

  function mouseMoveListener(e: MouseEvent) {
    if (popupRef?.current && (e.buttons === 1 || e.buttons === 3)) {
      const distanceMoved = Math.sqrt(
        Math.pow(e.clientX - initialPosition.x, 2) + Math.pow(e.clientY - initialPosition.y, 2),
      );

      if (distanceMoved > movementThreshold) {
        popupRef.current.style.pointerEvents = "none";
      }
    }
  }

  function mouseUpListener(e: MouseEvent) {
    if (popupRef?.current) {
      popupRef.current.style.pointerEvents = "auto";
    }
  }

  useEffect(() => {
    if (popupRef?.current) {
      document.addEventListener("mousedown", mouseDownListener);
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousedown", mouseDownListener);
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [popupRef]);

  const closeFloatingToolbar = useCallback(() => {
    setFloatingElementPosition(null, popupRef.current!, anchorElem);
  }, []);

  const updateFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupContainerEl = popupRef.current;
    const nativeSelection = window.getSelection();

    if (popupContainerEl === null) {
      return;
    }

    if (!$isRangeSelection(selection)) {
      closeFloatingToolbar();
      return;
    }

    if ($isRangeSelection(selection)) {
      const isCollapsed = selection.isCollapsed();
      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      const textContent = rawTextContent.trim();
      const isTextSelected = textContent.length > 0;

      if (!isTextSelected || isCollapsed) {
        closeFloatingToolbar();
        return;
      }
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElementPosition(rangeRect, popupContainerEl, anchorElem);
    }
  }, [editor, anchorElem, closeFloatingToolbar]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateFloatingToolbar();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [editor, updateFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => updateFloatingToolbar());
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateFloatingToolbar());
      }),

      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          closeFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand(
        CLOSE_FLOATING_TOOLBAR_COMMAND,
        () => {
          console.log("closing floating toolbar");
          closeFloatingToolbar();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    );
  }, [editor, updateFloatingToolbar]);

  return (
    <div ref={popupRef} className={theme?.floatingToolbar?.container}>
      {editor.isEditable() && !editor.isComposing() && <>{children}</>}
    </div>
  );
};

export default function FloatingToolbarPlugin({ anchorElem, children }: FloatingToolbarPluginProps) {
  const [editor, context] = useLexicalComposerContext();
  const theme = context.getTheme() as EditorTheme;

  return createPortal(
    <FloatingToolbarContainer anchorElem={anchorElem} editor={editor} theme={theme}>
      {children}
    </FloatingToolbarContainer>,
    anchorElem,
  );
}
