import { LexicalNode, ParagraphNode, TextNode, LineBreakNode } from "lexical";
import { InitialConfigType } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { ExcalidrawNode } from "../../core/nodes/Excalidraw/ExcalidrawNode";

export const mediumEditorNodes: InitialConfigType["nodes"] = [
  HeadingNode,
  ParagraphNode,
  QuoteNode,
  TextNode,
  LineBreakNode,
  LinkNode,
  AutoLinkNode,
  ListNode,
  ListItemNode,
  CodeNode,
  ExcalidrawNode,
];
