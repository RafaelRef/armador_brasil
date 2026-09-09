import assert from 'node:assert/strict';
import { supabase } from '../lib/supabase.ts';
const { error: loginError } = await supabase.auth.signInWithPassword({
  email: 'armador-no-such-user@example.invalid',
  password: 'invalid-auth-check-9876',
});
assert.ok(loginError, 'Credenciais inválidas não podem autenticar');
assert.equal(loginError.code, 'invalid_credentials');
const { data, error } = await supabase.from('armador_teams').select('*');
assert.ok(error, 'Acesso sem sessão deve ser rejeitado');
const { error: rpcError } = await supabase.rpc('armador_load_state');
assert.ok(rpcError, 'RPC sem sessão deve ser rejeitada');
console.log(
  'PASS: login inválido rejeitado; equipes e RPC inacessíveis sem autenticação.',
);
