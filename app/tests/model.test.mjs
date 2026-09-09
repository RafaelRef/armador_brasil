import test from 'node:test';
import assert from 'node:assert/strict';
import {
  demoState,
  newGame,
  box,
  score,
  blank,
  pct,
  validateState,
  validateGame,
  advanced,
  quintets,
  uid,
} from '../lib/model.ts';
const fixture = () => {
  const d = demoState();
  const g = newGame(...d.teams);
  g.remaining = 500;
  return g;
};
const shot = (g, over = {}) => ({
  id: uid(),
  kind: 'shot',
  team: g.home.id,
  player: g.home.players[0].id,
  period: 1,
  elapsed: 20,
  value: 2,
  made: true,
  ...over,
});
test('demonstração deriva 89–88 de lances válidos', () => {
  const s = demoState();
  validateState(s);
  assert.equal(score(s.games[0], s.teams[0].id), 89);
  assert.equal(score(s.games[0], s.teams[1].id), 88);
});
test('corrigir cesta recalcula pontos, tentativas e assistência vinculada', () => {
  const g = fixture();
  g.events = [shot(g, { value: 3, other: g.home.players[1].id })];
  let b = box(g);
  assert.equal(b[g.home.id].pts, 3);
  assert.equal(b[g.home.players[1].id].ast, 1);
  g.events[0] = { ...g.events[0], made: false, other: undefined };
  b = box(g);
  assert.equal(b[g.home.id].pts, 0);
  assert.equal(b[g.home.id].fga, 1);
  assert.equal(b[g.home.id].ast, 0);
});
test('exclusão remove cesta e assistência sem acumuladores residuais', () => {
  const g = fixture();
  g.events = [shot(g, { other: g.home.players[1].id })];
  g.events = [];
  assert.equal(box(g)[g.home.id].pts, 0);
  assert.equal(box(g)[g.home.id].ast, 0);
});
test('lance livre não aumenta tentativas de campo', () => {
  const g = fixture();
  g.events = [shot(g, { free: true, value: 1 })];
  const b = box(g)[g.home.id];
  assert.equal(b.fta, 1);
  assert.equal(b.fga, 0);
  assert.equal(b.pts, 1);
});
test('estatística de equipe não duplica os totais dos jogadores', () => {
  const g = fixture();
  g.events = [{ ...shot(g), kind: 'oreb', player: g.home.id }];
  assert.equal(box(g)[g.home.id].oreb, 1);
  assert.equal(box(g)[g.home.players[0].id].oreb, 0);
});
test('substituição distribui minutos e mais/menos pelo instante do lance', () => {
  const g = fixture(),
    out = g.home.players[0].id,
    incoming = g.home.players[5].id;
  g.events = [
    shot(g),
    {
      id: uid(),
      kind: 'sub',
      team: g.home.id,
      player: out,
      incoming,
      period: 1,
      elapsed: 50,
    },
    shot(g, { elapsed: 70, player: incoming, value: 3 }),
  ];
  g.lineup[g.home.id] = g.lineup[g.home.id].map((id) =>
    id === out ? incoming : id,
  );
  validateGame(g);
  const b = box(g);
  assert.equal(b[out].seconds, 50);
  assert.equal(b[incoming].seconds, 50);
  assert.equal(b[out].pm, 2);
  assert.equal(b[incoming].pm, 3);
  assert.equal(quintets(g, g.home.id).length, 2);
});
test('atleta adversário não pode receber assistência da cesta', () => {
  const g = fixture();
  g.events = [shot(g, { other: g.away.players[0].id })];
  assert.throws(() => validateGame(g), /associado/);
});
test('evento futuro e substituição impossível são rejeitados', () => {
  const g = fixture();
  g.events = [shot(g, { elapsed: 300 })];
  assert.throws(() => validateGame(g), /relógio/);
  g.events = [
    {
      id: uid(),
      kind: 'sub',
      team: g.home.id,
      player: g.home.players[6].id,
      incoming: g.home.players[5].id,
      period: 1,
      elapsed: 50,
    },
  ];
  assert.throws(() => validateGame(g), /substituições/);
});
test('amostra zero produz ausência de porcentagem, não NaN', () => {
  assert.equal(pct(0, 0), null);
  const a = advanced(blank(), blank());
  assert.equal(a.ts, null);
  assert.equal(a.ortg, null);
});
test('3x3 tem três titulares e não aceita cesta de três', () => {
  const d = demoState(),
    g = newGame(...d.teams, { format: 3 });
  g.remaining = 500;
  assert.equal(g.lineup[g.home.id].length, 3);
  g.events = [shot(g, { value: 3 })];
  assert.throws(() => validateGame(g), /Arremesso/);
});
test('números duplicados são rejeitados', () => {
  const d = demoState();
  d.teams[0].players[1].number = d.teams[0].players[0].number;
  assert.throws(() => validateState(d), /único/);
});

test('positions remain optional, reject invalid enums and preserve game snapshots', () => {
  const state = demoState();
  validateState(state);
  state.teams[0].players[0].position = 'PG';
  const game = newGame(...state.teams);
  state.teams[0].players[0].position = 'C';
  assert.equal(game.home.players[0].position, 'PG');
  validateGame(game);
  state.teams[0].players[0].position = 'invalid';
  assert.throws(() => validateState(state), /Posição/);
});
