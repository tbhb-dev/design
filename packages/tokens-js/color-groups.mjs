// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// Preserve source groups and order while giving each leaf its CSS name.
export function colorGroups(source, path = ["color"]) {
  const groups = [];
  const tokens = [];
  for (const [name, value] of Object.entries(source)) {
    if (name.startsWith("$")) continue;
    const child = [...path, name];
    if ("$value" in value) {
      tokens.push({ name, property: `--tbhb-${child.join("-")}` });
    } else {
      groups.push(...colorGroups(value, child));
    }
  }
  return [{ name: path.join("."), tokens }, ...groups];
}
