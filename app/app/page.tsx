'use client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Trophy,
  UserRound,
  Plus,
  CircleDot,
  Target,
  Hand,
  ArrowUpRight,
  CloudCheck,
  Download,
  Upload,
  LogOut,
  Trash2,
  Pencil,
  ArrowLeft,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthGate } from '@/components/auth';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/use-store';
import {
  box,
  blank,
  score,
  demoState,
  validateState,
  type State,
  type Game,
  type Team,
  type Stats,
} from '@/lib/model';
import { download, csvCell } from '@/lib/export';
import { Modal, Pick, Jersey, Confirm } from '@/components/basketball';
import TeamEditor from '@/components/team-editor';
import GameSetup from '@/components/game-setup';
import GameDesk from '@/components/game-desk';
import { StatsPanel, BoxTable, Metrics } from '@/components/stats';
export default function Home() {
  return (
    <AuthGate>
      {(session) => <Workspace key={session.user.id} session={session} />}
    </AuthGate>
  );
}
function Workspace({ session }: { session: Session }) {
  const { data, change, status, error, retry, getPending } = useStore(
    session.user.id,
  );
  const [tab, T] = useState('Dashboard'),
    [modal, M] = useState(''),
    [editing, Editing] = useState<Team | undefined>(),
    [active, A] = useState<string | null>(null),
    [report, R] = useState<Game | null>(null),
    [teamID, TeamID] = useState(''),
    [season, Season] = useState('all'),
    [competitionFilter, CompetitionFilter] = useState('all'),
    [issue, I] = useState(''),
    [confirm, C] = useState<{
      title: string;
      body: string;
      action: () => void;
    } | null>(null),
    [profile, Profile] = useState<string | null>(null);
  const team = data?.teams.find((t) => t.id === teamID) ?? data?.teams[0];
  const game = data?.games.find((g) => g.id === active);
  function saveGame(g: Game) {
    change((s) => ({
      ...s,
      games: s.games.some((x) => x.id === g.id)
        ? s.games.map((x) => (x.id === g.id ? g : x))
        : [g, ...s.games],
    }));
  }
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const ctrl = new AbortController();
    const tools = [
      {
        name: 'armador_read_overview',
        title: 'Consultar equipes e partidas',
        description:
          'Lê o resumo dos dados da conta aberta, sem alterar registros.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: (input: unknown) => {
          if (!input || typeof input !== 'object' || Object.keys(input).length)
            throw new Error('Entrada inválida');
          return {
            teams: data?.teams.map((t) => ({ id: t.id, name: t.name })),
            games: data?.games.map((g) => ({
              id: g.id,
              home: g.home.name,
              away: g.away.name,
              status: g.status,
            })),
          };
        },
      },
      {
        name: 'armador_start_team_creation',
        title: 'Abrir cadastro de equipe',
        description:
          'Abre o formulário de nova equipe; não cria nem salva uma equipe.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: (input: unknown) => {
          if (!input || typeof input !== 'object' || Object.keys(input).length)
            throw new Error('Entrada inválida');
          Editing(undefined);
          M('team');
          return { status: 'form_open' };
        },
      },
    ];
    for (const tool of tools)
      Promise.resolve(
        context.registerTool(tool, { signal: ctrl.signal }),
      ).catch(() => {});
    return () => ctrl.abort();
  }, [data]);
  const relevant =
    data?.games.filter(
      (g) =>
        team &&
        (g.home.id === team.id || g.away.id === team.id) &&
        (season === 'all' || g.season === season) &&
        (tab !== 'Estatísticas' || competitionFilter === 'all' || (competitionFilter === 'none' ? !g.competitionId : g.competitionId === competitionFilter)) &&
        g.status === 'final',
    ) ?? [];
  const total: Record<string, Stats> = {};
  if (team) {
    total[team.id] = blank();
    for (const g of relevant) {
      const b = box(g);
      for (const [id, stats] of Object.entries(b)) {
        total[id] ??= blank();
        for (const key of Object.keys(stats) as (keyof Stats)[])
          total[id][key] += stats[key];
      }
    }
    for (const p of team.players) total[p.id] ??= blank();
  }
  const wins = relevant.filter(
    (g) =>
      score(g, team!.id) >
      score(g, g.home.id === team!.id ? g.away.id : g.home.id),
  ).length;
  const losses = relevant.filter(
    (g) =>
      score(g, team!.id) <
      score(g, g.home.id === team!.id ? g.away.id : g.home.id),
  ).length;
  function teamForm(t?: Team) {
    Editing(t);
    M('team');
  }
  function loadDemo() {
    const demo = demoState();
    change((s) => ({
      ...s,
      teams: [...s.teams, ...demo.teams],
      games: [...demo.games, ...s.games],
    }));
    M('');
  }
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) I('Não foi possível sair. Tente novamente.');
  }
  return (
    <>
      <header className="app-header">
        <div className="brand">
          <CircleDot size={25} />
          <span>
            ARMADOR <b>BRASIL</b>
          </span>
        </div>
        <h1>{game ? 'Registro de partida' : tab}</h1>
        <div className="header-actions">
          <button
            aria-label="Ver estatísticas"
            onClick={() => {
              A(null);
              T('Estatísticas');
            }}
          >
            <Trophy />
          </button>
          <button aria-label="Minha conta" onClick={() => M('account')}>
            <UserRound />
          </button>
        </div>
      </header>
      {!data ? (
        <main className="workspace">
          <div className="empty-panel">
            <CircleDot size={32} />
            <h2>{status}</h2>
            {error && <p className="error">{error}</p>}
            <button className="primary" onClick={() => location.reload()}>
              Tentar novamente
            </button>
            <button className="text-button" onClick={() => void signOut()}>
              Sair da conta
            </button>
          </div>
        </main>
      ) : (
        <>
          {(error || issue) && (
            <div className="save-error" role="alert">
              {issue || error}
              <button
                onClick={() => {
                  I('');
                  void retry();
                }}
              >
                Tentar salvar
              </button>
              <button
                onClick={() =>
                  download('armador-backup.json', JSON.stringify(data, null, 2))
                }
              >
                Exportar backup
              </button>
            </div>
          )}
          <div className="save-status">
            <CloudCheck size={15} />
            {status}
            <span>{session.user.email}</span>
          </div>
          {game ? (
            <GameDesk
              game={game}
              prefs={data.prefs}
              onSave={saveGame}
              onPrefs={(prefs) => change((s) => ({ ...s, prefs }))}
              onBack={() => A(null)}
            />
          ) : (
            <main className="workspace">
              <Tabs value={tab} onValueChange={(v) => T(String(v))}>
                <TabsList className="main-tabs">
                  {['Dashboard', 'Jogos', 'Equipes', 'Estatísticas'].map(
                    (x) => (
                      <TabsTrigger key={x} value={x}>
                        {x}
                      </TabsTrigger>
                    ),
                  )}
                </TabsList>
              </Tabs>
              {tab === 'Dashboard' && (
                <>
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">SUA EQUIPE, EM NÚMEROS</p>
                      <h2>Líderes de equipe</h2>
                    </div>
                    <span className="pill">
                      {season === 'all' ? 'Todas as temporadas' : season}
                    </span>
                  </div>
                  {team && (
                    <div className="filter-bar">
                      <Pick
                        value={team.id}
                        onChange={TeamID}
                        options={data.teams.map((t) => ({
                          value: t.id,
                          label: t.name,
                        }))}
                        label="Equipe"
                      />
                      <Pick
                        value={season}
                        onChange={Season}
                        options={[
                          { value: 'all', label: 'Todas as temporadas' },
                          ...Array.from(
                            new Set(data.games.map((g) => g.season)),
                          ).map((s) => ({ value: s, label: s })),
                        ]}
                        label="Temporada"
                      />
                    </div>
                  )}
                  <div className="leader-grid">
                    {(
                      [
                        {
                          label: 'Pontos',
                          key: 'pts',
                          Icon: Target,
                          color: 'green',
                        },
                        {
                          label: 'Assistências',
                          key: 'ast',
                          Icon: Hand,
                          color: 'rose',
                        },
                        {
                          label: 'Rebotes',
                          key: 'reb',
                          Icon: ArrowUpRight,
                          color: 'blue',
                        },
                      ] as const
                    ).map(({ label, key, Icon, color }) => {
                      const p = team?.players.reduce<
                        (typeof team.players)[0] | undefined
                      >(
                        (best, p) =>
                          !best ||
                          (total[p.id]?.[key] ?? 0) >
                            (total[best.id]?.[key] ?? 0)
                            ? p
                            : best,
                        undefined,
                      );
                      return (
                        <article key={label} className={'leader ' + color}>
                          <div className="leader-top">
                            <span className="icon-bubble">
                              <Icon />
                            </span>
                            <span>{label}</span>
                          </div>
                          <h3>
                            {p && relevant.length
                              ? `#${p.number} ${p.name}`
                              : 'Aguardando o primeiro jogo'}
                          </h3>
                          <p className="big-stat">
                            {p && relevant.length
                              ? (
                                  (total[p.id]?.[key] ?? 0) / relevant.length
                                ).toFixed(1)
                              : '—'}{' '}
                            <span>{label.toLowerCase()}</span>
                          </p>
                          <footer>
                            {relevant.length} jogos · média por partida da
                            equipe
                          </footer>
                        </article>
                      );
                    })}
                    <article className="results-card">
                      <h3>RESULTADOS</h3>
                      <div
                        className="donut"
                        style={{
                          background: `conic-gradient(#4e9f78 ${relevant.length ? (wins / relevant.length) * 360 : 0}deg,#bd2855 ${relevant.length ? (wins / relevant.length) * 360 : 0}deg ${relevant.length ? ((wins + losses) / relevant.length) * 360 : 0}deg,#e1ece5 0deg)`,
                        }}
                      >
                        <b>
                          {relevant.length}
                          <small>jogos</small>
                        </b>
                      </div>
                      <p>
                        {wins} vitórias · {losses} derrotas
                      </p>
                    </article>
                  </div>
                  <div className="section-heading">
                    <h2>Últimas partidas</h2>
                    <button className="text-button" onClick={() => T('Jogos')}>
                      Ver jogos
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  {data.games.slice(0, 2).map((g) => (
                    <GameCard
                      key={g.id}
                      game={g}
                      onReport={() => R(g)}
                      onResume={() => {
                        A(g.id);
                      }}
                    />
                  ))}
                  {!data.games.length && (
                    <div className="empty-panel">
                      <CircleDot size={32} />
                      <h3>A próxima história começa na quadra</h3>
                      <p>Cadastre suas equipes e registre o primeiro jogo.</p>
                      <div className="button-row">
                        <button className="primary" onClick={() => teamForm()}>
                          <Plus size={18} />
                          Cadastrar equipe
                        </button>
                        <button className="secondary" onClick={loadDemo}>
                          Carregar demonstração
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {tab === 'Equipes' && (
                <>
                  <div className="section-heading">
                    <h2>Equipes guardadas</h2>
                    <button className="primary" onClick={() => teamForm()}>
                      <Plus size={18} />
                      Nova equipe
                    </button>
                  </div>
                  {data.teams.map((t) => (
                    <article className="team-card" key={t.id}>
                      <div>
                        <Jersey color={t.color} />
                        <h3>{t.name}</h3>
                        <span>{t.players.length} jogadores</span>
                        <span className="pill">{t.season}</span>
                        <button
                          className="icon-button"
                          aria-label={`Excluir ${t.name}`}
                          onClick={() =>
                            C({
                              title: 'Excluir equipe?',
                              body: 'A equipe sairá da lista. As partidas já registradas manterão seus dados históricos.',
                              action: () =>
                                change((s) => ({
                                  ...s,
                                  teams: s.teams.filter((x) => x.id !== t.id),
                                })),
                            })
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <footer>
                        <button onClick={() => teamForm(t)}>
                          EDITAR EQUIPE
                        </button>
                        <button
                          onClick={() => {
                            TeamID(t.id);
                            T('Estatísticas');
                          }}
                        >
                          VER ESTATÍSTICAS
                        </button>
                      </footer>
                    </article>
                  ))}
                  {!data.teams.length && (
                    <div className="empty-panel">
                      <h3>Nenhuma equipe cadastrada</h3>
                      <p>
                        Adicione o nome, a cor do uniforme e seus jogadores.
                      </p>
                    </div>
                  )}
                </>
              )}
              {tab === 'Jogos' && (
                <>
                  <div className="section-heading">
                    <h2>Jogos guardados</h2>
                    <button
                      className="primary"
                      onClick={() => M('setup')}
                      disabled={data.teams.length < 2}
                    >
                      <Plus size={18} />
                      Novo jogo
                    </button>
                  </div>
                  {data.teams.length < 2 && (
                    <p className="notice">
                      Cadastre duas equipes para preparar uma partida.
                    </p>
                  )}
                  <Pick label="Filtrar por campeonato" value={competitionFilter} onChange={CompetitionFilter} options={[{value:'all',label:'Todos os campeonatos'}, {value:'none',label:'Sem campeonato'}, ...(data.competitions ?? []).map(c => ({value:c.id,label:`${c.name} · ${c.season}`}))]} />
                  {data.games.filter(g => competitionFilter === 'all' || (competitionFilter === 'none' ? !g.competitionId : g.competitionId === competitionFilter)).map((g) => (
                    <GameCard
                      key={g.id}
                      game={g}
                      onReport={() => R(g)}
                      onResume={() => A(g.id)}
                      onDelete={() =>
                        C({
                          title: 'Excluir partida?',
                          body: 'A partida e seus lances serão removidos da conta. Exporte um backup se quiser preservá-los.',
                          action: () =>
                            change((s) => ({
                              ...s,
                              games: s.games.filter((x) => x.id !== g.id),
                            })),
                        })
                      }
                    />
                  ))}
                  {!data.games.length && (
                    <div className="empty-panel">
                      <h3>Ainda não há partidas</h3>
                      <p>Seus jogos e relatórios aparecerão aqui.</p>
                    </div>
                  )}
                </>
              )}
              {tab === 'Estatísticas' && (
                <>
                  <div className="section-heading">
                    <h2>Estatísticas da temporada</h2>
                    <Pick label="Filtrar por campeonato" value={competitionFilter} onChange={CompetitionFilter} options={[{value:'all',label:'Todos os campeonatos'}, {value:'none',label:'Sem campeonato'}, ...(data.competitions ?? []).map(c => ({value:c.id,label:`${c.name} · ${c.season}`}))]} />
                  </div>
                  {team ? (
                    <>
                      <div className="filter-bar">
                        <Pick
                          value={team.id}
                          onChange={(v) => {
                            TeamID(v);
                            Profile(null);
                          }}
                          options={data.teams.map((t) => ({
                            value: t.id,
                            label: t.name,
                          }))}
                          label="Equipe"
                        />
                        <Pick
                          value={season}
                          onChange={Season}
                          options={[
                            { value: 'all', label: 'Todas as temporadas' },
                            ...Array.from(
                              new Set(data.games.map((g) => g.season)),
                            ).map((s) => ({ value: s, label: s })),
                          ]}
                          label="Temporada"
                        />
                      </div>
                      <p className="notice">
                        Totais de {relevant.length} partidas finalizadas ·{' '}
                        {wins} vitórias / {losses} derrotas
                        {relevant.some((g) => g.demo)
                          ? ' · Inclui dados de demonstração'
                          : ''}
                      </p>
                      {profile && (
                        <>
                          <button
                            className="text-button"
                            onClick={() => Profile(null)}
                          >
                            <ArrowLeft size={16} />
                            Toda a equipe
                          </button>
                          <h3>
                            {team.players.find((p) => p.id === profile)?.name}
                          </h3>
                          <Metrics
                            s={total[profile] ?? blank()}
                            opp={blank()}
                          />
                        </>
                      )}
                      <BoxTable team={team} stats={total} onPlayer={Profile} />
                      <button
                        className="secondary"
                        onClick={() => {
                          const rows = [
                            [
                              'Jogador',
                              'Pontos',
                              'Rebotes',
                              'Assistências',
                              'Jogos da equipe',
                            ],
                            ...team.players.map((p) => [
                              p.name,
                              total[p.id]?.pts ?? 0,
                              total[p.id]?.reb ?? 0,
                              total[p.id]?.ast ?? 0,
                              relevant.length,
                            ]),
                          ];
                          download(
                            'armador-temporada.csv',
                            '\uFEFF' +
                              rows
                                .map((r) => r.map(csvCell).join(';'))
                                .join('\r\n'),
                            'text/csv;charset=utf-8',
                          );
                        }}
                      >
                        <Download size={18} />
                        Exportar totais CSV
                      </button>
                      <div className="section-heading">
                        <h3>Partidas</h3>
                      </div>
                      {relevant.map((g) => (
                        <GameCard
                          key={g.id}
                          game={g}
                          onReport={() => R(g)}
                          onResume={() => A(g.id)}
                        />
                      ))}
                    </>
                  ) : (
                    <div className="empty-panel">
                      <h3>Cadastre sua primeira equipe</h3>
                    </div>
                  )}
                </>
              )}
            </main>
          )}
          {modal === 'team' && (
            <TeamEditor
              team={editing}
              onClose={() => M('')}
              onSave={(t) =>
                change((s) => ({
                  ...s,
                  teams: s.teams.some((x) => x.id === t.id)
                    ? s.teams.map((x) => (x.id === t.id ? t : x))
                    : [...s.teams, t],
                }))
              }
            />
          )}{' '}
          {modal === 'setup' && (
            <GameSetup
              teams={data.teams}
              competitions={data.competitions ?? []}
              onCompetition={c => change(s => ({...s, competitions: [...(s.competitions ?? []), c]}))}
              onClose={() => M('')}
              onSave={(g) => {
                saveGame(g);
                A(g.id);
              }}
            />
          )}
          {report && (
            <Modal title="Relatório da partida" wide onClose={() => R(null)}>
              <StatsPanel
                game={data.games.find((g) => g.id === report.id) ?? report}
              />
            </Modal>
          )}
          {modal === 'account' && (
            <Modal title="Minha conta" onClose={() => M('')}>
              <p className="account-email">{session.user.email}</p>
              <p className="muted">
                {data.teams.length} equipes · {data.games.length} partidas
              </p>
              <div className="stack">
                <button
                  className="secondary"
                  onClick={() =>
                    download(
                      'armador-backup.json',
                      JSON.stringify(data, null, 2),
                    )
                  }
                >
                  <Download size={18} />
                  Exportar backup
                </button>
                <label className="secondary file-button">
                  <Upload size={18} />
                  Restaurar backup
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={async (e) => {
                      try {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (f.size > 8000000)
                          throw new Error('O arquivo deve ter até 8 MB.');
                        const state = JSON.parse(await f.text());
                        validateState(state);
                        C({
                          title: 'Restaurar backup?',
                          body: 'Este backup substituirá as equipes e partidas da sua conta. A ação será salva no Supabase.',
                          action: () => {
                            change(() => state);
                            M('');
                          },
                        });
                      } catch (e) {
                        I((e as Error).message);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
                <button
                  className="secondary"
                  onClick={async () => {
                    const pending = await getPending();
                    if (pending)
                      download(
                        'armador-rascunho.json',
                        JSON.stringify(pending.state, null, 2),
                      );
                    else I('Nenhum rascunho pendente neste dispositivo.');
                  }}
                >
                  Exportar rascunho pendente
                </button>
                <button
                  className="secondary"
                  onClick={() =>
                    C({
                      title: 'Adicionar demonstração?',
                      body: 'Serão adicionadas duas equipes fictícias e uma partida de exemplo, sem substituir seus dados.',
                      action: loadDemo,
                    })
                  }
                >
                  Adicionar jogo de demonstração
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    if (status !== 'Salvo')
                      C({
                        title: 'Sair com alterações pendentes?',
                        body: 'Exporte um backup antes de sair. O rascunho ficará neste dispositivo para sua conta.',
                        action: () => void signOut(),
                      });
                    else void signOut();
                  }}
                >
                  <LogOut size={18} />
                  Sair da conta
                </button>
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
        </>
      )}
    </>
  );
}
function GameCard({
  game: g,
  onReport,
  onResume,
  onDelete,
}: {
  game: Game;
  onReport: () => void;
  onResume: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="game-card">
      <div className="game-card-meta">
        <span className="pill">
          {g.phase} · {g.season}
        </span>
        {g.demo && <span className="demo-label">DEMONSTRAÇÃO</span>}
        {onDelete && (
          <button
            aria-label="Excluir partida"
            className="icon-button"
            onClick={onDelete}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <div className="match-card">
        <div>
          <Jersey color={g.home.color} />
          <h3>{g.home.name}</h3>
        </div>
        <b>{score(g, g.home.id)}</b>
        <div className="match-status">
          <strong>{g.status === 'final' ? 'FINAL' : 'EM ANDAMENTO'}</strong>
          <span>{g.date.split('-').reverse().join('/')}</span>
        </div>
        <b>{score(g, g.away.id)}</b>
        <div>
          <Jersey color={g.away.color} />
          <h3>{g.away.name}</h3>
        </div>
      </div>
      <footer>
        <button onClick={onReport}>BOX SCORE / RELATÓRIO</button>
        <button onClick={onResume}>
          {g.status === 'final' ? 'ABRIR PARTIDA' : 'RETOMAR'}
        </button>
      </footer>
    </article>
  );
}
