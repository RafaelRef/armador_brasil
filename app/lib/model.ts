export const COMPETITION_TYPES = { league: 'Liga', cup: 'Copa', tournament: 'Torneio', friendly: 'Amistoso' } as const;
export type Competition = { id: string; name: string; season: string; type: keyof typeof COMPETITION_TYPES };
export const competitionKey = (c: Competition) => `${c.name.trim().toLowerCase().replace(/\s+/g, ' ')}|${c.season.trim().toLowerCase()}`;
export function validateCompetition(c: Competition) {
  if (!c.id || !c.name?.trim() || c.name.length > 100 || !/^\d{4}(\/\d{2})?$/.test(c.season) || !Object.hasOwn(COMPETITION_TYPES, c.type)) throw new Error('Informe nome, temporada (2026 ou 2026/27) e tipo do campeonato.');
}
export const PLAYER_POSITIONS = { PG: 'Armador', SG: 'Ala-Armador', SF: 'Ala', PF: 'Ala-Pivô', C: 'Pivô' } as const;
export type PlayerPosition = keyof typeof PLAYER_POSITIONS;
export type Player = { id: string; name: string; number: string; position?: PlayerPosition };
export const positionLabel = (p: Player) => p.position ? PLAYER_POSITIONS[p.position] : 'Não informada';
export type Team = {
  id: string;
  name: string;
  color: string;
  season: string;
  coach: string;
  players: Player[];
};
export type Kind =
  | 'shot'
  | 'oreb'
  | 'dreb'
  | 'ast'
  | 'stl'
  | 'tov'
  | 'blk'
  | 'foul'
  | 'timeout'
  | 'sub';
export type Play = {
  id: string;
  kind: Kind;
  team: string;
  player: string;
  period: number;
  elapsed: number;
  made?: boolean;
  value?: number;
  free?: boolean;
  x?: number;
  y?: number;
  shotType?: string;
  other?: string;
  detail?: string;
  incoming?: string;
  fastbreak?: boolean;
  note?: string;
};
export type Game = {
  competitionId?: string;
  id: string;
  home: Team;
  away: Team;
  date: string;
  season: string;
  phase: string;
  referees: string;
  format: number;
  periods: number;
  minutes: number;
  overtime: number;
  period: number;
  remaining: number;
  runningSince: number | null;
  status: 'playing' | 'final';
  initial: Record<string, string[]>;
  lineup: Record<string, string[]>;
  events: Play[];
  notes: string;
  demo?: boolean;
  revisions: { at: string; action: string; before: Play }[];
};
export type State = {
  competitions?: Competition[];
  version: 1;
  teams: Team[];
  games: Game[];
  prefs: {
    stopOnFoul: boolean;
    foulLimit: number;
    assistPrompt: boolean;
    shotPrompt: boolean;
  };
};
export const uid = () => crypto.randomUUID();
export const emptyState = (): State => ({
  version: 1,
  competitions: [],
  teams: [],
  games: [],
  prefs: {
    stopOnFoul: true,
    foulLimit: 5,
    assistPrompt: true,
    shotPrompt: true,
  },
});
export const periodLength = (g: Game, p = g.period) =>
  (p <= g.periods ? g.minutes : g.overtime) * 60;
export const periodStart = (g: Game, p = g.period) =>
  p <= g.periods
    ? (p - 1) * g.minutes * 60
    : g.periods * g.minutes * 60 + (p - g.periods - 1) * g.overtime * 60;
export const remaining = (g: Game, now = Date.now()) =>
  Math.max(
    0,
    g.remaining -
      (g.runningSince ? Math.max(0, (now - g.runningSince) / 1000) : 0),
  );
export const elapsed = (g: Game, now = Date.now()) =>
  periodStart(g) + periodLength(g) - remaining(g, now);
