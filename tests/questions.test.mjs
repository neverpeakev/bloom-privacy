import { test } from 'node:test';
import assert from 'node:assert/strict';

import { generateQuiz, generateFlagRound, generateContinentRound, generateMatchdayQuiz } from '../js/games/questions.js';
import { TEAMS } from '../js/data/teams.js';
import { MATCHES } from '../js/data/matches.js';
import { seededRng } from '../js/state.js';

test('quiz rounds always have valid questions (200 seeded rounds)', () => {
  for (let seed = 0; seed < 200; seed++) {
    const rng = seededRng('quiz-' + seed);
    const qs = generateQuiz(5, rng);
    assert.equal(qs.length, 5, `seed ${seed}`);
    const texts = new Set();
    for (const q of qs) {
      assert.equal(q.options.length, 4, q.text);
      assert.equal(new Set(q.options).size, 4, `duplicate options: ${q.text}`);
      assert.ok(q.options.includes(q.answer), `answer missing: ${q.text}`);
      assert.ok(q.explain.length > 5, q.text);
      assert.ok(!texts.has(q.text), `duplicate question in round: ${q.text}`);
      texts.add(q.text);
    }
  }
});

test('quiz respects a restricted (free-tier) team pool', () => {
  const free = TEAMS.filter((t) => t.free);
  const names = new Set(free.map((t) => t.name));
  const capitals = new Set(free.map((t) => t.capital));
  for (let seed = 0; seed < 50; seed++) {
    const qs = generateQuiz(5, seededRng('p' + seed), { teams: free });
    for (const q of qs) {
      if (q.kind === 'fact' || q.kind === 'soccer') {
        assert.ok(names.has(q.answer), `${q.answer} not in free pool`);
      }
      if (q.kind === 'capital') {
        assert.ok(capitals.has(q.answer), `${q.answer} not a free-pool capital`);
      }
    }
  }
});

test('daily quiz is identical for the same seed', () => {
  const a = generateQuiz(5, seededRng('daily-2026-06-11'));
  const b = generateQuiz(5, seededRng('daily-2026-06-11'));
  assert.deepEqual(a, b);
});

test('flag rounds: 10 distinct flags, 4 unique options each', () => {
  for (let seed = 0; seed < 100; seed++) {
    const round = generateFlagRound(10, seededRng('f' + seed));
    assert.equal(round.length, 10);
    assert.equal(new Set(round.map((r) => r.code)).size, 10, 'flags unique');
    for (const item of round) {
      assert.equal(new Set(item.options).size, 4);
      assert.ok(item.options.includes(item.answer));
    }
  }
});

test('continent rounds cover valid continents', () => {
  const round = generateContinentRound(12, seededRng('c1'));
  assert.equal(round.length, 12);
  for (const item of round) {
    assert.ok(item.accept.length >= 1);
    assert.ok(item.name && item.emoji);
  }
});

test('matchday quiz built from real opening-day fixtures', () => {
  const day1 = MATCHES.filter((m) => m.num <= 4); // first four real matches
  for (let seed = 0; seed < 50; seed++) {
    const qs = generateMatchdayQuiz(day1, seededRng('m' + seed));
    assert.ok(qs.length >= 3 && qs.length <= 5, `got ${qs.length}`);
    for (const q of qs) {
      assert.equal(new Set(q.options).size, 4, q.text);
      assert.ok(q.options.includes(q.answer), q.text);
    }
  }
});

test('matchday quiz with knockout placeholders yields no broken questions', () => {
  const tbd = MATCHES.filter((m) => m.stage === 'final');
  const qs = generateMatchdayQuiz(tbd, seededRng('x'));
  assert.deepEqual(qs, []);
});
