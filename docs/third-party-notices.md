# Third-party notices

## Imported repository helper and historical fixture

`scripts/runRepositoryPython.js` was copied from the ONI repository at source commit `fe75c5d8e29f68e43812439fbc6ec73df2f43b05` and remains MIT-licensed.
Its complete original notice is retained in `scripts/runRepositoryPython.LICENSE` in source checkouts; it is development tooling and is not distributed in the npm archive.
The copied historical Workshop fixture retains the original MIT/Klei text in `test/fixtures/steamify/ONI-LICENSE.txt`.
These source-only materials do not change the runtime package's AGPL-3.0-only licence.

The converter's own code is licensed under [AGPL-3.0-only](../LICENSE).
This document preserves the separate terms for third-party text included in its generated documentation.
Dependencies installed through npm retain their own licence and notice files.

## Temporary TypeDoc development patch

The source-only `tooling/api-docs/patches/typedoc+0.28.20.patch` adapts TypeDoc's traversal to minimatch 11's native API, following TypeStrong/typedoc PR #3151.
TypeDoc's Apache-2.0 licence is retained at `tooling/api-docs/patches/typedoc.LICENSE`.
The patch, patch-package and TypeDoc are development tooling excluded from the npm runtime archive.

## Local jq development tool

Environment setup downloads the official jq binary for the host using the version, size and SHA-256 in `scripts/repository-jq.js`.
The upstream [COPYING notice](https://github.com/jqlang/jq/blob/jq-1.8.2/COPYING), including its incorporated-component notices, is retained in `scripts/repository-jq.COPYING` and copied beside the local executable.
The tool is used only for development tests and is excluded from the npm package.

## Generated unist descriptions

The generated [SourceSpan reference](https://github.com/MaksymShostak/steam-community-bbcode/blob/6d0d731399c5afb6418c11682b2ad63bdb02d600/docs/reference/index-1.md#sourcespan) includes descriptions from `@types/unist` 3.0.3.
Its published package supplies the following notice:

```text
    MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
```
