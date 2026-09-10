import type {Game, Kind} from './model';
export const VOICE_ACTIONS: Record<string,{kind:Kind;value?:number;made?:boolean;free?:boolean}> = {
 'cesta de 2 pontos':{kind:'shot',value:2,made:true,free:false},
 'cesta de 3 pontos':{kind:'shot',value:3,made:true,free:false},
 'arremesso de 2 pontos errado':{kind:'shot',value:2,made:false,free:false},
 'arremesso de 3 pontos errado':{kind:'shot',value:3,made:false,free:false},
 'lance livre convertido':{kind:'shot',value:1,made:true,free:true},
 'lance livre errado':{kind:'shot',value:1,made:false,free:true},
 'rebote ofensivo':{kind:'oreb'}, 'rebote defensivo':{kind:'dreb'},
 'assistencia':{kind:'ast'}, 'roubo':{kind:'stl'}, 'perda':{kind:'tov'}, 'bloqueio':{kind:'blk'}, 'falta':{kind:'foul'}
};
export function parseVoice(text:string,g:Game) {
 const normalized=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[,.;:!?]/g,' ').replace(/\bdois\b/g,'2').replace(/\btres\b/g,'3').replace(/\s+/g,' ').trim();
 const m=/^time (a|b|local|visitante) camisa (\d{1,3}) (.+)$/.exec(normalized);
 if(!m || !Object.hasOwn(VOICE_ACTIONS,m[3])) throw new Error('Comando fora do padrão. Use time A ou B, camisa, número em dígitos e uma ação da lista.');
 const team=['a','local'].includes(m[1])?g.home:g.away;
 const players=team.players.filter(p=>p.number===m[2] && g.lineup[team.id].includes(p.id));
 if(players.length!==1) throw new Error('Camisa não encontrada entre as atletas em quadra dessa equipe.');
 const action=VOICE_ACTIONS[m[3]];
 if(g.format===3 && action.kind==='shot' && !action.free) throw new Error('Neste MVP, arremessos por voz são para 5×5. Use o registro manual no 3×3.');
 return {team:team.id,player:players[0].id,action:m[3],...action};
}
