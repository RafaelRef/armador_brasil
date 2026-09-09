'use client';
import { useEffect, useState, useRef } from 'react';
import {
  Play as PlayIcon,
  Pause,
  Settings,
  Table2,
  List,
  Undo2,
  Flag,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Save,
  Clock,
  Plus,
  Check,
  X,
  Trash2,
  Pencil,
} from 'lucide-react';
import {
  Court,
  Jersey,
  Modal,
  Pick,
  ShotMap,
  Confirm,
  Toggle,
} from './basketball';
import { StatsPanel } from './stats';
import {
  positionLabel,
  box,
  clock,
  elapsed,
  remaining,
  periodLength,
  periodStart,
  score,
  uid,
  labels,
  validateGame,
  type Game,
  type Play,
  type Kind,
  type State,
} from '@/lib/model';
function lineups(g: Game, events: Play[]) {
  const on = structuredClone(g.initial);
  for (const e of [...events].sort((a, b) => a.elapsed - b.elapsed)) {
    if (e.kind === 'sub') {
      if (!on[e.team].includes(e.player) || on[e.team].includes(e.incoming!))
        throw new Error(
          'Essa alteração invalida uma substituição posterior. Corrija as substituições primeiro.',
        );
      on[e.team] = on[e.team].map((id) => (id === e.player ? e.incoming! : id));
    }
  }
  return on;
}
export default function GameDesk({
  game: g,
  prefs,
  onSave,
  onPrefs,
  onBack,
}: {
  game: Game;
  prefs: State['prefs'];
  onSave: (g: Game) => void;
  onPrefs: (p: State['prefs']) => void;
  onBack: () => void;
}) {
  const [now, N] = useState(Date.now()),
    [selected, S] = useState(g.lineup[g.home.id][0]),
    [modal, M] = useState(''),
    [draft, D] = useState<Play | null>(null),
    [err, E] = useState(''),
    [confirm, C] = useState<{
      title: string;
      body: string;
      action: () => void;
    } | null>(null),
    [undo, U] = useState<Play[] | null>(null),
    [out, Out] = useState(''),
    [subteam, ST] = useState(g.home.id);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const rows = box(g, 0, now),
    left = remaining(g, now);
  useEffect(() => {
    const t = setInterval(() => N(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (g.runningSince && left === 0)
      save({ ...g, remaining: 0, runningSince: null });
  }, [left === 0, g.runningSince]);
  function save(next: Game) {
    try {
      validateGame(next);
      onSave(next);
      E('');
    } catch (e) {
      E((e as Error).message);
    }
  }
  function freeze(game = g) {
    return {
      ...game,
      remaining: remaining(game),
      runningSince: game.runningSince ? Date.now() : null,
    };
  }
  function record(
    kind: Kind,
    value?: number,
    made?: boolean,
    free = false,
    player = selected,
  ) {
    if (g.status === 'final') {
      E('Retome a partida para registrar novos lances.');
      return;
    }
    const team =
      g.home.players.some((p) => p.id === player) || player === g.home.id
        ? g.home
        : g.away;
    const base: Play = {
      id: uid(),
      kind,
      team: team.id,
      player,
      period: g.period,
      elapsed: elapsed(g),
      ...(kind === 'shot' ? { value, made, free } : {}),
    };
    if (prefs.stopOnFoul && ['foul', 'tov'].includes(kind) && g.runningSince)
      save({ ...g, remaining: remaining(g), runningSince: null });
    D(base);
  }
  function commit(e: Play) {
    const exists = g.events.some((p) => p.id === e.id);
    const events = exists
      ? g.events.map((p) => (p.id === e.id ? e : p))
      : [...g.events, e];
    try {
      const next = {
        ...freeze(),
        events,
        lineup: lineups(g, events),
        revisions: exists
          ? [
              ...g.revisions,
              {
                at: new Date().toISOString(),
                action: 'edit',
                before: g.events.find((p) => p.id === e.id)!,
              },
            ]
          : g.revisions,
      };
      validateGame(next);
      U(g.events);
      save(next);
      D(null);
    } catch (e) {
      E((e as Error).message);
    }
  }
  function remove(e: Play) {
    C({
      title: 'Excluir este lance?',
      body: 'O placar e as estatísticas relacionadas serão recalculados. Você poderá desfazer esta ação.',
      action: () => {
        try {
          const events = g.events.filter((p) => p.id !== e.id);
          const next = {
            ...freeze(),
            events,
            lineup: lineups(g, events),
            revisions: [
              ...g.revisions,
              { at: new Date().toISOString(), action: 'delete', before: e },
            ],
          };
          validateGame(next);
          U(g.events);
          save(next);
        } catch (e) {
          E((e as Error).message);
        }
      },
    });
  }
  function advance() {
    save({
      ...g,
      period: g.period + 1,
      remaining: periodLength(g, g.period + 1),
      runningSince: null,
      status: 'playing',
    });
    M('');
  }
  const actions: [string, Kind, number?, boolean?, boolean?][] = [
    ['LL ✓', 'shot', 1, true, true],
    ['LL ×', 'shot', 1, false, true],
    [`${g.format === 3 ? 1 : 2} ✓`, 'shot', g.format === 3 ? 1 : 2, true],
    [`${g.format === 3 ? 1 : 2} ×`, 'shot', g.format === 3 ? 1 : 2, false],
    [`${g.format === 3 ? 2 : 3} ✓`, 'shot', g.format === 3 ? 2 : 3, true],
    [`${g.format === 3 ? 2 : 3} ×`, 'shot', g.format === 3 ? 2 : 3, false],
    ['RO', 'oreb'],
    ['RD', 'dreb'],
    ['AST', 'ast'],
    ['STL', 'stl'],
    ['TOV', 'tov'],
    ['BLK', 'blk'],
    ['Falta', 'foul'],
  ];
  return (
    <div className="game-desk">
      <div className="desk-top">
        <button className="desk-button" onClick={onBack}>
          <ArrowLeft />
          Jogos
        </button>
        <span>
          {g.phase} · {g.date.split('-').reverse().join('/')}
          {g.demo ? ' · Demonstração' : ''}
        </span>
        <button className="desk-button" onClick={() => M('stats')}>
          <Table2 />
          Box score
        </button>
      </div>
      {err && (
        <p role="alert" className="error">
          {err}
        </p>
      )}
      <div className="court-wrap">
        <Court />
        <div className="scoreboard">
          <div className="score-names">
            <span>{g.home.name}</span>
            <button
              aria-label="Ajustar cronômetro"
              className="digital time"
              onClick={() => M('clock')}
            >
              {clock(left)}
            </button>
            <span>{g.away.name}</span>
          </div>
          <div className="score-values">
            <b className="digital">{score(g, g.home.id)}</b>
            <div>
              <span>
                {g.period <= g.periods
                  ? `${g.period}º PERÍODO`
                  : `PRORROGAÇÃO ${g.period - g.periods}`}
              </span>
              <div className="clock-controls">
                <button
                  aria-label={
                    g.runningSince ? 'Pausar relógio' : 'Iniciar relógio'
                  }
                  disabled={g.status === 'final' || left <= 0}
                  onClick={() =>
                    save({
                      ...g,
                      remaining: remaining(g),
                      runningSince: g.runningSince ? null : Date.now(),
                    })
                  }
                >
                  {g.runningSince ? (
                    <Pause fill="#e89512" />
                  ) : (
                    <PlayIcon fill="#36d217" color="#36d217" />
                  )}
                </button>
                <button
                  aria-label="Encerrar período ou partida"
                  onClick={() => M('period')}
                >
                  <Flag />
                </button>
              </div>
            </div>
            <b className="digital">{score(g, g.away.id)}</b>
          </div>
          <div className="foul-score">
            <span>
              FALTAS{' '}
              {
                g.events.filter(
                  (e) =>
                    e.team === g.home.id &&
                    e.kind === 'foul' &&
                    e.period === g.period,
                ).length
              }
            </span>
            <span>
              {g.status === 'final'
                ? 'FINAL'
                : g.runningSince
                  ? 'EM JOGO'
                  : 'PAUSADO'}
            </span>
            <span>
              FALTAS{' '}
              {
                g.events.filter(
                  (e) =>
                    e.team === g.away.id &&
                    e.kind === 'foul' &&
                    e.period === g.period,
                ).length
              }
            </span>
          </div>
        </div>
        <div className="court-players">
          {[g.home, g.away].map((t, i) => (
            <div className={'team-players side-' + i} key={t.id}>
              {g.lineup[t.id].map((id) => {
                const p = t.players.find((p) => p.id === id)!;
                const r = rows[id];
                return (
                  <button
                    key={id}
                    className={
                      'court-player ' + (selected === id ? 'selected' : '')
                    }
                    data-player={id}
                    data-team={t.id}
                    aria-pressed={selected === id}
                    onClick={() => S(id)}
                    onDragOver={(e) => {
                      if (g.status !== 'final') e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (g.status === 'final') return;
                      const incoming = e.dataTransfer.getData(
                        'application/x-armador-player',
                      );
                      if (incoming) {
                        if (
                          !t.players.some((p) => p.id === incoming) ||
                          g.lineup[t.id].includes(incoming)
                        ) {
                          E('Escolha um reserva da mesma equipe.');
                          return;
                        }
                        commit({
                          id: uid(),
                          kind: 'sub',
                          team: t.id,
                          player: id,
                          incoming,
                          period: g.period,
                          elapsed: elapsed(g),
                        });
                        S(incoming);
                        return;
                      }
                      const raw = e.dataTransfer.getData(
                        'application/x-armador-action',
                      );
                      if (!/^\d+$/.test(raw)) return;
                      const a = actions[Number(raw)];
                      if (a) {
                        S(id);
                        record(a[1], a[2], a[3], a[4], id);
                      }
                    }}
                  >
                    <Jersey color={t.color} player={p} />
                    <span className="player-mini-stats">
                      {r.pts} Pts
                      <br />
                      {r.reb} Rbs
                      <br />
                      {r.ast} Ast
                    </span>
                    <b>{p.name}<small className="player-position">{positionLabel(p)}</small></b>
                    <span
                      className={
                        'foul-badge ' +
                        (r.foul >= prefs.foulLimit ? 'fouled-out' : '')
                      }
                    >
                      {r.foul}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="action-console">
          <p>
            {[...g.home.players, ...g.away.players].find(
              (p) => p.id === selected,
            )?.name ?? 'Equipe'}{' '}
            <span>· selecione uma ação ou arraste até o jogador</span>
          </p>
          <div className="action-grid">
            {actions.map((a, i) => (
              <button
                key={i}
                draggable
                disabled={g.status === 'final'}
                title={
                  a[1] === 'shot'
                    ? `${a[4] ? 'Lance livre' : a[2] + ' pontos'} ${a[3] ? 'convertido' : 'errado'}`
                    : labels[a[1]]
                }
                onDragStart={(e) =>
                  e.dataTransfer.setData(
                    'application/x-armador-action',
                    String(i),
                  )
                }
                onClick={() => record(a[1], a[2], a[3], a[4])}
                className={
                  a[1] === 'shot' ? (a[3] ? 'made-action' : 'miss-action') : ''
                }
              >
                {a[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="bench-row">
        {[g.home, g.away].map((t) => (
          <div className="bench" key={t.id}>
            <button
              className="desk-button"
              onClick={() => {
                ST(t.id);
                Out('');
                M('sub');
              }}
            >
              <RefreshCw size={18} />
              Substituir
            </button>
            {t.players
              .filter((p) => !g.lineup[t.id].includes(p.id))
              .map((p) => (
                <button
                  key={p.id}
                  className="bench-player"
                  onPointerDown={(e) => {
                    if (e.pointerType === 'touch' && g.status !== 'final') {
                      touch.current = { x: e.clientX, y: e.clientY };
                      e.currentTarget.setPointerCapture(e.pointerId);
                    }
                  }}
                  onPointerCancel={() => {
                    touch.current = null;
                  }}
                  onPointerUp={(e) => {
                    const start = touch.current;
                    touch.current = null;
                    if (
                      !start ||
                      Math.hypot(e.clientX - start.x, e.clientY - start.y) < 8
                    )
                      return;
                    suppressClick.current = true;
                    const target = document
                      .elementFromPoint(e.clientX, e.clientY)
                      ?.closest<HTMLElement>('.court-player');
                    if (
                      target?.dataset.team !== t.id ||
                      !target.dataset.player
                    ) {
                      E('Arraste sobre um titular da mesma equipe.');
                      return;
                    }
                    commit({
                      id: uid(),
                      kind: 'sub',
                      team: t.id,
                      player: target.dataset.player,
                      incoming: p.id,
                      period: g.period,
                      elapsed: elapsed(g),
                    });
                    S(p.id);
                  }}
                  draggable={g.status !== 'final'}
                  title={`Arraste ${p.name} sobre um titular da mesma equipe`}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData(
                      'application/x-armador-player',
                      p.id,
                    );
                  }}
                  onClick={() => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    ST(t.id);
                    Out('');
                    M('sub');
                  }}
                >
                  <Jersey color={t.color} player={p} small />
                  <span>{p.name}<small className="player-position">{positionLabel(p)}</small></span>
                </button>
              ))}
            <button
              className="desk-button"
              onClick={() => {
                ST(t.id);
                M('team-action');
              }}
            >
              Ação da equipe
            </button>
          </div>
        ))}
      </div>
      <div className="desk-tools">
        <button onClick={() => M('settings')}>
          <Settings />
          Configuração
        </button>
        <button onClick={() => M('history')}>
          <List />
          Jogadas
        </button>
        <button
          disabled={!undo}
          onClick={() => {
            if (undo) {
              save({ ...freeze(), events: undo, lineup: lineups(g, undo) });
              U(null);
            }
          }}
        >
          <Undo2 />
          Desfazer
        </button>
        <button onClick={() => M('minutes')}>
          <Clock />
          Minutos e faltas
        </button>
        <button onClick={() => M('notes')}>
          <Pencil />
          Notas
        </button>
        <button
          onClick={() => {
            ST(g.home.id);
            M('timeout');
          }}
        >
          <Pause />
          Tempo técnico
        </button>
        <button onClick={() => M('period')}>
          <Flag />
          Período / finalizar
        </button>
      </div>
      {draft && (
        <EventEditor
          game={g}
          event={draft}
          prefs={prefs}
          onSave={commit}
          onClose={() => D(null)}
        />
      )}{' '}
      {modal === 'stats' && (
        <Modal title="Estatísticas da partida" wide onClose={() => M('')}>
          <StatsPanel game={g} />
        </Modal>
      )}
      {modal === 'history' && (
        <Modal title="Jogadas" wide onClose={() => M('')}>
          <div className="event-list">
            {[...g.events]
              .sort((a, b) => b.elapsed - a.elapsed)
              .map((e) => {
                const t = e.team === g.home.id ? g.home : g.away;
                return (
                  <div className="event-row" key={e.id}>
                    <span className="event-time">
                      {e.period}º ·{' '}
                      {clock(
                        periodLength(g, e.period) -
                          (e.elapsed - periodStart(g, e.period)),
                      )}
                    </span>
                    <span
                      className="color-dot"
                      style={{ background: t.color }}
                    />
                    <div>
                      <b>
                        {t.players.find((p) => p.id === e.player)?.name ??
                          t.name}
                      </b>
                      <p>
                        {labels[e.kind]}
                        {e.kind === 'shot'
                          ? ` · ${e.free ? 'LL' : e.value + ' pontos'} ${e.made ? 'convertido' : 'errado'}`
                          : ''}
                        {e.detail ? ` · ${e.detail}` : ''}
                      </p>
                    </div>
                    {e.kind !== 'sub' && (
                      <button
                        className="icon-button"
                        aria-label="Editar lance"
                        onClick={() => D(e)}
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                    <button
                      className="icon-button"
                      aria-label="Excluir lance"
                      onClick={() => remove(e)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            {!g.events.length && (
              <p className="muted">Os lances registrados aparecerão aqui.</p>
            )}
          </div>
        </Modal>
      )}
      {modal === 'sub' && (
        <Modal title="Substituição" onClose={() => M('')} wide>
          {[g.home, g.away]
            .filter((t) => t.id === subteam)
            .map((t) => (
              <div key={t.id}>
                <h3>{t.name}</h3>
                <p className="muted">1. Selecione quem sai da quadra</p>
                <div className="select-players">
                  {t.players
                    .filter((p) => g.lineup[t.id].includes(p.id))
                    .map((p) => (
                      <button
                        className={out === p.id ? 'selected' : ''}
                        key={p.id}
                        onClick={() => Out(p.id)}
                      >
                        <Jersey color={t.color} player={p} />
                        {p.name}
                      </button>
                    ))}
                </div>
                <p className="muted">2. Selecione quem entra</p>
                <div className="select-players">
                  {t.players
                    .filter((p) => !g.lineup[t.id].includes(p.id))
                    .map((p) => (
                      <button
                        disabled={!out || g.status === 'final'}
                        key={p.id}
                        onClick={() => {
                          commit({
                            id: uid(),
                            kind: 'sub',
                            team: t.id,
                            player: out,
                            incoming: p.id,
                            period: g.period,
                            elapsed: elapsed(g),
                          });
                          S(p.id);
                          M('');
                        }}
                      >
                        <Jersey color={t.color} player={p} />
                        {p.name}
                      </button>
                    ))}
                </div>
              </div>
            ))}
        </Modal>
      )}
      {modal === 'clock' && (
        <Modal title="Ajustar cronômetro" onClose={() => M('')}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const r = Number(f.get('min')) * 60 + Number(f.get('sec'));
              const latest = Math.max(
                periodStart(g),
                ...g.events
                  .filter((e) => e.period === g.period)
                  .map((e) => e.elapsed),
              );
              if (periodStart(g) + periodLength(g) - r < latest) {
                E(
                  'O relógio não pode voltar para antes do último lance. Corrija os lances primeiro.',
                );
                return;
              }
              save({ ...g, remaining: r, runningSince: null });
              M('');
            }}
          >
            <div className="form-grid">
              <label>
                Minutos
                <input
                  name="min"
                  type="number"
                  min={0}
                  max={periodLength(g) / 60}
                  defaultValue={Math.floor(left / 60)}
                  required
                />
              </label>
              <label>
                Segundos
                <input
                  name="sec"
                  type="number"
                  min={0}
                  max={59}
                  defaultValue={Math.floor(left % 60)}
                  required
                />
              </label>
            </div>
            <button className="primary full">Salvar relógio</button>
          </form>
        </Modal>
      )}
      {modal === 'period' && (
        <Modal title="Período e encerramento" onClose={() => M('')}>
          <p className="muted">
            {g.home.name} {score(g, g.home.id)} × {score(g, g.away.id)}{' '}
            {g.away.name}
          </p>
          <div className="stack">
            <button
              className="primary"
              onClick={() =>
                C({
                  title:
                    g.period < g.periods
                      ? 'Avançar período?'
                      : 'Iniciar prorrogação?',
                  body: 'O relógio do período atual será encerrado. A próxima etapa começa pausada.',
                  action: advance,
                })
              }
            >
              {g.period < g.periods ? 'Próximo período' : 'Iniciar prorrogação'}
            </button>
            <button
              className="secondary"
              onClick={() =>
                C({
                  title: 'Finalizar partida?',
                  body: 'O jogo será salvo como finalizado. Você poderá retomar para fazer correções.',
                  action: () => {
                    save({
                      ...g,
                      remaining: remaining(g),
                      runningSince: null,
                      status: 'final',
                    });
                    M('');
                  },
                })
              }
            >
              Finalizar partida
            </button>
            {g.status === 'final' && (
              <button
                className="secondary"
                onClick={() => {
                  save({ ...g, status: 'playing' });
                  M('');
                }}
              >
                Retomar para corrigir
              </button>
            )}
          </div>
        </Modal>
      )}
      {modal === 'settings' && (
        <Modal title="Configuração do jogo" onClose={() => M('')}>
          <Toggle
            checked={prefs.stopOnFoul}
            onChange={(v) => onPrefs({ ...prefs, stopOnFoul: v })}
            label="Pausar ao marcar falta ou perda"
          />
          <Toggle
            checked={prefs.assistPrompt}
            onChange={(v) => onPrefs({ ...prefs, assistPrompt: v })}
            label="Oferecer assistência após cesta"
          />
          <Toggle
            checked={prefs.shotPrompt}
            onChange={(v) => onPrefs({ ...prefs, shotPrompt: v })}
            label="Mostrar mapa no registro de arremessos"
          />
          <label>
            Limite de faltas
            <Pick
              label="Limite de faltas"
              value={String(prefs.foulLimit)}
              onChange={(v) => onPrefs({ ...prefs, foulLimit: +v })}
              options={[
                { value: '5', label: '5 faltas' },
                { value: '6', label: '6 faltas' },
              ]}
            />
          </label>
        </Modal>
      )}
      {modal === 'minutes' && (
        <Modal title="Minutos e faltas" wide onClose={() => M('')}>
          <div className="roster-columns">
            {[g.home, g.away].map((t) => (
              <div key={t.id}>
                <h3>{t.name}</h3>
                {t.players.map((p) => (
                  <div className="minute-row" key={p.id}>
                    <span>
                      #{p.number} {p.name}
                    </span>
                    <b>{clock(rows[p.id].seconds)}</b>
                    <span>{rows[p.id].foul} faltas</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Modal>
      )}
      {modal === 'notes' && (
        <Modal title="Notas da partida" onClose={() => M('')}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save({
                ...freeze(),
                notes: String(new FormData(e.currentTarget).get('notes') ?? ''),
              });
              M('');
            }}
          >
            <textarea
              name="notes"
              defaultValue={g.notes}
              rows={8}
              maxLength={5000}
              placeholder="Observações, ajustes e pontos para o próximo treino…"
            />
            <button className="primary full">
              <Save size={18} />
              Salvar notas
            </button>
          </form>
        </Modal>
      )}
      {modal === 'team-action' && (
        <Modal title="Ação da equipe" onClose={() => M('')}>
          <p className="muted">Registra sem atribuir a um jogador.</p>
          <div className="stack">
            {(['oreb', 'dreb', 'stl', 'tov', 'foul'] as Kind[]).map((k) => (
              <button
                className="secondary"
                key={k}
                onClick={() => {
                  record(k, undefined, undefined, false, subteam);
                  M('');
                }}
              >
                {labels[k]}
              </button>
            ))}
          </div>
        </Modal>
      )}
      {modal === 'timeout' && (
        <Modal title="Tempo técnico" onClose={() => M('')}>
          <div className="stack">
            {[g.home, g.away].map((t) => (
              <button
                className="primary"
                key={t.id}
                onClick={() => {
                  save({
                    ...g,
                    remaining: remaining(g),
                    runningSince: null,
                    events: [
                      ...g.events,
                      {
                        id: uid(),
                        kind: 'timeout',
                        team: t.id,
                        player: t.id,
                        period: g.period,
                        elapsed: elapsed(g),
                      },
                    ],
                  });
                  M('');
                }}
              >
                {t.name} · pedir tempo
              </button>
            ))}
          </div>
        </Modal>
      )}
      {confirm && (
        <Confirm
          title={confirm.title}
          body={confirm.body}
          onConfirm={confirm.action}
          onClose={() => C(null)}
        />
      )}
    </div>
  );
}
function EventEditor({
  game: g,
  event,
  prefs,
  onSave,
  onClose,
}: {
  game: Game;
  event: Play;
  prefs: State['prefs'];
  onSave: (e: Play) => void;
  onClose: () => void;
}) {
  const [e, S] = useState<Play>(structuredClone(event));
  const t = e.team === g.home.id ? g.home : g.away,
    other = e.kind === 'shot' ? t : e.team === g.home.id ? g.away : g.home;
  const editing = g.events.some((p) => p.id === e.id);
  const opts = [
    { value: t.id, label: 'Equipe (sem jogador)' },
    ...t.players.map((p) => ({ value: p.id, label: `#${p.number} ${p.name}` })),
  ];
  return (
    <Modal
      title={editing ? 'Editar lance' : labels[e.kind]}
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          onSave(e);
        }}
      >
        <div className="form-grid">
          <label>
            Jogador
            <Pick
              value={e.player}
              onChange={(v) => S({ ...e, player: v, other: undefined })}
              options={opts}
              label="Jogador"
            />
          </label>
          {editing && (
            <>
              <label>
                Período
                <Pick
                  value={String(e.period)}
                  onChange={(v) =>
                    S({ ...e, period: +v, elapsed: periodStart(g, +v) })
                  }
                  options={Array.from({ length: g.period }, (_, i) => ({
                    value: String(i + 1),
                    label: `${i + 1}º período`,
                  }))}
                  label="Período"
                />
              </label>
              <label>
                Segundos decorridos no período
                <input
                  type="number"
                  min={0}
                  max={periodLength(g, e.period)}
                  value={Math.round(e.elapsed - periodStart(g, e.period))}
                  onChange={(v) =>
                    S({
                      ...e,
                      elapsed:
                        periodStart(g, e.period) + Number(v.target.value),
                    })
                  }
                />
              </label>
            </>
          )}
          {e.kind === 'shot' && (
            <>
              <label>
                Arremesso
                <Pick
                  value={e.free ? 'ft' : String(e.value)}
                  onChange={(v) =>
                    S({
                      ...e,
                      free: v === 'ft',
                      value: v === 'ft' ? 1 : +v,
                      other: undefined,
                    })
                  }
                  options={[
                    { value: 'ft', label: 'Lance livre' },
                    ...(g.format === 3 ? [1, 2] : [2, 3]).map((n) => ({
                      value: String(n),
                      label: `${n} pontos`,
                    })),
                  ]}
                  label="Tipo de arremesso"
                />
              </label>
              <Toggle
                label="Convertido"
                checked={!!e.made}
                onChange={(v) => S({ ...e, made: v, other: undefined })}
              />
            </>
          )}
          {e.kind === 'foul' && (
            <label>
              Tipo de falta
              <Pick
                value={e.detail ?? 'Pessoal'}
                onChange={(v) => S({ ...e, detail: v })}
                label="Tipo de falta"
                options={[
                  'Pessoal',
                  'Ofensiva',
                  'Técnica',
                  'Antidesportiva',
                  'Desqualificante',
                  'Técnica do banco',
                  'Técnica do treinador',
                ].map((x) => ({ value: x, label: x }))}
              />
            </label>
          )}
          {e.kind === 'tov' && (
            <label>
              Tipo de perda
              <Pick
                value={e.detail ?? 'Passe errado'}
                onChange={(v) => S({ ...e, detail: v })}
                label="Tipo de perda"
                options={[
                  'Passe errado',
                  'Manejo de bola',
                  'Passos',
                  'Violação',
                  'Ofensiva',
                  'Outro',
                ].map((x) => ({ value: x, label: x }))}
              />
            </label>
          )}
        </div>
        {e.kind === 'shot' && !e.free && (prefs.shotPrompt || editing) && (
          <>
            <p className="muted">Toque na posição do arremesso (opcional).</p>
            <ShotMap
              select={e.x === undefined ? undefined : { x: e.x, y: e.y! }}
              onSelect={(x, y) => S({ ...e, x, y })}
            />
            <label>
              Tipo
              <Pick
                value={e.shotType ?? 'Jump shot'}
                onChange={(v) => S({ ...e, shotType: v })}
                label="Tipo do arremesso"
                options={[
                  'Jump shot',
                  'Bandeja',
                  'Enterrada',
                  'Gancho',
                  'Floater',
                  'Pull-up',
                  'Step-back',
                  'Outro',
                ].map((x) => ({ value: x, label: x }))}
              />
            </label>
            <Toggle
              label="Contra-ataque"
              checked={!!e.fastbreak}
              onChange={(v) => S({ ...e, fastbreak: v })}
            />
          </>
        )}
        {((e.kind === 'shot' &&
          e.made &&
          !e.free &&
          (prefs.assistPrompt || editing)) ||
          ['tov', 'stl', 'blk', 'foul'].includes(e.kind)) && (
          <label>
            {e.kind === 'shot'
              ? 'Quem deu a assistência?'
              : e.kind === 'tov'
                ? 'Quem recuperou a bola?'
                : e.kind === 'stl'
                  ? 'Quem perdeu a bola?'
                  : e.kind === 'blk'
                    ? 'Quem recebeu o bloqueio?'
                    : 'Quem recebeu a falta?'}
            <Pick
              value={e.other ?? 'none'}
              onChange={(v) => S({ ...e, other: v === 'none' ? undefined : v })}
              options={[
                { value: 'none', label: 'Não registrar' },
                ...other.players
                  .filter((p) => p.id !== e.player)
                  .map((p) => ({
                    value: p.id,
                    label: `#${p.number} ${p.name}`,
                  })),
              ]}
              label="Jogador associado"
            />
          </label>
        )}
        <button className="primary full" type="submit">
          <Check size={18} />
          {editing ? 'Salvar correção' : 'Registrar lance'}
        </button>
      </form>
    </Modal>
  );
}
