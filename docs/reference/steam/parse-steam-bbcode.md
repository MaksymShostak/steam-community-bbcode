[**steam-community-bbcode**](../index.md)

---

[steam-community-bbcode](../index.md) / steam/parse-steam-bbcode

# steam/parse-steam-bbcode

## Type Aliases

<a id="steambbcodeparsediagnostic"></a>

### SteamBbcodeParseDiagnostic

```ts
type SteamBbcodeParseDiagnostic = Readonly<{
  code: SteamParseDiagnosticCode;
  message: string;
  sourceSpan?: ReadonlySourceSpan;
}>;
```

Type references: [`SteamParseDiagnosticCode`](../diagnostics/diagnostic-codes.md#steamparsediagnosticcode), [`ReadonlySourceSpan`](steam-bbcode-syntax.md#readonlysourcespan).

#### Type Parameters

| Type Parameter |
| -------------- |

## Functions

<a id="isissuedsteambbcodeparseresult"></a>

### isIssuedSteamBbcodeParseResult()

```ts
function isIssuedSteamBbcodeParseResult(value): value is Readonly<{ children: readonly SteamBbcodeSyntaxNode[]; diagnostics: readonly Readonly<{ code: "STEAM_MAX_INPUT_BYTES_EXCEEDED" | "STEAM_MAX_ATTRIBUTE_BYTES_EXCEEDED" | "STEAM_MAX_NESTING_DEPTH_EXCEEDED" | "STEAM_MAX_NODE_COUNT_EXCEEDED" | "STEAM_LEXICAL_ERROR" | "STEAM_SYNTAX_ERROR" | "STEAM_UNCLOSED_TAG_HEADER" | "STEAM_UNCLOSED_ATTRIBUTE_QUOTE" | "STEAM_UNCLOSED_TAG" | "STEAM_MISMATCHED_CLOSING_TAG" | "STEAM_UNMATCHED_CLOSING_TAG"; message: string; sourceSpan?: { end: { column: number; line: number; offset?: number }; start: { column: number; line: number; offset?: number } } }>[]; profile: "workshop-item" | "ugc-description" | "guide-section" | "discussion" | "review" | "announcement"; source: string }>;
```

Type references: [`SteamBbcodeSyntaxNode`](../index-1.md#steambbcodesyntaxnode).

Conversion reuses immutable results issued by this parser.
A deserialized or fabricated tree has not passed the parser's runtime limits and validation.

#### Parameters

| Parameter | Type      | Description |
| --------- | --------- | ----------- |
| `value`   | `unknown` | -           |

#### Returns

```ts
value is Readonly<{ children: readonly SteamBbcodeSyntaxNode[]; diagnostics: readonly Readonly<{ code: "STEAM_MAX_INPUT_BYTES_EXCEEDED" | "STEAM_MAX_ATTRIBUTE_BYTES_EXCEEDED" | "STEAM_MAX_NESTING_DEPTH_EXCEEDED" | "STEAM_MAX_NODE_COUNT_EXCEEDED" | "STEAM_LEXICAL_ERROR" | "STEAM_SYNTAX_ERROR" | "STEAM_UNCLOSED_TAG_HEADER" | "STEAM_UNCLOSED_ATTRIBUTE_QUOTE" | "STEAM_UNCLOSED_TAG" | "STEAM_MISMATCHED_CLOSING_TAG" | "STEAM_UNMATCHED_CLOSING_TAG"; message: string; sourceSpan?: { end: { column: number; line: number; offset?: number }; start: { column: number; line: number; offset?: number } } }>[]; profile: "workshop-item" | "ugc-description" | "guide-section" | "discussion" | "review" | "announcement"; source: string }>
```

---

<a id="parsesteamcommunitybbcode"></a>

### parseSteamCommunityBbcode()

```ts
function parseSteamCommunityBbcode(source, options?): Readonly<{
  children: readonly SteamBbcodeSyntaxNode[];
  diagnostics: readonly Readonly<{
     code:   | "STEAM_MAX_INPUT_BYTES_EXCEEDED"
        | "STEAM_MAX_ATTRIBUTE_BYTES_EXCEEDED"
        | "STEAM_MAX_NESTING_DEPTH_EXCEEDED"
        | "STEAM_MAX_NODE_COUNT_EXCEEDED"
        | "STEAM_LEXICAL_ERROR"
        | "STEAM_SYNTAX_ERROR"
        | "STEAM_UNCLOSED_TAG_HEADER"
        | "STEAM_UNCLOSED_ATTRIBUTE_QUOTE"
        | "STEAM_UNCLOSED_TAG"
        | "STEAM_MISMATCHED_CLOSING_TAG"
        | "STEAM_UNMATCHED_CLOSING_TAG";
     message: string;
     sourceSpan?: {
        end: {
           column: number;
           line: number;
           offset?: number;
        };
        start: {
           column: number;
           line: number;
           offset?: number;
        };
     };
  }>[];
  profile:   | "workshop-item"
     | "ugc-description"
     | "guide-section"
     | "discussion"
     | "review"
     | "announcement";
  source: string;
}>;
```

Type references: [`SteamBbcodeSyntaxNode`](../index-1.md#steambbcodesyntaxnode), [`SteamParseResourceLimits`](../index-1.md#steamparseresourcelimits).

Parse source into readonly Steam syntax with structured diagnostics.
The default profile is the registry's Workshop-item profile.
This is a syntax operation; it does not serialize GFM or claim target representability.

#### Parameters

| Parameter  | Type                                                                                                                                                                                                                                                  | Description |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `source`   | `string`                                                                                                                                                                                                                                              | -           |
| `options?` | `Readonly`<{ `profile?`: \| `"workshop-item"` \| `"ugc-description"` \| `"guide-section"` \| `"discussion"` \| `"review"` \| `"announcement"`; `resourceLimits?`: `Partial`<[`SteamParseResourceLimits`](../index-1.md#steamparseresourcelimits)>; }> | -           |

#### Returns

```ts
Readonly<{ children: readonly SteamBbcodeSyntaxNode[]; diagnostics: readonly Readonly<{ code: "STEAM_MAX_INPUT_BYTES_EXCEEDED" | "STEAM_MAX_ATTRIBUTE_BYTES_EXCEEDED" | "STEAM_MAX_NESTING_DEPTH_EXCEEDED" | "STEAM_MAX_NODE_COUNT_EXCEEDED" | "STEAM_LEXICAL_ERROR" | "STEAM_SYNTAX_ERROR" | "STEAM_UNCLOSED_TAG_HEADER" | "STEAM_UNCLOSED_ATTRIBUTE_QUOTE" | "STEAM_UNCLOSED_TAG" | "STEAM_MISMATCHED_CLOSING_TAG" | "STEAM_UNMATCHED_CLOSING_TAG"; message: string; sourceSpan?: { end: { column: number; line: number; offset?: number }; start: { column: number; line: number; offset?: number } } }>[]; profile: "workshop-item" | "ugc-description" | "guide-section" | "discussion" | "review" | "announcement"; source: string }>
```

## References

<a id="parsesteamcommunitybbcodeoptions"></a>

### ParseSteamCommunityBbcodeOptions

Re-exports [ParseSteamCommunityBbcodeOptions](../index-1.md#parsesteamcommunitybbcodeoptions)

---

<a id="steambbcodeparseresult"></a>

### SteamBbcodeParseResult

Re-exports [SteamBbcodeParseResult](../index-1.md#steambbcodeparseresult)

---

<a id="steambbcodesyntaxnode"></a>

### SteamBbcodeSyntaxNode

Re-exports [SteamBbcodeSyntaxNode](../index-1.md#steambbcodesyntaxnode)

---

<a id="steamdialectprofileid"></a>

### SteamDialectProfileId

Re-exports [SteamDialectProfileId](../index-1.md#steamdialectprofileid)
