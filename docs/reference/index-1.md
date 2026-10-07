[**steam-community-bbcode**](index.md)

---

[steam-community-bbcode](index.md) / index

# index

## Interfaces

<a id="gfmconversionresourcelimits"></a>

### GfmConversionResourceLimits

#### Properties

<a id="maxinputbytes"></a>

##### maxInputBytes

```ts
maxInputBytes: number;
```

Maximum UTF-8 source size.

<a id="maxnestingdepth"></a>

##### maxNestingDepth

```ts
maxNestingDepth: number;
```

Maximum native MDAST depth.

<a id="maxnodecount"></a>

##### maxNodeCount

```ts
maxNodeCount: number;
```

Maximum number of native MDAST nodes.

<a id="maxoutputbytes"></a>

##### maxOutputBytes

```ts
maxOutputBytes: number;
```

Maximum UTF-8 target size.

---

<a id="sourcespan"></a>

### SourceSpan

Position of a node in a source document.

A position is a range between two points.

#### Properties

<a id="end"></a>

##### end

```ts
end: Point;
```

Place of the first character after the parsed source region.

<a id="start"></a>

##### start

```ts
start: Point;
```

Place of the first character of the parsed source region.

---

<a id="steamparseresourcelimits"></a>

### SteamParseResourceLimits

#### Properties

<a id="maxattributebytes"></a>

##### maxAttributeBytes

```ts
maxAttributeBytes: number;
```

Maximum UTF-8 attribute size per construct.

<a id="maxinputbytes-1"></a>

##### maxInputBytes

```ts
maxInputBytes: number;
```

Maximum UTF-8 input size.

<a id="maxnestingdepth-1"></a>

##### maxNestingDepth

```ts
maxNestingDepth: number;
```

Maximum nested Steam construct depth.

<a id="maxnodecount-1"></a>

##### maxNodeCount

```ts
maxNodeCount: number;
```

Maximum number of syntax nodes.

## Type Aliases

<a id="constructid"></a>

### ConstructId

```ts
type ConstructId = typeof steamConstructIds[number];
```

