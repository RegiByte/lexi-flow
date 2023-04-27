import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  GridSelection,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  NodeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import React, { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import { getSelectedNode } from "../../helpers/nodes";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { createPortal } from "react-dom";
import { setFloatingElementPositionForLinkEditor } from "../../helpers/setFloatingElementPositionForLinkEditor";
import { sanitizeUrl } from "../../helpers/url";
import classNames from "classnames";

const FloatingLinkEditor: React.FC<{
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<boolean>;
  anchorElem: HTMLElement;
  inputElementClass?: string;
}> = ({ editor, isLink, setIsLink, anchorElem, inputElementClass = "link-input" }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [editedLinkUrl, setEditedLinkUrl] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [lastSelection, setLastSelection] = useState<RangeSelection | GridSelection | NodeSelection | null>(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
    }

    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect: DOMRect | undefined = nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
      if (domRect) {
        domRect.y += 40;
        setFloatingElementPositionForLinkEditor(domRect, editorElem, anchorElem);
      }
      setLastSelection(selection);
    } else if (!activeElement || !activeElement.classList.contains(inputElementClass)) {
      if (rootElement !== null) {
        setFloatingElementPositionForLinkEditor(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setIsEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [anchorElem, editor, inputElementClass]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  const monitorInputInteraction = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection !== null) {
      if (editedLinkUrl.trim() === "") {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      } else if (linkUrl.trim() !== "") {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));
      }
      setIsEditMode(false);
    }
  };

  return (
    <div
      ref={editorRef}
      className="link-editor flex items-center bg-white px-1 items-center gap-1 absolute
       z-10 opacity-0 shadow-md rounded-md transition-opacity will-change-transform bg-slate-200">
      {!isLink ? null : isEditMode ? (
        <div className="link-editor-input-area flex items-center">
          <input
            type="text"
            className={classNames(inputElementClass, "inline-block border rounded bg-neutral-200 px-1")}
            placeholder="Type your link here..."
            value={editedLinkUrl}
            onChange={(event) => {
              setEditedLinkUrl(event.target.value);
            }}
            onKeyDown={(event) => {
              monitorInputInteraction(event);
            }}
          />
          <div className="flex gap-1 items-center">
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setIsEditMode(false);
              }}
              onMouseDown={(event) => event.preventDefault()}
              className="link-cancel bg-red-300 rounded px-2 py-1">
              Cancel
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={handleLinkSubmission}
              onMouseDown={(event) => event.preventDefault()}
              className="link-cancel  bg-green-300 rounded px-2 py-1">
              Confirm
            </div>
          </div>
        </div>
      ) : (
        <div className="link-view flex items-center gap-2">
          <div className="link-scroller min-w-[200px] max-w-[250px] h-full overflow-x-auto py-2">
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline whitespace-nowrap snap-x">
              {linkUrl}
            </a>
          </div>
          <div
            className="link-edit bg-green-300 rounded px-2 py-1"
            role="button"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setEditedLinkUrl(linkUrl);
              setIsEditMode(true);
            }}>
            Edit
          </div>
          <div
            className="link-trash bg-red-300 rounded px-2 py-1"
            role="button"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            }}>
            Remove Link
          </div>
        </div>
      )}
    </div>
  );
};

function useFloatingLinkEditorToolbar(editor: LexicalEditor, anchorElement: HTMLElement) {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

      // We don't want this menu to open for auto links.
      const isSelectedLink = linkParent != null && autoLinkParent == null;
      setIsLink(isSelectedLink);
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, updateToolbar]);

  return createPortal(
    <FloatingLinkEditor editor={activeEditor} isLink={isLink} anchorElem={anchorElement} setIsLink={setIsLink} />,
    anchorElement,
  );
}

export default function FloatingLinkEditorPlugin({ anchorElem = document.body }: { anchorElem?: HTMLElement }) {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(editor, anchorElem);
}
