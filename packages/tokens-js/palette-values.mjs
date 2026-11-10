// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// oklch to Display P3, by Björn Ottosson's oklab matrices, linear sRGB to
// linear Display P3, and the sRGB transfer function both spaces share.
// Channels keep three decimals, as Radix writes its P3 values.
export function p3([l, c, h]) {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lms = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0638541728 * b,
    l - 0.0894841775 * a - 1.291485548 * b,
  ].map((x) => x ** 3);
  const srgb = [
    [4.0767416621, -3.3077115913, 0.2309699292],
    [-1.2684380046, 2.6097574011, -0.3413193965],
    [-0.0041960863, -0.7034186147, 1.707614701],
  ].map((row) => row.reduce((sum, k, i) => sum + k * lms[i], 0));
  return [
    [0.8224621, 0.177538, 0],
    [0.0331941, 0.9668058, 0],
    [0.0170827, 0.0723974, 0.9105199],
  ].map((row) => {
    const linear = Math.min(
      1,
      Math.max(
        0,
        row.reduce((sum, k, i) => sum + k * srgb[i], 0),
      ),
    );
    const encoded =
      linear <= 0.0031308
        ? 12.92 * linear
        : 1.055 * linear ** (1 / 2.4) - 0.055;
    return Number(encoded.toFixed(3));
  });
}

export function mergePalettes(files) {
  const merged = { light: {}, dark: {} };
  for (const { file, palette } of files) {
    const mode = file.endsWith(".dark.tokens.json") ? "dark" : "light";
    for (const [scale, group] of Object.entries(palette)) {
      merged[mode][scale] = Object.fromEntries(
        Object.entries(group)
          .filter(([key]) => !key.startsWith("$"))
          .map(([key, token]) => [
            key,
            { ...token.$value, p3: p3(token.$value.components) },
          ]),
      );
    }
  }
  return merged;
}
