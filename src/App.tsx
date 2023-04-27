import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {PlainTextPlugin} from "@lexical/react/LexicalPlainTextPlugin";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getRoot, $getSelection, EditorState} from "lexical";

const theme = {

}

function onError(error: any) {
	console.error(error);
}

function onChange(editorState: EditorState) {
	editorState.read(() => {
		// Read the contents of the EditorState here.
		const root = $getRoot();
		const selection = $getSelection();

		console.log(root, selection);
	});
}

function MyCustomAutoFocusPlugin() {
	const [editor, context] = useLexicalComposerContext();

	useEffect(() => {
		// Focus the editor when the effect fires!
		editor.focus();
	}, [editor]);

	return null;
}

function App() {
	const initialConfig = {
		namespace: 'MyEditor',
		theme,
		onError,
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<div className="bg-slate-100 rounded px-5 py-3">
				<PlainTextPlugin
					contentEditable={<ContentEditable/>}
					placeholder={<div>Enter some text...</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<OnChangePlugin onChange={onChange}/>
				<HistoryPlugin/>
				<MyCustomAutoFocusPlugin/>
			</div>
		</LexicalComposer>
	)
}

export default App
