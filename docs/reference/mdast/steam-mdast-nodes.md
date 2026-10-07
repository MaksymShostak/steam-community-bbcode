[**steam-community-bbcode**](../index.md)

---

[steam-community-bbcode](../index.md) / mdast/steam-mdast-nodes

# mdast/steam-mdast-nodes

## Type Aliases

<a id="steamblockquote"></a>

### SteamBlockquote

```ts
type SteamBlockquote = Omit<Blockquote, "children"> & {
  children: SteamFlowContent[];
};
```

Type references: [`SteamFlowContent`](#steamflowcontent).

#### Type Declaration

##### children

```ts
children: SteamFlowContent[];
```

Type references: [`SteamFlowContent`](#steamflowcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamdelete"></a>

### SteamDelete

```ts
type SteamDelete = Omit<Delete, "children"> & {
  children: SteamPhrasingContent[];
};
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamemphasis"></a>

### SteamEmphasis

```ts
type SteamEmphasis = Omit<Emphasis, "children"> & {
  children: SteamPhrasingContent[];
};
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamflowcontent"></a>

### SteamFlowContent

```ts
type SteamFlowContent =
  | Exclude<BlockContent | DefinitionContent, {
  children: unknown[];
}>
  | SteamParagraph
  | SteamHeading
  | SteamBlockquote
  | SteamFootnoteDefinition
  | SteamList
  | SteamTable
  | SteamBlockSpoiler
  | SteamAttributedBlockquote
  | SteamPullQuote
  | SteamEmbeddedMedia;
```

Type references: [`SteamParagraph`](#steamparagraph), [`SteamHeading`](#steamheading), [`SteamBlockquote`](#steamblockquote), [`SteamFootnoteDefinition`](#steamfootnotedefinition), [`SteamList`](#steamlist), [`SteamTable`](#steamtable), [`SteamBlockSpoiler`](../index-1.md#steamblockspoiler), [`SteamAttributedBlockquote`](../index-1.md#steamattributedblockquote), [`SteamPullQuote`](../index-1.md#steampullquote), [`SteamEmbeddedMedia`](../index-1.md#steamembeddedmedia).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamfootnotedefinition"></a>

### SteamFootnoteDefinition

```ts
type SteamFootnoteDefinition = Omit<FootnoteDefinition, "children"> & {
  children: SteamFlowContent[];
};
```

Type references: [`SteamFlowContent`](#steamflowcontent).

#### Type Declaration

##### children

```ts
children: SteamFlowContent[];
```

Type references: [`SteamFlowContent`](#steamflowcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamheading"></a>

### SteamHeading

```ts
type SteamHeading = Omit<Heading, "children"> & {
  children: SteamPhrasingContent[];
};
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamlink"></a>

### SteamLink

```ts
type SteamLink = Omit<Link, "children" | "data"> & {
  children: SteamPhrasingContent[];
  data?: LinkData & {
     steamUrlWidget?: SteamUrlWidget;
  };
};
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent), [`SteamUrlWidget`](steam-url-widgets.md#steamurlwidget).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

##### data?

```ts
optional data?: LinkData & {
  steamUrlWidget?: SteamUrlWidget;
};
```

Type references: [`SteamUrlWidget`](steam-url-widgets.md#steamurlwidget).

###### Type Declaration

###### steamUrlWidget?

```ts
optional steamUrlWidget?: SteamUrlWidget;
```

Type references: [`SteamUrlWidget`](steam-url-widgets.md#steamurlwidget).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamlinkreference"></a>

### SteamLinkReference

```ts
type SteamLinkReference = Omit<LinkReference, "children"> & {
  children: SteamPhrasingContent[];
};
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamlist"></a>

### SteamList

```ts
type SteamList = Omit<List, "children"> & {
  children: SteamListItem[];
};
```

Type references: [`SteamListItem`](#steamlistitem).

#### Type Declaration

##### children

```ts
children: SteamListItem[];
```

Type references: [`SteamListItem`](#steamlistitem).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamlistitem"></a>

### SteamListItem

```ts
type SteamListItem = Omit<ListItem, "children"> & {
  children: SteamFlowContent[];
};
```

Type references: [`SteamFlowContent`](#steamflowcontent).

#### Type Declaration

##### children

```ts
children: SteamFlowContent[];
```

Type references: [`SteamFlowContent`](#steamflowcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamparagraph"></a>

### SteamParagraph

```ts
type SteamParagraph = Omit<Paragraph, "children"> & {
  children: SteamPhrasingContent[];
};
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamphrasingcontent"></a>

### SteamPhrasingContent

```ts
type SteamPhrasingContent =
  | Exclude<PhrasingContent, {
  children: unknown[];
}>
  | SteamStrong
  | SteamEmphasis
  | SteamDelete
  | SteamLink
  | SteamLinkReference
  | SteamNoParse
  | SteamUnderline
  | SteamSpoiler
  | SteamColor
  | SteamPreviewImage;
```

Type references: [`SteamStrong`](#steamstrong), [`SteamEmphasis`](#steamemphasis), [`SteamDelete`](#steamdelete), [`SteamLink`](#steamlink), [`SteamLinkReference`](#steamlinkreference), [`SteamNoParse`](../index-1.md#steamnoparse), [`SteamUnderline`](../index-1.md#steamunderline), [`SteamSpoiler`](../index-1.md#steamspoiler), [`SteamColor`](../index-1.md#steamcolor), [`SteamPreviewImage`](../index-1.md#steampreviewimage).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamstrong"></a>

### SteamStrong

```ts
type SteamStrong = Omit<Strong, "children"> & {
  children: SteamPhrasingContent[];
};
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamtable"></a>

### SteamTable

```ts
type SteamTable = Omit<Table, "children" | "data"> & {
  children: SteamTableRow[];
  data?: TableData & {
     steamTableLayout?: SteamTableLayout;
  };
};
```

Type references: [`SteamTableRow`](#steamtablerow), [`SteamTableLayout`](steam-table-layout.md#steamtablelayout).

#### Type Declaration

##### children

```ts
children: SteamTableRow[];
```

Type references: [`SteamTableRow`](#steamtablerow).

##### data?

```ts
optional data?: TableData & {
  steamTableLayout?: SteamTableLayout;
};
```

Type references: [`SteamTableLayout`](steam-table-layout.md#steamtablelayout).

###### Type Declaration

###### steamTableLayout?

```ts
optional steamTableLayout?: SteamTableLayout;
```

Type references: [`SteamTableLayout`](steam-table-layout.md#steamtablelayout).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamtablecell"></a>

### SteamTableCell

```ts
type SteamTableCell = Omit<TableCell, "children"> & {
  children: SteamPhrasingContent[];
};
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](#steamphrasingcontent).

#### Type Parameters

| Type Parameter |
| -------------- |

---

<a id="steamtablerow"></a>

### SteamTableRow

```ts
type SteamTableRow = Omit<TableRow, "children"> & {
  children: SteamTableCell[];
};
```

Type references: [`SteamTableCell`](#steamtablecell).

#### Type Declaration

##### children

```ts
children: SteamTableCell[];
```

Type references: [`SteamTableCell`](#steamtablecell).

#### Type Parameters

| Type Parameter |
| -------------- |

## References

<a id="steamattributedblockquote"></a>

### SteamAttributedBlockquote

Re-exports [SteamAttributedBlockquote](../index-1.md#steamattributedblockquote)

---

<a id="steamblockspoiler"></a>

### SteamBlockSpoiler

Re-exports [SteamBlockSpoiler](../index-1.md#steamblockspoiler)

---

<a id="steamcolor"></a>

### SteamColor

Re-exports [SteamColor](../index-1.md#steamcolor)

---

<a id="steamembeddedmedia"></a>

### SteamEmbeddedMedia

Re-exports [SteamEmbeddedMedia](../index-1.md#steamembeddedmedia)

---

<a id="steammdastroot"></a>

### SteamMdastRoot

Re-exports [SteamMdastRoot](../index-1.md#steammdastroot)

---

<a id="steamnoparse"></a>

### SteamNoParse

Re-exports [SteamNoParse](../index-1.md#steamnoparse)

---

<a id="steampreviewimage"></a>

### SteamPreviewImage

Re-exports [SteamPreviewImage](../index-1.md#steampreviewimage)

---

<a id="steampullquote"></a>

### SteamPullQuote

Re-exports [SteamPullQuote](../index-1.md#steampullquote)

---

<a id="steamspoiler"></a>

### SteamSpoiler

Re-exports [SteamSpoiler](../index-1.md#steamspoiler)

---

<a id="steamunderline"></a>

### SteamUnderline

Re-exports [SteamUnderline](../index-1.md#steamunderline)
