'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal, Jersey } from './basketball';
import { uid, validateTeam, PLAYER_POSITIONS, type PlayerPosition, type Team } from '@/lib/model';
export default function TeamEditor({
  team,
  onSave,
  onClose,
}: {
  team?: Team;
  onSave: (t: Team) => void;
  onClose: () => void;
}) {
  const [t, set] = useState<Team>(
      team
        ? structuredClone(team)
        : {
            id: uid(),
            name: '',
            color: '#3022c5',
            season: '2026/27',
            coach: '',
            players: [],
          },
    ),
    [error, err] = useState('');
  return (
    <Modal
      title={team ? 'Editar equipe' : 'Nova equipe'}
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            validateTeam(t);
            onSave(t);
            onClose();
          } catch (e) {
            err((e as Error).message);
          }
        }}
      >
        <div className="form-grid">
          <label>
            Nome da equipe
            <input
              required
              maxLength={80}
              value={t.name}
              onChange={(e) => set({ ...t, name: e.target.value })}
            />
          </label>
          <label>
            Temporada
            <input
              required
              maxLength={30}
              value={t.season}
              onChange={(e) => set({ ...t, season: e.target.value })}
            />
          </label>
          <label>
            Treinador
            <input
              maxLength={80}
              value={t.coach}
              onChange={(e) => set({ ...t, coach: e.target.value })}
            />
          </label>
          <label>
            Cor do uniforme
            <div className="uniform-color">
              <input
                type="color"
                value={t.color}
                onChange={(e) => set({ ...t, color: e.target.value })}
              />
              <Jersey color={t.color} small />
            </div>
          </label>
        </div>
        <div className="section-heading">
          <h3>Elenco · {t.players.length} jogadores</h3>
          <button
            type="button"
            className="text-button"
            onClick={() =>
              set({
                ...t,
                players: [
                  ...t.players,
                  { id: uid(), name: '', number: String(t.players.length + 1) },
                ],
              })
            }
          >
            <Plus size={18} />
            Adicionar
          </button>
        </div>
        {t.players.length === 0 && (
          <p className="muted">
            Adicione pelo menos 5 jogadores para uma partida 5×5 ou 3 para 3×3.
          </p>
        )}
        {t.players.map((p, i) => (
          <div className="player-edit" key={p.id}>
            <input
              aria-label={`Número do jogador ${i + 1}`}
              required
              inputMode="numeric"
              pattern="[0-9]{1,3}"
              value={p.number}
              onChange={(e) =>
                set({
                  ...t,
                  players: t.players.map((x) =>
                    x.id === p.id ? { ...x, number: e.target.value } : x,
                  ),
                })
              }
            />
            <input
              aria-label={`Nome do jogador ${i + 1}`}
              placeholder="Nome do jogador"
              required
              maxLength={80}
              value={p.name}
              onChange={(e) =>
                set({
                  ...t,
                  players: t.players.map((x) =>
                    x.id === p.id ? { ...x, name: e.target.value } : x,
                  ),
                })
              }
            />
            <label className="player-position-field">
              Posição
              <select aria-label={`Posição do jogador ${i + 1}`} value={p.position ?? ''}
                onChange={(e) => set({ ...t, players: t.players.map((x) => x.id === p.id ? { ...x, position: (e.target.value || undefined) as PlayerPosition | undefined } : x) })}>
                <option value="">Não informada</option>
                {Object.entries(PLAYER_POSITIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <button
              type="button"
              className="icon-button"
              aria-label={`Remover ${p.name || 'jogador'}`}
              onClick={() =>
                set({ ...t, players: t.players.filter((x) => x.id !== p.id) })
              }
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="primary full" type="submit">
          Salvar equipe
        </button>
      </form>
    </Modal>
  );
}
