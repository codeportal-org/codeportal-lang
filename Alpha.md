# Alpha Spec

Spec of first prototype of the language, editor and platform.

## Code Tree

```tsx
const codeTree = Map()

const blockID = nanoid()

codeTree.set(blockID, {
  type: "expression", // expression | statement
  kind: "binary expression",
  refs: {
    left: "id1",
    right: "id2",
  },
})
```

## Storage

All data is stored in 3 JSON blobs and synced to the cloud:

- Code Tree map (JSON KV) - necessary for reads - Priority 0
- Child / parent map (JSON KV) - necessary for writes - Priority 1
- Full-text search index (MiniSearch) - necessary for search - Priority 2

They are loaded locally on startup and changes are sent to the cloud one by one.

## Editor

- Editor view
- Block-view:
  - Autocomplete to add blocks.
  - ...
- Blocks:
  - ...

## Runtime

- Pausable interpreter? Or just traceable.
- Standard library.

## Platform

- Create and deploy app.
- Custom domains.
- Basic usage based billing.
