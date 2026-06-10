/**
 * Trivia question generator. Pure functions — fully unit-testable.
 * Questions are generated from the team dataset with plausible distractors.
 */

import { TEAMS, TEAM_BY_CODE, CONTINENTS } from '../data/teams.js';
import { MATCHES, STAGE_LABELS } from '../data/matches.js';

function shuffled(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample(arr, n, rng) {
  return shuffled(arr, rng).slice(0, n);
}

function others(team, rng, n, keyFn) {
  const seen = new Set([keyFn(team)]);
  const out = [];
  for (const t of shuffled(TEAMS, rng)) {
    const k = keyFn(t);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(k);
      if (out.length === n) break;
    }
  }
  return out;
}

/** Build one question object {text, options[4], answer, explain, kind}. */
const GENERATORS = [
  function capital(team, rng) {
    return {
      kind: 'capital',
      text: `What is the capital of ${team.name}? ${team.emoji}`,
      answer: team.capital,
      options: shuffled([team.capital, ...others(team, rng, 3, (t) => t.capital)], rng),
      explain: `${team.capital} is the capital of ${team.name}. ${team.fact}`,
    };
  },
  function continent(team, rng) {
    const answer = team.continents[0];
    const wrong = sample(CONTINENTS.filter((c) => !team.continents.includes(c)), 3, rng);
    return {
      kind: 'continent',
      text: `Which continent is ${team.name} ${team.emoji} part of?`,
      answer,
      options: shuffled([answer, ...wrong], rng),
      explain:
        team.continents.length > 1
          ? `${team.name} actually spans ${team.continents.join(' and ')}!`
          : `${team.name} is in ${answer}.`,
    };
  },
  function language(team, rng) {
    const answer = team.languages[0];
    const wrong = others(team, rng, 3, (t) => t.languages[0]).filter((l) => l !== answer);
    if (wrong.length < 3) return null;
    return {
      kind: 'language',
      text: `Which language do people speak in ${team.name} ${team.emoji}?`,
      answer,
      options: shuffled([answer, ...wrong.slice(0, 3)], rng),
      explain: `In ${team.name} people speak ${team.languages.join(', ')}.`,
    };
  },
  function group(team, rng) {
    const groups = [...new Set(TEAMS.map((t) => t.group))];
    const wrong = sample(groups.filter((g) => g !== team.group), 3, rng);
    return {
      kind: 'group',
      text: `⚽ Which World Cup 2026 group is ${team.name} ${team.emoji} playing in?`,
      answer: `Group ${team.group}`,
      options: shuffled([`Group ${team.group}`, ...wrong.map((g) => `Group ${g}`)], rng),
      explain: `${team.name} plays in Group ${team.group}. ${team.soccer}`,
    };
  },
  function funFact(team, rng) {
    const wrong = others(team, rng, 3, (t) => t.name);
    return {
      kind: 'fact',
      text: `Which country is this about? “${team.fact}”`,
      answer: team.name,
      options: shuffled([team.name, ...wrong], rng),
      explain: `That's ${team.name} ${team.emoji}!`,
    };
  },
  function soccerFact(team, rng) {
    const wrong = others(team, rng, 3, (t) => t.name);
    return {
      kind: 'soccer',
      text: `⚽ Football fact: “${team.soccer}” Which team is it?`,
      answer: team.name,
      options: shuffled([team.name, ...wrong], rng),
      explain: `${team.name} ${team.emoji} — now you know!`,
    };
  },
];

/** Generate a quiz round of n questions (no duplicate question text). */
export function generateQuiz(n, rng = Math.random, { teams = TEAMS } = {}) {
  const out = [];
  const usedText = new Set();
  let guard = 0;
  while (out.length < n && guard++ < 500) {
    const team = teams[Math.floor(rng() * teams.length)];
    const gen = GENERATORS[Math.floor(rng() * GENERATORS.length)];
    const q = gen(team, rng);
    if (!q || usedText.has(q.text)) continue;
    if (new Set(q.options).size !== 4 || !q.options.includes(q.answer)) continue;
    usedText.add(q.text);
    out.push(q);
  }
  return out;
}

/** "Guess the flag" round: each item shows a flag, pick the country name. */
export function generateFlagRound(n, rng = Math.random, { teams = TEAMS } = {}) {
  const picks = sample(teams, Math.min(n, teams.length), rng);
  return picks.map((team) => {
    const wrong = sample(teams.filter((t) => t.code !== team.code), 3, rng).map((t) => t.name);
    return {
      code: team.code,
      answer: team.name,
      options: shuffled([team.name, ...wrong], rng),
      explain: team.fact,
    };
  });
}

/** Continent-sorting round: a queue of countries to drop on continents. */
export function generateContinentRound(n, rng = Math.random, { teams = TEAMS } = {}) {
  return sample(teams, Math.min(n, teams.length), rng).map((team) => ({
    code: team.code,
    name: team.name,
    emoji: team.emoji,
    accept: team.continents,
  }));
}

/** Matchday quiz built from a real day's fixtures. */
export function generateMatchdayQuiz(dateMatches, rng = Math.random) {
  const qs = [];
  for (const m of dateMatches) {
    if (!m.home || !m.away) continue;
    const home = TEAM_BY_CODE[m.home];
    const away = TEAM_BY_CODE[m.away];
    if (!home || !away) continue;
    const otherCities = sample(
      [...new Set(MATCHES.map((x) => x.city))].filter((c) => c !== m.city), 3, rng,
    );
    qs.push({
      kind: 'venue',
      text: `🏟️ ${home.emoji} ${home.name} vs ${away.name} ${away.emoji} — which city hosts this match?`,
      answer: m.city,
      options: shuffled([m.city, ...otherCities], rng),
      explain: `It's played at ${m.venue} in ${m.city} (${STAGE_LABELS[m.stage]}).`,
    });
    const t = rng() < 0.5 ? home : away;
    const wrongConf = sample(
      [...new Set(TEAMS.map((x) => x.conf))].filter((c) => c !== t.conf), 3, rng,
    );
    qs.push({
      kind: 'conf',
      text: `${t.emoji} ${t.name} qualified through which confederation?`,
      answer: t.conf,
      options: shuffled([t.conf, ...wrongConf], rng),
      explain: `${t.name} plays in ${t.conf}. ${t.soccer}`,
    });
  }
  return shuffled(qs, rng).slice(0, 5);
}
