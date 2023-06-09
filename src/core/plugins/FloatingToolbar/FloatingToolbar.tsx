/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getDOMRangeRect } from "../../helpers/getDOMRangeRect";
import { setFloatingElementPosition } from "../../helpers/setFloatingElementPosition";
import { getSelectedNode } from "../../helpers/nodes";
import classNames from "classnames";
import {
  BsCode,
  BsLink,
  BsSubscript,
  BsSuperscript,
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaUnderline,
} from "react-icons/all";
import { $isHeadingNode } from "@lexical/rich-text";
import * as Toolbar from "@radix-ui/react-toolbar";

type TextFormattingState = "bold" | "italic" | "underline" | "superscript" | "subscript" | "strikethrough" | "code";

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const movementThreshold = 5; // Set a threshold for minimum movement in pixels

  let initialPosition = { x: 0, y: 0 };

  function mouseDownListener(e: MouseEvent) {
    initialPosition = { x: e.clientX, y: e.clientY };
  }

  function mouseMoveListener(e: MouseEvent) {
    if (popupCharStylesEditorRef?.current && (e.buttons === 1 || e.buttons === 3)) {
      const distanceMoved = Math.sqrt(
        Math.pow(e.clientX - initialPosition.x, 2) + Math.pow(e.clientY - initialPosition.y, 2),
      );

      if (distanceMoved > movementThreshold) {
        popupCharStylesEditorRef.current.style.pointerEvents = "none";
      }
    }
  }

  function mouseUpListener(e: MouseEvent) {
    if (popupCharStylesEditorRef?.current) {
      popupCharStylesEditorRef.current.style.pointerEvents = "auto";
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener("mousedown", mouseDownListener);
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousedown", mouseDownListener);
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = window.getSelection();

    if (popupCharStylesEditorElem === null) {
      return;
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

      setFloatingElementPosition(rangeRect, popupCharStylesEditorElem, anchorElem);
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateTextFormatFloatingToolbar();
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
  }, [editor, updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateTextFormatFloatingToolbar]);

  const textFormattingStates = useMemo<TextFormattingState[]>(() => {
    return [
      isBold && "bold",
      isItalic && "italic",
      isUnderline && "underline",
      isSuperscript && "superscript",
      isSubscript && "subscript",
      isStrikethrough && "strikethrough",
      isCode && "code",
    ].filter(Boolean) as TextFormattingState[];
  }, [editor, isBold, isItalic, isUnderline, isCode, isStrikethrough, isSubscript, isSuperscript]);

  const handleChangeFormattingState = useCallback(
    (value: string[]) => {
      const newFormattingStates = value as TextFormattingState[];
      const formattingStatesToRemove = textFormattingStates.filter((state) => !newFormattingStates.includes(state));
      const formattingStatesToAdd = newFormattingStates.filter((state) => !textFormattingStates.includes(state));

      formattingStatesToRemove.forEach((state) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, state);
      });

      formattingStatesToAdd.forEach((state) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, state);
      });
    },
    [textFormattingStates],
  );

  const itemClassName = classNames(
    `border-0 inline-flex items-center justify-center bg-white rounded-lg relative
    h-[32px] w-[32px] p-2 cursor-pointer align-middle hover:bg-gray-600/300 data-[state=on]:bg-gray-700/30`,
    {},
  );
  return (
    <div
      className={"editor-floating-toolbar absolute top-0 left-0 flex items-center opacity-0"}
      ref={popupCharStylesEditorRef}>
      {editor.isEditable() && !editor.isComposing() && (
        <Toolbar.Root
          className={`floating-text-format-popup flex items-center bg-white px-1 py-1 gap-1
       z-10 shadow-md rounded-md transition-opacity will-change-transform bg-slate-200`}>
          <Toolbar.ToggleGroup
            onValueChange={handleChangeFormattingState}
            value={textFormattingStates}
            type={"multiple"}
            className="flex items-center gap-1.5">
            <Toolbar.ToggleItem
              value={"bold"}
              className={classNames(itemClassName, { "bg-gray-700/30": isBold })}
              aria-label="Format text as bold">
              <FaBold />
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              value={"italic"}
              className={classNames(itemClassName, { "bg-gray-700/30": isItalic })}
              aria-label="Format text as italics">
              <FaItalic />
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              value={"underline"}
              className={classNames(itemClassName, { "bg-gray-700/30": isUnderline })}
              aria-label="Format text to underlined">
              <FaUnderline />
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              value={"strikethrough"}
              className={classNames(itemClassName, { "bg-gray-700/30": isStrikethrough })}
              aria-label="Format text with a strikethrough">
              <FaStrikethrough />
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              value={"subscript"}
              className={classNames(itemClassName, { "bg-gray-700/30": isSubscript })}
              title="Subscript"
              aria-label="Format Subscript">
              <BsSubscript className="w-6 h-6" />
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              value={"superscript"}
              className={classNames(itemClassName, { "bg-gray-700/30": isSuperscript })}
              title="Superscript"
              aria-label="Format Superscript">
              <BsSuperscript className="w-6 h-6" />
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              value={"code"}
              defaultChecked={isCode}
              className={classNames(itemClassName, { "bg-gray-700/30": isCode })}
              aria-label="Insert code block">
              <i className="format code" />
              <BsCode className="w-6 h-6" />
            </Toolbar.ToggleItem>
          </Toolbar.ToggleGroup>
          <Toolbar.Separator className="w-[1px] h-[20px] bg-neutral-300 mx-[5px]" />
          <Toolbar.Button
            onClick={insertLink}
            className={classNames(itemClassName, { "bg-gray-700/30": isLink })}
            aria-label="Insert link">
            <BsLink className="w-6 h-6" />
          </Toolbar.Button>
        </Toolbar.Root>
      )}
    </div>
  );
}

function useFloatingTextFormatToolbar(editor: LexicalEditor, anchorElem: HTMLElement): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateFloatingToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) || rootElement === null || !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== "") {
        setIsText($isTextNode(node) || $isParagraphNode(node) || $isHeadingNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateFloatingToolbar);
    return () => {
      document.removeEventListener("selectionchange", updateFloatingToolbar);
    };
  }, [updateFloatingToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updateFloatingToolbar();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updateFloatingToolbar]);

  if (!isText || isLink) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
    />,
    anchorElem,
  );
}

export default function FloatingToolbarPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem);
}
