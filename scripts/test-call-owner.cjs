const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-owner-tests-'));
try {
  for (const name of ['monday', 'validation', 'owner.test']) {
    const input = fs.readFileSync(path.join(__dirname, '../src/lib/calls', `${name}.ts`), 'utf8');
    const result = ts.transpileModule(input, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
    fs.writeFileSync(path.join(output, `${name}.js`), result.outputText);
  }
  process.exitCode = spawnSync(process.execPath, ['--test', path.join(output, 'owner.test.js')], { stdio: 'inherit' }).status ?? 1;
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}
