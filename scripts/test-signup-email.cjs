// Exercises the actual contact route with email and GHL replaced by in-memory spies.
// No network, credentials, real contacts or real emails are used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const FORM_NAME = 'Black Friday Free Website';
const BOOKING = 'https://calendly.com/creativecowboys/lets-talk';

function harness({ internalError = false, customerError = false, customerThrows = false } = {}) {
  const sent = [], queued = [], mirrored = [], errors = [], cache = new Map();
  const stubs = {
    'next/server': {
      after: (callback) => queued.push(callback),
      NextResponse: { json: (body, options = {}) => ({ status: options.status || 200, body }) },
    },
    resend: { Resend: class {
      emails = { send: async (email, options) => {
        sent.push({ email, options });
        const customer = typeof email.to === 'string';
        if (customer && customerThrows) throw Error('provider transport failed');
        if ((!customer && internalError) || (customer && customerError)) return { error: { name: 'rate_limit_exceeded' } };
        return { data: { id: `fake-${sent.length}` }, error: null };
      } };
    } },
    '@/lib/ghl-website-form': { pushWebsiteFormToGHL: async (lead) => { mirrored.push(lead); return 'fake-contact'; } },
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const source = fs.readFileSync(file, 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    }, fileName: file }).outputText;
    const mod = new Module(file, module); cache.set(file, mod);
    mod.filename = file; mod.paths = module.paths;
    mod.require = (spec) => {
      if (stubs[spec]) return stubs[spec];
      if (spec.startsWith('@/')) return load(path.join(root, 'src', spec.slice(2)) + '.ts');
      return require(spec);
    };
    const originalError = console.error;
    // Logging is intercepted only during the explicit route/after invocations below.
    mod._compile(output, file);
    console.error = originalError;
    return mod.exports;
  }
  const route = load(path.join(root, 'src/app/api/contact/route.ts'));
  const helper = load(path.join(root, 'src/lib/website-signup-email.ts'));
  const withLogs = async (action) => {
    const original = console.error; console.error = (...args) => errors.push(args);
    try { return await action(); } finally { console.error = original; }
  };
  return {
    sent, queued, mirrored, errors, helper,
    post: (body) => withLogs(() => route.POST({ json: async () => body })),
    flush: () => withLogs(async () => { for (const callback of queued.splice(0)) await callback(); }),
  };
}

const lead = (overrides = {}) => ({ name: 'Jamie Example', email: 'jamie@example.test', source: FORM_NAME, elapsed_ms: 5000, message: 'Interested in a website', ...overrides });

test('genuine offer signup gets internal notification, then branded Howdy booking email and GHL mirror', async () => {
  const h = harness(); const response = await h.post(lead());
  assert.equal(response.status, 200); assert.equal(response.body.success, true);
  assert.equal(h.sent.length, 1); // customer confirmation is kept alive in after(), not a second form request
  assert.deepEqual(h.sent[0].email.to, ['dave@creativecowboys.co', 'josh@creativecowboys.co']);
  await h.flush(); assert.equal(h.sent.length, 2); assert.equal(h.mirrored.length, 1);
  const customer = h.sent[1];
  assert.equal(customer.email.to, 'jamie@example.test');
  assert.equal(customer.email.from, 'Creative Cowboys <howdy@creativecowboys.co>');
  assert.equal(customer.email.replyTo, 'howdy@creativecowboys.co');
  assert.match(customer.email.html, /cc-logo-stacked-signature\.png/);
  assert.match(customer.email.html, /background:#eee9df/);
  assert.ok(customer.email.html.includes(`href="${BOOKING}"`));
  assert.ok(customer.email.text.includes(BOOKING));
  assert.match(customer.email.html, /reach out to follow up/);
  assert.doesNotMatch(customer.email.html, /Thanksgiving|\$297|within.*days/i);
  assert.match(customer.options.idempotencyKey, /^website-signup-v1-[0-9a-f]{64}$/);
});

test('honeypot and too-fast submissions get no email, job or GHL contact', async () => {
  for (const input of [lead({ website_url: 'bot value' }), lead({ elapsed_ms: 100 })]) {
    const h = harness(); assert.equal((await h.post(input)).status, 200); await h.flush();
    assert.equal(h.sent.length, 0); assert.equal(h.mirrored.length, 0);
  }
});

test('missing email remains rejected without a confirmation', async () => {
  const h = harness(); assert.equal((await h.post(lead({ email: '' }))).status, 400);
  await h.flush(); assert.equal(h.sent.length, 0);
});

test('ordinary unrelated contact forms keep their current internal notification without offer auto-email', async () => {
  const h = harness(); assert.equal((await h.post(lead({ source: 'Contact Page' }))).status, 200);
  await h.flush(); assert.equal(h.sent.length, 1); assert.equal(h.mirrored.length, 1);
});

test('internal notification failure does not send a confirmation for an unaccepted signup', async () => {
  const h = harness({ internalError: true }); assert.equal((await h.post(lead())).status, 500);
  await h.flush(); assert.equal(h.sent.length, 1); assert.equal(h.mirrored.length, 0);
});

test('customer provider errors do not fail the accepted form or repeat its internal notification', async () => {
  for (const options of [{ customerError: true }, { customerThrows: true }]) {
    const h = harness(options); const response = await h.post(lead());
    assert.equal(response.status, 200); await h.flush();
    assert.equal(response.status, 200); assert.equal(h.sent.length, 2);
    assert.equal(h.mirrored.length, 1); assert.equal(h.errors.length, 1);
    assert.ok(!JSON.stringify(h.errors).includes('jamie@example.test'));
  }
});

test('retries use the same private idempotency key for normalized recipient', () => {
  const h = harness();
  const a = h.helper.signupConfirmation('Jamie', ' Jamie@Example.Test ', FORM_NAME);
  const b = h.helper.signupConfirmation('Jamie', 'jamie@example.test', FORM_NAME);
  assert.equal(a.idempotencyKey, b.idempotencyKey);
  assert.ok(!a.idempotencyKey.includes('jamie'));
});

test('unsafe first name is escaped and arbitrary form message is not reflected to the customer', async () => {
  const h = harness(); await h.post(lead({ name: '<img/onerror=alert(1)> Person', message: 'DO NOT ECHO THIS MESSAGE' }));
  await h.flush(); const html = h.sent[1].email.html;
  assert.match(html, /&lt;img\/onerror=alert\(1\)&gt;/);
  assert.ok(!html.includes('<img/onerror=')); assert.ok(!html.includes('DO NOT ECHO THIS MESSAGE'));
});

test('confirmation refuses a malformed mailbox or recipient list', () => {
  const h = harness();
  for (const email of ['bad', 'a@example.test,b@example.test', 'a@example.test\r\nBcc:x@example.test', 'Name <a@example.test>']) {
    assert.equal(h.helper.signupConfirmation('Jamie', email, FORM_NAME), null);
  }
});
