// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// This scanner deliberately accepts only the simple job mappings and runner
// values used here. A new YAML shape needs review before it can pass.
const allowedRunners = new Set(["ubuntu-26.04"]);

function runnerLabels(value) {
  if (value.includes("${{")) return null;
  const scalar = (text) => {
    const match = /^(?:([\w.-]+)|"([\w.-]+)"|'([\w.-]+)')$/.exec(text.trim());
    return match ? (match[1] ?? match[2] ?? match[3]) : null;
  };
  if (value.startsWith("[") && value.endsWith("]")) {
    const labels = value.slice(1, -1).split(",").map(scalar);
    return labels.every((label) => label !== null) ? labels : null;
  }
  const label = scalar(value);
  return label === null ? null : [label];
}

function checkRunnerValue(value, job, failures) {
  const labels = runnerLabels(value);
  if (!labels) {
    failures.push(`${job}: unsupported runs-on ${JSON.stringify(value)}`);
    return;
  }
  for (const label of labels) {
    if (!allowedRunners.has(label)) {
      failures.push(`${job}: runs-on ${JSON.stringify(label)} is not allowed`);
    }
  }
}

function checkRunnerLine(line, state) {
  if (/^ {5,}/.test(line)) {
    if (state.afterRunner) {
      state.failures.push(`${state.job}: unsupported multiline runs-on`);
    }
    return;
  }
  state.afterRunner = false;
  const runner = /^ {4}(?:runs-on|"runs-on"|'runs-on'):\s*(.*?)\s*$/.exec(line);
  if (!runner) return;
  state.afterRunner = true;
  state.jobs.set(state.job, state.jobs.get(state.job) + 1);
  // Comments are allowed after a value, never inside a runner label.
  const value = runner[1].replace(/\s+#.*$/, "").trim();
  checkRunnerValue(value, state.job, state.failures);
}

function beginJob(line, index, state) {
  const match = /^ {2}([\w-]+):\s*$/.exec(line);
  state.job = match?.[1];
  state.afterRunner = false;
  if (!state.job || state.jobs.has(state.job)) {
    state.failures.push(`line ${index + 1}: unsupported or duplicate job`);
  } else {
    state.jobs.set(state.job, 0);
  }
}

function scanLine(line, index, state) {
  if (/^\s*(?:#.*)?$/.test(line)) return;
  if (/^jobs:\s*$/.test(line)) {
    if (state.foundJobs) state.failures.push("duplicate jobs mapping");
    state.foundJobs = true;
    state.inJobs = true;
    return;
  }
  if (!state.inJobs) return;
  if (/^\S/.test(line)) {
    state.inJobs = false;
    return;
  }
  if (/^ {2}\S/.test(line)) {
    beginJob(line, index, state);
    return;
  }
  if (!state.job || !/^ {4,}\S/.test(line)) {
    state.failures.push(`line ${index + 1}: unsupported jobs mapping`);
    return;
  }
  checkRunnerLine(line, state);
}

export function runnerFailures(source) {
  const state = {
    failures: [],
    jobs: new Map(),
    inJobs: false,
    foundJobs: false,
    job: undefined,
    afterRunner: false,
  };
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    scanLine(line, index, state);
  }
  if (!state.foundJobs || state.jobs.size === 0) {
    state.failures.push("no supported jobs found");
  }
  for (const [name, count] of state.jobs) {
    if (count !== 1)
      state.failures.push(`${name}: expected exactly one runs-on`);
  }
  return state.failures;
}
