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

const EditorView: React.FC<{ classPrefix?: string }> = (props) => {
  const { classPrefix = "" } = props;
  const {historyState} = useSharedHistoryContext()
  const [editor, context] = useLexicalComposerContext();
  const theme = context.getTheme();
  const viewClasses = classNames(prefixClassNames("editor-view", classPrefix), theme?.container?.view);

  return (
    <>
      <ToolbarPlugin />
      <div className={viewClasses}>
        <RichTextPlugin
          contentEditable={<ContentEditable className={theme?.container?.input} spellCheck={false} />}
          placeholder={Placeholder}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin externalHistoryState={historyState}/>
        <AutoFocusPlugin defaultSelection="rootStart" />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <CodeHighlightPlugin />
      </div>
    </>
  );
};

export default EditorView;
