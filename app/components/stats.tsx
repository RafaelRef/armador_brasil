'use client';
import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  box,
  pct,
  clock,
  score,
  points,
  advanced,
  quintets,
  blank,
  type Game,
  type Team,
  type Stats,
} from '@/lib/model';
import { exportGame } from '@/lib/export';
import { Jersey, Pick, ShotMap } from './basketball';
const percent = (n: number | null) => (n === null ? '—' : `${n.toFixed(1)}%`);
export function Metrics({
  s,
  opp,
  format = 5,
}: {
  s: Stats;
  opp: Stats;
  format?: number;
}) {
  const a = advanced(s, opp, format);
  return (
    <>
      <div className="metrics">
        {[
          ['Minutos', clock(s.seconds)],
          ['Pontos', s.pts],
          ['Rebotes', s.reb],
          ['Assistências', s.ast],
          ['Reb. ofensivos', s.oreb],
          ['Reb. defensivos', s.dreb],
          ['Bloqueios', s.blk],
          ['Bloqueios recebidos', s.blocked],
        ].map(([name, v]) => (
          <div key={name}>
            <b>{v}</b>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className="rings">
        {[
          ['FG', pct(s.fgm, s.fga)],
          ['Longa distância', pct(s.tpm, s.tpa)],
          ['Dentro do arco', pct(s.fgm - s.tpm, s.fga - s.tpa)],
          ['Lances livres', pct(s.ftm, s.fta)],
        ].map(([name, v]) => (
          <div key={String(name)}>
            <div
              className="stat-ring"
              style={{
                background: `conic-gradient(#19714f ${Number(v ?? 0) * 3.6}deg,#ffb344 0deg)`,
              }}
            >
              <b>{percent(v as number | null)}</b>
            </div>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className="metrics">
        {[
          ['Perdas', s.tov],
          ['Roubos', s.stl],
          ['Faltas', s.foul],
          ['Faltas recebidas', s.drawn],
          ['PIR', a.pir],
          ['Eficiência', a.eff],
          ['Mais / menos', s.pm],
        ].map(([name, v]) => (
          <div key={name}>
            <b>{v}</b>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
export function BoxTable({
  team,
  stats,
  onPlayer,
}: {
  team: Team;
  stats: Record<string, Stats>;
  onPlayer?: (id: string) => void;
}) {
  return (
    <div className="box-panel">
      <h3>
        <span className="color-dot" style={{ background: team.color }} />
        {team.name}
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            {[
              'Jogador',
              'MIN',
              'PTS',
              'FG',
              'LD',
              'LL',
              'RO',
              'RD',
              'REB',
              'AST',
              'STL',
              'TOV',
              'BLK',
              'FC',
              '+/-',
            ].map((x) => (
              <TableHead key={x}>{x}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...team.players, { id: team.id, number: '', name: 'TOTAL' }].map(
            (p) => {
              const s = stats[p.id] ?? blank();
              return (
                <TableRow
                  key={p.id}
                  className={p.id === team.id ? 'total' : ''}
                >
                  <TableCell>
                    <button
                      className="player-link"
                      disabled={!onPlayer || p.id === team.id}
                      onClick={() => onPlayer?.(p.id)}
                    >
                      {p.number && `#${p.number} `}
                      {p.name}
                    </button>
                  </TableCell>
                  {[
                    clock(s.seconds),
                    s.pts,
                    `${s.fgm}/${s.fga}`,
                    `${s.tpm}/${s.tpa}`,
                    `${s.ftm}/${s.fta}`,
                    s.oreb,
                    s.dreb,
                    s.reb,
                    s.ast,
                    s.stl,
                    s.tov,
                    s.blk,
                    s.foul,
                    s.pm,
                  ].map((v, i) => (
                    <TableCell key={i}>{v}</TableCell>
                  ))}
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
    </div>
  );
}
export function StatsPanel({ game: g }: { game: Game }) {
  const [tab, T] = useState('Box score'),
    [period, P] = useState('0'),
    [team, S] = useState(g.home.id),
    [player, Player] = useState('all'),
    [filter, F] = useState('all');
  const t = team === g.home.id ? g.home : g.away,
    opp = team === g.home.id ? g.away : g.home;
  const b = box(g, +period);
  const events = g.events.filter(
    (e) =>
      e.kind === 'shot' &&
      e.team === team &&
      (!+period || e.period === +period) &&
      (player === 'all' || e.player === player) &&
      (filter === 'all' || e.made === (filter === 'made')),
  );
  const s = b[player === 'all' ? team : player] ?? blank();
  const a = advanced(s, b[opp.id], g.format);
  let home = 0,
    away = 0;
  const progress = [...g.events]
    .sort((a, b) => a.elapsed - b.elapsed)
    .filter((e) => points(e))
    .map((e) => {
      if (e.team === g.home.id) home += points(e);
      else away += points(e);
      return { time: e.elapsed, home, away };
    });
  const end = Math.max(1, ...progress.map((p) => p.time)),
    max = Math.max(1, home, away);
  return (
    <div className="stats-view">
      <div className="report-score">
        <span>
          <Jersey color={g.home.color} small />
          {g.home.name}
        </span>
        <b>
          {score(g, g.home.id)} <small>×</small> {score(g, g.away.id)}
        </b>
        <span>
          {g.away.name}
          <Jersey color={g.away.color} small />
        </span>
      </div>
      <div className="report-meta">
        {g.date.split('-').reverse().join('/')} · {g.phase} · {g.season}
        {g.demo ? ' · Demonstração' : ''}
      </div>
      <Tabs value={tab} onValueChange={(v) => T(String(v))}>
        <TabsList className="detail-tabs">
          {[
            'Box score',
            'Stats',
            'Avançadas',
            'Shot chart',
            'Zonas de tiro',
            'Evolução',
            'Quintetos',
          ].map((x) => (
            <TabsTrigger key={x} value={x}>
              {x}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="filter-bar no-print">
        <Pick
          value={period}
          onChange={P}
          options={[
            { value: '0', label: 'Todos os períodos' },
            ...Array.from({ length: g.period }, (_, i) => ({
              value: String(i + 1),
              label:
                i < g.periods
                  ? `${i + 1}º período`
                  : `Prorrogação ${i + 1 - g.periods}`,
            })),
          ]}
          label="Período"
        />
        {tab !== 'Box score' && (
          <>
            <Pick
              value={team}
              onChange={(v) => {
                S(v);
                Player('all');
              }}
              options={[g.home, g.away].map((t) => ({
                value: t.id,
                label: t.name,
              }))}
              label="Equipe"
            />
            {!['Evolução', 'Quintetos'].includes(tab) && (
              <Pick
                value={player}
                onChange={Player}
                options={[
                  { value: 'all', label: 'Toda a equipe' },
                  ...t.players.map((p) => ({
                    value: p.id,
                    label: `#${p.number} ${p.name}`,
                  })),
                ]}
                label="Jogador"
              />
            )}
          </>
        )}
      </div>
      {tab === 'Box score' &&
        [g.home, g.away].map((t) => (
          <BoxTable
            key={t.id}
            team={t}
            stats={b}
            onPlayer={(id) => {
              S(t.id);
              Player(id);
              T('Stats');
            }}
          />
        ))}
      {tab === 'Stats' && <Metrics s={s} opp={b[opp.id]} format={g.format} />}{' '}
      {tab === 'Avançadas' && (
        <>
          <div className="metrics advanced">
            {[
              ['eFG%', percent(a.efg)],
              ['TS%', percent(a.ts)],
              ['Rebote ofensivo %', player === 'all' ? percent(a.orb) : '—'],
              ['Taxa de perdas', percent(a.tov)],
              ['FT rate', percent(a.ftr)],
              ['Posses estimadas', player === 'all' ? a.poss.toFixed(1) : '—'],
              [
                'Pontos / 100 posses',
                player === 'all' ? (a.ortg?.toFixed(1) ?? '—') : '—',
              ],
              ['Eficiência', a.eff],
            ].map(([name, v]) => (
              <div key={name}>
                <b>{v}</b>
                <span>{name}</span>
              </div>
            ))}
          </div>
          <details className="formula">
            <summary>Como os números são calculados</summary>
            <p>
              eFG% = (FGM + 0,5 × cestas de 3) / FGA. TS% = pontos / [2 × (FGA +
              0,44 × FTA)]. Posses estimadas = FGA + 0,44 × FTA − rebotes
              ofensivos + perdas. Estimativas não substituem contagem de posses.
              eFG e TS são apresentados apenas em 5×5.
            </p>
            <a
              href="https://www.nba.com/stats/help/glossary"
              target="_blank"
              rel="noreferrer"
            >
              Glossário de estatísticas da NBA
            </a>
          </details>
        </>
      )}
      {['Shot chart', 'Zonas de tiro'].includes(tab) && (
        <>
          <ShotMap events={events} zones={tab === 'Zonas de tiro'} />
          <div className="filter-bar">
            <Pick
              value={filter}
              onChange={F}
              label="Resultado dos arremessos"
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'made', label: 'Convertidos' },
                { value: 'miss', label: 'Errados' },
              ]}
            />
            <span>
              {events.filter((e) => e.made).length}/{events.length} arremessos ·{' '}
              {percent(pct(events.filter((e) => e.made).length, events.length))}
            </span>
          </div>
          {tab === 'Zonas de tiro' && (
            <p className="muted">
              Mapa simplificado em três faixas de profundidade. Lances livres
              não aparecem na quadra.
            </p>
          )}
        </>
      )}
      {tab === 'Evolução' && (
        <div className="chart-panel">
          <h3>Evolução do placar · partida completa</h3>
          <svg
            viewBox="0 0 800 300"
            aria-label="Evolução dos pontos das equipes"
            role="img"
          >
            <path d="M40 10V260H780" fill="none" stroke="#adbdb2" />
            {['home', 'away'].map((key, i) => (
              <polyline
                key={key}
                fill="none"
                stroke={i ? g.away.color : g.home.color}
                strokeWidth="3"
                points={
                  '40,260 ' +
                  progress
                    .map(
                      (p) =>
                        `${40 + (p.time / end) * 730},${260 - (p[key as 'home'] / max) * 230}`,
                    )
                    .join(' ')
                }
              />
            ))}
            <text x="8" y="28">
              {max}
            </text>
            <text x="20" y="260">
              0
            </text>
            <text x="40" y="285">
              Início
            </text>
            <text x="700" y="285">
              {clock(end)}
            </text>
          </svg>
          <div className="button-row">
            <span style={{ color: g.home.color }}>● {g.home.name}</span>
            <span style={{ color: g.away.color }}>● {g.away.name}</span>
          </div>
        </div>
      )}
      {tab === 'Quintetos' && (
        <div className="box-panel">
          <h3>Formações · partida completa</h3>
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  'Jogadores',
                  'Minutos',
                  'Pontos a favor',
                  'Contra',
                  '+/-',
                ].map((x) => (
                  <TableHead key={x}>{x}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {quintets(g, team).map((q, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {q.ids
                      .map((id) => t.players.find((p) => p.id === id)?.name)
                      .join(', ')}
                  </TableCell>
                  <TableCell>{clock(q.seconds)}</TableCell>
                  <TableCell>{q.plus}</TableCell>
                  <TableCell>{q.minus}</TableCell>
                  <TableCell>{q.plus - q.minus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="button-row exports no-print">
        <button
          className="secondary"
          onClick={() => exportGame(g, false, +period)}
        >
          <Download size={18} />
          Box score CSV
        </button>
        <button
          className="secondary"
          onClick={() => exportGame(g, true, +period)}
        >
          <Download size={18} />
          Lances CSV
        </button>
        <button className="primary" onClick={() => window.print()}>
          <Printer size={18} />
          Imprimir / salvar PDF
        </button>
      </div>
      <section className="print-only">
        <h2>
          Box score — {+period ? `${period}º período` : 'Partida completa'}
        </h2>
        {[g.home, g.away].map((t) => (
          <BoxTable key={t.id} team={t} stats={b} />
        ))}
        <p>{g.notes}</p>
      </section>
    </div>
  );
}
