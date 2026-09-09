// Runs only against the dedicated Armador project. Temporary users are removed in finally.
// The admin key stays in this server-side process and is never printed or written to disk.
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { demoState, emptyState } from '../lib/model.ts';
const ref = 'setgmeuidsmodcssssha',
  url = `https://${ref}.supabase.co`;
const result = JSON.parse(
  execFileSync(
    'supabase',
    ['projects', 'api-keys', '--project-ref', ref, '--output', 'json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  ),
);
const keys = Array.isArray(result) ? result : (result.keys ?? result.api_keys);
if (!Array.isArray(keys)) throw new Error('Unexpected key response shape');
const adminKey = keys.find(
  (k) => k.name === 'service_role' && !k.disabled,
)?.api_key;
const publicKey =
  keys.find((k) => k.type === 'publishable' && !k.disabled)?.api_key ??
  keys.find((k) => k.name === 'anon')?.api_key;
if (!adminKey || !publicKey)
  throw new Error('Required project keys unavailable');
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, adminKey, opts),
  users = [];
async function unwrap(p) {
  const r = await p;
  if (r.error) throw new Error(r.error.message);
  return r.data;
}
try {
  for (let i = 0; i < 2; i++) {
    const email = `armador-test-${crypto.randomUUID()}@example.invalid`,
      password = crypto.randomUUID() + 'Aa9!';
    const { user } = await unwrap(
      admin.auth.admin.createUser({ email, password, email_confirm: true }),
    );
    users.push(user.id);
    const client = createClient(url, publicKey, opts);
    const signed = await unwrap(
      client.auth.signInWithPassword({ email, password }),
    );
    assert.equal(signed.user.id, user.id);
    users[i] = { id: user.id, client };
  }
  const [a, b] = users;
  const state = demoState();
  const competition = {id: crypto.randomUUID(), name: 'Liga Paulista', season: '2026', type: 'league'};
  state.competitions = [competition];
  state.games[0].competitionId = competition.id;
  const first = await unwrap(
    a.client.rpc('armador_commit_state', {
      document: state,
      expected_revision: 0,
      expected_owner: a.id,
    }),
  );
  assert.equal(first, 1);
  const loaded = await unwrap(a.client.rpc('armador_load_state'));
  assert.equal(loaded.state.teams.length, 2);
  assert.equal(loaded.state.games.length, 1);
  assert.equal(loaded.state.competitions[0].id, competition.id);
  assert.equal(loaded.state.games[0].competitionId, competition.id);
  assert.equal((await unwrap(b.client.from('armador_competitions').select('*'))).length, 0);
  const duplicate = await a.client.from('armador_competitions').insert({owner_id:a.id, ...competition, id:crypto.randomUUID(), name:' liga   paulista '});
  assert.equal(duplicate.error?.code, '23505');
  const crossCompetition = await b.client.from('armador_competitions').insert({owner_id:a.id, ...competition, id:crypto.randomUUID()});
  assert.equal(crossCompetition.error?.code, '42501');
  const other = await unwrap(b.client.rpc('armador_load_state'));
  assert.equal(other.state, null);
  assert.equal(
    (await unwrap(b.client.from('armador_teams').select('*'))).length,
    0,
  );
  const cross = await b.client.rpc('armador_commit_state', {
    document: emptyState(),
    expected_revision: 1,
    expected_owner: a.id,
  });
  assert.equal(cross.error.code, '42501');
  const conflict = await a.client.rpc('armador_commit_state', {
    document: emptyState(),
    expected_revision: 0,
    expected_owner: a.id,
  });
  assert.equal(conflict.error.code, 'PT409');
  assert.equal(
    (await unwrap(a.client.rpc('armador_load_state'))).state.games.length,
    1,
  );
  await unwrap(a.client.auth.signOut());
  assert.ok((await a.client.from('armador_teams').select('*')).error);
  console.log(
    'PASS: login real de duas contas; persistência; recarga; isolamento; conflito; logout. Nenhum e-mail enviado.',
  );
} finally {
  for (const u of users) {
    const id = typeof u === 'string' ? u : u.id;
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw new Error('Falha ao remover conta temporária: ' + id);
  }
}
