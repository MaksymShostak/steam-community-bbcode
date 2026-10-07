// SPDX-License-Identifier: AGPL-3.0-only
import { randomBytes, createHash } from "node:crypto";
import {
  appendFileSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

/** @param {string} value */
const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/gu,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] ?? character,
  );

class EvidenceCollectionError extends Error {
  /** @param {string[]} errors @param {{path: string, bytes: Buffer}[]} files */
  constructor(errors, files) {
    super(errors.join("\n"));
    /** @type {{path: string, bytes: Buffer}[]} */
    this.files = files;
  }
}

/** Read only the selected invocation's diagnostic roots; never follow links or dump binaries/scratch trees.
 * @param {{root?: string, mode: string, profile?: string | undefined, rendererDirectory?: string | undefined, windowDirectory?: string | undefined, registryDirectory?: string | undefined}} options
 * @returns {{path: string, bytes: Buffer}[]}
 */
export function collectEvidence({
  root = process.cwd(),
  mode,
  profile,
  rendererDirectory,
  windowDirectory,
  registryDirectory,
}) {
  const diagnostics = /\.(?:json|log|txt|stderr|md|html|lcov)$/u;
  const base = realpathSync(root);
  /** @type {string[]} */
  let roots;
  switch (mode) {
    case "converter":
      roots = [
        "artifacts/runtime-coverage",
        "artifacts/supply-chain",
        "artifacts/node-declarations",
        "artifacts/consumer-report.json",
        "artifacts/consumer-package-lock.json",
        "artifacts/consumer-declaration-files.log",
        "artifacts/pack-actual.json",
      ];
      break;
    case "markdown":
      roots = ["artifacts/prose"];
      break;
    case "archive":
      roots = [
        "artifacts/consumer-report.json",
        "artifacts/consumer-package-lock.json",
        "artifacts/consumer-declaration-files.log",
        "artifacts/pack-actual.json",
      ];
      break;
    case "consumer":
      roots = [
        "artifacts/consumer-qualification",
        "consumer-qualification.log",
      ];
      break;
    case "mutation":
      if (!["library", "cli"].includes(profile ?? ""))
        throw new Error("Unknown mutation profile.");
      roots = [`artifacts/mutation-${profile}`];
      break;
    case "renderer": {
      if (!rendererDirectory)
        throw new Error("Missing exact renderer invocation directory.");
      const path = relative(base, resolve(rendererDirectory));
      if (
        !path.startsWith(`artifacts${sep}github-rendering${sep}run-`) ||
        path.includes(`..${sep}`)
      )
        throw new Error("Renderer directory outside its output contract.");
      roots = [path];
      break;
    }
    case "trusted-markdown":
      if (!windowDirectory) throw new Error("Missing exact Markdown window.");
      roots = [windowDirectory];
      break;
    case "release":
      roots = [
        "artifacts/release-candidate",
        "artifacts/prose",
        "artifacts/runtime-coverage",
        "artifacts/supply-chain",
      ];
      break;
    case "registry":
      if (registryDirectory !== "registry-verification")
        throw new Error("Unexpected registry output.");
      roots = [registryDirectory];
      break;
    default:
      throw new Error("Unknown evidence mode.");
  }
  /** @type {{path: string, bytes: Buffer}[]} */
  const files = [];
  /** @type {string[]} */
  const errors = [];
  /** @param {string} path @param {boolean} optional */
  function collect(path, optional) {
    try {
      visit(path, optional);
    } catch (error) {
      errors.push(String(error));
    }
  }
  /** @param {string} path @param {boolean} optional */
  function visit(path, optional) {
    const full = resolve(base, path);
    /** @type {import('node:fs').Stats} */
    let stat;
    try {
      stat = lstatSync(full);
    } catch (error) {
      if (
        optional &&
        /** @type {NodeJS.ErrnoException} */ (error).code === "ENOENT"
      )
        return;
      throw error;
    }
    if (stat.isSymbolicLink())
      throw new Error(`Redirected diagnostic input: ${path}`);
    const actual = realpathSync(full);
    const within = relative(base, actual);
    const outside =
      isAbsolute(within) || within === ".." || within.startsWith(`..${sep}`);
    // The trusted observer is outside the checkout, but must remain within the exact admitted window.
    if (outside && mode !== "trusted-markdown")
      throw new Error(`Diagnostic outside checkout: ${path}`);
    if (mode === "trusted-markdown") {
      const window = resolve(windowDirectory ?? "");
      const insideWindow = relative(window, actual);
      if (
        isAbsolute(insideWindow) ||
        insideWindow === ".." ||
        insideWindow.startsWith(`..${sep}`)
      )
        throw new Error("Redirected Markdown window input.");
    }
    if (stat.isDirectory()) {
      for (const name of readdirSync(full).sort()) {
        // Installed trees, caches, generated API sites and declaration scratch are reproducible; they are not reports.
        if (
          [
            "node_modules",
            "runtime",
            "types",
            "src",
            "api-reference",
            "api-documentation-fixture",
            "cache",
            "tmp",
          ].includes(name)
        )
          continue;
        collect(join(path, name), false);
      }
    } else {
      if (!stat.isFile())
        throw new Error(`Non-regular diagnostic input: ${path}`);
      if (!diagnostics.test(full)) return;
      if (mode !== "renderer" && full.endsWith(".html")) return;
      if (
        mode === "trusted-markdown" &&
        !/(?:^|[\\/])(?:window\.json|stdout\.txt|stderr\.txt|trusted-markdown-run\.json)$/u.test(
          path,
        )
      )
        return;
      files.push({
        path: outside ? relative(resolve(windowDirectory ?? ""), full) : within,
        bytes: readFileSync(full),
      });
    }
  }
  for (const path of roots) collect(path, true);
  if (errors.length) throw new EvidenceCollectionError(errors, files);
  if (!files.length)
    throw new Error(
      "No current diagnostic files were produced; evidence is unavailable.",
    );
  return files;
}

