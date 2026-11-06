# Partial GFM-to-Steam conversion

`gfmToSteamCommunityBbcode` consumes native GFM syntax and maps an explicit subset to Steam BBCode.
Its independent [matrix](steam-support-matrix.md#partial-gfm-to-steam) records executed cases; forward registry coverage does not establish reverse coverage.
Neither direction promises a byte-identical round trip.

## Which features convert?

- **Headings and blocks.**
  Headings 1–3, paragraphs, blockquotes and thematic breaks convert.
  Headings 4–6, raw HTML and hard breaks stay literal.
- **Formatting and code.**
  Strong, emphasis, deletion and eligible code blocks convert.
  Inline code, code with a language or metadata, and code containing a Steam closing delimiter stay literal.
- **Lists.**
  Unordered lists, ordered lists starting at 1 and nested list structure convert.
  Task state and other ordered-list starts stay literal.
- **Links and images.**
  Safe absolute links and eligible images with empty alternative text convert.
  Relative resources, reference syntax, resource titles and meaningful image alternative text stay literal.
- **Tables.**
  Rectangular tables without alignment convert.
  Tables with alignment stay literal.

## Why Markdown appears in the output

Preservation is deliberate: dropping an image's alt text, changing a list start or executing Markdown-shaped text as BBCode would lose meaning silently.
The literal encoder protects source brackets even when the input contains `[/noparse]`.
Unsupported output can therefore look like Markdown source in Steam; it does not pretend to be a faithful rendering of that unsupported feature.

## Inspect a conversion

Use `unsupportedSourceNodes` to find which features were preserved.
Use `coverage.sourceNodes` to account for individual occurrences.
A preserved parent retains its complete source span and accounts for descendants without interpreting them.
Whitespace and conventional list serialization can normalize in supported output.

The library does not fetch links, resolve repository-relative resources, upload images or verify live Steam behavior.
Default limits and their allocation/timing limitations are documented in the [security model](security-model.md).
