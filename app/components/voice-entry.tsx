'use client';
import {useEffect,useRef,useState} from 'react';
import {Modal} from './basketball';
import {parseVoice,VOICE_ACTIONS} from '@/lib/voice';
import {uid,elapsed,type Game,type Play} from '@/lib/model';
export default function VoiceEntry({game,onReview,onClose}:{game:Game;onReview:(p:Play)=>void;onClose:()=>void}) {
 const [heard,H]=useState(''),[error,E]=useState(''),[listening,L]=useState(false);
 const [candidate,C]=useState<Play|null>(null);
 const recognition=useRef<any>(null);
 const current=useRef(game); current.current=game;
 useEffect(()=>()=>{if(recognition.current){recognition.current.onresult=null;recognition.current.onerror=null;recognition.current.onend=null;recognition.current.abort();}},[]);
 function listen(){
  const Recognition=(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if(!Recognition){E('Voz indisponível neste navegador. Continue pelo registro manual.');return;}
  C(null);E('');H('');
  const r=new Recognition();recognition.current=r;r.lang='pt-BR';r.continuous=false;r.interimResults=false;r.maxAlternatives=1;
  r.onresult=(e:any)=>{const text=e.results[0][0].transcript;H(text);try{const g=current.current;if(g.status!=='playing')throw new Error('A partida está finalizada.');const parsed=parseVoice(text,g);const {action,...fields}=parsed;C({id:uid(),period:g.period,elapsed:elapsed(g),...fields});}catch(e){E((e as Error).message);}};
  r.onerror=(e:any)=>{E(e.error==='not-allowed'?'Permita o microfone para usar a voz.':'Não foi possível reconhecer. Tente novamente ou registre manualmente.');L(false);};
  r.onend=()=>L(false);
  try {r.start();L(true);}catch{E('Não foi possível iniciar o microfone.');L(false);}
 }
 const team=candidate?.team===game.home.id?game.home:game.away;
 return <Modal title="Registrar por voz" onClose={onClose}>
  <p>Time A: {game.home.name} · Time B: {game.away.name}</p>
  <p>Diga: “Time A, camisa 29, cesta de 2 pontos”.</p>
  <p className="muted">O navegador pode enviar áudio ao serviço de reconhecimento. Nenhum lance é salvo sem sua confirmação.</p>
  <button className="primary" disabled={listening} onClick={listen}>{listening?'Ouvindo…':'Iniciar captura'}</button>
  {listening && <button onClick={()=>{recognition.current?.abort();L(false);}}>Cancelar captura</button>}
  {heard && <p>Reconhecido: “{heard}”</p>}
  {error && <p role="alert" className="error">{error}</p>}
  {candidate && <div className="notice"><p>{team.name} · #{team.players.find(p=>p.id===candidate.player)?.number} {team.players.find(p=>p.id===candidate.player)?.name}</p><button className="primary" onClick={()=>{onReview(candidate);}}>Revisar e confirmar lance</button><button onClick={()=>C(null)}>Cancelar lance</button></div>}
  <details><summary>Comandos aceitos</summary><ul>{Object.keys(VOICE_ACTIONS).map(a=><li key={a}>{a}</li>)}</ul></details>
 </Modal>;
}
