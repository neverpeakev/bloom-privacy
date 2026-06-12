/**
 * Official FIFA World Cup 2026 match schedule — all 104 matches.
 * Compact rows: [matchNumber, home, away, stage, group, kickoffISO, venue, city, placeholder]
 * Knockout rows have null teams and a human-readable placeholder instead.
 */

const ROWS = [
  [1, 'MEX', 'RSA', 'group', 'A', '2026-06-11T19:00:00Z', 'Estadio Azteca', 'Mexico City', null],
  [2, 'KOR', 'CZE', 'group', 'A', '2026-06-12T02:00:00Z', 'Estadio Akron', 'Guadalajara', null],
  [3, 'CAN', 'BIH', 'group', 'B', '2026-06-12T19:00:00Z', 'BMO Field', 'Toronto', null],
  [4, 'USA', 'PAR', 'group', 'D', '2026-06-13T01:00:00Z', 'SoFi Stadium', 'Los Angeles', null],
  [5, 'HAI', 'SCO', 'group', 'C', '2026-06-14T01:00:00Z', 'Gillette Stadium', 'Boston', null],
  [6, 'AUS', 'TUR', 'group', 'D', '2026-06-14T04:00:00Z', 'BC Place', 'Vancouver', null],
  [7, 'BRA', 'MAR', 'group', 'C', '2026-06-13T22:00:00Z', 'MetLife Stadium', 'New York/NJ', null],
  [8, 'QAT', 'SUI', 'group', 'B', '2026-06-13T19:00:00Z', "Levi's Stadium", 'San Francisco Bay', null],
  [9, 'CIV', 'ECU', 'group', 'E', '2026-06-14T23:00:00Z', 'Lincoln Financial Field', 'Philadelphia', null],
  [10, 'GER', 'CUW', 'group', 'E', '2026-06-14T17:00:00Z', 'NRG Stadium', 'Houston', null],
  [11, 'NED', 'JPN', 'group', 'F', '2026-06-14T20:00:00Z', 'AT&T Stadium', 'Dallas', null],
  [12, 'SWE', 'TUN', 'group', 'F', '2026-06-15T02:00:00Z', 'Estadio BBVA', 'Monterrey', null],
  [13, 'KSA', 'URU', 'group', 'H', '2026-06-15T22:00:00Z', 'Hard Rock Stadium', 'Miami', null],
  [14, 'ESP', 'CPV', 'group', 'H', '2026-06-15T16:00:00Z', 'Mercedes-Benz Stadium', 'Atlanta', null],
  [15, 'IRN', 'NZL', 'group', 'G', '2026-06-16T01:00:00Z', 'SoFi Stadium', 'Los Angeles', null],
  [16, 'BEL', 'EGY', 'group', 'G', '2026-06-15T19:00:00Z', 'Lumen Field', 'Seattle', null],
  [17, 'FRA', 'SEN', 'group', 'I', '2026-06-16T19:00:00Z', 'MetLife Stadium', 'New York/NJ', null],
  [18, 'IRQ', 'NOR', 'group', 'I', '2026-06-16T22:00:00Z', 'Gillette Stadium', 'Boston', null],
  [19, 'ARG', 'ALG', 'group', 'J', '2026-06-17T01:00:00Z', 'Arrowhead Stadium', 'Kansas City', null],
  [20, 'AUT', 'JOR', 'group', 'J', '2026-06-17T04:00:00Z', "Levi's Stadium", 'San Francisco Bay', null],
  [21, 'GHA', 'PAN', 'group', 'L', '2026-06-17T23:00:00Z', 'BMO Field', 'Toronto', null],
  [22, 'ENG', 'CRO', 'group', 'L', '2026-06-17T20:00:00Z', 'AT&T Stadium', 'Dallas', null],
  [23, 'POR', 'COD', 'group', 'K', '2026-06-17T17:00:00Z', 'NRG Stadium', 'Houston', null],
  [24, 'UZB', 'COL', 'group', 'K', '2026-06-18T02:00:00Z', 'Estadio Azteca', 'Mexico City', null],
  [25, 'CZE', 'RSA', 'group', 'A', '2026-06-18T16:00:00Z', 'Mercedes-Benz Stadium', 'Atlanta', null],
  [26, 'SUI', 'BIH', 'group', 'B', '2026-06-18T19:00:00Z', 'SoFi Stadium', 'Los Angeles', null],
  [27, 'CAN', 'QAT', 'group', 'B', '2026-06-18T22:00:00Z', 'BC Place', 'Vancouver', null],
  [28, 'MEX', 'KOR', 'group', 'A', '2026-06-19T01:00:00Z', 'Estadio Akron', 'Guadalajara', null],
  [29, 'BRA', 'HAI', 'group', 'C', '2026-06-20T01:00:00Z', 'Lincoln Financial Field', 'Philadelphia', null],
  [30, 'SCO', 'MAR', 'group', 'C', '2026-06-19T22:00:00Z', 'Gillette Stadium', 'Boston', null],
  [31, 'TUR', 'PAR', 'group', 'D', '2026-06-20T04:00:00Z', "Levi's Stadium", 'San Francisco Bay', null],
  [32, 'USA', 'AUS', 'group', 'D', '2026-06-19T19:00:00Z', 'Lumen Field', 'Seattle', null],
  [33, 'GER', 'CIV', 'group', 'E', '2026-06-20T20:00:00Z', 'BMO Field', 'Toronto', null],
  [34, 'ECU', 'CUW', 'group', 'E', '2026-06-21T00:00:00Z', 'Arrowhead Stadium', 'Kansas City', null],
  [35, 'NED', 'SWE', 'group', 'F', '2026-06-20T17:00:00Z', 'NRG Stadium', 'Houston', null],
  [36, 'TUN', 'JPN', 'group', 'F', '2026-06-21T04:00:00Z', 'Estadio BBVA', 'Monterrey', null],
  [37, 'URU', 'CPV', 'group', 'H', '2026-06-21T22:00:00Z', 'Hard Rock Stadium', 'Miami', null],
  [38, 'ESP', 'KSA', 'group', 'H', '2026-06-21T16:00:00Z', 'Mercedes-Benz Stadium', 'Atlanta', null],
  [39, 'BEL', 'IRN', 'group', 'G', '2026-06-21T19:00:00Z', 'SoFi Stadium', 'Los Angeles', null],
  [40, 'NZL', 'EGY', 'group', 'G', '2026-06-22T01:00:00Z', 'BC Place', 'Vancouver', null],
  [41, 'NOR', 'SEN', 'group', 'I', '2026-06-23T00:00:00Z', 'MetLife Stadium', 'New York/NJ', null],
  [42, 'FRA', 'IRQ', 'group', 'I', '2026-06-22T21:00:00Z', 'Lincoln Financial Field', 'Philadelphia', null],
  [43, 'ARG', 'AUT', 'group', 'J', '2026-06-22T17:00:00Z', 'AT&T Stadium', 'Dallas', null],
  [44, 'JOR', 'ALG', 'group', 'J', '2026-06-23T03:00:00Z', "Levi's Stadium", 'San Francisco Bay', null],
  [45, 'ENG', 'GHA', 'group', 'L', '2026-06-23T20:00:00Z', 'Gillette Stadium', 'Boston', null],
  [46, 'PAN', 'CRO', 'group', 'L', '2026-06-23T23:00:00Z', 'BMO Field', 'Toronto', null],
  [47, 'POR', 'UZB', 'group', 'K', '2026-06-23T17:00:00Z', 'NRG Stadium', 'Houston', null],
  [48, 'COL', 'COD', 'group', 'K', '2026-06-24T02:00:00Z', 'Estadio Akron', 'Guadalajara', null],
  [49, 'SCO', 'BRA', 'group', 'C', '2026-06-24T22:00:00Z', 'Hard Rock Stadium', 'Miami', null],
  [50, 'MAR', 'HAI', 'group', 'C', '2026-06-24T22:00:00Z', 'Mercedes-Benz Stadium', 'Atlanta', null],
  [51, 'SUI', 'CAN', 'group', 'B', '2026-06-24T19:00:00Z', 'BC Place', 'Vancouver', null],
  [52, 'BIH', 'QAT', 'group', 'B', '2026-06-24T19:00:00Z', 'Lumen Field', 'Seattle', null],
  [53, 'CZE', 'MEX', 'group', 'A', '2026-06-25T01:00:00Z', 'Estadio Azteca', 'Mexico City', null],
  [54, 'RSA', 'KOR', 'group', 'A', '2026-06-25T01:00:00Z', 'Estadio BBVA', 'Monterrey', null],
  [55, 'CUW', 'CIV', 'group', 'E', '2026-06-25T20:00:00Z', 'Lincoln Financial Field', 'Philadelphia', null],
  [56, 'ECU', 'GER', 'group', 'E', '2026-06-25T20:00:00Z', 'MetLife Stadium', 'New York/NJ', null],
  [57, 'JPN', 'SWE', 'group', 'F', '2026-06-25T23:00:00Z', 'AT&T Stadium', 'Dallas', null],
  [58, 'TUN', 'NED', 'group', 'F', '2026-06-25T23:00:00Z', 'Arrowhead Stadium', 'Kansas City', null],
  [59, 'TUR', 'USA', 'group', 'D', '2026-06-26T02:00:00Z', 'SoFi Stadium', 'Los Angeles', null],
  [60, 'PAR', 'AUS', 'group', 'D', '2026-06-26T02:00:00Z', "Levi's Stadium", 'San Francisco Bay', null],
  [61, 'NOR', 'FRA', 'group', 'I', '2026-06-26T19:00:00Z', 'Gillette Stadium', 'Boston', null],
  [62, 'SEN', 'IRQ', 'group', 'I', '2026-06-26T19:00:00Z', 'BMO Field', 'Toronto', null],
  [63, 'EGY', 'IRN', 'group', 'G', '2026-06-27T03:00:00Z', 'Lumen Field', 'Seattle', null],
  [64, 'NZL', 'BEL', 'group', 'G', '2026-06-27T03:00:00Z', 'BC Place', 'Vancouver', null],
  [65, 'CPV', 'KSA', 'group', 'H', '2026-06-27T00:00:00Z', 'NRG Stadium', 'Houston', null],
  [66, 'URU', 'ESP', 'group', 'H', '2026-06-27T00:00:00Z', 'Estadio Akron', 'Guadalajara', null],
  [67, 'PAN', 'ENG', 'group', 'L', '2026-06-27T21:00:00Z', 'MetLife Stadium', 'New York/NJ', null],
  [68, 'CRO', 'GHA', 'group', 'L', '2026-06-27T21:00:00Z', 'Lincoln Financial Field', 'Philadelphia', null],
  [69, 'ALG', 'AUT', 'group', 'J', '2026-06-28T02:00:00Z', 'Arrowhead Stadium', 'Kansas City', null],
  [70, 'JOR', 'ARG', 'group', 'J', '2026-06-28T02:00:00Z', 'AT&T Stadium', 'Dallas', null],
  [71, 'COL', 'POR', 'group', 'K', '2026-06-27T23:30:00Z', 'Hard Rock Stadium', 'Miami', null],
  [72, 'COD', 'UZB', 'group', 'K', '2026-06-27T23:30:00Z', 'Mercedes-Benz Stadium', 'Atlanta', null],
  [73, null, null, 'round_32', null, '2026-06-28T19:00:00Z', 'SoFi Stadium', 'Los Angeles', '2nd Group A vs 2nd Group B'],
  [74, null, null, 'round_32', null, '2026-06-29T20:30:00Z', 'Gillette Stadium', 'Boston', '1st Group E vs 3rd A/B/C/D/F'],
  [75, null, null, 'round_32', null, '2026-06-30T01:00:00Z', 'Estadio BBVA', 'Monterrey', '1st Group F vs 2nd Group C'],
  [76, null, null, 'round_32', null, '2026-06-29T17:00:00Z', 'NRG Stadium', 'Houston', '1st Group C vs 2nd Group F'],
  [77, null, null, 'round_32', null, '2026-06-30T21:00:00Z', 'MetLife Stadium', 'New York/NJ', '1st Group I vs 3rd C/D/F/G/H'],
  [78, null, null, 'round_32', null, '2026-06-30T17:00:00Z', 'AT&T Stadium', 'Dallas', '2nd Group E vs 2nd Group I'],
  [79, null, null, 'round_32', null, '2026-07-01T01:00:00Z', 'Estadio Azteca', 'Mexico City', '1st Group A vs 3rd C/E/F/H/I'],
  [80, null, null, 'round_32', null, '2026-07-01T16:00:00Z', 'Mercedes-Benz Stadium', 'Atlanta', '1st Group L vs 3rd E/H/I/J/K'],
  [81, null, null, 'round_32', null, '2026-07-02T00:00:00Z', "Levi's Stadium", 'San Francisco Bay', '1st Group D vs 3rd B/E/F/I/J'],
  [82, null, null, 'round_32', null, '2026-07-01T20:00:00Z', 'Lumen Field', 'Seattle', '1st Group G vs 3rd A/E/H/I/J'],
  [83, null, null, 'round_32', null, '2026-07-02T23:00:00Z', 'BMO Field', 'Toronto', '2nd Group K vs 2nd Group L'],
  [84, null, null, 'round_32', null, '2026-07-02T19:00:00Z', 'SoFi Stadium', 'Los Angeles', '1st Group H vs 2nd Group J'],
  [85, null, null, 'round_32', null, '2026-07-03T03:00:00Z', 'BC Place', 'Vancouver', '1st Group B vs 3rd E/F/G/I/J'],
  [86, null, null, 'round_32', null, '2026-07-03T22:00:00Z', 'Hard Rock Stadium', 'Miami', '1st Group J vs 2nd Group H'],
  [87, null, null, 'round_32', null, '2026-07-04T01:30:00Z', 'Arrowhead Stadium', 'Kansas City', '1st Group K vs 3rd D/E/I/J/L'],
  [88, null, null, 'round_32', null, '2026-07-03T18:00:00Z', 'AT&T Stadium', 'Dallas', '2nd Group D vs 2nd Group G'],
  [89, null, null, 'round_16', null, '2026-07-04T21:00:00Z', 'Lincoln Financial Field', 'Philadelphia', 'Winner M74 vs Winner M77'],
  [90, null, null, 'round_16', null, '2026-07-04T17:00:00Z', 'NRG Stadium', 'Houston', 'Winner M73 vs Winner M75'],
  [91, null, null, 'round_16', null, '2026-07-05T20:00:00Z', 'MetLife Stadium', 'New York/NJ', 'Winner M76 vs Winner M78'],
  [92, null, null, 'round_16', null, '2026-07-06T00:00:00Z', 'Estadio Azteca', 'Mexico City', 'Winner M79 vs Winner M80'],
  [93, null, null, 'round_16', null, '2026-07-06T19:00:00Z', 'AT&T Stadium', 'Dallas', 'Winner M83 vs Winner M84'],
  [94, null, null, 'round_16', null, '2026-07-07T00:00:00Z', 'Lumen Field', 'Seattle', 'Winner M81 vs Winner M82'],
  [95, null, null, 'round_16', null, '2026-07-07T16:00:00Z', 'Mercedes-Benz Stadium', 'Atlanta', 'Winner M86 vs Winner M88'],
  [96, null, null, 'round_16', null, '2026-07-07T20:00:00Z', 'BC Place', 'Vancouver', 'Winner M85 vs Winner M87'],
  [97, null, null, 'quarter', null, '2026-07-09T20:00:00Z', 'Gillette Stadium', 'Boston', 'Winner M89 vs Winner M90'],
  [98, null, null, 'quarter', null, '2026-07-10T19:00:00Z', 'SoFi Stadium', 'Los Angeles', 'Winner M93 vs Winner M94'],
  [99, null, null, 'quarter', null, '2026-07-11T21:00:00Z', 'Hard Rock Stadium', 'Miami', 'Winner M91 vs Winner M92'],
  [100, null, null, 'quarter', null, '2026-07-12T01:00:00Z', 'Arrowhead Stadium', 'Kansas City', 'Winner M95 vs Winner M96'],
  [101, null, null, 'semi', null, '2026-07-14T19:00:00Z', 'AT&T Stadium', 'Dallas', 'Winner M97 vs Winner M98'],
  [102, null, null, 'semi', null, '2026-07-15T19:00:00Z', 'Mercedes-Benz Stadium', 'Atlanta', 'Winner M99 vs Winner M100'],
  [103, null, null, 'third', null, '2026-07-18T21:00:00Z', 'Hard Rock Stadium', 'Miami', 'SF Losers'],
  [104, null, null, 'final', null, '2026-07-19T19:00:00Z', 'MetLife Stadium', 'New York/NJ', 'Winner M101 vs Winner M102'],
];

