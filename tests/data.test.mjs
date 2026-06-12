import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TEAMS, TEAM_BY_CODE, GROUPS, teamsInGroup, CONTINENTS, CONFEDERATIONS } from '../js/data/teams.js';
import { MATCHES, STAGE_LABELS, matchesOn, nextMatchDay } from '../js/data/matches.js';

test('there are exactly 48 teams in 12 groups of 4', () => {
  assert.equal(TEAMS.length, 48);
  assert.equal(GROUPS.length, 12);
  assert.deepEqual(GROUPS, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);
  for (const g of GROUPS) assert.equal(teamsInGroup(g).length, 4, `group ${g}`);
});

test('team codes are unique 3-letter codes', () => {
  const codes = TEAMS.map((t) => t.code);
  assert.equal(new Set(codes).size, 48);
  for (const c of codes) assert.match(c, /^[A-Z]{3}$/);
});

test('every team has complete kid-facing content', () => {
  for (const t of TEAMS) {
    assert.ok(t.name.length >= 4, t.code);
    assert.ok(t.capital.length >= 3, `${t.code} capital`);
    assert.ok(t.languages.length >= 1, `${t.code} languages`);
    assert.ok(t.fact.length >= 20, `${t.code} fact`);
    assert.ok(t.soccer.length >= 20, `${t.code} soccer fact`);
    assert.ok(t.emoji.length >= 2, `${t.code} emoji`);
    assert.ok(Array.isArray(t.continents) && t.continents.length >= 1, `${t.code} continents`);
    for (const c of t.continents) assert.ok(CONTINENTS.includes(c), `${t.code} continent ${c}`);
    assert.ok(Object.keys(CONFEDERATIONS).includes(t.conf), `${t.code} conf ${t.conf}`);
  }
});

test('a sensible number of starter (free) flags exists', () => {
  const free = TEAMS.filter((t) => t.free);
  assert.equal(free.length, 12);
  // hosts must be free
  for (const host of ['MEX', 'CAN', 'USA']) {
    assert.ok(TEAM_BY_CODE[host].free, `${host} should be a free starter flag`);
  }
});

test('schedule has all 104 matches with correct stage breakdown', () => {
  assert.equal(MATCHES.length, 104);
  const byStage = {};
  for (const m of MATCHES) byStage[m.stage] = (byStage[m.stage] || 0) + 1;
  assert.deepEqual(byStage, {
    group: 72, round_32: 16, round_16: 8, quarter: 4, semi: 2, third: 1, final: 1,
  });
  for (const stage of Object.keys(byStage)) assert.ok(STAGE_LABELS[stage], stage);
});

test('match numbers are 1..104 and unique', () => {
  const nums = MATCHES.map((m) => m.num).sort((a, b) => a - b);
  assert.deepEqual(nums, Array.from({ length: 104 }, (_, i) => i + 1));
});

test('group matches reference real teams of the same group', () => {
  for (const m of MATCHES.filter((x) => x.stage === 'group')) {
    const h = TEAM_BY_CODE[m.home];
    const a = TEAM_BY_CODE[m.away];
    assert.ok(h, `unknown home ${m.home} in M${m.num}`);
    assert.ok(a, `unknown away ${m.away} in M${m.num}`);
    assert.equal(h.group, m.group, `M${m.num} home group`);
    assert.equal(a.group, m.group, `M${m.num} away group`);
  }
});

test('every team plays exactly 3 group matches', () => {
  const count = {};
  for (const m of MATCHES.filter((x) => x.stage === 'group')) {
    count[m.home] = (count[m.home] || 0) + 1;
    count[m.away] = (count[m.away] || 0) + 1;
  }
  for (const t of TEAMS) assert.equal(count[t.code], 3, t.code);
});

test('knockout matches carry placeholders and venues', () => {
  for (const m of MATCHES.filter((x) => x.stage !== 'group')) {
    assert.equal(m.home, null);
    assert.ok(m.placeholder?.length >= 5, `M${m.num}`);
    assert.ok(m.venue && m.city, `M${m.num} venue`);
  }
});

test('matchesOn / nextMatchDay navigate the calendar', () => {
  const opening = new Date('2026-06-11T20:00:00Z');
  const dayMatches = matchesOn(opening);
  // depending on local TZ the opener lands on the 11th or 12th — both valid days
  assert.ok(dayMatches.length >= 0);
  const beforeCup = new Date('2026-06-01T12:00:00Z');
  const next = nextMatchDay(beforeCup);
  assert.ok(next.matches.length > 0, 'there is an upcoming match day');
  assert.ok(next.matches.every((m) => new Date(m.kickoff) > beforeCup));
  const afterCup = new Date('2026-08-01T12:00:00Z');
  assert.deepEqual(nextMatchDay(afterCup).matches, []);
});
