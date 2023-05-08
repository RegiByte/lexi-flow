import React from "react";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useSharedHistoryContext } from "../../../context/SharedHistory";

/** ContextHistoryPlugin ------
 *  This component auto-wires the LexicalHistoryPlugin to the shared history context.
 *  You need to use the SharedHistoryContext in your app for this to work.
 */
export const ContextHistoryPlugin = () => {
  const { historyState } = useSharedHistoryContext();
  return <HistoryPlugin externalHistoryState={historyState} />;
};
