'use client';
import { useEffect, useRef, useState } from 'react';
import { emptyState, validateState, type State } from './model';
function draft(
  action: 'get' | 'put' | 'delete',
  key: string,
  value?: unknown,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('armador-pending', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('drafts');
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(
        'drafts',
        action === 'get' ? 'readonly' : 'readwrite',
      );
      const s = tx.objectStore('drafts');
      const r =
        action === 'get'
          ? s.get(key)
          : action === 'put'
            ? s.put(value, key)
            : s.delete(key);
      let out: unknown;
      r.onsuccess = () => {
        out = r.result;
      };
      tx.oncomplete = () => {
        db.close();
        resolve(out);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
}
import { supabase } from './supabase';
const canonical = (s: State | null) =>
  s
    ? JSON.stringify(
        {
          ...s,
          competitions: [...(s.competitions ?? [])].sort((a,b) => a.id.localeCompare(b.id)),
          teams: [...s.teams].sort((a, b) => a.id.localeCompare(b.id)),
          games: [...s.games].sort((a, b) => a.id.localeCompare(b.id)),
        },
        (_, v) =>
          v && typeof v === 'object' && !Array.isArray(v)
            ? Object.fromEntries(
                Object.keys(v)
                  .sort()
                  .map((k) => [k, v[k]]),
              )
            : v,
      )
    : 'null';
const load = async () => {
  const { data, error } = await supabase.rpc('armador_load_state');
  if (error) throw error;
  return data;
};
export function useStore(accountId: string) {
  const [data, setData] = useState<State | null>(null),
    [status, setStatus] = useState('Carregando partidas…'),
    [error, setError] = useState('');
  const latest = useRef<State | null>(null),
    revision = useRef(0),
    owner = useRef(''),
    busy = useRef(false),
    dirty = useRef(false),
    alive = useRef(true);
  async function save() {
    if (busy.current || !latest.current || !owner.current || !dirty.current)
      return;
    busy.current = true;
    setStatus('Salvando…');
    try {
      while (dirty.current && alive.current) {
        const value = latest.current;
        const rev = revision.current;
        await draft('put', owner.current, {
          state: value,
          revision: rev,
        }).catch(() => {});
        const { data: nextRevision, error: saveError } = await supabase.rpc(
          'armador_commit_state',
          {
            document: value,
            expected_revision: rev,
            expected_owner: accountId,
          },
        );
        const result = { revision: nextRevision, error: saveError?.message };
        if (saveError) {
          if (saveError.code === 'PT409') {
            const fresh = await load();
            if (canonical(fresh.state) === canonical(value)) {
              revision.current = fresh.revision;
            } else
              throw new Error(
                'Os dados mudaram em outra janela. Exporte o backup e recarregue antes de continuar.',
              );
          } else throw new Error(result.error || 'Não foi possível salvar.');
        } else revision.current = result.revision;
        dirty.current = latest.current !== value;
        if (!dirty.current) await draft('delete', owner.current);
      }
      if (alive.current) {
        setStatus('Salvo');
        setError('');
      }
    } catch (e) {
      if (alive.current) {
        setStatus('Alterações pendentes');
        setError(
          e instanceof Error
            ? e.message
            : 'Falha de conexão. Exporte um backup para preservar suas alterações.',
        );
      }
    } finally {
      busy.current = false;
    }
  }
  useEffect(() => {
    alive.current = true;
    async function init() {
      try {
        const res = await load();
        if (!alive.current) return;
        if (res.owner !== accountId)
          throw new Error('Entre novamente para acessar sua conta.');
        owner.current = res.owner;
        revision.current = res.revision;
        let value = res.state ?? emptyState();
        const pending = await draft('get', res.owner).catch(() => undefined);
        if (pending) {
          if (pending.revision === res.revision) {
            validateState(pending.state);
            value = pending.state;
            dirty.current = true;
          } else if (canonical(pending.state) === canonical(res.state)) {
            await draft('delete', res.owner);
          } else {
            await draft('put', res.owner + ':conflict', pending);
            await draft('delete', res.owner);
            setError(
              'Há um rascunho de outra revisão neste dispositivo. Os dados salvos foram carregados. Exporte o rascunho em Conta antes de restaurá-lo.',
            );
          }
        }
        validateState(value);
        latest.current = value;
        setData(value);
        setStatus('Salvo');
        if (!res.state) dirty.current = true;
        await save();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Não foi possível carregar.');
        setStatus('Sem conexão');
      }
    }
    void init();
    const retry = () => void save();
    window.addEventListener('online', retry);
    const before = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', before);
    return () => {
      alive.current = false;
      window.removeEventListener('online', retry);
      window.removeEventListener('beforeunload', before);
    };
  }, []);
  function change(fn: (s: State) => State) {
    if (!latest.current) return;
    const value = fn(structuredClone(latest.current));
    validateState(value);
    latest.current = value;
    dirty.current = true;
    setData(value);
    void draft('put', owner.current, {
      state: value,
      revision: revision.current,
    }).catch(() =>
      setError(
        'Não foi possível guardar o rascunho neste dispositivo. Exporte um backup.',
      ),
    );
    void save();
  }
  return {
    data,
    change,
    status,
    error,
    retry: save,
    getPending: async () =>
      (await draft('get', owner.current + ':conflict')) ??
      (await draft('get', owner.current)),
  };
}
