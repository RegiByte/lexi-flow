/** This is not a code file, this is an A.I context file.
 * This files has descriptions and chains of thought so that I can remember what I was thinking when I wrote the code.
 * And also to help Copilot and other A.I. to understand what I was thinking.
 * This will improve the quality of the code that Copilot and other A.I. will suggest.
 * Okay let's start.
 */

/** Q: What is this project about? */
/** A: This is a text editor library built on top of meta's new framework called lexical.
 * It is a framework that allows you to build a text editor with a lot of features.
 * We want to provide a sensible default so that users can plug-n-play and get a text editor with a lot of features.
 * We also want to provide them with an extension abstraction that let's them register nodes, plugins and commands to the editor.
 * This will help organize the library and also prevent too many moving parts to think about.
 * And extension should have the power to provide it's own nodes, plugins and commands.
 * An extension should also be able to provide view-nodes that can be used to render elements in the editor. at a specific position.
 */

/** Q: What is the purpose of this file? */
/** A: This file is the context file for LLM, Copilot and other A.I. to understand what I was thinking when I wrote the code. */

// Requirements
// 1. The user should be able to create a new extension
// 2. The user should be able to register nodes, plugins and commands to the extension
// 3. The user should be able to register view-nodes to the extension
// 4. The user should be able to provide an array of extensions to the editor
// 5. The editor should be able to register all the nodes, plugins and commands from the extensions
// 6. The editor should be able to register all the view-nodes from the extensions and render them in the editor at the correct position


// Features that I want to create
// 1. Block actions like what we have in notion
// 2. Draggable blocks
// 3. Collapsible blocks
// 4. Drag and drop blocks
// 5. Drag and drop images
// 6. Drag and drop files
// 7. Drag and drop text
// 8. Export/Import MarkDown
// 9. MarkDown shortcuts and transformations
// 10. MarkDown syntax highlighting
// 11. CodeBlocks with syntax highlighting
// 12. Pre-Defined Shortcuts (system independent)
// 13. User-Defined Shortcuts (system dependent, we may need to use a library for this)
// 14. User-Defined Themes (we may need to use a library for this)
// 15. A.I extension for writing and asking questions to LLM's, may be used for auto-completion too.

export {};

