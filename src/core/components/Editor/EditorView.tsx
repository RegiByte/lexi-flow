import React from "react";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { Placeholder } from "../Placeholder/placeholder";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import CodeHighlightPlugin from "../../plugins/CodeHightlight/codeHighlight";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import ToolbarPlugin from "../../plugins/Toolbar/toolbar";
import classNames from "classnames";
import { prefixClassNames } from "../../helpers/strings";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useSharedHistoryContext } from "../../context/SharedHistory";
import useViewportWidth from "./hooks/useViewportWidth";
import { LocalDocumentPlugin } from "../../plugins/LocalDocument/LocalDocumentPlugin";
import FloatingToolbarPlugin from "../../plugins/FloatingToolbar/FloatingToolbar";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { autoLinkMatchers } from "../../constants/links";
import FloatingLinkEditorPlugin from "../../plugins/FloatingLinkEditor/FloatingLinkEditor";
import DraggableBlockPlugin from "../../plugins/DraggableBlock/DraggableBlock";

const EditorView: React.FC<{ classPrefix?: string }> = (props) => {
  const { classPrefix = "" } = props;
  const { historyState } = useSharedHistoryContext();
  const [editor, context] = useLexicalComposerContext();
  const theme = context.getTheme();
  const scrollerClasses = classNames(prefixClassNames("editor-scroller", classPrefix), theme?.container?.scroller);
  const viewClasses = classNames(prefixClassNames("editor-view", classPrefix), theme?.container?.view);
  const inputClasses = classNames(prefixClassNames("editor-input", classPrefix), theme?.container?.input);
  const [viewAnchorElement, setViewAnchorElement] = React.useState<HTMLDivElement | null>(null);
  const [isSmallViewportWidth, viewportWidth] = useViewportWidth(400);

  const onViewRef = (_viewAnchorElement: HTMLDivElement) => {
    if (_viewAnchorElement !== null) {
      setViewAnchorElement(_viewAnchorElement);
    }
  };

  return (
    <>
      <ToolbarPlugin />
      <RichTextPlugin
        contentEditable={
          <div className={scrollerClasses}>
            <div className={viewClasses} ref={onViewRef}>
              <ContentEditable className={inputClasses} spellCheck={false} />
            </div>
          </div>
        }
        placeholder={Placeholder}
        ErrorBoundary={LexicalErrorBoundary}
      />
      {viewAnchorElement && !isSmallViewportWidth && (
        <>
          <FloatingToolbarPlugin anchorElem={viewAnchorElement} />
          <FloatingLinkEditorPlugin anchorElem={viewAnchorElement} />
          <DraggableBlockPlugin anchorElem={viewAnchorElement} />
        </>
      )}
      <AutoLinkPlugin matchers={autoLinkMatchers} />
      <LocalDocumentPlugin documentId="first" prefix={"@lexiflow"} />
      <HistoryPlugin externalHistoryState={historyState} />
      <AutoFocusPlugin defaultSelection="rootStart" />
      <ListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <CodeHighlightPlugin />
    </>
  );
};

export default EditorView;
