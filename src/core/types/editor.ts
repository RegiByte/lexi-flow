import { GridSelection, NodeSelection, RangeSelection } from "lexical";

export type EditorSelection = RangeSelection | NodeSelection | GridSelection | null;
