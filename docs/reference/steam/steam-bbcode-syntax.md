[**steam-community-bbcode**](../index.md)

---

[steam-community-bbcode](../index.md) / steam/steam-bbcode-syntax

# steam/steam-bbcode-syntax

## Type Aliases

<a id="readonlysourcespan"></a>

### ReadonlySourceSpan

```ts
type ReadonlySourceSpan = ReadonlySyntaxValue<SourceSpan>;
```

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="readonlysyntaxvalue"></a>

### ReadonlySyntaxValue

```ts
type ReadonlySyntaxValue<T> = T extends object ? { readonly [K in keyof T]: ReadonlySyntaxValue<T[K]> } : T;
```

#### Type Parameters

| Type Parameter | Description |
| -------------- | ----------- |
| `T`            |             |

---

<a id="steamlistitemboundarysyntax"></a>

### SteamListItemBoundarySyntax

```ts
type SteamListItemBoundarySyntax = SteamSyntaxSource & Readonly<{
  type: "steamListItemBoundary";
}>;
```

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamopaquetagsyntax"></a>

### SteamOpaqueTagSyntax

```ts
type SteamOpaqueTagSyntax = SteamTagSource & Readonly<{
  tagName: "code" | "noparse";
  type: "steamOpaqueTag";
  value: string;
}>;
```

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamsyntaxsource"></a>

### SteamSyntaxSource

```ts
type SteamSyntaxSource = Readonly<{
  rawSource: string;
  sourceSpan: ReadonlySourceSpan;
}>;
```

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamtagsource"></a>

### SteamTagSource

```ts
type SteamTagSource = SteamSyntaxSource & Readonly<{
  closingTagName?: string;
  headerClosed: boolean;
  rawAttributes: string;
  tagName: string;
}>;
```

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamtagsyntax"></a>

### SteamTagSyntax

```ts
type SteamTagSyntax = SteamTagSource & Readonly<{
  children: readonly SteamBbcodeSyntaxNode[];
  type: "steamTag";
}>;
```

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamtextsyntax"></a>

### SteamTextSyntax

```ts
type SteamTextSyntax = SteamSyntaxSource & Readonly<{
  type: "steamText";
  value: string;
}>;
```

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamunmatchedclosingtagsyntax"></a>

### SteamUnmatchedClosingTagSyntax

```ts
type SteamUnmatchedClosingTagSyntax = SteamSyntaxSource & Readonly<{
  tagName: string;
  type: "steamUnmatchedClosingTag";
}>;
```

#### Type Parameters

| Type Parameter |
| -------------- |

## References

<a id="steambbcodesyntaxnode"></a>

### SteamBbcodeSyntaxNode

Re-exports [SteamBbcodeSyntaxNode](../index-1.md#steambbcodesyntaxnode)
