import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {CodeHighlightNode, CodeNode} from "@lexical/code";
import {Klass, LexicalNode} from "lexical";
import {InitialConfigType} from "@lexical/react/LexicalComposer";

export type EditorNodes = ReadonlyArray<Klass<LexicalNode> | {
  replace: Klass<LexicalNode>;
  with: <T extends {
    new (...args: any): any;
  }>(node: InstanceType<T>) => LexicalNode;
}>

export const editorNodes: any = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
];
