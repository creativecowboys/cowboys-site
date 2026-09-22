import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { assignOwner, getCallLead, mapLead, GIVEAWAY_BOARD_ID, saveCall, TEAM } from './monday';
import { CALL_OUTCOMES, mondayOutcome } from './outcomes';
import { validateCallDraft, validateAssign } from './validation';
import type { CallDraft } from '@/app/leads/types';

const oldVersion = '2026-09-22T14:00:00Z';
const newVersion = '2026-09-22T14:01:00Z';
const item = (owner = '', version = oldVersion, board = GIVEAWAY_BOARD_ID) => ({
  id: '12345', name: 'Isolated test', updated_at: version, board: { id: board }, group: { title: 'Tests' },
  column_values: [{ id: 'owner', text: owner, value: JSON.stringify({ personsAndTeams: owner ? [{ id: Number(owner), kind: 'person' }] : [] }) }], updates: [],
});
let requests: { query: string; variables: Record<string, unknown> }[];
let queue: (object | Error)[];
const originalFetch = global.fetch;
const originalToken = process.env.MONDAY_API_TOKEN;
beforeEach(() => {
  requests = []; queue = []; process.env.MONDAY_API_TOKEN = 'nonfunctional-test-token';
  global.fetch = async (_url, init) => {
    requests.push(JSON.parse(String(init?.body)));
    const next = queue.shift();
    if (next instanceof Error) throw next;
    assert.ok(next, 'Unexpected upstream request');
    return new Response(JSON.stringify({ data: next }), { status: 200 });
  };
});
afterEach(() => {
  global.fetch = originalFetch;
  if (originalToken === undefined) delete process.env.MONDAY_API_TOKEN; else process.env.MONDAY_API_TOKEN = originalToken;
});

