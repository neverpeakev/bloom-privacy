/**
 * One-shot content scrub: remove FIFA / "World Cup" / "Copa Mundial" branding
 * and official-tournament framing to resolve App Store rejection (5.2.1 / 4.3a).
 * Keeps the legally-ours parts (national flags, geography, trivia) and reframes
 * the tournament hub generically. Idempotent: re-running is a no-op.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const EDITS = {
  'js/data/teams.js': [
    ['The 48 qualified teams of the FIFA World Cup 2026, enriched with',
     'The 48 national teams featured in WorldCopa, enriched with'],
    ['conf: football confederation — used in the World Cup hub.',
     'conf: football confederation — used in the Teams hub.'],
    ['FIFA, football’s world headquarters, lives in Zürich, Switzerland.',
     'Football’s world governing body has its headquarters in Zürich, Switzerland.'],
    ['World Cup finalists', 'global-finals runners-up'],
    ['World Cups', 'global finals'],
    ['World Cup finals', 'global finals'],
    ['World Cup', 'global finals'],
  ],
  'js/data/matches.js': [
    ['Official FIFA World Cup 2026 match schedule — all 104 matches.',
     '2026 international match fixture calendar — 104 public match dates. Not affiliated with, endorsed by, or sponsored by FIFA or any tournament organizer.'],
  ],
  'js/games/questions.js': [
    ['⚽ Which World Cup 2026 group is', '⚽ Which 2026 group is'],
  ],
  'js/state.js': [
    ['Colour all 4 flags of one World Cup group.', 'Colour all 4 flags of one tournament group.'],
  ],
  'js/main.js': [
    ["emoji: '⚽', label: 'World Cup'", "emoji: '⚽', label: 'Soccer'"],
    ['<span class="brand-text">World<span class="brand-accent">Copa</span><span class="brand-year">2026</span></span>',
     '<span class="brand-text">World<span class="brand-accent">Copa</span></span>'],
  ],
  'js/views/worldcup.js': [
    ['World Cup hub: the 12 real groups, the full 104-match schedule and the',
     'Teams hub: the 12 groups, the full 104-match schedule and the'],
    ['<h1>⚽ World Cup 2026</h1>', '<h1>⚽ Soccer 2026</h1>'],
  ],
  'js/views/home.js': [
    ['real World Cup matches, daily challenge,', 'matches, daily challenge,'],
    ['The Cup is here — color all 48 team flags', 'The tournament is here — color all 48 team flags'],
  ],
  'js/views/premium.js': [
    ['All 48 World Cup flags', 'All 48 national flags'],
  ],
  'index.html': [
    ['<title>WorldCopa — Color the Cup. Learn the World. Flag Coloring & 2026 Trivia Games</title>',
     '<title>WorldCopa — Color the Cup. Learn the World. Flag Coloring & Geography Games for Kids</title>'],
    ['WorldCopa: color all 48 World Cup 2026 flags, beat the clock in Flag Match, master trivia and fill your passport. The fun way for kids, teens and grown-ups to learn the world this tournament. Free to play!',
     'WorldCopa: color all 48 national flags, beat the clock in Flag Match, master geography trivia and fill your passport. The fun way for kids, teens and grown-ups to learn the world. Free to play! Not affiliated with FIFA.'],
    ['worldcopa, flag coloring app, world cup games, geography apps, world cup 2026, kids learning games, flag quiz, copa',
     'worldcopa, flag coloring app, geography games, geography apps, kids learning games, flag quiz, countries, capitals, atlas'],
    ['48 flags to color, trivia to master, a passport to fill — built for World Cup 2026 season.',
     '48 flags to color, geography trivia to master, and a passport to fill.'],
  ],
  'privacy.html': [
    ['designed for children and families during the FIFA World Cup 2026 season.',
     'designed for children and families who love flags, geography and soccer. WorldCopa is not affiliated with, endorsed by, or sponsored by FIFA or any tournament organizer.'],
  ],
  'manifest.webmanifest': [
    ['WorldCopa — Flag Coloring & World Cup 2026 Trivia', 'WorldCopa — Flag Coloring & Geography Game'],
  ],
  'package.json': [
    ['"name": "flag-explorer-2026"', '"name": "worldcopa"'],
    ['Interactive Flag Explorer — World Cup Edition. Color all 48 World Cup 2026 flags, master geography trivia and fill your passport.',
     'WorldCopa — color all 48 national flags, master geography trivia and fill your passport.'],
  ],
  'scripts/gen-promo.mjs': [
    ['All 48 nations of 2026 ⚽🎨', 'All 48 national flags ⚽🎨'],
    ['48 flags · trivia · the real 2026 schedule', '48 flags · trivia · geography for kids'],
  ],
  'assets/css/styles.css': [
    ['/* ── World Cup hub', '/* ── Soccer hub'],
  ],
  'README.md': [
    ['FIFA World Cup 2026', 'international soccer'],
    ['World Cup Hub', 'Soccer Hub'],
    ['World Cup', 'soccer'],
  ],
};

let total = 0;
for (const [file, edits] of Object.entries(EDITS)) {
  let src = readFileSync(file, 'utf8');
  let n = 0;
  for (const [from, to] of edits) {
    const before = src;
    src = src.split(from).join(to);
    if (src !== before) n++;
  }
  writeFileSync(file, src);
  console.log(`${n ? '✏️ ' : '·  '} ${file} (${n}/${edits.length} edits applied)`);
  total += n;
}
console.log(`\nDone — ${total} replacement groups applied.`);
