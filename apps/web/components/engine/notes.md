Group and group expressions

How do make a generic block?

Block -> Block (parts) -> Block

Language constructs (if statement, function declaration, variable declaration, etc)
-> each with an AST ->| we need to map that to |-> a UI description -> block UI

For instance: IfStatement -> IfStatementUI -> IfStatement

Representation traits:

- How does it interact with parent blocks? statements vs expressions -> is block type = statement | expression
- Can it hold children blocks?
  - statement list -> empty statement
  - expression -> empty expression
  - expression list
- How do we communicate it's purpose?
  - Keywords (horizontal)
- How do we give extra context if needed?
  - Tooltips for description
    - Main keyword -> block description
    - Normal keywords -> keyword description
  - User comment/documentation (horizontal)
- What does every block has that doesn't need to be declared by it's definition?
  - Select
  - Remove
  - Drag & drop
  - Add block below (statement only)
  - Copy & paste
  - Attach debugger
  - Attach logger
  - Attached comment/thread
