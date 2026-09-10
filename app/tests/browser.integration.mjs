import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { demoState } from '../lib/model.ts';
const ref = 'setgmeuidsmodcssssha',
  url = `https://${ref}.supabase.co`;
const raw = JSON.parse(
  execFileSync(
    'supabase',
    ['projects', 'api-keys', '--project-ref', ref, '--output', 'json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 },
  ),
);
const keys = Array.isArray(raw) ? raw : (raw.keys ?? raw.api_keys);
const admin = createClient(
  url,
  keys.find((k) => k.name === 'service_role').api_key,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const email = `armador-test-${crypto.randomUUID()}@example.invalid`,
  password = crypto.randomUUID() + 'Aa9!';
const {
  data: { user },
  error,
} = await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (error) throw error;
let browser;
try {
  const state = demoState();
  while(state.games[0].home.players.length < 30) { const i=state.games[0].home.players.length; state.games[0].home.players.push({id:crypto.randomUUID(),name:`Atleta ${i}`,number:String(80+i)}); }
  state.games[0].status = 'playing';
  state.games[0].period = 5;
  state.games[0].remaining = 300;
  const client = createClient(
    url,
    keys.find((k) => k.name === 'anon').api_key,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await client.auth.signInWithPassword({ email, password });
  const saved = await client.rpc('armador_commit_state', {
    document: state,
    expected_revision: 0,
    expected_owner: user.id,
  });
  if (saved.error) throw saved.error;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000/');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page
    .getByRole('button', { name: 'Entrar na minha conta', exact: true })
    .click();
  await page.getByRole('tab', { name: 'Jogos', exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Jogos', exact: true }).click();
  await page.getByRole('button', { name: 'RETOMAR', exact: true }).click();
  await page.locator('.court-wrap').waitFor();
  const bounds = await page.locator('.desk-tools').boundingBox();
  assert.ok(
    bounds.y + bounds.height <= 770,
    `Ferramentas fora da tela: ${JSON.stringify(bounds)}`,
  );
  const reserve = page.locator('.bench-player').filter({ hasText: 'Andre' });
  const starter = page.locator('.court-player').filter({ hasText: 'Stephen' });
  await reserve.dragTo(starter);
  await page.locator('.court-player').filter({ hasText: 'Andre' }).waitFor();
  assert.equal(
    await page.locator('.bench-player').filter({ hasText: 'Stephen' }).count(),
    1,
  );
  await page.getByRole('button', { name: '2 ✓', exact: true }).click();
  const map = page.locator('.shot-map.interactive');
  await map.waitFor();
  await map.click({ trial: true });
  const rect = await map.boundingBox();
  const x = rect.x + rect.width * 0.73,
    y = rect.y + rect.height * 0.35;
  await page.mouse.click(x, y);
  const mark = await map.locator('circle[fill="#ee8c08"]').boundingBox();
  assert.ok(
    Math.abs(mark.x + mark.width / 2 - x) < 2 &&
      Math.abs(mark.y + mark.height / 2 - y) < 2,
    'Marcação deslocada do clique',
  );
  await page
    .getByRole('button', { name: 'Registrar lance', exact: true })
    .click();
  await page.locator('.app-modal').waitFor({ state: 'hidden' });
  await page.screenshot({ path: '/tmp/armador-desktop.png' });
  await page.reload();
  await page.getByRole('tab', { name: 'Jogos', exact: true }).click();
  await page.getByRole('button', { name: 'RETOMAR', exact: true }).click();
  await page.locator('.court-player').filter({ hasText: 'Andre' }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  const scoreboard = await page.locator('.scoreboard').boundingBox();
  const players = await page.locator('.court-player').all();
  for (const player of players) {
    const box = await player.boundingBox();
    assert.ok(box.y >= scoreboard.y + scoreboard.height, 'Placar sobreposto aos jogadores no celular');
  }
  await page.screenshot({ path: '/tmp/armador-mobile.png', fullPage: true });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    'Overflow horizontal no celular',
  );
  await page.getByRole('button', { name: 'Jogadas', exact: true }).click();
  await page.getByRole('heading', { name: 'Jogadas', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.setViewportSize({width:1366,height:768});
  await page.getByRole('button', {name:'Jogos',exact:true}).click();
  await page.getByRole('button', {name:'Novo jogo',exact:true}).click();
  await page.getByRole('button', {name:'Criar campeonato',exact:true}).click();
  await page.getByLabel('Nome do campeonato', {exact:true}).fill('Liga de teste');
  await page.getByLabel('Temporada do campeonato', {exact:true}).fill('2026');
  await page.getByRole('button', {name:'Salvar campeonato',exact:true}).click();
  assert.match(await page.getByRole('combobox', {name:'Campeonato',exact:true}).innerText(), /Liga de teste/);
  await page.getByRole('button', {name:'Fechar',exact:true}).click();
  await page.getByRole('combobox', {name:'Filtrar por campeonato',exact:true}).click();
  await page.getByRole('option', {name:'Liga de teste · 2026',exact:true}).click();
  assert.equal(await page.getByRole('button', {name:'RETOMAR',exact:true}).count(), 0);
  await page.reload();
  await page.getByRole('tab', {name:'Estatísticas',exact:true}).click();
  await page.getByRole('combobox', {name:'Filtrar por campeonato',exact:true}).click();
  await page.getByRole('option', {name:'Liga de teste · 2026',exact:true}).click();
  await page.getByText(/Totais de 0 partidas finalizadas/).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    'PASS: login UI, desktop sem zoom, substituição por arrasto, mapa preciso, persistência e largura de celular.',
  );
} finally {
  if (browser) await browser.close();
  await admin.auth.admin.deleteUser(user.id);
}
