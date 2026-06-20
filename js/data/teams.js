/**
 * The 48 national teams featured in WorldCopa, enriched with
 * kid-friendly geography and football facts used across every game mode.
 *
 * continents: geographic continent(s) — used by Continent Quest (any listed
 * continent counts as correct, e.g. Türkiye spans Europe and Asia).
 * conf: football confederation — used in the Teams hub.
 * free: part of the free Starter Pack (everything else is a Pro flag).
 */

export const CONTINENTS = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
];

export const CONFEDERATIONS = {
  AFC: 'Asia',
  CAF: 'Africa',
  CONCACAF: 'North & Central America',
  CONMEBOL: 'South America',
  OFC: 'Oceania',
  UEFA: 'Europe',
};

export const TEAMS = [
  // ── Group A ──────────────────────────────────────────────────────────
  {
    code: 'MEX', name: 'Mexico', group: 'A', conf: 'CONCACAF', emoji: '🇲🇽',
    continents: ['North America'], capital: 'Mexico City', languages: ['Spanish'],
    fact: 'Mexico is home to ancient pyramids built by the Aztecs and the Maya.',
    soccer: 'Mexico is the first country ever to host the global finals three times — 1970, 1986 and 2026!',
    free: true,
  },
  {
    code: 'RSA', name: 'South Africa', group: 'A', conf: 'CAF', emoji: '🇿🇦',
    continents: ['Africa'], capital: 'Pretoria', languages: ['Zulu', 'English', '+10 more'],
    fact: 'South Africa has three capital cities — Pretoria, Cape Town and Bloemfontein.',
    soccer: 'Bafana Bafana hosted Africa’s very first global finals in 2010 — remember the vuvuzelas?',
    free: false,
  },
  {
    code: 'KOR', name: 'South Korea', group: 'A', conf: 'AFC', emoji: '🇰🇷',
    continents: ['Asia'], capital: 'Seoul', languages: ['Korean'],
    fact: 'South Korea has some of the fastest internet on Earth and loves e-sports.',
    soccer: 'South Korea co-hosted the 2002 global finals and roared all the way to the semi-finals.',
    free: false,
  },
  {
    code: 'CZE', name: 'Czechia', group: 'A', conf: 'UEFA', emoji: '🇨🇿',
    continents: ['Europe'], capital: 'Prague', languages: ['Czech'],
    fact: 'Prague’s famous Charles Bridge is guarded by 30 stone statues.',
    soccer: 'As Czechoslovakia, the team reached two global finals (1934 and 1962).',
    free: false,
  },

  // ── Group B ──────────────────────────────────────────────────────────
  {
    code: 'CAN', name: 'Canada', group: 'B', conf: 'CONCACAF', emoji: '🇨🇦',
    continents: ['North America'], capital: 'Ottawa', languages: ['English', 'French'],
    fact: 'Canada has more lakes than every other country in the world combined.',
    soccer: 'A 2026 co-host! Canada scored its first men’s global finals goal in 2022.',
    free: true,
  },
  {
    code: 'SUI', name: 'Switzerland', group: 'B', conf: 'UEFA', emoji: '🇨🇭',
    continents: ['Europe'], capital: 'Bern', languages: ['German', 'French', 'Italian', 'Romansh'],
    fact: 'Switzerland is famous for mountains, chocolate and trains that are never late.',
    soccer: 'Football’s world governing body has its headquarters in Zürich, Switzerland.',
    free: false,
  },
  {
    code: 'QAT', name: 'Qatar', group: 'B', conf: 'AFC', emoji: '🇶🇦',
    continents: ['Asia'], capital: 'Doha', languages: ['Arabic'],
    fact: 'Qatar is one of the hottest countries on Earth — summers can top 45°C!',
    soccer: 'Qatar hosted the 2022 global finals, the first ever in the Middle East.',
    free: false,
  },
  {
    code: 'BIH', name: 'Bosnia & Herzegovina', group: 'B', conf: 'UEFA', emoji: '🇧🇦',
    continents: ['Europe'], capital: 'Sarajevo', languages: ['Bosnian', 'Croatian', 'Serbian'],
    fact: 'Sarajevo hosted the 1984 Winter Olympics high in the Dinaric Alps.',
    soccer: 'The Dragons played their first global finals in 2014 — now they’re back!',
    free: false,
  },

  // ── Group C ──────────────────────────────────────────────────────────
  {
    code: 'BRA', name: 'Brazil', group: 'C', conf: 'CONMEBOL', emoji: '🇧🇷',
    continents: ['South America'], capital: 'Brasília', languages: ['Portuguese'],
    fact: 'The giant Amazon rainforest covers more than half of Brazil.',
    soccer: 'Brazil is the only nation to win the global finals five times — and played in every single one.',
    free: true,
  },
  {
    code: 'MAR', name: 'Morocco', group: 'C', conf: 'CAF', emoji: '🇲🇦',
    continents: ['Africa'], capital: 'Rabat', languages: ['Arabic', 'Amazigh'],
    fact: 'The Sahara, the world’s largest hot desert, begins on Morocco’s doorstep.',
    soccer: 'In 2022 the Atlas Lions became the first African team to reach a global finals semi-final.',
    free: true,
  },
  {
    code: 'SCO', name: 'Scotland', group: 'C', conf: 'UEFA', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    continents: ['Europe'], capital: 'Edinburgh', languages: ['English', 'Scots', 'Gaelic'],
    fact: 'Scotland is home to the legend of the Loch Ness Monster.',
    soccer: 'Scotland played in the world’s first international match — against England in 1872.',
    free: false,
  },
  {
    code: 'HAI', name: 'Haiti', group: 'C', conf: 'CONCACAF', emoji: '🇭🇹',
    continents: ['North America'], capital: 'Port-au-Prince', languages: ['Haitian Creole', 'French'],
    fact: 'In 1804 Haiti became the world’s first country founded by formerly enslaved people.',
    soccer: 'Haiti is back at the global finals for the first time since 1974!',
    free: false,
  },

  // ── Group D ──────────────────────────────────────────────────────────
  {
    code: 'USA', name: 'United States', group: 'D', conf: 'CONCACAF', emoji: '🇺🇸',
    continents: ['North America'], capital: 'Washington, D.C.', languages: ['English'],
    fact: 'The US flag has 50 stars — one for every state.',
    soccer: 'A 2026 co-host! The 1994 global finals in the USA is still the best-attended ever.',
    free: true,
  },
  {
    code: 'PAR', name: 'Paraguay', group: 'D', conf: 'CONMEBOL', emoji: '🇵🇾',
    continents: ['South America'], capital: 'Asunción', languages: ['Spanish', 'Guaraní'],
    fact: 'Paraguay is one of only two landlocked countries in South America.',
    soccer: 'Legendary keeper José Luis Chilavert even scored goals — from free kicks!',
    free: false,
  },
  {
    code: 'TUR', name: 'Türkiye', group: 'D', conf: 'UEFA', emoji: '🇹🇷',
    continents: ['Asia', 'Europe'], capital: 'Ankara', languages: ['Turkish'],
    fact: 'Türkiye sits on two continents — Istanbul has one foot in Europe and one in Asia.',
    soccer: 'Türkiye finished third at the 2002 global finals, its best ever run.',
    free: false,
  },
  {
    code: 'AUS', name: 'Australia', group: 'D', conf: 'AFC', emoji: '🇦🇺',
    continents: ['Oceania'], capital: 'Canberra', languages: ['English'],
    fact: 'Australia is home to kangaroos, koalas and the Great Barrier Reef.',
    soccer: 'The Socceroos have now qualified for six global finals in a row.',
    free: false,
  },

  // ── Group E ──────────────────────────────────────────────────────────
  {
    code: 'GER', name: 'Germany', group: 'E', conf: 'UEFA', emoji: '🇩🇪',
    continents: ['Europe'], capital: 'Berlin', languages: ['German'],
    fact: 'Germany is famous for fairy-tale castles and more than 1,500 kinds of sausage.',
    soccer: 'Die Mannschaft have lifted the global finals trophy four times.',
    free: true,
  },
  {
    code: 'ECU', name: 'Ecuador', group: 'E', conf: 'CONMEBOL', emoji: '🇪🇨',
    continents: ['South America'], capital: 'Quito', languages: ['Spanish'],
    fact: 'Ecuador is named after the equator, which runs right through the country.',
    soccer: 'Quito is so high up that visiting teams gasp for air at 2,850 metres!',
    free: false,
  },
  {
    code: 'CIV', name: 'Ivory Coast', group: 'E', conf: 'CAF', emoji: '🇨🇮',
    continents: ['Africa'], capital: 'Yamoussoukro', languages: ['French'],
    fact: 'Its capital holds one of the largest churches on the planet.',
    soccer: 'The Elephants won the 2024 Africa Cup of Nations on home soil.',
    free: false,
  },
  {
    code: 'CUW', name: 'Curaçao', group: 'E', conf: 'CONCACAF', emoji: '🇨🇼',
    continents: ['North America'], capital: 'Willemstad', languages: ['Papiamentu', 'Dutch'],
    fact: 'Curaçao’s waterfront houses are painted every colour of the rainbow.',
    soccer: 'Curaçao is the smallest nation EVER to qualify for a global finals. Giant hearts!',
    free: false,
  },

  // ── Group F ──────────────────────────────────────────────────────────
  {
    code: 'JPN', name: 'Japan', group: 'F', conf: 'AFC', emoji: '🇯🇵',
    continents: ['Asia'], capital: 'Tokyo', languages: ['Japanese'],
    fact: 'Japanese bullet trains zoom along at over 300 km/h.',
    soccer: 'Japanese fans are famous for tidying up the stadium after every match.',
    free: true,
  },
  {
    code: 'NED', name: 'Netherlands', group: 'F', conf: 'UEFA', emoji: '🇳🇱',
    continents: ['Europe'], capital: 'Amsterdam', languages: ['Dutch'],
    fact: 'Much of the Netherlands lies below sea level, protected by dikes and windmills.',
    soccer: 'The Oranje invented “Total Football” and reached three global finals.',
    free: false,
  },
  {
    code: 'SWE', name: 'Sweden', group: 'F', conf: 'UEFA', emoji: '🇸🇪',
    continents: ['Europe'], capital: 'Stockholm', languages: ['Swedish'],
    fact: 'Stockholm is built on 14 islands joined by 57 bridges.',
    soccer: 'Sweden hosted the 1958 global finals and reached the final — against a 17-year-old Pelé.',
    free: false,
  },
  {
    code: 'TUN', name: 'Tunisia', group: 'F', conf: 'CAF', emoji: '🇹🇳',
    continents: ['Africa'], capital: 'Tunis', languages: ['Arabic'],
    fact: 'Star Wars desert scenes were filmed in Tunisia’s Sahara.',
    soccer: 'In 1978 Tunisia became the first African team to win a global finals match.',
    free: false,
  },

  // ── Group G ──────────────────────────────────────────────────────────
  {
    code: 'BEL', name: 'Belgium', group: 'G', conf: 'UEFA', emoji: '🇧🇪',
    continents: ['Europe'], capital: 'Brussels', languages: ['Dutch', 'French', 'German'],
    fact: 'Belgium is famous for waffles, chocolate and comic heroes like Tintin.',
    soccer: 'The Red Devils finished third at the 2018 global finals.',
    free: false,
  },
  {
    code: 'EGY', name: 'Egypt', group: 'G', conf: 'CAF', emoji: '🇪🇬',
    continents: ['Africa'], capital: 'Cairo', languages: ['Arabic'],
    fact: 'The Great Pyramid of Giza is more than 4,500 years old.',
    soccer: 'The Pharaohs are powered by superstar forward Mo Salah.',
    free: false,
  },
  {
    code: 'IRN', name: 'Iran', group: 'G', conf: 'AFC', emoji: '🇮🇷',
    continents: ['Asia'], capital: 'Tehran', languages: ['Persian (Farsi)'],
    fact: 'Iran is home to some of the oldest cities on Earth.',
    soccer: 'Team Melli have been crowned champions of Asia three times.',
    free: false,
  },
  {
    code: 'NZL', name: 'New Zealand', group: 'G', conf: 'OFC', emoji: '🇳🇿',
    continents: ['Oceania'], capital: 'Wellington', languages: ['English', 'Māori'],
    fact: 'In New Zealand there are about five sheep for every person.',
    soccer: 'The All Whites went unbeaten at the 2010 global finals — three draws!',
    free: false,
  },

  // ── Group H ──────────────────────────────────────────────────────────
  {
    code: 'ESP', name: 'Spain', group: 'H', conf: 'UEFA', emoji: '🇪🇸',
    continents: ['Europe'], capital: 'Madrid', languages: ['Spanish'],
    fact: 'At La Tomatina festival, Spaniards throw thousands of tomatoes — just for fun.',
    soccer: '2010 champions, famous for dizzying “tiki-taka” passing.',
    free: true,
  },
  {
    code: 'URU', name: 'Uruguay', group: 'H', conf: 'CONMEBOL', emoji: '🇺🇾',
    continents: ['South America'], capital: 'Montevideo', languages: ['Spanish'],
    fact: 'Uruguay is the smallest country ever to win the global finals.',
    soccer: 'La Celeste won the very first global finals in 1930 — and again in 1950.',
    free: false,
  },
  {
    code: 'KSA', name: 'Saudi Arabia', group: 'H', conf: 'AFC', emoji: '🇸🇦',
    continents: ['Asia'], capital: 'Riyadh', languages: ['Arabic'],
    fact: 'Saudi Arabia is mostly desert and has no permanent rivers at all.',
    soccer: 'The Green Falcons shocked eventual champions Argentina in 2022!',
    free: false,
  },
  {
    code: 'CPV', name: 'Cape Verde', group: 'H', conf: 'CAF', emoji: '🇨🇻',
    continents: ['Africa'], capital: 'Praia', languages: ['Portuguese', 'Cape Verdean Creole'],
    fact: 'Cape Verde is a chain of 10 volcanic islands in the Atlantic Ocean.',
    soccer: 'The Blue Sharks qualified for their first global finals ever — island power!',
    free: false,
  },

  // ── Group I ──────────────────────────────────────────────────────────
  {
    code: 'FRA', name: 'France', group: 'I', conf: 'UEFA', emoji: '🇫🇷',
    continents: ['Europe'], capital: 'Paris', languages: ['French'],
    fact: 'The Eiffel Tower was only supposed to stand for 20 years.',
    soccer: 'Les Bleus won in 1998 and 2018, and reached the 2022 final too.',
    free: true,
  },
  {
    code: 'SEN', name: 'Senegal', group: 'I', conf: 'CAF', emoji: '🇸🇳',
    continents: ['Africa'], capital: 'Dakar', languages: ['French', 'Wolof'],
    fact: 'Dakar sits at the westernmost tip of mainland Africa.',
    soccer: 'The Lions of Teranga became African champions in 2022, led by Sadio Mané.',
    free: false,
  },
  {
    code: 'NOR', name: 'Norway', group: 'I', conf: 'UEFA', emoji: '🇳🇴',
    continents: ['Europe'], capital: 'Oslo', languages: ['Norwegian'],
    fact: 'Norway is the land of the midnight sun and the northern lights.',
    soccer: 'Goal machine Erling Haaland leads Norway back after 28 years away.',
    free: false,
  },
  {
    code: 'IRQ', name: 'Iraq', group: 'I', conf: 'AFC', emoji: '🇮🇶',
    continents: ['Asia'], capital: 'Baghdad', languages: ['Arabic', 'Kurdish'],
    fact: 'Ancient Iraq — Mesopotamia — is where writing was invented.',
    soccer: 'The Lions of Mesopotamia won the 2007 Asian Cup in a fairy-tale run.',
    free: false,
  },

  // ── Group J ──────────────────────────────────────────────────────────
  {
    code: 'ARG', name: 'Argentina', group: 'J', conf: 'CONMEBOL', emoji: '🇦🇷',
    continents: ['South America'], capital: 'Buenos Aires', languages: ['Spanish'],
    fact: 'The tango — music and dance — was born in Buenos Aires.',
    soccer: 'Reigning world champions! Messi finally lifted the trophy in 2022.',
    free: true,
  },
  {
    code: 'ALG', name: 'Algeria', group: 'J', conf: 'CAF', emoji: '🇩🇿',
    continents: ['Africa'], capital: 'Algiers', languages: ['Arabic', 'Tamazight'],
    fact: 'Algeria is the largest country in the whole of Africa.',
    soccer: 'The Desert Foxes won the Africa Cup of Nations in 2019.',
    free: false,
  },
  {
    code: 'AUT', name: 'Austria', group: 'J', conf: 'UEFA', emoji: '🇦🇹',
    continents: ['Europe'], capital: 'Vienna', languages: ['German'],
    fact: 'Mozart and the waltz both come from Austria.',
    soccer: 'Austria’s “Wunderteam” reached the global finals semi-final in 1954.',
    free: false,
  },
  {
    code: 'JOR', name: 'Jordan', group: 'J', conf: 'AFC', emoji: '🇯🇴',
    continents: ['Asia'], capital: 'Amman', languages: ['Arabic'],
    fact: 'Jordan is home to Petra, an ancient city carved into rose-pink rock.',
    soccer: 'After a dream 2023 Asian Cup final, Jordan reached its first global finals!',
    free: false,
  },

  // ── Group K ──────────────────────────────────────────────────────────
  {
    code: 'POR', name: 'Portugal', group: 'K', conf: 'UEFA', emoji: '🇵🇹',
    continents: ['Europe'], capital: 'Lisbon', languages: ['Portuguese'],
    fact: 'Lisbon is even older than Rome.',
    soccer: 'Cristiano Ronaldo is playing in a record sixth global finals.',
    free: false,
  },
  {
    code: 'COL', name: 'Colombia', group: 'K', conf: 'CONMEBOL', emoji: '🇨🇴',
    continents: ['South America'], capital: 'Bogotá', languages: ['Spanish'],
    fact: 'Colombia grows some of the most delicious coffee in the world.',
    soccer: 'James Rodríguez won the Golden Boot with six wonder-goals in 2014.',
    free: false,
  },
  {
    code: 'UZB', name: 'Uzbekistan', group: 'K', conf: 'AFC', emoji: '🇺🇿',
    continents: ['Asia'], capital: 'Tashkent', languages: ['Uzbek'],
    fact: 'Silk Road cities Samarkand and Bukhara sparkle with bright blue tiles.',
    soccer: 'The White Wolves qualified for their very first global finals!',
    free: false,
  },
  {
    code: 'COD', name: 'DR Congo', group: 'K', conf: 'CAF', emoji: '🇨🇩',
    continents: ['Africa'], capital: 'Kinshasa', languages: ['French', 'Lingala'],
    fact: 'The Congo rainforest is the second largest on Earth, after the Amazon.',
    soccer: 'As Zaire in 1974, they were the first sub-Saharan team at a global finals. Back after 52 years!',
    free: false,
  },

  // ── Group L ──────────────────────────────────────────────────────────
  {
    code: 'ENG', name: 'England', group: 'L', conf: 'UEFA', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    continents: ['Europe'], capital: 'London', languages: ['English'],
    fact: 'Football’s first official rulebook was written in a London pub in 1863.',
    soccer: 'Champions in 1966 and home of the Premier League.',
    free: true,
  },
  {
    code: 'CRO', name: 'Croatia', group: 'L', conf: 'UEFA', emoji: '🇭🇷',
    continents: ['Europe'], capital: 'Zagreb', languages: ['Croatian'],
    fact: 'The necktie (cravat) was invented in Croatia.',
    soccer: 'global-finals runners-up in 2018 and third in 2022 — Modrić magic.',
    free: false,
  },
  {
    code: 'GHA', name: 'Ghana', group: 'L', conf: 'CAF', emoji: '🇬🇭',
    continents: ['Africa'], capital: 'Accra', languages: ['English', 'Twi'],
    fact: 'Lake Volta in Ghana is one of the largest human-made lakes in the world.',
    soccer: 'The Black Stars came within a whisker of the 2010 semi-finals.',
    free: true,
  },
  {
    code: 'PAN', name: 'Panama', group: 'L', conf: 'CONCACAF', emoji: '🇵🇦',
    continents: ['North America'], capital: 'Panama City', languages: ['Spanish'],
    fact: 'The Panama Canal lets giant ships sail between two oceans.',
    soccer: 'Panama scored their first ever global finals goal in 2018 — the whole country partied.',
    free: false,
  },
];

export const TEAM_BY_CODE = Object.fromEntries(TEAMS.map((t) => [t.code, t]));

export const GROUPS = [...new Set(TEAMS.map((t) => t.group))].sort();

export function teamsInGroup(group) {
  return TEAMS.filter((t) => t.group === group);
}
