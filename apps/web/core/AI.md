# AI and generating code

The AI generation process at the moment:

- GPT generates JSX code.
- CodeProcessor generates AST from JSX code.
- ASTtoCTTransformer transforms AST to Code Tree format. At this point the code can be displayed in the editor.
- CodeDB indexes the Code Tree and stores it in useful data structures to be used by the Editor.
