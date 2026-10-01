// Sales-desk unit tests (Monday backend, GHL backend, the LEADS_BACKEND switch and the shared GHL client),
// run with the Node test runner: each module is transpiled to CommonJS into a temp dir with its "@/lib/…"
// imports rewritten to flat local files. No Monday, no GHL, no network — fetch is mocked inside the tests.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-desk-tests-'));
// flat name → source file. Imports are rewritten by the table below, so every module must be listed here.
const sources = {
  'validation': '../src/lib/calls/validation.ts', 'outcomes': '../src/lib/calls/outcomes.ts', 'roster': '../src/lib/calls/roster.ts',
  'followup-time': '../src/lib/calls/followup-time.ts', 'followups': '../src/lib/calls/followups.ts', 'markers': '../src/lib/calls/markers.ts',
  'monday': '../src/lib/calls/monday.ts', 'ghl': '../src/lib/calls/ghl.ts', 'switch': '../src/lib/calls/switch.ts',
  'ghl-client': '../src/lib/ghl/client.ts', 'ghl-fields': '../src/lib/ghl/fields.ts', 'ghl-reps': '../src/lib/ghl/reps.ts', 'ghl-links': '../src/lib/ghl/links.ts',
  'ghl-website-form': '../src/lib/ghl-website-form.ts', 'ghl-admin': '../src/lib/ghl/admin.ts', 'onboarding-api': '../src/lib/onboarding/api.ts',
  'roster.test': '../src/lib/calls/roster.test.ts', 'owner.test': '../src/lib/calls/owner.test.ts', 'followups.test': '../src/lib/calls/followups.test.ts',
  'ghl.test': '../src/lib/calls/ghl.test.ts', 'switch.test': '../src/lib/calls/switch.test.ts',
  'ghl-client.test': '../src/lib/ghl/client.test.ts', 'ghl-fields.test': '../src/lib/ghl/fields.test.ts', 'ghl-admin.test': '../src/lib/ghl/admin.test.ts', 'ghl-website-form.test': '../src/lib/ghl-website-form.test.ts',
};
const rewrites = [
  [/from "@\/lib\/calls\/validation"/g, 'from "./validation"'], [/from "@\/lib\/calls\/markers"/g, 'from "./markers"'],
  [/from "@\/lib\/ghl\/client"/g, 'from "./ghl-client"'], [/from "@\/lib\/ghl\/fields"/g, 'from "./ghl-fields"'],
  [/from "@\/lib\/ghl\/reps"/g, 'from "./ghl-reps"'], [/from "@\/lib\/ghl\/links"/g, 'from "./ghl-links"'],
  [/from "@\/lib\/ghl-website-form"/g, 'from "./ghl-website-form"'], [/from "@\/lib\/onboarding\/api"/g, 'from "./onboarding-api"'],
  [/from "@\/lib\/calls\/monday"/g, 'from "./monday"'], [/from "@\/lib\/calls\/ghl"/g, 'from "./ghl"'], [/from "\.\/admin"/g, 'from "./ghl-admin"'],
  [/from "\.\/links"/g, 'from "./ghl-links"'], [/from "\.\/client"/g, 'from "./ghl-client"'], [/from "\.\/fields"/g, 'from "./ghl-fields"'], [/from "\.\/reps"/g, 'from "./ghl-reps"'],
  [/from "\.\/ghl\/client"/g, 'from "./ghl-client"'], [/from "\.\/ghl\/fields"/g, 'from "./ghl-fields"'], [/from "\.\/ghl-website-form"/g, 'from "./ghl-website-form"'],
];
try {
  const present = new Set();
  for (const [name, rel] of Object.entries(sources)) {
    if (!fs.existsSync(path.join(__dirname, rel))) continue; // a module from a later commit — skip it and its tests
    present.add(name);
    let input = fs.readFileSync(path.join(__dirname, rel), 'utf8');
    for (const [re, to] of rewrites) input = input.replace(re, to);
    const result = ts.transpileModule(input, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
    fs.writeFileSync(path.join(output, `${name}.js`), result.outputText);
  }
  const tests = ['owner.test', 'roster.test', 'followups.test', 'ghl.test', 'switch.test', 'ghl-client.test', 'ghl-fields.test', 'ghl-admin.test', 'ghl-website-form.test'].filter((t) => present.has(t)).map((t) => path.join(output, `${t}.js`));
  process.exitCode = spawnSync(process.execPath, ['--test', ...tests], { stdio: 'inherit' }).status ?? 1;
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}
