import {
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  DecoratorNode,
  DOMConversionFn,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  GridSelection,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  NodeSelection,
  RangeSelection,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import React, { Suspense } from "react";
import { ImageLoadingSkeleton } from "../../ui/ImageLoadingSkeleton";

const ExcalidrawComponent = React.lazy(() =>
  Promise.all([
    // @ts-ignore
    import("./ExcalidrawComponent.tsx"),
    new Promise((resolve) => setTimeout(resolve, 500)), // delay to show loading skeleton
  ]).then(([moduleExports]) => moduleExports),
);

export type SerializedExcalidrawNode = Spread<
  {
    data: string;
    width: number | null;
    height: number | null;
  },
  SerializedLexicalNode
>;

const convertExcalidrawElement: DOMConversionFn = (domNode: HTMLElement): DOMConversionOutput | null => {
  const data = domNode.getAttribute("data-excalidraw");
  if (data) {
    const node = $createExcalidrawNode(data);
    return {
      node,
    };
  }
  return null;
};

export function $createExcalidrawNode(
  data: string = "[]",
  width: number | null = null,
  height: number | null = null,
): ExcalidrawNode {
  return new ExcalidrawNode(data, width, height);
}

export function $isExcalidrawNode(node: LexicalNode | null): node is ExcalidrawNode {
  return node instanceof ExcalidrawNode;
}

export function getExcalidrawNodeInSelection(): ExcalidrawNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes.find($isExcalidrawNode);
  return node || null;
}

export function getExcalidrawNodesInSelection(
  selection: NodeSelection | RangeSelection | GridSelection | null,
): ExcalidrawNode[] {
  if (!$isNodeSelection(selection)) {
    return [];
  }
  const nodes = selection.getNodes();
  return nodes.filter($isExcalidrawNode);
}

export class ExcalidrawNode extends DecoratorNode<JSX.Element> {
  __data: string;
  __width: number | null;
  __height: number | null;

  static getType(): string {
    return "excalidraw";
  }

  static clone(node: ExcalidrawNode): ExcalidrawNode {
    return new ExcalidrawNode(node.__data, node.__width, node.__height, node.__key);
  }

  static importJSON(serializedNode: SerializedExcalidrawNode): ExcalidrawNode {
    return new ExcalidrawNode(serializedNode.data, serializedNode.width, serializedNode.height);
  }

  exportJSON(): SerializedExcalidrawNode {
    return {
      data: this.__data,
      height: this.__height,
      width: this.__width,
      type: ExcalidrawNode.getType(),
      version: 1,
    };
  }

  constructor(data: string = "[]", width: number | null = null, height: number | null = null, key?: NodeKey) {
    super(key);
    this.__data = data;
    this.__width = width;
    this.__height = height;
  }

  // view
  createDOM(config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  static importDOM(): DOMConversionMap<HTMLSpanElement> | null {
    return {
      span: (domNode) => {
        if (!domNode?.hasAttribute("data-excalidraw")) {
          return null;
        }

        return {
          conversion: convertExcalidrawElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("span");
    const content = editor.getElementByKey(this.getKey());
    if (content) {
      const svg = content.querySelector("svg");
      if (svg) {
        element.innerHTML = svg.outerHTML;
      }
      if (this.getWidth()) {
        element.style.width = this.getWidth() + "px";
      }
      if (this.getHeight()) {
        element.style.height = this.getHeight() + "px";
      }
    }
    element.setAttribute("data-excalidraw", this.__data);
    return {
      element,
    };
  }

  setData(data: string): void {
    const self = this.getWritable();
    self.__data = data;
  }

  setWidth(width: number | null): void {
    const self = this.getWritable();
    self.__width = width;
  }

  setHeight(height: number | null): void {
    const self = this.getWritable();
    self.__height = height;
  }

  setDimensions(width: number | null, height: number | null): void {
    const self = this.getWritable();
    self.__width = width;
    self.__height = height;
  }

  getData(): string {
    const readable = this.getLatest();
    return readable.__data;
  }

  getWidth(): number | null {
    const readable = this.getLatest();
    return readable.__width;
  }

  getHeight(): number | null {
    const readable = this.getLatest();
    return readable.__height;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <Suspense
        fallback={
          <ImageLoadingSkeleton
            width={this.getWidth()}
            height={this.getHeight()}
            containerClassName={"animate-pulse"}
          />
        }>
        <ExcalidrawComponent
          width={this.getWidth()}
          height={this.getHeight()}
          nodeKey={this.getKey()}
          data={this.getData()}
        />
      </Suspense>
    );
  }
}