export const clock = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(Math.max(0, seconds) % 60)
    .toString()
    .padStart(2, '0')}`;
export const points = (p: Play) =>
  p.kind === 'shot' && p.made ? (p.value ?? 0) : 0;
export const score = (g: Game, team: string) =>
  g.events.filter((e) => e.team === team).reduce((n, e) => n + points(e), 0);
export const pct = (m: number, a: number) =>
  a ? Math.round((m / a) * 1000) / 10 : null;
export type Stats = {
  pts: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  tov: number;
  blk: number;
  blocked: number;
  foul: number;
  drawn: number;
  seconds: number;
  pm: number;
};
export const blank = (): Stats => ({
  pts: 0,
  fgm: 0,
  fga: 0,
  tpm: 0,
  tpa: 0,
  ftm: 0,
  fta: 0,
  oreb: 0,
  dreb: 0,
  reb: 0,
  ast: 0,
  stl: 0,
  tov: 0,
  blk: 0,
  blocked: 0,
  foul: 0,
  drawn: 0,
  seconds: 0,
  pm: 0,
});
export function box(
  g: Game,
  filterPeriod = 0,
  now = Date.now(),
): Record<string, Stats> {
  const rows: Record<string, Stats> = {};
  for (const t of [g.home, g.away]) {
    rows[t.id] = blank();
    for (const p of t.players) rows[p.id] = blank();
  }
  const on = structuredClone(g.initial);
  let last = 0;
  const end = elapsed(g, now);
  const low = filterPeriod ? periodStart(g, filterPeriod) : 0;
  const high = filterPeriod
    ? Math.min(end, low + periodLength(g, filterPeriod))
    : end;
  const minutes = (to: number) => {
    const dt = Math.max(0, Math.min(to, high) - Math.max(last, low));
    for (const ids of Object.values(on))
      for (const id of ids) rows[id].seconds += dt;
    last = to;
  };
  for (const e of [...g.events].sort((a, b) => a.elapsed - b.elapsed)) {
    minutes(e.elapsed);
    if (e.kind === 'sub') {
      on[e.team] = on[e.team].map((id) => (id === e.player ? e.incoming! : id));
      continue;
    }
    if (filterPeriod && e.period !== filterPeriod) continue;
    const s = rows[e.player] ?? rows[e.team];
    if (e.kind === 'shot') {
      s.pts += points(e);
      if (e.free) {
        s.fta++;
        if (e.made) s.ftm++;
      } else {
        s.fga++;
        if (e.made) s.fgm++;
        if (e.value === (g.format === 3 ? 2 : 3)) {
          s.tpa++;
          if (e.made) s.tpm++;
        }
      }
      if (e.made && e.other && rows[e.other]) rows[e.other].ast++;
      for (const t of [g.home, g.away])
        for (const id of on[t.id])
          rows[id].pm += points(e) * (t.id === e.team ? 1 : -1);
    } else if (e.kind === 'oreb' || e.kind === 'dreb') {
      s[e.kind]++;
      s.reb++;
    } else if (['ast', 'stl', 'tov', 'blk', 'foul'].includes(e.kind)) {
      s[e.kind as 'ast']++;
      if (e.other && rows[e.other]) {
        if (e.kind === 'tov') rows[e.other].stl++;
        if (e.kind === 'stl') rows[e.other].tov++;
        if (e.kind === 'blk') rows[e.other].blocked++;
        if (e.kind === 'foul') rows[e.other].drawn++;
      }
    }
  }
  minutes(end);
  for (const t of [g.home, g.away])
    for (const p of t.players)
      for (const k of Object.keys(blank()) as (keyof Stats)[])
        if (k !== 'pm') rows[t.id][k] += rows[p.id][k];
  rows[g.home.id].pm = rows[g.home.id].pts - rows[g.away.id].pts;
  rows[g.away.id].pm = -rows[g.home.id].pm;
  return rows;
}
export function validateTeam(t: Team) {
  if (
    !t.id ||
    !t.name?.trim() ||
    t.name.length > 80 ||
    !/^#[a-f\d]{6}$/i.test(t.color) ||
    !Array.isArray(t.players) ||
    t.players.length > 30
  )
    throw new Error('Equipe inválida. Confira nome, cor e elenco.');
  const nums = new Set<string>(),
    ids = new Set<string>();
  for (const p of t.players) {
    if (p.position !== undefined && !Object.hasOwn(PLAYER_POSITIONS, p.position))
      throw new Error('Posição do jogador inválida.');
    if (
      !p.id ||
      !p.name?.trim() ||
      p.name.length > 80 ||
      !/^\d{1,3}$/.test(p.number) ||
      nums.has(p.number) ||
      ids.has(p.id)
    )
      throw new Error('Cada jogador precisa de nome e número único (0 a 999).');
    nums.add(p.number);
    ids.add(p.id);
  }
}
export function validateGame(g: Game) {
  validateTeam(g.home);
  validateTeam(g.away);
  if (
    g.home.id === g.away.id ||
    ![3, 5].includes(g.format) ||
    ![g.minutes, g.overtime].every(
      (n) => Number.isInteger(n) && n > 0 && n <= 60,
    ) ||
    !Number.isInteger(g.periods) ||
    g.periods < 1 ||
    g.periods > 8 ||
    !Number.isInteger(g.period) ||
    g.period < 1 ||
    g.period > 100 ||
    !Number.isFinite(g.remaining) ||
    g.remaining < 0 ||
    g.remaining > periodLength(g) ||
    !['playing', 'final'].includes(g.status) ||
    (g.runningSince !== null &&
      (!Number.isFinite(g.runningSince) || g.runningSince < 0))
  )
    throw new Error('Configuração da partida inválida.');
  const ids = new Set([...g.home.players, ...g.away.players].map((p) => p.id));
  if (ids.size !== g.home.players.length + g.away.players.length)
    throw new Error('Jogador duplicado entre as equipes.');
  for (const t of [g.home, g.away])
    for (const l of [g.initial?.[t.id], g.lineup?.[t.id]])
      if (
        !Array.isArray(l) ||
        l.length !== g.format ||
        new Set(l).size !== l.length ||
        l.some((id) => !t.players.some((p) => p.id === id))
      )
        throw new Error('Selecione os titulares das duas equipes.');
  if (
    !Array.isArray(g.events) ||
    g.events.length > 20000 ||
    !Array.isArray(g.revisions)
  )
    throw new Error('Histórico inválido.');
  const seen = new Set<string>();
  for (const e of g.events) {
    const t =
      e.team === g.home.id ? g.home : e.team === g.away.id ? g.away : null;
    const opp = t?.id === g.home.id ? g.away : g.home;
    if (
      !t ||
      !e.id ||
      seen.has(e.id) ||
      ![
        'shot',
        'oreb',
        'dreb',
        'ast',
        'stl',
        'tov',
        'blk',
        'foul',
        'timeout',
        'sub',
      ].includes(e.kind) ||
      !Number.isInteger(e.period) ||
      e.period < 1 ||
      e.period > g.period ||
      !Number.isFinite(e.elapsed) ||
      e.elapsed < periodStart(g, e.period) ||
      e.elapsed > periodStart(g, e.period) + periodLength(g, e.period) ||
      (e.player !== t.id && !t.players.some((p) => p.id === e.player))
    )
      throw new Error('Lance inválido.');
    seen.add(e.id);
    if (e.elapsed > elapsed(g) + 0.1)
      throw new Error('O lance não pode estar à frente do relógio atual.');
    if (
      e.kind === 'shot' &&
      (![1, 2, 3].includes(e.value!) ||
        typeof e.made !== 'boolean' ||
        (e.free && e.value !== 1) ||
        (!e.free && !(g.format === 3 ? [1, 2] : [2, 3]).includes(e.value!)))
    )
      throw new Error('Arremesso inválido.');
    if (
      (e.x !== undefined || e.y !== undefined) &&
      ![e.x, e.y].every(
        (v) =>
          typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100,
      )
    )
      throw new Error('Posição inválida.');
    if (e.other) {
      if (e.kind === 'shot' && (!e.made || e.free))
        throw new Error('Assistência exige uma cesta de campo convertida.');
      const ps = e.kind === 'shot' ? t.players : opp.players;
      if (!ps.some((p) => p.id === e.other) || e.other === e.player)
        throw new Error('Jogador associado inválido.');
    }
    if (
      e.kind === 'sub' &&
      (!t.players.some((p) => p.id === e.incoming) || e.incoming === e.player)
    )
      throw new Error('Substituição inválida.');
  }
  const on = structuredClone(g.initial);
  for (const e of [...g.events].sort((a, b) => a.elapsed - b.elapsed)) {
    if (e.kind === 'sub') {
      if (!on[e.team].includes(e.player) || on[e.team].includes(e.incoming!))
        throw new Error('Sequência de substituições inválida.');
      on[e.team] = on[e.team].map((id) => (id === e.player ? e.incoming! : id));
    }
  }
  for (const t of [g.home, g.away])
    if ([...on[t.id]].sort().join('|') !== [...g.lineup[t.id]].sort().join('|'))
      throw new Error('Escalação não corresponde às substituições.');
}
export function validateState(s: State) {
  if (
    !s ||
    s.version !== 1 ||
    !Array.isArray(s.teams) ||
    !Array.isArray(s.games) ||
    s.teams.length > 200 ||
    s.games.length > 500 ||
    !s.prefs ||
    typeof s.prefs.stopOnFoul !== 'boolean' ||
    ![5, 6].includes(s.prefs.foulLimit)
  )
    throw new Error('Arquivo de backup incompatível.');
  const competitions = s.competitions ?? [];
  if (!Array.isArray(competitions) || competitions.length > 200) throw new Error('Cadastro de campeonatos inválido.');
  competitions.forEach(validateCompetition);
  if (new Set(competitions.map(competitionKey)).size !== competitions.length || new Set(competitions.map(c => c.id)).size !== competitions.length) throw new Error('Campeonato já cadastrado nesta temporada.');
  if (s.games.some(g => g.competitionId && !competitions.some(c => c.id === g.competitionId))) throw new Error('Campeonato do jogo não encontrado.');
  s.teams.forEach(validateTeam);
  s.games.forEach(validateGame);
  if (
    new Set(s.teams.map((t) => t.id)).size !== s.teams.length ||
    new Set(s.games.map((g) => g.id)).size !== s.games.length
  )
    throw new Error('Identificadores duplicados.');
}
export function newGame(
  home: Team,
  away: Team,
  settings: Partial<Game> = {},
): Game {
  const format = settings.format ?? 5;
  const g: Game = {
    id: uid(),
    home: structuredClone(home),
    away: structuredClone(away),
    date: new Date().toISOString().slice(0, 10),
    season: home.season,
    phase: 'Temporada regular',
    referees: '',
    format,
    periods: format === 3 ? 1 : 4,
    minutes: 10,
    overtime: 5,
    period: 1,
    remaining: 600,
    runningSince: null,
    status: 'playing',
    initial: {
      [home.id]: home.players.slice(0, format).map((p) => p.id),
      [away.id]: away.players.slice(0, format).map((p) => p.id),
    },
    lineup: {},
    events: [],
    notes: '',
    revisions: [],
    ...settings,
  };
  g.lineup = structuredClone(g.initial);
  g.remaining = g.minutes * 60;
  validateGame(g);
  return g;
}
export const labels: Record<Kind, string> = {
  shot: 'Arremesso',
  oreb: 'Rebote ofensivo',
  dreb: 'Rebote defensivo',
  ast: 'Assistência',
  stl: 'Roubo',
  tov: 'Perda de bola',
  blk: 'Bloqueio',
  foul: 'Falta',
  timeout: 'Tempo técnico',
  sub: 'Substituição',
};
export function demoState(): State {
  const s = emptyState();
  const aNames = [
    'Stephen',
    'Kevin',
    'Draymond',
    'Klay',
    'Zaza',
    'Andre',
    'Shaun',
    'Javale',
  ];
  const bNames = [
    'Kawhi',
    'Pascal',
    'Kyle',
    'Serge',
    'Danny',
    'Norman',
    'Fred',
    'Marc',
  ];
  s.teams = [aNames, bNames].map((names, i) => ({
    id: uid(),
    name: i ? 'Team B' : 'Team A',
    color: i ? '#c90808' : '#3022c5',
    season: '2026/27',
    coach: '',
    players: names.map((name, j) => ({
      id: uid(),
      name,
      number: String(
        (i ? [2, 43, 7, 9, 14, 24, 23, 33] : [30, 35, 23, 11, 27, 9, 34, 1])[j],
      ),
    })),
  }));
  const g = newGame(s.teams[0], s.teams[1]);
  g.date = '2026-09-07';
  g.demo = true;
  g.status = 'final';
  g.period = 4;
  g.remaining = 0;
  for (const [i, t] of [g.home, g.away].entries()) {
    let k = 0;
    for (const [value, count, free] of (i
      ? [
          [2, 25, false],
          [3, 12, false],
          [1, 2, true],
        ]
      : [
          [2, 20, false],
          [3, 15, false],
          [1, 4, true],
        ]) as [number, number, boolean][]) {
      for (let j = 0; j < count; j++) {
        const sec = 20 + k * 55;
        g.events.push({
          id: uid(),
          kind: 'shot',
          team: t.id,
          player: t.players[k % 5].id,
          period: Math.min(4, Math.floor(sec / 600) + 1),
          elapsed: sec,
          made: true,
          value,
          free,
          x: 12 + ((k * 17) % 76),
          y: free ? 35 : 10 + ((k * 23) % 77),
          other: !free && k % 3 === 0 ? t.players[(k + 1) % 5].id : undefined,
        });
        k++;
      }
    }
    for (let j = 0; j < 12; j++) {
      const sec = 30 + j * 160;
      g.events.push({
        id: uid(),
        kind: 'shot',
        team: t.id,
        player: t.players[j % 5].id,
        period: Math.floor(sec / 600) + 1,
        elapsed: sec,
        made: false,
        value: 2,
        x: 20 + j * 5,
        y: 22 + j * 4,
      });
      g.events.push({
        id: uid(),
        kind: 'dreb',
        team: t.id,
        player: t.players[(j + 2) % 5].id,
        period: Math.floor(sec / 600) + 1,
        elapsed: sec + 2,
      });
    }
  }
  s.games = [g];
  return s;
}
export function advanced(s: Stats, opp: Stats, format = 5) {
  const poss = Math.max(0, s.fga + 0.44 * s.fta - s.oreb + s.tov);
  return {
    efg: format === 5 ? pct(s.fgm + 0.5 * s.tpm, s.fga) : null,
    ts: format === 5 ? pct(s.pts, 2 * (s.fga + 0.44 * s.fta)) : null,
    orb: pct(s.oreb, s.oreb + opp.dreb),
    tov: pct(s.tov, s.fga + 0.44 * s.fta + s.tov),
    ftr: pct(s.fta, s.fga),
    poss,
    ortg: poss ? Math.round((s.pts / poss) * 1000) / 10 : null,
    eff:
      s.pts +
      s.reb +
      s.ast +
      s.stl +
      s.blk -
      (s.fga - s.fgm) -
      (s.fta - s.ftm) -
      s.tov,
    pir:
      s.pts +
      s.reb +
      s.ast +
      s.stl +
      s.blk +
      s.drawn -
      (s.fga - s.fgm) -
      (s.fta - s.ftm) -
      s.tov -
      s.blocked -
      s.foul,
  };
}
export function quintets(g: Game, team: string) {
  const result: Record<
    string,
    { ids: string[]; seconds: number; plus: number; minus: number }
  > = {};
  let ids = [...g.initial[team]],
    last = 0;
  function row() {
    const key = [...ids].sort().join('|');
    return (
      result[key] ??
      (result[key] = { ids: [...ids], seconds: 0, plus: 0, minus: 0 })
    );
  }
  for (const e of [...g.events].sort((a, b) => a.elapsed - b.elapsed)) {
    row().seconds += Math.max(0, e.elapsed - last);
    last = e.elapsed;
    if (e.kind === 'sub' && e.team === team)
      ids = ids.map((p) => (p === e.player ? e.incoming! : p));
    else if (points(e)) row()[e.team === team ? 'plus' : 'minus'] += points(e);
  }
  row().seconds += Math.max(0, elapsed(g) - last);
  return Object.values(result).sort((a, b) => b.seconds - a.seconds);
}
