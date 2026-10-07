[**steam-community-bbcode**](../index.md)

---

[steam-community-bbcode](../index.md) / mdast/steam-table-layout

# mdast/steam-table-layout

## Type Aliases

<a id="steamtablelayout"></a>

### SteamTableLayout

```ts
type SteamTableLayout = {
  equalcells?: boolean;
  noborder?: boolean;
};
```

#### Type Parameters

#### Type Declaration

<a id="equalcells"></a>

##### equalcells?

```ts
optional equalcells?: boolean;
```

<a id="noborder"></a>

##### noborder?

```ts
optional noborder?: boolean;
```

## Functions

<a id="steamtablelayout-1"></a>

### steamTableLayout()

```ts
function steamTableLayout(rawAttributes): SteamTableLayout | undefined;
```

Type references: [`SteamTableLayout`](#steamtablelayout).

Recognize only the two sourced Steam layout settings.
Duplicate keys and unknown values remain ambiguous; silently choosing a winner would lose source.

#### Parameters

##### rawAttributes

`string`

#### Returns

```ts
SteamTableLayout | undefined
```
