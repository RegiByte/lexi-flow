/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $createRangeSelection,
  $getNodeByKey,
  $insertNodes,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  DROP_COMMAND,
  LexicalCommand,
} from "lexical";
import { useEffect } from "react";
import { $createExcalidrawNode, $isExcalidrawNode, ExcalidrawNode } from "../../nodes/Excalidraw/ExcalidrawNode";
import { eventFiles } from "@lexical/rich-text";
import { DRAG_NODE_DATA_FORMAT } from "../../constants/mimeTypes";
import { getDragSelection } from "../../../shared/getDragSelection";

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void> = createCommand("INSERT_EXCALIDRAW_COMMAND");

export default function ExcalidrawPlugin(): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([ExcalidrawNode])) {
      throw new Error("ExcalidrawPlugin: ExcalidrawNode not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_EXCALIDRAW_COMMAND,
        () => {
          const excalidrawNode = $createExcalidrawNode();

          $insertNodes([excalidrawNode]);
          if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
            $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        DROP_COMMAND,
        (event) => {
          const [isFileTransfer] = eventFiles(event);
          if (isFileTransfer || !event.dataTransfer) {
            return false;
          }
          const dragData = event.dataTransfer.getData(DRAG_NODE_DATA_FORMAT);
          if (!dragData) {
            return false;
          }
          const parsedDragData = JSON.parse(dragData);
          if (!Array.isArray(parsedDragData)) {
            return false;
          }

          console.log(parsedDragData);
          let handled = false;
          editor.update(() => {
            for (let dragItem of parsedDragData) {
              const { nodeKey: draggableNodeKey, type } = dragItem;
              console.log("adding element", dragItem, draggableNodeKey, type);
              if (type === ExcalidrawNode.getType() && draggableNodeKey !== undefined) {
                const range = getDragSelection(event);
                const node = $getNodeByKey(draggableNodeKey);
                console.log("node", node, $isExcalidrawNode(node));
                if (!node || !$isExcalidrawNode(node)) {
                  return;
                }
                event.preventDefault();
                const data = node.getData();
                const width = node.getWidth();
                const height = node.getHeight();
                node.remove();
                const rangeSelection = $createRangeSelection();
                if (range !== null && range !== undefined) {
                  rangeSelection.applyDOMRange(range);
                }
                $setSelection(rangeSelection);
                const excalidrawNode = $createExcalidrawNode(data, width, height);
                console.log("inserted node", excalidrawNode);
                $insertNodes([excalidrawNode]);
                if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
                  $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
                }
              }
            }
            handled = true;
          });

          return handled;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor]);

  return null;
}
