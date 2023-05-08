import React, { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { createPortal } from "react-dom";
import classNames from "classnames";
import useLayoutEffect from "../../../../shared/useLayoutEffect";
import { EditorTheme } from "../../../components/Editor/theme";

const HORIZONTAL_SPACE = 2;

const $canShowEmptyNodePlaceholder = (isComposing: boolean, isEditable: boolean, mode: PlaceholderMode): boolean => {
  const root = $getRoot();

  // if mode is empty-doc we only return true if the root is empty, or else we return false
  if (mode === "empty-doc") {
    const isEmpty = root.isEmpty() || root.getChildren().every((child) => child.isEmpty());
    return isEmpty && !isComposing && isEditable;
  }

  const children = root.getChildren();
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return false;
  if (!isEditable) return false;
  const anchor = selection.anchor;
  const anchorKey = anchor.key;
  const anchorNode = $getNodeByKey(anchorKey);
  if (!anchorNode) return false;
  const anchorBlockParent = $findMatchingParent(anchorNode, (node) => children.includes(node));

  if ($isElementNode(anchorBlockParent)) {
    return anchorBlockParent.isEmpty() && !isComposing && isEditable;
  }

  return false;
};
const $canShowEmptyNodePlaceholderCurry = (isComposing: boolean, isEditable: boolean, mode: PlaceholderMode) => () =>
  $canShowEmptyNodePlaceholder(isComposing, isEditable, mode);

const canShowPlaceholderFromCurrentEditorState = (editor: LexicalEditor, mode: PlaceholderMode) => {
  return editor
    .getEditorState()
    .read($canShowEmptyNodePlaceholderCurry(editor.isComposing(), editor.isEditable(), mode));
};

const useCanShowPlaceholder = (editor: LexicalEditor, mode: PlaceholderMode): boolean => {
  const [canShowPlaceholder, setCanShowPlaceholder] = useState(() =>
    canShowPlaceholderFromCurrentEditorState(editor, mode),
  );

  useLayoutEffect(() => {
    function resetCanShowPlaceholder() {
      const currentCanShowPlaceholder = canShowPlaceholderFromCurrentEditorState(editor, mode);

      setCanShowPlaceholder(currentCanShowPlaceholder);
    }

    resetCanShowPlaceholder();

    return mergeRegister(
      editor.registerUpdateListener(() => {
        resetCanShowPlaceholder();
      }),
      editor.registerEditableListener(() => {
        resetCanShowPlaceholder();
      }),
    );
  }, [editor]);

  return canShowPlaceholder;
};

const setPlaceholderPosition = (placeholderElem: HTMLElement, targetElem: HTMLElement, anchorElem: HTMLElement) => {
  const targetRect = targetElem.getBoundingClientRect();
  const targetStyle = window.getComputedStyle(targetElem);
  const placeholderStyle = window.getComputedStyle(placeholderElem);
  const anchorRect = anchorElem.getBoundingClientRect();

  const placeholderLineHeight = parseInt(placeholderStyle.lineHeight, 10);
  const targetLineHeight = parseInt(targetStyle.lineHeight, 10);
  const top = targetRect.top + (targetLineHeight - placeholderLineHeight) / 2 - anchorRect.top;
  const left = targetRect.left - anchorRect.left + HORIZONTAL_SPACE;

  placeholderElem.style.transform = `translate(${left}px, ${top}px)`;
};

function usePlaceholderPlugin(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  mode: PlaceholderMode,
  children: React.ReactNode,
  theme: EditorTheme,
) {
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const canShowPlaceholder = useCanShowPlaceholder(editor, mode);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const root = $getRoot();
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            const isCollapsed = selection.isCollapsed();
            if (!isCollapsed) return false;
            const anchor = selection.anchor;
            const anchorKey = anchor.key;
            const anchorNode = $getNodeByKey(anchorKey);
            const focus = selection.focus;
            const focusNode = $getNodeByKey(focus.key);
            if (anchorNode !== focusNode) return false;
            const domElement = editor.getElementByKey(anchorKey) as HTMLElement;
            if (placeholderRef.current) {
              setPlaceholderPosition(placeholderRef.current, domElement, anchorElem);
            }
          }

          return false;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    );
  }, [editor, placeholderRef, anchorElem]);

  return createPortal(
    <div
      ref={placeholderRef}
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        transform: "translate(-10000px, -10000px)",
        pointerEvents: "none",
      }}
      className={classNames(theme?.placeholder?.container, {
        hidden: !canShowPlaceholder,
      })}>
      {children}
    </div>,
    anchorElem,
  );
}

export type PlaceholderMode = "empty-doc" | "empty-block";
export const PlaceholderPlugin: React.FC<{
  anchorElem: HTMLElement;
  mode?: PlaceholderMode;
  children: React.ReactNode;
}> = ({ anchorElem, mode = "empty-block", children }) => {
  const [editor, context] = useLexicalComposerContext();
  const theme = context.getTheme() as EditorTheme;
  return usePlaceholderPlugin(editor, anchorElem, mode, children, theme);
};
