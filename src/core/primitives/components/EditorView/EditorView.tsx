import React, { useMemo } from "react";
import { ErrorBoundaryType } from "@lexical/react/shared/useDecorators";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorTheme } from "../../../components/Editor/theme";
import classNames from "classnames";
import { prefixClassNames } from "../../../helpers/strings";
import useViewportWidth from "../../../components/Editor/hooks/useViewportWidth";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

type ToolbarPosition = "top" | "bottom";

export interface EditorViewProps {
  toolbar?: JSX.Element | null;
  toolbarPosition?: ToolbarPosition | null;
  plugins: JSX.Element;
  ErrorBoundary?: ErrorBoundaryType;
  richText?: boolean;
  viewPlugins?: (viewAnchorElement: HTMLDivElement, isSmallViewportWidth: boolean) => JSX.Element;
  smallViewportWidth?: number;
}

/** EditorView ---------
 *  The EditorView component is the main component that renders the editor contentEditable.
 *  It is responsible for rendering the toolbar, the contentEditable, and the plugins.
 *  It is also responsible for rendering the ErrorBoundary component.
 *  @param toolbar - the toolbar component
 *  @param toolbarPosition - the position of the toolbar
 *  @param plugins - the plugins to render
 *  @param ErrorBoundary - the ErrorBoundary component to use
 *  @param richText - whether or not to render the contentEditable as rich text
 *  @param viewPlugins - a function that returns a JSX.Element to render plugins that
 *  depend on the editor input reference for portals or other calculations.
 *  @example
 *  <EditorView
 *    toolbar={null}
 *    toolbarPosition={null}
 *    richText={true}
 *    plugins={<></>}
 *  />
 *  @example
 *  <LexicalComposer initialConfig={initialConfig}>
 *    <SharedHistoryContext>
 *      <EditorShell>
 *        <EditorView
 *          toolbar={null}
 *          toolbarPosition={null}
 *          richText={true}
 *          plugins={<></>} />
 *      </EditorShell>
 *    </SharedHistoryContext>
 *  </LexicalComposer>
 */
export const EditorView: React.FC<EditorViewProps> = ({
  plugins,
  richText,
  toolbar,
  toolbarPosition = "top",
  ErrorBoundary = LexicalErrorBoundary,
  viewPlugins,
  smallViewportWidth = 400,
}) => {
  const [editor, context] = useLexicalComposerContext();
  const theme = context.getTheme() as EditorTheme;
  const { prefix: classPrefix } = theme;
  const scrollerClasses = classNames(prefixClassNames("editor-scroller", classPrefix), theme?.container?.scroller);
  const viewClasses = classNames(prefixClassNames("editor-view", classPrefix), theme?.container?.view);
  const inputClasses = classNames(prefixClassNames("editor-input", classPrefix), theme?.container?.input);
  const [viewAnchorElement, setViewAnchorElement] = React.useState<HTMLDivElement | null>(null);
  const [isSmallViewportWidth, viewportWidth] = useViewportWidth(smallViewportWidth);

  const viewDependantPlugins = useMemo(() => {
    if (!viewAnchorElement) return null;
    return viewPlugins?.(viewAnchorElement!, isSmallViewportWidth) ?? null;
  }, [viewAnchorElement, isSmallViewportWidth]);

  const onViewRef = (_viewAnchorElement: HTMLDivElement) => {
    if (_viewAnchorElement !== null) {
      setViewAnchorElement(_viewAnchorElement);
    }
  };

  return (
    <>
      {toolbarPosition === "top" && toolbar}
      {richText ? (
        <RichTextPlugin
          placeholder={null}
          ErrorBoundary={ErrorBoundary}
          contentEditable={
            <div className={scrollerClasses}>
              <div className={viewClasses} ref={onViewRef}>
                <ContentEditable className={inputClasses} spellCheck={false} />
              </div>
            </div>
          }
        />
      ) : (
        <PlainTextPlugin
          placeholder={null}
          ErrorBoundary={ErrorBoundary}
          contentEditable={
            <div className={scrollerClasses}>
              <div className={viewClasses} ref={onViewRef}>
                <ContentEditable className={inputClasses} spellCheck={false} />
              </div>
            </div>
          }
        />
      )}
      {toolbarPosition === "bottom" && toolbar}
      {plugins}
      {viewDependantPlugins}
    </>
  );
};
