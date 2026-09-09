'use client';
import { TeamLogo } from './team-logo';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { newGame, uid, validateCompetition, competitionKey, COMPETITION_TYPES, type Competition, type Team, type Game } from '@/lib/model';
import { Modal, Pick, Jersey } from './basketball';
export default function GameSetup({
  teams,
  competitions,
  onCompetition,
  onSave,
  onClose,
}: {
  teams: Team[];
  competitions: Competition[];
  onCompetition: (c: Competition) => void;
  onSave: (g: Game) => void;
  onClose: () => void;
}) {
  const [competitionId, CompetitionId] = useState('');
  const [creating, Creating] = useState(false);
  const [competitionName, CompetitionName] = useState('');
  const [competitionType, CompetitionType] = useState<Competition['type']>('league');
  const [h, H] = useState(teams[0]?.id ?? ''),
    [a, A] = useState(teams[1]?.id ?? ''),
    [format, F] = useState(5),
    [minutes, M] = useState(10),
    [periods, P] = useState(4),
    [overtime, O] = useState(5),
    [date, D] = useState(new Date().toISOString().slice(0, 10)),
    [season, S] = useState(teams[0]?.season ?? '2026/27'),
    [phase, Ph] = useState('Temporada regular'),
    [referees, R] = useState(''),
    [step, Step] = useState(0),
    [lineup, L] = useState<Record<string, string[]>>({}),
    [error, E] = useState('');
  const home = teams.find((t) => t.id === h),
    away = teams.find((t) => t.id === a);
  const opts = teams.map((t) => ({ value: t.id, label: t.name }));
  return (
    <Modal
      title={step ? 'Convocar jogadores' : 'Novo jogo'}
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            if (!home || !away)
              throw new Error('Cadastre duas equipes primeiro.');
            if (!step) {
              newGame(home, away, { format, minutes, periods, overtime });
              L({
                [h]: home.players.slice(0, format).map((p) => p.id),
                [a]: away.players.slice(0, format).map((p) => p.id),
              });
              Step(1);
              E('');
            } else {
              onSave(
                newGame(home, away, {
                  competitionId: competitionId || undefined,
                  format,
                  minutes,
                  periods,
                  overtime,
                  date,
                  season,
                  phase,
                  referees,
                  initial: lineup,
                }),
              );
              onClose();
            }
          } catch (e) {
            E((e as Error).message);
          }
        }}
      >
        {!step ? (
          <>
            <div className="match-setup">
              <div>
                {home ? <TeamLogo team={home} /> : <Jersey color="#444444" />}
                <Pick
                  value={h}
                  onChange={H}
                  options={opts}
                  label="Equipe local"
                />
              </div>
              <b>VS</b>
              <div>
                {away ? <TeamLogo team={away} /> : <Jersey color="#444444" />}
                <Pick
                  value={a}
                  onChange={A}
                  options={opts}
                  label="Equipe visitante"
                />
              </div>
            </div>
            <Pick label="Campeonato" value={competitionId || 'none'} onChange={v => { CompetitionId(v === 'none' ? '' : v); const c = competitions.find(c => c.id === v); if (c) S(c.season); }} options={[{value: 'none', label: 'Sem campeonato'}, ...competitions.map(c => ({value: c.id, label: `${c.name} · ${c.season}`}))]} />
            <button type="button" className="text-button" onClick={() => Creating(!creating)}>Criar campeonato</button>
            {creating && <fieldset><legend>Novo campeonato</legend>
              <label>Nome (sem o ano)<input aria-label="Nome do campeonato" value={competitionName} maxLength={100} onChange={e => CompetitionName(e.target.value)} /></label>
              <label>Temporada<input aria-label="Temporada do campeonato" placeholder="2026 ou 2026/27" value={season} onChange={e => S(e.target.value)} /></label>
              <Pick label="Tipo do campeonato" value={competitionType} onChange={v => CompetitionType(v as Competition['type'])} options={Object.entries(COMPETITION_TYPES).map(([value,label]) => ({value,label}))} />
              <button type="button" className="primary" onClick={() => { try { const c: Competition = {id: uid(), name: competitionName.trim().replace(/\s+/g, ' '), season: season.trim(), type: competitionType}; validateCompetition(c); const existing = competitions.find(x => competitionKey(x) === competitionKey(c)); if (existing) { CompetitionId(existing.id); } else { onCompetition(c); CompetitionId(c.id); } Creating(false); E(''); } catch(e) { E((e as Error).message); } }}>Salvar campeonato</button>
            </fieldset>}
            <div className="form-grid">
              <label>
                Formato
                <Pick
                  value={String(format)}
                  onChange={(v) => {
                    F(+v);
                    P(+v === 3 ? 1 : 4);
                  }}
                  options={[
                    { value: '5', label: '5 × 5' },
                    { value: '3', label: '3 × 3 (regras personalizadas)' },
                  ]}
                  label="Formato"
                />
              </label>
              <label>
                Períodos
                <input
                  type="number"
                  min={1}
                  max={8}
                  required
                  value={periods}
                  onChange={(e) => P(+e.target.value)}
                />
              </label>
              <label>
                Minutos por período
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={minutes}
                  onChange={(e) => M(+e.target.value)}
                />
              </label>
              <label>
                Minutos da prorrogação
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={overtime}
                  onChange={(e) => O(+e.target.value)}
                />
              </label>
              <label>
                Data
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => D(e.target.value)}
                />
              </label>
              <label>
                Temporada
                <input
                  required
                  value={season}
                  maxLength={30}
                  onChange={(e) => S(e.target.value)}
                />
              </label>
              <label>
                Fase
                <input
                  required
                  value={phase}
                  maxLength={60}
                  onChange={(e) => Ph(e.target.value)}
                />
              </label>
              <label>
                Árbitros
                <input
                  value={referees}
                  maxLength={160}
                  onChange={(e) => R(e.target.value)}
                />
              </label>
            </div>
            {format === 3 && (
              <p className="notice">
                Neste formato, cestas valem 1 ou 2 pontos. O encerramento é por
                tempo e a prorrogação usa a duração configurada.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="muted">
              Selecione {format} titulares por equipe. Os demais jogadores ficam
              no banco.
            </p>
            <div className="roster-columns">
              {[home!, away!].map((t) => (
                <div key={t.id}>
                  <h3>
                    {t.name} · {lineup[t.id]?.length}/{format}
                  </h3>
                  {t.players.map((p) => (
                    <label className="roster-check" key={p.id}>
                      <Checkbox
                        checked={lineup[t.id]?.includes(p.id)}
                        onCheckedChange={(checked) =>
                          L({
                            ...lineup,
                            [t.id]: checked
                              ? [...lineup[t.id], p.id]
                              : lineup[t.id].filter((id) => id !== p.id),
                          })
                        }
                      />
                      <Jersey color={t.color} player={p} small />
                      {p.name}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="button-row">
          {!!step && (
            <button className="secondary" type="button" onClick={() => Step(0)}>
              Voltar
            </button>
          )}
          <button className="primary" type="submit">
            {step ? 'Iniciar partida' : 'Convocar jogadores'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
