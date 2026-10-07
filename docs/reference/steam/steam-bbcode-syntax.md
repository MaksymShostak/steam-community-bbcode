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

Type references: [`ReadonlySyntaxValue`](#readonlysyntaxvalue), [`SourceSpan`](../index-1.md#sourcespan).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="readonlysyntaxvalue"></a>

### ReadonlySyntaxValue

```ts
type ReadonlySyntaxValue<T> = T extends object ? { readonly [K in keyof T]: ReadonlySyntaxValue<T[K]> } : T;
```

Type references: [`ReadonlySyntaxValue`](#readonlysyntaxvalue).

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

Type references: [`SteamSyntaxSource`](#steamsyntaxsource).

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

Type references: [`SteamTagSource`](#steamtagsource).

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

Type references: [`ReadonlySourceSpan`](#readonlysourcespan).

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

Type references: [`SteamSyntaxSource`](#steamsyntaxsource).

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

Type references: [`SteamTagSource`](#steamtagsource), [`SteamBbcodeSyntaxNode`](../index-1.md#steambbcodesyntaxnode).

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

Type references: [`SteamSyntaxSource`](#steamsyntaxsource).

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

Type references: [`SteamSyntaxSource`](#steamsyntaxsource).

#### Type Parameters

| Type Parameter |
| -------------- |

## References

<a id="steambbcodesyntaxnode"></a>

### SteamBbcodeSyntaxNode

Re-exports [SteamBbcodeSyntaxNode](../index-1.md#steambbcodesyntaxnode)
