# Lang notes

On demand errors as values.

```javascript
async errorAsValue(x) {
    try {
        return { value: await x }
    } catch (error) {
        return { error }
    }
}

const { value, error } = await errorAsValue(myFun())
```

That can be easily replaced by:

```portal-lang
var (value), error = "my fun"()
```
