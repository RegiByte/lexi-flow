import React, { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  NodeKey,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import { $getSelectionStyleValueForProperty, $isParentElementRTL, $patchStyleText } from "@lexical/selection";
import { getSelectedNode } from "../../helpers/nodes";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isTableNode } from "@lexical/table";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $isCodeNode, CODE_LANGUAGE_MAP } from "@lexical/code";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { sanitizeUrl } from "../../helpers/url";
import classNames from "classnames";
import { prefixClassNames } from "../../helpers/strings";
import { EditorTheme } from "../../components/Editor/theme";
import * as Popover from "@radix-ui/react-popover";
import { ColorListDropdown } from "../../components/ColorListDropdown";
import { defaultColorItems } from "../../defaults/colors";
import { ColorPicker } from "../../components/icons/ColorPicker";
import { CheckIcon, ChevronRightIcon, DotFilledIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CgBrush, CgRedo, CgUndo, SlActionRedo, SlActionUndo } from "react-icons/all";
import { ToolbarButton } from "./ToolbarButton";

const rootTypeToRootName = {
  root: "Root",
  table: "Table",
};

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  number: "Numbered List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  paragraph: "Normal",
  quote: "Quote",
};

const ToolbarPlugin = () => {
  const [editor, editorContext] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState<boolean>(() => editor.isEditable());
  const [activeEditor, setActiveEditor] = useState(editor);
  const theme = editorContext.getTheme() as EditorTheme;
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
  const [rootType, setRootType] = useState<keyof typeof rootTypeToRootName>("root");
  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>("paragraph");

  /** Selection format state */
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [isStrikethrough, setIsStrikethrough] = useState<boolean>(false);
  const [isCode, setIsCode] = useState<boolean>(false);
  const [isLink, setIsLink] = useState<boolean>(false);
  const [isRTL, setIsRTL] = useState<boolean>(false);
  const [codeLanguage, setCodeLanguage] = useState<string>("plaintext");

  /** Selection style state */
  const [fontSize, setFontSize] = useState<string>("15px");
  const [fontColor, setFontColor] = useState<string>("#000000");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [bgColor, setBgColor] = useState<string>("#ffffff");

  /** Selection actions state */
  const [isSuperscript, setIsSuperscript] = useState<boolean>(false);
  const [isSubscript, setIsSubscript] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDom = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsSubscript(selection.hasFormat("subscript"));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      // Update tables
      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType("table");
      } else {
        setRootType("root");
      }

      // Update block type and code language
      if (elementDom !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language = element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(language ? CODE_LANGUAGE_MAP[language] || language : "plaintext");
          }
        }
      }

      // Handle buttons
      setBgColor($getSelectionStyleValueForProperty(selection, "background-color", "#ffffff"));
      setFontColor($getSelectionStyleValueForProperty(selection, "color", "#000000"));
      setFontSize($getSelectionStyleValueForProperty(selection, "font-size", "15px"));
      setFontFamily($getSelectionStyleValueForProperty(selection, "font-family", "Arial"));
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();

        // If there is nothing selected we simply stop here
        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        // We remove all the formats from the selection
        nodes.forEach((node, idx) => {
          if ($isTextNode(node)) {
            if (idx === 0 && anchor.offset !== 0) {
              node = node.splitText(anchor.offset)[1] || node;
            }
            if (idx === nodes.length - 1) {
              node = node.splitText(focus.offset)[0] || node;
            }

            if (node.__style !== "") {
              node.setStyle("");
            }
            if (node.__format !== 0) {
              node.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(node).setFormat("");
            }
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat("");
          }
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ color: value });
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ "background-color": value });
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const undo = useCallback(() => {
    activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [activeEditor]);

  const redo = useCallback(() => {
    activeEditor.dispatchCommand(REDO_COMMAND, undefined);
  }, []);

  const [bookmarksChecked, setBookmarksChecked] = React.useState(true);
  const [urlsChecked, setUrlsChecked] = React.useState(false);
  const [person, setPerson] = React.useState("pedro");

  const toolbarClassNames = classNames(
    prefixClassNames("toolbar-container", theme.prefix!),
    theme?.toolbar?.container ?? "",
  );

  return (
    <div className={toolbarClassNames}>
      <ToolbarButton onClick={undo} title="Undo" className={"disabled:bg-slate-300"} disabled={!canUndo}>
        <CgUndo />
      </ToolbarButton>
      <ToolbarButton onClick={redo} title="Redo" className={"disabled:bg-neutral-200"} disabled={!canRedo}>
        <CgRedo />
      </ToolbarButton>
      <ToolbarButton title="Clear Formatting" onClick={clearFormatting} className="disabled:bg-neutral-200 bg-blue-300 rounded px-2 py-1">
        <CgBrush/>
      </ToolbarButton>
      <ColorListDropdown
        colors={defaultColorItems}
        onSelect={(color) => onFontColorSelect(color)}
        label={"Text Color"}
        icon={<ColorPicker className="h-5 w-5" />}
      />
    </div>
  );
};

export default ToolbarPlugin;
