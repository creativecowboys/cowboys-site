// Desk-on-GoHighLevel unit tests (Phase 2: Onboarding + Clients tabs), run with the Node test runner.
// Unlike the two older runners (flat files + a hand-kept rewrite table), this one follows imports: it starts
// from every src/lib/desk/*.test.ts, transpiles each module it reaches into a temp dir that mirrors the repo
// tree, and rewrites "@/…" imports to relative paths. No network, no Monday, no GoHighLevel, no Blob:
// fetch is replaced by an in-memory GoHighLevel (src/lib/desk/testing/fake-ghl.ts) and "@vercel/blob" by an
// in-memory store (src/lib/desk/testing/blob-stub.ts).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-desk-tests-'));
// bare module → repo source file that stands in for it under test
const STUBS = { '@vercel/blob': 'src/lib/desk/testing/blob-stub.ts' };
const emitted = new Map(); // absolute source path → absolute output path

function resolveSource(spec, from) {
  let base;
  if (STUBS[spec]) base = path.join(root, STUBS[spec]);
  else if (spec.startsWith('@/')) base = path.join(root, 'src', spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
  else return null; // node: builtins and real packages stay as they are
  for (const candidate of [base, `${base}.ts`, path.join(base, 'index.ts')]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  if (fs.existsSync(`${base}.tsx`)) throw new Error(`${path.relative(root, from)} imports a UI file (${spec}); desk tests cover server modules only.`);
  throw new Error(`Cannot resolve "${spec}" from ${path.relative(root, from)}`);
}
const outPathFor = (abs) => path.join(out, path.relative(root, abs)).replace(/\.ts$/, '.js');

function emit(abs) {
  if (emitted.has(abs)) return emitted.get(abs);
  const target = outPathFor(abs);
  emitted.set(abs, target);
  let source = fs.readFileSync(abs, 'utf8');
  source = source.replace(/(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])([^"'\n]+)\2/g, (whole, lead, quote, spec) => {
    const dep = resolveSource(spec, abs);
    if (!dep) return whole;
    let rel = path.relative(path.dirname(target), emit(dep)).split(path.sep).join('/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return `${lead}${quote}${rel}${quote}`;
  });
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: abs });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, result.outputText);
  return target;
}

try {
  const dir = path.join(root, 'src', 'lib', 'desk');
  const only = process.argv.slice(2);
  const tests = fs.readdirSync(dir).filter((f) => f.endsWith('.test.ts')).filter((f) => !only.length || only.some((o) => f.includes(o))).sort().map((f) => emit(path.join(dir, f)));
  if (!tests.length) { console.error('No desk tests matched.'); process.exitCode = 1; }
  else process.exitCode = spawnSync(process.execPath, ['--test', ...tests], { stdio: 'inherit', env: { ...process.env, NODE_PATH: path.join(root, 'node_modules') } }).status ?? 1;
} finally {
  fs.rmSync(out, { recursive: true, force: true });
}