test('assignment requires a known owner and the draft version', () => {
  for (const owner of ['Dave', 'Josh', 'Keaton', '']) assert.deepEqual(validateAssign({ owner, expectedUpdatedAt: oldVersion }), { owner, expectedUpdatedAt: oldVersion });
  for (const value of [{ owner: 'Dave' }, { owner: 'Stranger', expectedUpdatedAt: oldVersion }, { owner: 'Dave', expectedUpdatedAt: 'yesterday' }, { owner: 'Dave', expectedUpdatedAt: oldVersion, extra: true }]) assert.throws(() => validateAssign(value));
});
for (const [owner, id] of Object.entries(TEAM)) test(`assigns ${owner} to the matching Monday person and returns the new version`, async () => {
  queue.push({ items: [item()] }, { change_multiple_column_values: { id: '12345' } }, { items: [item(String(id), newVersion)] });
  const lead = await assignOwner('12345', owner as keyof typeof TEAM, oldVersion);
  assert.equal(lead.ownerId, String(id)); assert.equal(lead.updatedAt, newVersion);
  assert.deepEqual(JSON.parse(requests[1].variables.values as string), { owner: { personsAndTeams: [{ id, kind: 'person' }] } });
});
test('clearing the owner is confirmed by readback', async () => {
  queue.push({ items: [item(String(TEAM.Dave))] }, { change_multiple_column_values: { id: '12345' } }, { items: [item('', newVersion)] });
  assert.equal((await assignOwner('12345', '', oldVersion)).ownerId, '');
  assert.deepEqual(JSON.parse(requests[1].variables.values as string), { owner: { personsAndTeams: [] } });
});
test('stale draft cannot assign or silently rebase over a teammate change', async () => {
  queue.push({ items: [item('', newVersion)] });
  await assert.rejects(assignOwner('12345', 'Dave', oldVersion), { status: 409 });
  assert.equal(requests.length, 1);
});
test('assignment remains locked to the giveaway board', async () => {
  queue.push({ items: [item('', oldVersion, '999')] });
  await assert.rejects(assignOwner('12345', 'Dave', oldVersion), { status: 404 });
  assert.equal(requests.length, 1);
});
test('a different owner in readback cannot be reported as success', async () => {
  queue.push({ items: [item()] }, { change_multiple_column_values: { id: '12345' } }, { items: [item(String(TEAM.Josh), newVersion)] });
  await assert.rejects(assignOwner('12345', 'Dave', oldVersion), { status: 409 });
});
test('an uncertain assignment mutation is not automatically retried', async () => {
  queue.push({ items: [item()] }, new Error('timeout'));
  await assert.rejects(assignOwner('12345', 'Dave', oldVersion), { status: 502 });
  assert.equal(requests.length, 2);
});
for (const outcome of CALL_OUTCOMES) test(`notes save after assignment with outcome: ${outcome}`, async () => {
  const assigned = item(String(TEAM.Keaton), newVersion);
  queue.push({ items: [item()] }, { change_multiple_column_values: { id: '12345' } }, { items: [assigned] });
  const lead = await assignOwner('12345', 'Keaton', oldVersion);
  const draft: CallDraft = {
    callId: '78f205d3-abc0-4e10-812f-ccb149629725', leadId: '12345', expectedUpdatedAt: lead.updatedAt, rep: 'Keaton',
    goal: '', currentMarketing: '', challenge: '', budget: '', timing: '', recommendation: '', notes: 'Notes typed before assignment.',
    nextStep: '', outcome, interest: '', followupDate: '', quotedMonthly: '',
  };
  queue.push({ items: [assigned] }, { items: [assigned] }, { items: [assigned] }, { create_update: { id: '789' } }, { items: [assigned] }, { change_multiple_column_values: { id: '12345' } });
  assert.equal(validateCallDraft(draft, '12345').outcome, outcome);
  for (const stale of ['', 'Call Held', 'Contacted', 'Call Booked', 'Not Interested']) assert.throws(() => validateCallDraft({ ...draft, outcome: stale }, '12345'), { status: 400 });
  const result = await saveCall(draft);
  assert.equal(result.saved, true); assert.equal(result.warning, undefined);
  const note = requests.find(r => r.query.includes('mutation SaveCallNote'));
  assert.ok(String(note?.variables.body).includes('Notes typed before assignment.'));
  assert.ok(String(note?.variables.body).includes('Keaton'));
  assert.ok(String(note?.variables.body).includes(outcome));
  const fields = requests.find(r => r.query.includes('mutation SaveCallFields'));
  assert.equal(JSON.parse(fields?.variables.values as string).outreach.label, mondayOutcome(outcome));
});


test('reopening a lead returns newest-first saved notes with call markers removed', async () => {
  const record = { ...item(), updates: [
    { id: '1', text_body: 'Older context', created_at: '2026-09-20T12:00:00Z', creator: { name: 'Keaton' } },
    { id: '2', text_body: 'Conversation notes: Remember this detail. [CC-CALL:78f205d3-abc0-4e10-812f-ccb149629725]', created_at: '2026-09-22T12:00:00Z', creator: { name: 'Dave' } },
  ] };
  queue.push({ items: [record] });
  const result = await getCallLead('12345');
  assert.equal(result.history[0].id, '2');
  assert.equal(result.history[0].text, 'Conversation notes: Remember this detail.');
  assert.equal(result.history[0].isCallNote, true);
  assert.equal(result.history[1].isCallNote, false);
});
test('all assigned people are available for owner filtering', () => {
  const record = { ...item(), column_values: [{ id: 'owner', text: 'Dave Collum, Keaton Vanwey', value: JSON.stringify({ personsAndTeams: [{ id: TEAM.Dave, kind: 'person' }, { id: TEAM.Keaton, kind: 'person' }] }) }] };
  const lead = mapLead(record);
  assert.deepEqual(lead.ownerIds, [String(TEAM.Dave), String(TEAM.Keaton)]);
  assert.equal(lead.ownerId, String(TEAM.Dave));
});
