import { box, clock, labels, type Game } from './model';
export function download(
  name: string,
  text: string,
  type = 'application/json',
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csvCell(value: unknown) {
  let s = String(value ?? '');
  if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function exportGame(g: Game, events = false, period = 0) {
  const b = box(g, period);
  const head = events
    ? [
        'ID',
        'Período',
        'Segundos decorridos',
        'Equipe',
        'Jogador',
        'Ação',
        'Pontos',
        'Convertido',
        'Jogador associado',
        'X',
        'Y',
        'Tipo',
        'Observação',
      ]
    : [
        'Equipe',
        'Número',
        'Jogador',
        'Minutos',
        'PTS',
        'FGM',
        'FGA',
        '3PM',
        '3PA',
        'FTM',
        'FTA',
        'REB',
        'OREB',
        'DREB',
        'AST',
        'STL',
        'TOV',
        'BLK',
        'Faltas',
        '+/-',
      ];
  const rows = events
    ? g.events
        .filter((e) => !period || e.period === period)
        .map((e) => {
          const t = e.team === g.home.id ? g.home : g.away;
          return [
            e.id,
            e.period,
            e.elapsed,
            t.name,
            t.players.find((p) => p.id === e.player)?.name ?? 'Equipe',
            labels[e.kind],
            e.value,
            e.made,
            e.other,
            e.x,
            e.y,
            e.shotType ?? e.detail,
            e.note,
          ];
        })
    : [g.home, g.away].flatMap((t) =>
        [...t.players, { id: t.id, name: 'TOTAL', number: '' }].map((p) => {
          const s = b[p.id];
          return [
            t.name,
            p.number,
            p.name,
            clock(s.seconds),
            s.pts,
            s.fgm,
            s.fga,
            s.tpm,
            s.tpa,
            s.ftm,
            s.fta,
            s.reb,
            s.oreb,
            s.dreb,
            s.ast,
            s.stl,
            s.tov,
            s.blk,
            s.foul,
            s.pm,
          ];
        }),
      );
  download(
    `armador-${g.date}-${events ? 'lances' : 'box-score'}.csv`,
    '\uFEFF' +
      [head, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n'),
    'text/csv;charset=utf-8',
  );
}
