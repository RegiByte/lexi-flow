import React, { PropsWithChildren } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorTheme } from "../../../components/Editor/theme";
import { prefixClassNames } from "../../../helpers/strings";
import classNames from "classnames";

export interface EditorShellProps {
  editorProps?: React.HTMLProps<HTMLDivElement>;
  shellProps?: React.HTMLProps<HTMLDivElement>;
}

/** EditorShell ------
 * This component is a simple wrapper for the EditorView component.
 * It is used to provide a container for the EditorView and to allow for custom styling.
 * It is also used to provide a container for the EditorView when using the EditorComposer component.
 * You can customize the styling of the editor and shell containers by passing changing the theme classes respective to these containers.
 * @param editorProps - props to pass to the editor container
 * @param shellProps - props to pass to the shell container
 * @param children - the EditorView component
 * @example
 * <EditorShell>
 *  <EditorView richText={true} plugins={<></>}/>
 * </EditorView>
 * */
export const EditorShell: React.FC<PropsWithChildren<EditorShellProps>> = ({ children, editorProps, shellProps }) => {
  const [editor, context] = useLexicalComposerContext();
  const theme = context.getTheme() as EditorTheme;
  const { prefix: classPrefix } = theme;
  const editorClasses = classNames(prefixClassNames("editor", classPrefix), theme?.container?.editor);
  const shellClasses = classNames(prefixClassNames("editor-shell", classPrefix), theme?.container?.shell);

  return (
    <div {...editorProps} className={editorClasses}>
      <div {...shellProps} className={shellClasses}>
        {children}
      </div>
    </div>
  );
};
