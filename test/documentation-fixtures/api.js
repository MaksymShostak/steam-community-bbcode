// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Retain the input in a labelled envelope.
 * @template T
 * @param {T} value Input value.
 * @returns {import('./model.js').Envelope<T>} The same generic value and a label.
 */
export function envelope(value) {
  return {value, label: 'Example'};
}

/**
 * Retain every documented default value.
 * @param {object} [options] Options.
 * @param {number} [count] Count.
 * @param {boolean} [enabled] Enabled.
 * @param {string} [label] Label.
 */
export function documentedDefaults(options = {}, count = 0, enabled = false, label = '') {
  return {options, count, enabled, label};
}
