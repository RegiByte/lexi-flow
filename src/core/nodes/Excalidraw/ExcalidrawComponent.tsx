import React, { DragEventHandler, useCallback, useEffect, useMemo, useRef } from "react";
import {
  $createParagraphNode,
  $createRangeSelection,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection, $isRangeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGEND_COMMAND,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  $createExcalidrawNode,
  $isExcalidrawNode,
  ExcalidrawNode,
  getExcalidrawNodeInSelection, getExcalidrawNodesInSelection,
  SerializedExcalidrawNode
} from "./ExcalidrawNode";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";
import ExcalidrawModal, { ExcalidrawElementFragment } from "./ExcalidrawModal";
import ImageResizer from "../../ui/ImageResizer";
import ExcalidrawImage from "./ExcalidrawImage";
import classNames from "classnames";

export const ExcalidrawComponent: React.FC<{
  nodeKey: NodeKey;
  data: string;
  width: number | null;
  height: number | null;
}> = ({ nodeKey, data, height, width }) => {
  const [editor] = useLexicalComposerContext();
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(data === "[]" && editor.isEditable());
  const imageContainerRef = React.useRef<HTMLImageElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const captionButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = React.useState<boolean>(false);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isExcalidrawNode(node)) {
            node.remove();
          }
          setSelected(false);
        });
      }
      return false;
    },
    [editor, isSelected, nodeKey, setSelected],
  );

  // Set editor to readOnly if excalidraw is open to prevent unwanted changes
  useEffect(() => {
    editor.setEditable(!isModalOpen);
  }, [isModalOpen, editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const buttonElem = buttonRef.current;
          const eventTarget = event.target;

          if (isResizing) {
            return true;
          }

          if (buttonElem !== null && buttonElem.contains(eventTarget as Node)) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            if (event.detail > 1) {
              setIsModalOpen(true);
            }
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
    );
  }, [buttonRef, clearSelection, editor, isResizing, isSelected, nodeKey, onDelete, setSelected]);

  const deleteNode = useCallback(() => {
    setIsModalOpen(false);
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  const setData = (els: ReadonlyArray<ExcalidrawElementFragment>, aps: Partial<AppState>, fls: BinaryFiles) => {
    if (!editor.isEditable()) {
      return;
    }
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        if (els.length > 0 || Object.keys(fls).length > 0) {
          node.setData(
            JSON.stringify({
              appState: aps,
              elements: els,
              files: fls,
            }),
          );
        } else {
          node.remove();
        }
      }
    });
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeEnd = (width: number | "inherit", height: number | "inherit") => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false);
    }, 200);

    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        node.setDimensions(width === "inherit" ? null : width, height === "inherit" ? null : height);
      }
    });
  };

  const {
    elements = [],
    files = {},
    appState = {},
  } = useMemo(() => {
    return JSON.parse(data);
  }, [data]);

  const isFocused = isSelected || isResizing || isDragging;
  const isDraggable = !isResizing && editor.isEditable();
  console.log({ isSelected });

  let onDragStart = (e: React.DragEvent) => {
    console.log("drag start")
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      console.log(selection, $isRangeSelection(selection), $isNodeSelection(selection))
      if (!$isNodeSelection(selection)) {
        return
      }
      const excalidrawNodes = getExcalidrawNodesInSelection(selection)
      console.log({
        excalidrawNodes
      })

      const dataTransfer = e.dataTransfer;
      if (!dataTransfer) {
        return;
      }
      dataTransfer.setData("text/plain", " ");
      dataTransfer.setDragImage(imageContainerRef.current as Element, 0, 0);
      dataTransfer.setData(
        "application/x-lexical-drag",
        JSON.stringify([
        ...excalidrawNodes.map(node => ({
            nodeKey: node.getKey(),
            type: ExcalidrawNode.getType(),
          }))
        ]),
      );
    })

    // e.dataTransfer!.dropEffect = "move";
  };
  return (
    <>
      <ExcalidrawModal
        initialElements={elements}
        initialFiles={files}
        initialAppState={appState}
        isShown={isModalOpen}
        onDelete={deleteNode}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSave={(els, aps, fls) => {
          editor.setEditable(true);
          setData(els, aps, fls);
          setIsModalOpen(false);
        }}
        closeOnClickOutside={false}
      />
      {elements.length > 0 && (
        <button
          tabIndex={-1}
          draggable={isDraggable}
          ref={buttonRef}
          onDragStart={onDragStart}
          className={classNames(`excalidraw-button relative`, {
            "selected": isSelected,
            "ring-2 ring-sky-500": isFocused || isSelected,
          })}>
          <ExcalidrawImage
            imageContainerRef={imageContainerRef}
            className="image"
            width={width}
            height={height}
            elements={elements}
            files={files}
            appState={appState}
          />
          {(isSelected || isResizing) && !isDragging && (
            <ImageResizer
              buttonRef={captionButtonRef}
              showCaption={true}
              setShowCaption={() => null}
              imageRef={imageContainerRef}
              editor={editor}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
              captionsEnabled={true}
            />
          )}
        </button>
      )}
    </>
  );
};

export default ExcalidrawComponent;
