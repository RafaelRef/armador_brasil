'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Team } from '@/lib/model';
import { Jersey } from './basketball';
export function TeamLogo({team}: {team: Team}) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let alive = true;
    setUrl('');
    const refresh = async () => {
      if (!team.logoPath) return;
      const {data} = await supabase.storage.from('team-logos').createSignedUrl(team.logoPath, 3600);
      if (alive) setUrl(data?.signedUrl ?? '');
    };
    void refresh();
    const timer = setInterval(refresh, 3000000);
    return () => { alive = false; clearInterval(timer); };
  }, [team.logoPath]);
  return url ? <img src={url} alt={`Logo de ${team.name}`} className="team-logo" onError={() => setUrl('')} /> : <Jersey color={team.color} />;
}
