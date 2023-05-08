import React, { useCallback, useMemo } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorTheme } from "../../core/components/Editor/theme";
import * as Toolbar from "@radix-ui/react-toolbar";
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
  MdGraphicEq,
} from "react-icons/all";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import useTextFormattingStates, {
  ActiveTextFormattingStatesList,
} from "../../core/primitives/hooks/useTextFormattingStates";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { BoldIcon, ItalicIcon, QuoteIcon, SubScriptIcon, SuperScriptIcon } from "./icons";
import { $setBlocksType } from "@lexical/selection";
import { $createQuoteNode } from "@lexical/rich-text";
import { CLOSE_FLOATING_TOOLBAR_COMMAND } from "../../core/primitives/plugins/FloatingToolbar/commands";
import { INSERT_EXCALIDRAW_COMMAND } from "../../core/plugins/Excalidraw/ExcalidrawPlugin";

export const MediumToolbar = () => {
  const [editor, context] = useLexicalComposerContext();
  const theme = context.getTheme() as EditorTheme;
  const [activeTextFormattingStates, activeStatesList] = useTextFormattingStates(editor);
  const { isCode, isLink, isStrikethrough, isSubscript, isSuperscript, isItalic, isUnderline, isBold } =
    activeTextFormattingStates;

  const handleChangeFormattingState = useCallback(
    (value: string[]) => {
      const newFormattingStates = value as ActiveTextFormattingStatesList;
      const formattingStatesToRemove = activeStatesList.filter((state) => !newFormattingStates.includes(state));
      const formattingStatesToAdd = newFormattingStates.filter((state) => !activeStatesList.includes(state));

      formattingStatesToRemove.forEach((state) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, state);
      });

      formattingStatesToAdd.forEach((state) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, state);
      });
    },
    [activeStatesList],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
    editor.dispatchCommand(CLOSE_FLOATING_TOOLBAR_COMMAND, null);
  }, [editor, isLink]);

  const insertExcalidraw = useCallback(() => {
    editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined);
  }, [editor]);

  const insertBlockquote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }, [editor]);

  const itemClassName = classNames(
    `border-0 inline-flex items-center justify-center rounded-lg relative
     h-[28px] w-[28px] outline-[rgba(255,255,255,0.5)] cursor-pointer align-middle text-white data-[state=on]:text-medium-green`,
    {},
  );
  return (
    <Toolbar.Root
      className={`relative flex items-center px-3 bg-gradient-to-b h-[44px] from-[rgba(49,49,47,.99)] to-[#262625] py-1 gap-1
       z-10 shadow-md rounded-md transition-opacity will-change-transform bg-slate-200`}>
      <Toolbar.ToggleGroup
        onValueChange={handleChangeFormattingState}
        value={activeStatesList}
        type={"multiple"}
        className="flex items-center gap-1.5">
        <Toolbar.ToggleItem value={"bold"} className={classNames(itemClassName)} aria-label="Format text as bold">
          <BoldIcon className="fill-current" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value={"italic"}
          className={classNames(itemClassName, { "bg-gray-700/30": isItalic })}
          aria-label="Format text as italics">
          <ItalicIcon className="fill-current" />
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
        <Toolbar.Separator className="w-[1px] h-[20px] bg-neutral-300 mx-[5px]" />
        <Toolbar.Button
          onClick={insertBlockquote}
          className={classNames(itemClassName, { "bg-gray-700/30": isLink })}
          aria-label="Insert link">
          <QuoteIcon className="fill-current" />
        </Toolbar.Button>
        <Toolbar.ToggleItem
          value={"subscript"}
          className={classNames(itemClassName, { "bg-gray-700/30": isSubscript })}
          title="Subscript"
          aria-label="Format Subscript">
          <SubScriptIcon className=" fill-current" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value={"superscript"}
          className={classNames(itemClassName, { "bg-gray-700/30": isSuperscript })}
          title="Superscript"
          aria-label="Format Superscript">
          <SuperScriptIcon className="fill-current" />
        </Toolbar.ToggleItem>
        <Toolbar.Separator className="w-[1px] h-[20px] bg-neutral-300 mx-[5px]" />
        <Toolbar.ToggleItem
          value={"code"}
          defaultChecked={isCode}
          className={classNames(itemClassName, { "bg-gray-700/30": isCode })}
          aria-label="Insert code block">
          <i className="format code" />
          <BsCode className="w-6 h-6" />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
      <Toolbar.Button
        onClick={insertLink}
        className={classNames(itemClassName, { "bg-gray-700/30": isLink })}
        aria-label="Insert link">
        <BsLink className="w-6 h-6" />
      </Toolbar.Button>
      <Toolbar.Button
        onClick={insertExcalidraw}
        className={classNames(itemClassName, { "bg-gray-700/30": isLink })}
        aria-label="Insert Excalidraw">
        <MdGraphicEq className="w-6 h-6" />
      </Toolbar.Button>
    </Toolbar.Root>
  );
};
