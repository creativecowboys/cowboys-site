// Runs the onboarding unit tests with the Node test runner, the same way test-call-owner.cjs does:
// transpile the pure modules into a temp dir and rewrite the "@/lib/calls/…" imports to local files.
// No Monday, no Blob, no network — these cover validation, checklist rules and Monday payload shaping.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-onboarding-tests-'));
const sources = {
  'calls-validation': '../src/lib/calls/validation.ts', 'outcomes': '../src/lib/calls/outcomes.ts',
  'config': '../src/lib/onboarding/config.ts', 'api': '../src/lib/onboarding/api.ts', 'checklist': '../src/lib/onboarding/checklist.ts',
  'validation': '../src/lib/onboarding/validation.ts', 'pipeline': '../src/lib/onboarding/pipeline.ts',
  'clients-config': '../src/lib/clients/config.ts', 'clients-stripe': '../src/lib/clients/stripe.ts', 'clients-board': '../src/lib/clients/board.ts', 'clients-types': '../src/lib/clients/types.ts', 'clients.test': '../src/lib/clients/clients.test.ts',
  'checklist.test': '../src/lib/onboarding/checklist.test.ts', 'validation.test': '../src/lib/onboarding/validation.test.ts', 'pipeline.test': '../src/lib/onboarding/pipeline.test.ts',
};
try {
  for (const [name, rel] of Object.entries(sources)) {
    let input = fs.readFileSync(path.join(__dirname, rel), 'utf8');
    input = input.replace(/from "@\/lib\/calls\/validation"/g, 'from "./calls-validation"').replace(/from "@\/lib\/onboarding\/api"/g, 'from "./api"').replace(/from "@\/lib\/onboarding\/config"/g, 'from "./config"')
      .replace(/from "\.\/stripe"/g, 'from "./clients-stripe"').replace(/from "\.\/board"/g, 'from "./clients-board"');
    if (name.startsWith('clients')) input = input.replace(/from "\.\/config"/g, 'from "./clients-config"').replace(/from "\.\/types"/g, 'from "./clients-types"').replace(/from "@\/lib\/onboarding\/config"/g, 'from "./config"').replace(/from "\.\/validation"/g, name.startsWith('calls') || name === 'outcomes' ? 'from "./validation"' : 'from "./validation"');
    if (name === 'calls-validation') input = input.replace(/from "\.\/outcomes"/g, 'from "./outcomes"');
    const result = ts.transpileModule(input, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
    fs.writeFileSync(path.join(output, `${name}.js`), result.outputText);
  }
  // calls/validation imports "./validation"? No — it imports "./outcomes" only; onboarding/validation imports "./config" and "@/lib/calls/validation".
  const tests = ['checklist.test', 'validation.test', 'pipeline.test', 'clients.test'].map((t) => path.join(output, `${t}.js`));
  process.exitCode = spawnSync(process.execPath, ['--test', ...tests], { stdio: 'inherit' }).status ?? 1;
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}
