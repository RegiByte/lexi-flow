import React from "react";
import useInitialEditorConfig from "../../core/primitives/hooks/useInitialEditorConfig";
import { mediumEditorTheme } from "./theme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { SharedHistoryContext } from "../../core/context/SharedHistory";
import { EditorShell } from "../../core/primitives/components/EditorShell/EditorShell";
import { EditorView } from "../../core/primitives/components/EditorView/EditorView";
import { mediumEditorNodes } from "./nodes";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { autoLinkMatchers } from "../../core/constants/links";
import { ContextHistoryPlugin } from "../../core/primitives/plugins/ContextHistory/ContextHistory";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LocalDocumentPlugin } from "../../core/plugins/LocalDocument/LocalDocumentPlugin";
import { MediumToolbar } from "./MediumToolbar";
import FloatingToolbarPlugin from "../../core/primitives/plugins/FloatingToolbar/FloatingToolbar";
import { PlaceholderPlugin } from "../../core/primitives/plugins/Placeholder/Placeholder";
import FloatingLinkEditorPlugin from "../../core/plugins/FloatingLinkEditor/FloatingLinkEditor";
import ExcalidrawPlugin from "../../core/plugins/Excalidraw/ExcalidrawPlugin";

export const MediumEditor = () => {
  const initialConfig = useInitialEditorConfig({
    initialConfig: {
      theme: mediumEditorTheme,
      editable: true,
      nodes: mediumEditorNodes,
      namespace: "medium-editor",
      editorState: null,
    },
  });

  return (
    <div className={mediumEditorTheme.page}>
      <LexicalComposer initialConfig={initialConfig}>
        <SharedHistoryContext>
          <EditorShell>
            <EditorView
              richText={true}
              smallViewportWidth={400}
              plugins={
                <>
                  <ContextHistoryPlugin />
                  <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                  <ListPlugin />
                  <LinkPlugin />
                  <AutoLinkPlugin matchers={autoLinkMatchers} />
                  <LocalDocumentPlugin documentId={"first"} prefix={"@medium-editor"} />
                  <ExcalidrawPlugin/>
                </>
              }
              viewPlugins={(viewAnchor) => (
                <>
                  <FloatingToolbarPlugin anchorElem={viewAnchor}>
                    <MediumToolbar />
                  </FloatingToolbarPlugin>
                  <PlaceholderPlugin anchorElem={viewAnchor}>
                    <span className="text-md">Tell your story...</span>
                  </PlaceholderPlugin>
                  <FloatingLinkEditorPlugin anchorElem={viewAnchor} />
                </>
              )}
            />
          </EditorShell>
        </SharedHistoryContext>
      </LexicalComposer>
    </div>
  );
};