Type references: [`steamConstructIds`](steam/registry-identifiers.md#steamconstructids).

#### Type Parameters

---

<a id="conversiondiagnostic"></a>

### ConversionDiagnostic

```ts
type ConversionDiagnostic = ConversionDiagnosticDetail & (
  | Readonly<{
  constructId: DiagnosticConstructId;
  scope: "construct";
}>
  | Readonly<{
  scope: "input";
}>
  | Readonly<{
  nodeType: Nodes["type"];
  scope: "gfm-node";
}>);
```

Type references: [`ConversionDiagnosticDetail`](diagnostics/conversion-result.md#conversiondiagnosticdetail), [`DiagnosticConstructId`](diagnostics/conversion-result.md#diagnosticconstructid).

#### Type Parameters

---

<a id="conversionfidelity"></a>

### ConversionFidelity

```ts
type ConversionFidelity = "exact" | "equivalent" | "approximate" | "lossy" | "unsupported";
```

#### Type Parameters

---

<a id="conversionresult"></a>

### ConversionResult

```ts
type ConversionResult<T> = Readonly<{
  coverage: ConversionCoverage;
  diagnostics: readonly ConversionDiagnostic[];
  value: T;
}>;
```

Type references: [`ConversionCoverage`](diagnostics/conversion-result.md#conversioncoverage), [`ConversionDiagnostic`](#conversiondiagnostic).

#### Type Parameters

##### T

`T`

---

<a id="diagnosticcode"></a>

### DiagnosticCode

```ts
type DiagnosticCode = typeof conversionDiagnosticCodes[number];
```

Type references: [`conversionDiagnosticCodes`](diagnostics/diagnostic-codes.md#conversiondiagnosticcodes).

#### Type Parameters

---

<a id="gfmtosteambbcodeoptions"></a>

### GfmToSteamBbcodeOptions

```ts
type GfmToSteamBbcodeOptions = Readonly<{
  resourceLimits?: Partial<GfmConversionResourceLimits>;
}>;
```

Type references: [`GfmConversionResourceLimits`](#gfmconversionresourcelimits).

#### Type Parameters

---

<a id="parsesteamcommunitybbcodeoptions"></a>

### ParseSteamCommunityBbcodeOptions

```ts
type ParseSteamCommunityBbcodeOptions = Readonly<{
  profile?: SteamDialectProfileId;
  resourceLimits?: Partial<SteamParseResourceLimits>;
}>;
```

Type references: [`SteamDialectProfileId`](steam/parse-steam-bbcode.md#steamdialectprofileid), [`SteamParseResourceLimits`](#steamparseresourcelimits).

#### Type Parameters

---

<a id="partialconversionresult"></a>

### PartialConversionResult

```ts
type PartialConversionResult<T> = ConversionResult<T> & Readonly<{
  coverage: ConversionCoverage & Readonly<{
     direction: "gfm-to-steam";
     sourceNodes: readonly GfmNodeConversionOutcome[];
  }>;
  unsupportedSourceNodes: readonly UnsupportedGfmFeatureDiagnostic[];
}>;
```

Type references: [`ConversionResult`](#conversionresult), [`ConversionCoverage`](diagnostics/conversion-result.md#conversioncoverage), [`GfmNodeConversionOutcome`](diagnostics/conversion-result.md#gfmnodeconversionoutcome), [`UnsupportedGfmFeatureDiagnostic`](#unsupportedgfmfeaturediagnostic).

#### Type Parameters

##### T

`T`

---

<a id="steamattributedblockquote"></a>

### SteamAttributedBlockquote

```ts
type SteamAttributedBlockquote = Node & {
  author: string;
  children: SteamFlowContent[];
  steamCommentId?: string;
  type: "steamAttributedBlockquote";
};
```

Type references: [`SteamFlowContent`](mdast/steam-mdast-nodes.md#steamflowcontent).

#### Type Declaration

##### author

```ts
author: string;
```

##### children

```ts
children: SteamFlowContent[];
```

Type references: [`SteamFlowContent`](mdast/steam-mdast-nodes.md#steamflowcontent).

##### steamCommentId?

```ts
optional steamCommentId?: string;
```

##### type

```ts
type: "steamAttributedBlockquote";
```

#### Type Parameters

---

<a id="steambbcodeparseresult"></a>

### SteamBbcodeParseResult

```ts
type SteamBbcodeParseResult = Readonly<{
  children: readonly SteamBbcodeSyntaxNode[];
  diagnostics: readonly SteamBbcodeParseDiagnostic[];
  profile: SteamDialectProfileId;
  source: string;
}>;
```

Type references: [`SteamBbcodeSyntaxNode`](steam/parse-steam-bbcode.md#steambbcodesyntaxnode), [`SteamBbcodeParseDiagnostic`](steam/parse-steam-bbcode.md#steambbcodeparsediagnostic), [`SteamDialectProfileId`](steam/parse-steam-bbcode.md#steamdialectprofileid).

#### Type Parameters

---

<a id="steambbcodesyntaxnode"></a>

### SteamBbcodeSyntaxNode

```ts
type SteamBbcodeSyntaxNode =
  | SteamTextSyntax
  | SteamListItemBoundarySyntax
  | SteamUnmatchedClosingTagSyntax
  | SteamTagSyntax
  | SteamOpaqueTagSyntax;
```

Type references: [`SteamTextSyntax`](steam/steam-bbcode-syntax.md#steamtextsyntax), [`SteamListItemBoundarySyntax`](steam/steam-bbcode-syntax.md#steamlistitemboundarysyntax), [`SteamUnmatchedClosingTagSyntax`](steam/steam-bbcode-syntax.md#steamunmatchedclosingtagsyntax), [`SteamTagSyntax`](steam/steam-bbcode-syntax.md#steamtagsyntax), [`SteamOpaqueTagSyntax`](steam/steam-bbcode-syntax.md#steamopaquetagsyntax).

#### Type Parameters

---

<a id="steamblockspoiler"></a>

### SteamBlockSpoiler

```ts
type SteamBlockSpoiler = Node & {
  children: SteamFlowContent[];
  type: "steamBlockSpoiler";
};
```

Type references: [`SteamFlowContent`](mdast/steam-mdast-nodes.md#steamflowcontent).

#### Type Declaration

##### children

```ts
children: SteamFlowContent[];
```

Type references: [`SteamFlowContent`](mdast/steam-mdast-nodes.md#steamflowcontent).

##### type

```ts
type: "steamBlockSpoiler";
```

#### Type Parameters

---

<a id="steamcolor"></a>

### SteamColor

```ts
type SteamColor = Node & {
  children: SteamPhrasingContent[];
  color?: string;
  type: "steamColor";
};
```

Type references: [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent).

##### color?

```ts
optional color?: string;
```

##### type

```ts
type: "steamColor";
```

#### Type Parameters

---

<a id="steamdialectprofileid"></a>

### SteamDialectProfileId

```ts
type SteamDialectProfileId = typeof steamDialectProfileIds[number];
```

Type references: [`steamDialectProfileIds`](steam/registry-identifiers.md#steamdialectprofileids).

#### Type Parameters

---

<a id="steamembeddedmedia"></a>

### SteamEmbeddedMedia

```ts
type SteamEmbeddedMedia = Node & {
  children: SteamPhrasingContent[];
  constructId: ConstructId;
  source: string;
  type: "steamEmbeddedMedia";
} & (
  | {
  layout?: "leftthumb" | "rightthumb" | "full";
  mediaKind: "youtube";
}
  | {
  autoplay?: boolean;
  mediaKind: "video";
  poster?: string;
});
```

Type references: [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent), [`ConstructId`](#constructid).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent).

##### constructId

```ts
constructId: ConstructId;
```

Type references: [`ConstructId`](#constructid).

##### source

```ts
source: string;
```

##### type

```ts
type: "steamEmbeddedMedia";
```

#### Type Parameters

---

<a id="steammdastroot"></a>

### SteamMdastRoot

```ts
type SteamMdastRoot = Omit<Root, "children"> & {
  children: (
     | SteamFlowContent
     | SteamPhrasingContent
     | SteamListItem
     | SteamTableRow
     | SteamTableCell
    | FrontmatterContent)[];
};
```

Type references: [`SteamFlowContent`](mdast/steam-mdast-nodes.md#steamflowcontent), [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent), [`SteamListItem`](mdast/steam-mdast-nodes.md#steamlistitem), [`SteamTableRow`](mdast/steam-mdast-nodes.md#steamtablerow), [`SteamTableCell`](mdast/steam-mdast-nodes.md#steamtablecell).

#### Type Declaration

##### children

```ts
children: (
  | SteamFlowContent
  | SteamPhrasingContent
  | SteamListItem
  | SteamTableRow
  | SteamTableCell
  | FrontmatterContent)[];
```

Type references: [`SteamFlowContent`](mdast/steam-mdast-nodes.md#steamflowcontent), [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent), [`SteamListItem`](mdast/steam-mdast-nodes.md#steamlistitem), [`SteamTableRow`](mdast/steam-mdast-nodes.md#steamtablerow), [`SteamTableCell`](mdast/steam-mdast-nodes.md#steamtablecell).

#### Type Parameters

---

<a id="steamnoparse"></a>

### SteamNoParse

```ts
type SteamNoParse = Literal & {
  type: "steamNoParse";
  value: string;
};
```

#### Type Declaration

##### type

```ts
type: "steamNoParse";
```

##### value

```ts
value: string;
```

#### Type Parameters

---

<a id="steampreviewimage"></a>

### SteamPreviewImage

```ts
type SteamPreviewImage = Node & {
  alignment?: "left" | "right" | "inline";
  alt: string;
  constructId: ConstructId;
  image:   | {
     kind: "url";
     steamImageId: string;
     url: string;
   }
     | {
     fileName: string;
     kind: "guideImage";
     steamImageId: string;
   };
  rawSource: string;
  size?: "thumb" | "full" | "original";
  type: "steamPreviewImage";
};
```

Type references: [`ConstructId`](#constructid).

#### Type Declaration

##### alignment?

```ts
optional alignment?: "left" | "right" | "inline";
```

##### alt

```ts
alt: string;
```

##### constructId

```ts
constructId: ConstructId;
```

Type references: [`ConstructId`](#constructid).

##### image

```ts
image:
  | {
  kind: "url";
  steamImageId: string;
  url: string;
}
  | {
  fileName: string;
  kind: "guideImage";
  steamImageId: string;
};
```

##### rawSource

```ts
rawSource: string;
```

##### size?

```ts
optional size?: "thumb" | "full" | "original";
```

##### type

```ts
type: "steamPreviewImage";
```

#### Type Parameters

---

<a id="steampullquote"></a>

### SteamPullQuote

```ts
type SteamPullQuote = Node & {
  children: SteamFlowContent[];
  type: "steamPullQuote";
};
```

Type references: [`SteamFlowContent`](mdast/steam-mdast-nodes.md#steamflowcontent).

#### Type Declaration

##### children

```ts
children: SteamFlowContent[];
```

Type references: [`SteamFlowContent`](mdast/steam-mdast-nodes.md#steamflowcontent).

##### type

```ts
type: "steamPullQuote";
```

#### Type Parameters

---

<a id="steamspoiler"></a>

### SteamSpoiler

```ts
type SteamSpoiler = Node & {
  children: SteamPhrasingContent[];
  type: "steamSpoiler";
};
```

Type references: [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent).

##### type

```ts
type: "steamSpoiler";
```

#### Type Parameters

---

<a id="steamunderline"></a>

### SteamUnderline

```ts
type SteamUnderline = Node & {
  children: SteamPhrasingContent[];
  type: "steamUnderline";
};
```

Type references: [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent).

#### Type Declaration

##### children

```ts
children: SteamPhrasingContent[];
```

Type references: [`SteamPhrasingContent`](mdast/steam-mdast-nodes.md#steamphrasingcontent).

##### type

```ts
type: "steamUnderline";
```

#### Type Parameters

---

<a id="unsupportedgfmfeaturediagnostic"></a>

### UnsupportedGfmFeatureDiagnostic

```ts
type UnsupportedGfmFeatureDiagnostic = ConversionDiagnosticDetail & Readonly<{
  nodeType: Nodes["type"];
  scope: "gfm-node";
}>;
```

Type references: [`ConversionDiagnosticDetail`](diagnostics/conversion-result.md#conversiondiagnosticdetail).

#### Type Parameters

## Functions

<a id="gfmtosteamcommunitybbcode"></a>

### gfmToSteamCommunityBbcode()

```ts
function gfmToSteamCommunityBbcode(source, options?): PartialConversionResult<string>;
```

Type references: [`PartialConversionResult`](#partialconversionresult), [`GfmConversionResourceLimits`](#gfmconversionresourcelimits).

Convert a documented subset of GFM into Steam Community BBCode.
Unsupported source semantics are reported separately from forward coverage.
This pure function does not read files, fetch URLs or render arbitrary HTML.

#### Parameters

##### source

`string`

##### options?

`Readonly`<{ `resourceLimits?`: `Partial`<[`GfmConversionResourceLimits`](#gfmconversionresourcelimits)>; }> = `{}`

#### Returns

```ts
PartialConversionResult<string>
```

---

<a id="steamcommunitybbcodetogfm"></a>

### steamCommunityBbcodeToGfm()

```ts
function steamCommunityBbcodeToGfm(source, options?): Readonly<{
  coverage: ConversionCoverage;
  diagnostics: readonly ConversionDiagnostic[];
  value: string;
}>;
```

Type references: [`ConversionCoverage`](diagnostics/conversion-result.md#conversioncoverage), [`ConversionDiagnostic`](#conversiondiagnostic), [`SteamParseResourceLimits`](#steamparseresourcelimits).

Convert Steam source to GFM and retain per-input diagnostics and fidelity.
Markdown syntax and escaping belong to the maintained native serializer.

#### Parameters

##### source

`string`

##### options?

`Readonly`<{ `profile?`: | `"workshop-item"` | `"ugc-description"` | `"guide-section"` | `"discussion"` | `"review"` | `"announcement"`; `resourceLimits?`: `Partial`<[`SteamParseResourceLimits`](#steamparseresourcelimits)>; }> = `{}`

#### Returns

```ts
Readonly<{ coverage: ConversionCoverage; diagnostics: readonly ConversionDiagnostic[]; value: string }>
```

---

<a id="steamcommunitybbcodetomdast"></a>

### steamCommunityBbcodeToMdast()

```ts
function steamCommunityBbcodeToMdast(source, options?): Readonly<{
  coverage: ConversionCoverage;
  diagnostics: readonly ConversionDiagnostic[];
  value: SteamMdastRoot;
}>;
```

Type references: [`ConversionCoverage`](diagnostics/conversion-result.md#conversioncoverage), [`ConversionDiagnostic`](#conversiondiagnostic), [`SteamMdastRoot`](#steammdastroot), [`SteamBbcodeSyntaxNode`](#steambbcodesyntaxnode), [`SteamParseResourceLimits`](#steamparseresourcelimits).

Interpret Steam source as MDAST while retaining diagnostics and per-input outcomes.
This layer does not serialize Markdown or perform external I/O.
Prepared inputs must be immutable results issued by this package's parser.
Their profile cannot change, and resource limits belong to the initial parse.

#### Parameters

##### source

\| `string` | `Readonly`<{ `children`: readonly [`SteamBbcodeSyntaxNode`](#steambbcodesyntaxnode)\[]; `diagnostics`: readonly `Readonly`<{ `code`: | `"STEAM_MAX_INPUT_BYTES_EXCEEDED"` | `"STEAM_MAX_ATTRIBUTE_BYTES_EXCEEDED"` | `"STEAM_MAX_NESTING_DEPTH_EXCEEDED"` | `"STEAM_MAX_NODE_COUNT_EXCEEDED"` | `"STEAM_LEXICAL_ERROR"` | `"STEAM_SYNTAX_ERROR"` | `"STEAM_UNCLOSED_TAG_HEADER"` | `"STEAM_UNCLOSED_ATTRIBUTE_QUOTE"` | `"STEAM_UNCLOSED_TAG"` | `"STEAM_MISMATCHED_CLOSING_TAG"` | `"STEAM_UNMATCHED_CLOSING_TAG"`; `message`: `string`; `sourceSpan?`: { `end`: { `column`: `number`; `line`: `number`; `offset?`: `number`; }; `start`: { `column`: `number`; `line`: `number`; `offset?`: `number`; }; }; }>\[]; `profile`: | `"workshop-item"` | `"ugc-description"` | `"guide-section"` | `"discussion"` | `"review"` | `"announcement"`; `source`: `string`; }>

##### options?

`Readonly`<{ `profile?`: | `"workshop-item"` | `"ugc-description"` | `"guide-section"` | `"discussion"` | `"review"` | `"announcement"`; `resourceLimits?`: `Partial`<[`SteamParseResourceLimits`](#steamparseresourcelimits)>; }> = `{}`

#### Returns

```ts
Readonly<{ coverage: ConversionCoverage; diagnostics: readonly ConversionDiagnostic[]; value: SteamMdastRoot }>
```

## References

<a id="parsesteamcommunitybbcode"></a>

### parseSteamCommunityBbcode

Re-exports [parseSteamCommunityBbcode](steam/parse-steam-bbcode.md#parsesteamcommunitybbcode)

---

<a id="steambbcodetogfmoptions"></a>

### SteamBbcodeToGfmOptions

Renames and re-exports [ParseSteamCommunityBbcodeOptions](#parsesteamcommunitybbcodeoptions)

---

<a id="steambbcodetomdastoptions"></a>

### SteamBbcodeToMdastOptions

Renames and re-exports [ParseSteamCommunityBbcodeOptions](#parsesteamcommunitybbcodeoptions)