export const STAGE_LABELS = {
  group: 'Group Stage',
  round_32: 'Round of 32',
  round_16: 'Round of 16',
  quarter: 'Quarter-final',
  semi: 'Semi-final',
  third: 'Third Place',
  final: 'THE FINAL',
};

export const MATCHES = ROWS.map(
  ([num, home, away, stage, group, kickoff, venue, city, placeholder]) => ({
    num, home, away, stage, group, kickoff, venue, city, placeholder,
  }),
);

/** Matches whose kickoff falls on the given local calendar day. */
export function matchesOn(date, list = MATCHES) {
  return list.filter((m) => {
    const k = new Date(m.kickoff);
    return (
      k.getFullYear() === date.getFullYear() &&
      k.getMonth() === date.getMonth() &&
      k.getDate() === date.getDate()
    );
  });
}

/** The next chronological match day on/after the given date, with its matches. */
export function nextMatchDay(date, list = MATCHES) {
  const today = matchesOn(date, list);
  if (today.length) return { date, matches: today };
  const upcoming = list
    .filter((m) => new Date(m.kickoff) > date)
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  if (!upcoming.length) return { date: null, matches: [] };
  return { date: new Date(upcoming[0].kickoff), matches: matchesOn(new Date(upcoming[0].kickoff), list) };
}
