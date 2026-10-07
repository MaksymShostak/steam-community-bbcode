[**steam-community-bbcode**](../index.md)

---

[steam-community-bbcode](../index.md) / mdast/steam-url-widgets

# mdast/steam-url-widgets

## Type Aliases

<a id="steamurlwidget"></a>

### SteamUrlWidget

```ts
type SteamUrlWidget = {
  constructId: ConstructId;
  kind: SteamUrlWidgetKind;
};
```

Type references: [`ConstructId`](../index-1.md#constructid), [`SteamUrlWidgetKind`](#steamurlwidgetkind-1).

#### Type Parameters

#### Type Declaration

<a id="constructid"></a>

##### constructId

```ts
constructId: ConstructId;
```

Type references: [`ConstructId`](../index-1.md#constructid).

<a id="kind"></a>

##### kind

```ts
kind: SteamUrlWidgetKind;
```

Type references: [`SteamUrlWidgetKind`](#steamurlwidgetkind-1).

---

<a id="steamurlwidgetkind-1"></a>

### SteamUrlWidgetKind

```ts
type SteamUrlWidgetKind =
  | "youtube-widget"
  | "store-widget"
  | "ugc-widget"
  | "inventory-widget"
  | "vimeo-widget"
  | "sketchfab-widget";
```

#### Type Parameters

## Functions

<a id="steamtextwithurlwidgets"></a>

### steamTextWithUrlWidgets()

```ts
function steamTextWithUrlWidgets(node): (Text | SteamLink)[];
```

Type references: [`SteamLink`](steam-mdast-nodes.md#steamlink), [`SteamTextSyntax`](../steam/steam-bbcode-syntax.md#steamtextsyntax).

Split one literal source text node into native text/link nodes, retaining UTF-16 source spans.
Opaque regions and active link labels never call this.

#### Parameters

##### node

[`SteamTextSyntax`](../steam/steam-bbcode-syntax.md#steamtextsyntax)

#### Returns

```ts
(Text | SteamLink)[]
```
