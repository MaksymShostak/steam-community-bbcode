[**steam-community-bbcode**](../index.md)

---

[steam-community-bbcode](../index.md) / diagnostics/conversion-result

# diagnostics/conversion-result

## Type Aliases

<a id="constructconversionoutcome"></a>

### ConstructConversionOutcome

```ts
type ConstructConversionOutcome = Readonly<{
  constructId: DiagnosticConstructId;
  fidelity: ConversionFidelity;
  sourceSpan: ReadonlySourceSpan;
}>;
```

Type references: [`DiagnosticConstructId`](#diagnosticconstructid), [`ConversionFidelity`](../index-1.md#conversionfidelity), [`ReadonlySourceSpan`](../steam/steam-bbcode-syntax.md#readonlysourcespan).

#### Type Parameters

---

<a id="contextonlyrendererpolicy"></a>

### ContextOnlyRendererPolicy

```ts
type ContextOnlyRendererPolicy = Readonly<{
  constructId: ConstructId;
  fidelity: "unsupported";
  policy: "preserve-source";
  reason: string;
}>;
```

Type references: [`ConstructId`](../index-1.md#constructid).

#### Type Parameters

---

<a id="conversioncoverage"></a>

### ConversionCoverage

```ts
type ConversionCoverage = Readonly<{
  constructs: readonly ConstructConversionOutcome[];
  contextOnlyPolicies: readonly ContextOnlyRendererPolicy[];
  profile: SteamDialectProfileId;
  registryVersion: string;
}>;
```

Type references: [`ConstructConversionOutcome`](#constructconversionoutcome), [`ContextOnlyRendererPolicy`](#contextonlyrendererpolicy), [`SteamDialectProfileId`](../index-1.md#steamdialectprofileid).

#### Type Parameters

---

<a id="conversiondiagnosticdetail"></a>

### ConversionDiagnosticDetail

```ts
type ConversionDiagnosticDetail = Readonly<{
  code: DiagnosticCode;
  fidelity: ConversionFidelity;
  message: string;
  severity: "info" | "warning" | "error";
  sourceSpan?: ReadonlySourceSpan;
}>;
```

Type references: [`DiagnosticCode`](../index-1.md#diagnosticcode), [`ConversionFidelity`](../index-1.md#conversionfidelity), [`ReadonlySourceSpan`](../steam/steam-bbcode-syntax.md#readonlysourcespan).

#### Type Parameters

---

<a id="diagnosticconstructid"></a>

### DiagnosticConstructId

```ts
type DiagnosticConstructId = ConstructId | "steam.bbcode.unknown";
```

Type references: [`ConstructId`](../index-1.md#constructid).

#### Type Parameters

---

<a id="gfmnodeconversionoutcome"></a>

### GfmNodeConversionOutcome

```ts
type GfmNodeConversionOutcome = Readonly<{
  fidelity: ConversionFidelity;
  nodeType: Nodes["type"];
  sourceSpan?: ReadonlySourceSpan;
}>;
```

Type references: [`ConversionFidelity`](../index-1.md#conversionfidelity), [`ReadonlySourceSpan`](../steam/steam-bbcode-syntax.md#readonlysourcespan).

#### Type Parameters

## References

<a id="conversiondiagnostic"></a>

### ConversionDiagnostic

Re-exports [ConversionDiagnostic](../index-1.md#conversiondiagnostic)

---

<a id="conversionfidelity"></a>

### ConversionFidelity

Re-exports [ConversionFidelity](../index-1.md#conversionfidelity)

---

<a id="conversionresult"></a>

### ConversionResult

Re-exports [ConversionResult](../index-1.md#conversionresult)

---

<a id="partialconversionresult"></a>

### PartialConversionResult

Re-exports [PartialConversionResult](../index-1.md#partialconversionresult)

---

<a id="unsupportedgfmfeaturediagnostic"></a>

### UnsupportedGfmFeatureDiagnostic

Re-exports [UnsupportedGfmFeatureDiagnostic](../index-1.md#unsupportedgfmfeaturediagnostic)
