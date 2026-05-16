// sync-genesis.js — antcpu-launcher
// Pushes Block 0 data from SQLite → Supabase
// Human in the loop — run manually: node sync-genesis.js
// v1.0.0 — 2026-05-06

require('dotenv').config();
const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');

const db = new Database('./antcpu.db');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const ALLOWED = ['antcoin', 'samplecoin'];

async function sync() {
  console.log('[SYNC] Starting Block 0 sync → Supabase');

  const wallets = db.prepare(`SELECT * FROM wallets WHERE currency IN ('antcoin','samplecoin')`).all();
  if (wallets.length) {
    const { error } = await supabase.from('wallets').upsert(wallets);
    if (error) console.error('[WALLETS] error:', error.message);
    else console.log(`[WALLETS] synced ${wallets.length} records`);
  }

  const nodes = db.prepare(`SELECT * FROM chain_nodes`).all();
  if (nodes.length) {
    const { error } = await supabase.from('chain_nodes').upsert(nodes);
    if (error) console.error('[NODES] error:', error.message);
    else console.log(`[NODES] synced ${nodes.length} records`);
  }

  const rewards = db.prepare(`SELECT * FROM rewards WHERE currency IN ('antcoin','samplecoin')`).all();
  if (rewards.length) {
    const { error } = await supabase.from('rewards').upsert(rewards);
    if (error) console.error('[REWARDS] error:', error.message);
    else console.log(`[REWARDS] synced ${rewards.length} records`);
  } else {
    console.log('[REWARDS] 0 records — schema ready for samplecoin tasks');
  }

  const ledger = db.prepare(`SELECT * FROM ledger WHERE currency IN ('antcoin','samplecoin')`).all();
  if (ledger.length) {
    const { error } = await supabase.from('ledger').upsert(ledger);
    if (error) console.error('[LEDGER] error:', error.message);
    else console.log(`[LEDGER] synced ${ledger.length} records`);
  }

  console.log('[SYNC] Complete ✅');
  console.log('[GATE] testcoin, BTC and all other currencies blocked');
}

sync().catch(console.error);