/** Stream full diagnostic text with runner commands suspended; the summary contains only escaped inventory and identities.
 * @param {ReturnType<typeof collectEvidence>} files
 * @param {{mode: string, env?: NodeJS.ProcessEnv, write?: (text: string) => void, summary?: (text: string) => void}} options
 */
export function reportEvidence(
  files,
  {
    mode,
    env = process.env,
    write = (text) => process.stdout.write(text),
    summary = (text) => {
      if (env["GITHUB_STEP_SUMMARY"])
        appendFileSync(env["GITHUB_STEP_SUMMARY"], text);
    },
  },
) {
  const texts = files.map((file) => file.bytes.toString("utf8"));
  // A guessed token in candidate diagnostics must never re-enable command parsing.
  let token = "";
  do {
    token = `bbcode-${randomBytes(32).toString("hex")}`;
  } while (texts.some((text) => text.includes(token)));
  const identity = {
    mode,
    source: env["GITHUB_SHA"] ?? "local",
    workflowSource: env["GITHUB_WORKFLOW_SHA"] ?? "local",
    run: env["GITHUB_RUN_ID"] ?? "local",
    attempt: env["GITHUB_RUN_ATTEMPT"] ?? "local",
    lane: env["EVIDENCE_LANE"] ?? env["GITHUB_JOB"] ?? "local",
    node: process.version,
    outcome: env["EVIDENCE_OUTCOME"] ?? "unknown",
  };
  /** @type {string[]} */
  const rows = [];
  write(`::stop-commands::${token}\n`);
  try {
    write(`Evidence identity: ${JSON.stringify(identity)}\n`);
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (!file)
        throw new Error("Diagnostic inventory changed during reporting.");
      const hash = createHash("sha256").update(file.bytes).digest("hex");
      write(
        `\nEvidence file: ${JSON.stringify({ path: file.path, bytes: file.bytes.length, sha256: hash })}\n${texts[index]}\n`,
      );
      rows.push(
        `<li>${escapeHtml(file.path)}: ${file.bytes.length} bytes; SHA-256 ${hash}</li>`,
      );
    }
  } finally {
    write(`\n::${token}::\n`);
  }
  // Missing records matter on failure too; always preserve available output first.
  /** @type {string[]} */
  const missing = [];
  {
    const paths = files.map((file) => file.path.replaceAll("\\", "/"));
    /** @type {string[]} */
    let required = [];
    switch (mode) {
      case "markdown":
        required = [
          "artifacts/prose/check.json",
          "artifacts/prose/check.stderr.txt",
        ];
        break;
      case "archive":
        required = [
          "artifacts/consumer-report.json",
          "artifacts/consumer-package-lock.json",
          "artifacts/pack-actual.json",
        ];
        break;
      case "consumer":
        required = [
          "artifacts/consumer-qualification/consumer-report.json",
          "artifacts/consumer-qualification/consumer-package-lock.json",
          "consumer-qualification.log",
        ];
        break;
      case "converter":
        required = [
          "artifacts/runtime-coverage/coverage-final.json",
          "artifacts/runtime-coverage/coverage-summary.json",
          "artifacts/supply-chain/package.cdx.json",
          "artifacts/supply-chain/type-coverage.cdx.json",
          "artifacts/supply-chain/api-docs.cdx.json",
          "artifacts/consumer-report.json",
        ];
        if (
          !paths.some((path) =>
            /^artifacts\/node-declarations\/\d+\/result\.json$/u.test(path),
          )
        )
          missing.push("declaration qualification record");
        break;
      case "mutation":
        if (
          !paths.some((path) =>
            /^artifacts\/mutation-(?:library|cli)\/mutation\.json$/u.test(path),
          )
        )
          missing.push("native mutation record");
        break;
      case "release":
        required = [
          "artifacts/release-candidate/candidate.json",
          "artifacts/release-candidate/pack-actual.json",
          "artifacts/release-candidate/consumer-report.json",
          "artifacts/release-candidate/production-audit.json",
          "artifacts/release-candidate/production.cdx.json",
          "artifacts/prose/check.json",
        ];
        break;
      case "registry":
        required = [
          "registry-verification/registry-metadata.json",
          "registry-verification/registry-verification.json",
          "registry-verification/signature-audit.json",
          "registry-verification/consumer-report.json",
          "registry-verification/consumer-package-lock.json",
        ];
        break;
      case "trusted-markdown":
        required = ["window.json"];
        for (let sample = 1; sample <= 6; sample++)
          required.push(
            `sample-${sample}/markdown-evidence/trusted-markdown-run.json`,
            `sample-${sample}/stdout.txt`,
            `sample-${sample}/stderr.txt`,
          );
        break;
      case "renderer":
        if (
          !paths.some((path) => path.endsWith("/request.md")) ||
          !paths.some((path) => path.endsWith("/response.html"))
        )
          missing.push("renderer request/response");
        break;
    }
    for (const path of required) if (!paths.includes(path)) missing.push(path);
    if (missing.length) write(`Missing evidence: ${JSON.stringify(missing)}\n`);
  }
  const header = `<h3>Qualification diagnostics</h3><pre>${escapeHtml(JSON.stringify(identity, null, 2))}</pre>${missing.length ? `<p>Missing required diagnostic records: ${escapeHtml(missing.join(", "))}</p>` : ""}\n`;
  let inventory = "<ul>";
  let included = 0;
  for (const row of rows) {
    if (Buffer.byteLength(header + inventory + row) > 64 * 1024) break;
    inventory += row;
    included++;
  }
  summary(
    `${header}${inventory}</ul><p>${files.length} complete files streamed to this step's log; ${included} listed here. Masking, provider truncation, cancellation and expiry can limit retrieval. Local hashes identify original bytes, not unchanged provider display.</p>\n`,
  );
  if (missing.length && env["EVIDENCE_OUTCOME"] === "success")
    throw new Error(
      `Missing required diagnostic record: ${missing.join(", ")}`,
    );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const { values } = parseArgs({
    options: {
      mode: { type: "string" },
      profile: { type: "string" },
      "renderer-directory": { type: "string" },
      "window-directory": { type: "string" },
      "registry-directory": { type: "string" },
    },
  });
  try {
    reportEvidence(
      collectEvidence({
        mode: values.mode ?? "",
        profile: values.profile,
        rendererDirectory: values["renderer-directory"],
        windowDirectory: values["window-directory"],
        registryDirectory: values["registry-directory"],
      }),
      { mode: values.mode ?? "" },
    );
  } catch (error) {
    reportEvidence(
      [
        ...(error instanceof EvidenceCollectionError ? error.files : []),
        { path: "reporting-failure.txt", bytes: Buffer.from(String(error)) },
      ],
      {
        mode: values.mode ?? "unavailable",
        env: { ...process.env, EVIDENCE_OUTCOME: "failure" },
      },
    );
    process.exitCode = 1;
  }
}
