import test from 'node:test';
import assert from 'node:assert/strict';
import {demoState,newGame} from '../lib/model.ts';
import {parseVoice} from '../lib/voice.ts';
test('strict voice grammar resolves team and active shirt only',()=>{const s=demoState();const g=newGame(...s.teams);const p=g.home.players[0];const r=parseVoice(`Time A, camisa ${p.number}, cesta de dois pontos`,g);assert.equal(r.player,p.id);assert.equal(r.value,2);assert.equal(g.events.length,0);for(const text of [`camisa ${p.number} cesta de 2 pontos`,`time a camisa 999 cesta de 2 pontos`,`time a camisa ${p.number} cesta de 2 pontos e falta`,`time a camisa ${g.home.players[7].number} falta`])assert.throws(()=>parseVoice(text,g));});
test('game roster snapshots can exclude non-related players without changing team',()=>{const s=demoState();const home={...s.teams[0],players:s.teams[0].players.slice(0,6)};const g=newGame(home,s.teams[1]);assert.equal(g.home.players.length,6);assert.equal(s.teams[0].players.length,8);});
