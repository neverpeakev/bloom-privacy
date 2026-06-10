/**
 * Flag geometry engine.
 *
 * Every flag is described as a list of paintable regions inside a 300×200
 * viewBox. A region is one SVG path (it may contain several subpaths, e.g.
 * "all the red stripes") with a single correct colour. Flags are lovingly
 * simplified so young kids can colour them, while staying recognisable.
 */

const W = 300;
const H = 200;

// ── Path helpers ───────────────────────────────────────────────────────

const fmt = (n) => +n.toFixed(2);

export function rect(x, y, w, h) {
  return `M${fmt(x)},${fmt(y)} h${fmt(w)} v${fmt(h)} h${fmt(-w)} Z`;
}

export function poly(points) {
  return (
    points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${fmt(x)},${fmt(y)}`).join(' ') + ' Z'
  );
}

export function circle(cx, cy, r) {
  return (
    `M${fmt(cx - r)},${fmt(cy)} ` +
    `a${fmt(r)},${fmt(r)} 0 1 0 ${fmt(2 * r)},0 ` +
    `a${fmt(r)},${fmt(r)} 0 1 0 ${fmt(-2 * r)},0 Z`
  );
}

/** n-pointed star. rotation in degrees, 0 = one point straight up. */
export function star(cx, cy, rOuter, points = 5, rotation = 0, innerRatio = 0.42) {
  const rInner = rOuter * innerRatio;
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI / points) * i - Math.PI / 2 + (rotation * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return poly(pts);
}

/** Ring (donut) — relies on even-odd fill. */
export function ring(cx, cy, rOuter, rInner) {
  return circle(cx, cy, rOuter) + ' ' + circle(cx, cy, rInner);
}

/** Crescent — outer circle with an offset inner hole (even-odd fill). */
export function crescent(cx, cy, rOuter, rInner, dx) {
  return circle(cx, cy, rOuter) + ' ' + circle(cx + dx, cy, rInner);
}

/** Sun with triangular rays around a disc. */
export function sun(cx, cy, rDisc, rayCount = 8, rayLen = 12, rayWidth = 7) {
  let d = circle(cx, cy, rDisc);
  for (let i = 0; i < rayCount; i++) {
    const a = ((Math.PI * 2) / rayCount) * i;
    const tip = [cx + (rDisc + rayLen) * Math.cos(a), cy + (rDisc + rayLen) * Math.sin(a)];
    const b1 = [
      cx + rDisc * Math.cos(a - rayWidth / 57.3),
      cy + rDisc * Math.sin(a - rayWidth / 57.3),
    ];
    const b2 = [
      cx + rDisc * Math.cos(a + rayWidth / 57.3),
      cy + rDisc * Math.sin(a + rayWidth / 57.3),
    ];
    d += ' ' + poly([b1, tip, b2]);
  }
  return d;
}

function hBands(n) {
  const h = H / n;
  return Array.from({ length: n }, (_, i) => rect(0, i * h, W, h));
}

function vBands(n) {
  const w = W / n;
  return Array.from({ length: n }, (_, i) => rect(i * w, 0, w, H));
}

/** Vertical zigzag boundary (Qatar) from (xBase ± amp) spanning full height. */
function zigzagBand(xBase, amp, teeth) {
  const step = H / (teeth * 2);
  let d = `M0,0 L${fmt(xBase)},0`;
  for (let i = 0; i < teeth * 2; i++) {
    const x = i % 2 === 0 ? xBase + amp : xBase;
    d += ` L${fmt(x)},${fmt((i + 1) * step)}`;
  }
  d += ` L0,${H} Z`;
  return d;
}

/** Simplified Union Jack canton (for AUS / NZL). Returns layered paths. */
function unionJack(cw, ch) {
  const t = cw * 0.12; // diagonal band half-thickness
  const saltire =
    poly([[0, 0], [t, 0], [cw, ch - t * 0.66], [cw, ch], [cw - t, ch], [0, t * 0.66]]) +
    ' ' +
    poly([[cw, 0], [cw, t * 0.66], [t, ch], [0, ch], [0, ch - t * 0.66], [cw - t, 0]]);
  const crossWhite =
    rect(cw / 2 - cw * 0.115, 0, cw * 0.23, ch) + ' ' + rect(0, ch / 2 - ch * 0.17, cw, ch * 0.34);
  const crossRed =
    rect(cw / 2 - cw * 0.065, 0, cw * 0.13, ch) + ' ' + rect(0, ch / 2 - ch * 0.1, cw, ch * 0.2);
  return { saltire, crossWhite, crossRed };
}

/** Stylised eagle silhouette used for the Mexico / Egypt emblems. */
function eagle(cx, cy, s) {
  return (
    `M${fmt(cx)},${fmt(cy - 18 * s)} ` +
    `C${fmt(cx + 6 * s)},${fmt(cy - 20 * s)} ${fmt(cx + 10 * s)},${fmt(cy - 14 * s)} ${fmt(cx + 8 * s)},${fmt(cy - 8 * s)} ` +
    `C${fmt(cx + 20 * s)},${fmt(cy - 12 * s)} ${fmt(cx + 26 * s)},${fmt(cy - 4 * s)} ${fmt(cx + 22 * s)},${fmt(cy + 6 * s)} ` +
    `C${fmt(cx + 14 * s)},${fmt(cy + 2 * s)} ${fmt(cx + 8 * s)},${fmt(cy + 4 * s)} ${fmt(cx + 4 * s)},${fmt(cy + 10 * s)} ` +
    `L${fmt(cx + 8 * s)},${fmt(cy + 18 * s)} L${fmt(cx - 2 * s)},${fmt(cy + 13 * s)} L${fmt(cx - 10 * s)},${fmt(cy + 18 * s)} ` +
    `L${fmt(cx - 7 * s)},${fmt(cy + 8 * s)} ` +
    `C${fmt(cx - 18 * s)},${fmt(cy + 6 * s)} ${fmt(cx - 24 * s)},${fmt(cy - 2 * s)} ${fmt(cx - 20 * s)},${fmt(cy - 10 * s)} ` +
    `C${fmt(cx - 12 * s)},${fmt(cy - 12 * s)} ${fmt(cx - 8 * s)},${fmt(cy - 10 * s)} ${fmt(cx - 4 * s)},${fmt(cy - 12 * s)} ` +
    `C${fmt(cx - 6 * s)},${fmt(cy - 16 * s)} ${fmt(cx - 4 * s)},${fmt(cy - 19 * s)} ${fmt(cx)},${fmt(cy - 18 * s)} Z`
  );
}

/** Stylised maple leaf (Canada). */
function mapleLeaf(cx, cy, s) {
  const p = [
    [0, -48], [8, -28], [26, -36], [20, -12], [40, -16], [12, 10], [18, 26],
    [4, 20], [4, 44], [-4, 44], [-4, 20], [-18, 26], [-12, 10], [-40, -16],
    [-20, -12], [-26, -36], [-8, -28],
  ].map(([x, y]) => [cx + x * s, cy + y * s]);
  return poly(p);
}

// ── Region factory ─────────────────────────────────────────────────────

let rid = 0;
function R(name, color, d, opts = {}) {
  return { id: `r${rid++}`, name, color, d, ...opts };
}

function buildFlags() {
  const F = {};
  const def = (code, regions) => {
    rid = 0;
    F[code] = { code, regions: regions() };
  };

  // Group A ────────────────────────────────────────────────────────────
  def('MEX', () => {
    const [a, b, c] = vBands(3);
    return [
      R('Green', '#006847', a),
      R('White', '#ffffff', b),
      R('Red', '#ce1126', c),
      R('Brown', '#8a5a2b', eagle(150, 100, 1.4)),
    ];
  });

  def('RSA', () => [
    R('Red', '#de3831', poly([[55, 0], [300, 0], [300, 70], [160, 70]])),
    R('Blue', '#002395', poly([[160, 130], [300, 130], [300, 200], [55, 200]])),
    R('Green', '#007a4d', poly(
      [[0, 0], [38, 0], [148, 83], [300, 83], [300, 117], [148, 117], [38, 200], [0, 200], [0, 162], [92, 100], [0, 38]],
    )),
    R('Yellow', '#ffb612', poly([[0, 52], [64, 100], [0, 148]])),
    R('Black', '#000000', poly([[0, 70], [40, 100], [0, 130]])),
  ]);

  def('KOR', () => [
    R('White', '#ffffff', rect(0, 0, W, H)),
    R('Red', '#cd2e3a', `M${150 - 42},100 a42,42 0 0 1 84,0 a21,21 0 0 1 -42,0 a21,21 0 0 0 -42,0 Z`),
    R('Blue', '#0047a0', `M${150 + 42},100 a42,42 0 0 1 -84,0 a21,21 0 0 0 42,0 a21,21 0 0 1 42,0 Z`),
    R('Black', '#000000',
      [
        rect(40, 30, 34, 7), rect(40, 41, 34, 7), rect(40, 52, 34, 7),
        rect(226, 30, 34, 7), rect(226, 41, 15, 7), rect(245, 41, 15, 7), rect(226, 52, 34, 7),
        rect(40, 141, 34, 7), rect(40, 152, 15, 7), rect(59, 152, 15, 7), rect(40, 163, 34, 7),
        rect(226, 141, 15, 7), rect(245, 141, 15, 7), rect(226, 152, 34, 7), rect(226, 163, 15, 7), rect(245, 163, 15, 7),
      ].join(' ')),
  ]);

  def('CZE', () => [
    R('White', '#ffffff', poly([[0, 0], [300, 0], [300, 100], [150, 100], [0, 0]])),
    R('Red', '#d7141a', poly([[150, 100], [300, 100], [300, 200], [0, 200], [150, 100]])),
    R('Blue', '#11457e', poly([[0, 0], [150, 100], [0, 200]])),
  ]);

  // Group B ────────────────────────────────────────────────────────────
  def('CAN', () => [
    R('Red', '#d52b1e', rect(0, 0, 75, H) + ' ' + rect(225, 0, 75, H)),
    R('White', '#ffffff', rect(75, 0, 150, H)),
    R('Red', '#d52b1e', mapleLeaf(150, 95, 1.05) + ' ' + rect(146, 138, 8, 26)),
  ]);

  def('SUI', () => [
    R('Red', '#da291c', rect(0, 0, W, H)),
    R('White', '#ffffff', rect(132, 50, 36, 100) + ' ' + rect(100, 82, 100, 36)),
  ]);

  def('QAT', () => [
    R('Maroon', '#8a1538', rect(0, 0, W, H)),
    R('White', '#ffffff', zigzagBand(95, 28, 9)),
  ]);

  def('BIH', () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(star(96 + i * 33, 22 + i * 38, 12, 5));
    }
    return [
      R('Blue', '#002395', rect(0, 0, W, H)),
      R('Yellow', '#fecb00', poly([[110, 0], [262, 0], [262, 152]])),
      R('White', '#ffffff', stars.join(' ')),
    ];
  });

  // Group C ────────────────────────────────────────────────────────────
  def('BRA', () => [
    R('Green', '#009739', rect(0, 0, W, H)),
    R('Yellow', '#fedd00', poly([[150, 20], [280, 100], [150, 180], [20, 100]])),
    R('Blue', '#012169', circle(150, 100, 44)),
    R('White', '#ffffff',
      'M109,108 C130,92 170,92 191,96 L189,105 C168,101 132,101 112,116 Z'),
  ]);

  def('MAR', () => [
    R('Red', '#c1272d', rect(0, 0, W, H)),
    R('Green', '#006233', star(150, 100, 42, 5)),
  ]);

  def('SCO', () => [
    R('Blue', '#0065bf', rect(0, 0, W, H)),
    R('White', '#ffffff',
      poly([[0, 0], [42, 0], [300, 172], [300, 200], [258, 200], [0, 28]]) + ' ' +
      poly([[300, 0], [300, 28], [42, 200], [0, 200], [0, 172], [258, 0]])),
  ]);

  def('HAI', () => [
    R('Blue', '#00209f', rect(0, 0, W, 100)),
    R('Red', '#d21034', rect(0, 100, W, 100)),
    R('White', '#ffffff', rect(116, 72, 68, 56)),
    R('Green', '#016a16', poly([[150, 80], [163, 104], [156, 104], [166, 120], [134, 120], [144, 104], [137, 104]]) + ' ' + rect(147, 118, 6, 8)),
  ]);

  // Group D ────────────────────────────────────────────────────────────
  def('USA', () => {
    const sh = H / 13;
    const reds = [0, 2, 4, 6, 8, 10, 12].map((i) => {
      const x = i < 7 ? 120 : 0;
      return rect(x, i * sh, W - x, sh);
    });
    const whites = [1, 3, 5, 7, 9, 11].map((i) => {
      const x = i < 7 ? 120 : 0;
      return rect(x, i * sh, W - x, sh);
    });
    const stars = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        stars.push(star(24 + c * 36, 20 + r * 36, 9, 5));
      }
    }
    return [
      R('Red', '#b31942', reds.join(' ')),
      R('White', '#ffffff', whites.join(' ')),
      R('Blue', '#0a3161', rect(0, 0, 120, 7 * sh)),
      R('White', '#ffffff', stars.join(' ')),
    ];
  });

  def('PAR', () => {
    const [a, b, c] = hBands(3);
    return [
      R('Red', '#d52b1e', a),
      R('White', '#ffffff', b),
      R('Blue', '#0038a8', c),
      R('Green', '#009b3a', ring(150, 100, 24, 18)),
      R('Yellow', '#fedf00', star(150, 100, 12, 5)),
    ];
  });

  def('TUR', () => [
    R('Red', '#e30a17', rect(0, 0, W, H)),
    R('White', '#ffffff', crescent(125, 100, 47, 38, 13)),
    R('White', '#ffffff', star(192, 100, 18, 5, 90)),
  ]);

  def('AUS', () => {
    const uj = unionJack(150, 100);
    const sc = [
      star(225, 33, 11, 7), star(265, 73, 11, 7), star(225, 167, 11, 7),
      star(188, 95, 11, 7), star(245, 110, 7, 5),
    ];
    return [
      R('Blue', '#012169', rect(0, 0, W, H)),
      R('White', '#ffffff', uj.saltire + ' ' + uj.crossWhite),
      R('Red', '#e4002b', uj.crossRed),
      R('White', '#ffffff', star(75, 155, 16, 7)),
      R('White', '#ffffff', sc.join(' ')),
    ];
  });

  // Group E ────────────────────────────────────────────────────────────
  def('GER', () => {
    const [a, b, c] = hBands(3);
    return [R('Black', '#000000', a), R('Red', '#dd0000', b), R('Gold', '#ffce00', c)];
  });

  def('ECU', () => [
    R('Yellow', '#ffd100', rect(0, 0, W, 100)),
    R('Blue', '#0072ce', rect(0, 100, W, 50)),
    R('Red', '#ef3340', rect(0, 150, W, 50)),
    R('Steel Blue', '#7a9bbf', circle(150, 100, 24)),
  ]);

  def('CIV', () => {
    const [a, b, c] = vBands(3);
    return [R('Orange', '#ff8200', a), R('White', '#ffffff', b), R('Green', '#009a44', c)];
  });

  def('CUW', () => [
    R('Blue', '#002b7f', rect(0, 0, W, 125) + ' ' + rect(0, 150, W, 50)),
    R('Yellow', '#f9e814', rect(0, 125, W, 25)),
    R('White', '#ffffff', star(55, 38, 11, 5) + ' ' + star(85, 68, 17, 5)),
  ]);

  // Group F ────────────────────────────────────────────────────────────
  def('JPN', () => [
    R('White', '#ffffff', rect(0, 0, W, H)),
    R('Red', '#bc002d', circle(150, 100, 58)),
  ]);

  def('NED', () => {
    const [a, b, c] = hBands(3);
    return [R('Red', '#ae1c28', a), R('White', '#ffffff', b), R('Blue', '#21468b', c)];
  });

  def('SWE', () => [
    R('Blue', '#006aa7', rect(0, 0, W, H)),
    R('Yellow', '#fecc02', rect(90, 0, 40, H) + ' ' + rect(0, 80, W, 40)),
  ]);

  def('TUN', () => [
    R('Red', '#e70013', rect(0, 0, W, H)),
    R('White', '#ffffff', circle(150, 100, 52)),
    R('Red', '#e70013', crescent(146, 100, 40, 32, 12)),
    R('Red', '#e70013', star(160, 100, 16, 5, 90)),
  ]);

  // Group G ────────────────────────────────────────────────────────────
  def('BEL', () => {
    const [a, b, c] = vBands(3);
    return [R('Black', '#000000', a), R('Yellow', '#fdda24', b), R('Red', '#ef3340', c)];
  });

  def('EGY', () => {
    const [a, b, c] = hBands(3);
    return [
      R('Red', '#ce1126', a),
      R('White', '#ffffff', b),
      R('Black', '#000000', c),
      R('Gold', '#c09300', eagle(150, 100, 0.9)),
    ];
  });

  def('IRN', () => {
    const [a, b, c] = hBands(3);
    return [
      R('Green', '#239f40', a),
      R('White', '#ffffff', b),
      R('Red', '#da0000', c),
      R('Red', '#da0000',
        'M150,78 C138,88 136,104 150,122 C164,104 162,88 150,78 Z ' +
        'M129,92 C124,100 126,110 133,116 C130,108 130,99 133,93 Z ' +
        'M171,92 C176,100 174,110 167,116 C170,108 170,99 167,93 Z'),
    ];
  });

  def('NZL', () => {
    const uj = unionJack(150, 100);
    const sc = [
      star(225, 38, 11, 5), star(263, 80, 11, 5), star(225, 150, 12, 5), star(190, 92, 11, 5),
    ];
    return [
      R('Blue', '#012169', rect(0, 0, W, H)),
      R('White', '#ffffff', uj.saltire + ' ' + uj.crossWhite),
      R('Red', '#c8102e', uj.crossRed),
      R('Red', '#c8102e', sc.join(' '), { stroke: '#ffffff', strokeWidth: 2 }),
    ];
  });

  // Group H ────────────────────────────────────────────────────────────
  def('ESP', () => [
    R('Red', '#aa151b', rect(0, 0, W, 50) + ' ' + rect(0, 150, W, 50)),
    R('Yellow', '#f1bf00', rect(0, 50, W, 100)),
    R('Crest Red', '#9a2b2b',
      'M75,78 h36 v28 a18,18 0 0 1 -18,16 a18,18 0 0 1 -18,-16 Z'),
  ]);

  def('URU', () => {
    const sh = H / 9;
    const blues = [1, 3, 5, 7].map((i) => {
      const x = i < 4 ? 110 : 0;
      return rect(x, i * sh, W - x, sh);
    });
    return [
      R('White', '#ffffff', rect(0, 0, W, H)),
      R('Blue', '#0038a8', blues.join(' ')),
      R('Yellow', '#fcd116', sun(55, 44, 17, 8, 10, 8)),
    ];
  });

  def('KSA', () => [
    R('Green', '#165d31', rect(0, 0, W, H)),
    R('White', '#ffffff',
      'M60,70 q18,-14 36,0 q18,14 36,0 q18,-14 36,0 q18,14 36,0 q18,-14 36,0 l0,9 q-18,14 -36,0 q-18,-14 -36,0 q-18,14 -36,0 q-18,-14 -36,0 q-18,14 -36,0 Z ' +
      'M60,96 q18,-14 36,0 q18,14 36,0 q18,-14 36,0 q18,14 36,0 q18,-14 36,0 l0,9 q-18,14 -36,0 q-18,-14 -36,0 q-18,14 -36,0 q-18,-14 -36,0 q-18,14 -36,0 Z'),
    R('White', '#ffffff', rect(66, 132, 158, 8) + ' ' + poly([[224, 128], [244, 136], [224, 144]]) + ' ' + rect(56, 130, 10, 12)),
  ]);

  def('CPV', () => {
    const stars = [];
    for (let i = 0; i < 10; i++) {
      const a = ((Math.PI * 2) / 10) * i - Math.PI / 2;
      stars.push(star(112 + 40 * Math.cos(a), 133 + 40 * Math.sin(a), 7, 5));
    }
    return [
      R('Blue', '#003893', rect(0, 0, W, 120) + ' ' + rect(0, 160, W, 40)),
      R('White', '#ffffff', rect(0, 120, W, 13) + ' ' + rect(0, 147, W, 13)),
      R('Red', '#cf2027', rect(0, 133, W, 14)),
      R('Yellow', '#f7d116', stars.join(' ')),
    ];
  });

  // Group I ────────────────────────────────────────────────────────────
  def('FRA', () => {
    const [a, b, c] = vBands(3);
    return [R('Blue', '#0055a4', a), R('White', '#ffffff', b), R('Red', '#ef4135', c)];
  });

  def('SEN', () => {
    const [a, b, c] = vBands(3);
    return [
      R('Green', '#00853f', a),
      R('Yellow', '#fdef42', b),
      R('Red', '#e31b23', c),
      R('Green', '#00853f', star(150, 100, 22, 5)),
    ];
  });

  def('NOR', () => [
    R('Red', '#ba0c2f', rect(0, 0, W, H)),
    R('White', '#ffffff', rect(84, 0, 52, H) + ' ' + rect(0, 74, W, 52)),
    R('Navy Blue', '#00205b', rect(97, 0, 26, H) + ' ' + rect(0, 87, W, 26)),
  ]);

  def('IRQ', () => {
    const [a, b, c] = hBands(3);
    return [
      R('Red', '#ce1126', a),
      R('White', '#ffffff', b),
      R('Black', '#000000', c),
      R('Green', '#007a3d',
        'M95,88 h22 v6 h-16 v10 h-6 Z M125,104 h6 v-16 h14 v6 h-8 v10 Z ' +
        'M153,88 h6 v16 h-6 Z M167,88 h22 v6 h-16 v4 h14 v6 h-20 Z'),
    ];
  });

  // Group J ────────────────────────────────────────────────────────────
  def('ARG', () => {
    const [a, b, c] = hBands(3);
    return [
      R('Sky Blue', '#74acdf', a),
      R('White', '#ffffff', b),
      R('Sky Blue', '#74acdf', c),
      R('Golden Yellow', '#f6b40e', sun(150, 100, 15, 12, 10, 6)),
    ];
  });

  def('ALG', () => [
    R('Green', '#006233', rect(0, 0, 150, H)),
    R('White', '#ffffff', rect(150, 0, 150, H)),
    R('Red', '#d21034', crescent(148, 100, 44, 36, 13) + ' ' + star(168, 100, 17, 5, 90)),
  ]);

  def('AUT', () => {
    const [a, b, c] = hBands(3);
    return [R('Red', '#ef3340', a), R('White', '#ffffff', b), R('Red', '#ef3340', c)];
  });

  def('JOR', () => {
    const [a, b, c] = hBands(3);
    return [
      R('Black', '#000000', a),
      R('White', '#ffffff', b),
      R('Green', '#007a3d', c),
      R('Red', '#ce1126', poly([[0, 0], [120, 100], [0, 200]])),
      R('White', '#ffffff', star(42, 100, 13, 7)),
    ];
  });

  // Group K ────────────────────────────────────────────────────────────
  def('POR', () => [
    R('Green', '#046a38', rect(0, 0, 120, H)),
    R('Red', '#da291c', rect(120, 0, 180, H)),
    R('Yellow', '#ffe900', ring(120, 100, 34, 26)),
    R('White', '#ffffff', 'M104,82 h32 v24 a16,16 0 0 1 -16,14 a16,16 0 0 1 -16,-14 Z'),
  ]);

  def('COL', () => [
    R('Yellow', '#ffcd00', rect(0, 0, W, 100)),
    R('Blue', '#003087', rect(0, 100, W, 50)),
    R('Red', '#c8102e', rect(0, 150, W, 50)),
  ]);

  def('UZB', () => {
    const stars = [];
    const rows = [[3, 28], [2, 46], [1, 64]];
    for (const [count, y] of rows) {
      for (let i = 0; i < count; i++) {
        stars.push(star(118 + i * 22 + (3 - count) * 11, y, 7, 5));
      }
    }
    return [
      R('Sky Blue', '#0099b5', rect(0, 0, W, 64)),
      R('White', '#ffffff', rect(0, 70, W, 60)),
      R('Green', '#1eb53a', rect(0, 136, W, 64)),
      R('Red', '#ce1126', rect(0, 64, W, 6) + ' ' + rect(0, 130, W, 6)),
      R('White', '#ffffff', crescent(62, 46, 22, 18, 8) + ' ' + stars.join(' ')),
    ];
  });

  def('COD', () => [
    R('Sky Blue', '#007fff', rect(0, 0, W, H)),
    R('Yellow', '#f7d618', poly([[0, 200], [0, 144], [216, 0], [300, 0], [300, 56], [84, 200]])),
    R('Red', '#ce1021', poly([[0, 200], [0, 158], [237, 0], [300, 0], [300, 42], [63, 200]])),
    R('Yellow', '#f7d618', star(52, 44, 26, 5)),
  ]);

  // Group L ────────────────────────────────────────────────────────────
  def('ENG', () => [
    R('White', '#ffffff', rect(0, 0, W, H)),
    R('Red', '#ce1124', rect(130, 0, 40, H) + ' ' + rect(0, 80, W, 40)),
  ]);

  def('CRO', () => {
    const sq = 13;
    const checks = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if ((r + c) % 2 === 0) {
          // taper the bottom rows into the shield point
          const inset = r === 3 ? (c === 0 || c === 3 ? 1 : 0) : 0;
          if (!inset) checks.push(rect(124 + c * sq, 62 + r * sq, sq, sq));
        }
      }
    }
    return [
      R('Red', '#ff0000', rect(0, 0, W, 66.7)),
      R('White', '#ffffff', rect(0, 66.7, W, 66.7)),
      R('Blue', '#171796', rect(0, 133.4, W, 66.6)),
      R('White', '#ffffff', 'M124,62 h52 v40 a26,18 0 0 1 -26,16 a26,18 0 0 1 -26,-16 Z'),
      R('Red', '#ff0000', checks.join(' ')),
    ];
  });

  def('GHA', () => {
    const [a, b, c] = hBands(3);
    return [
      R('Red', '#ce1126', a),
      R('Yellow', '#fcd116', b),
      R('Green', '#006b3f', c),
      R('Black', '#000000', star(150, 100, 28, 5)),
    ];
  });

  def('PAN', () => [
    R('White', '#ffffff', rect(0, 0, 150, 100) + ' ' + rect(150, 100, 150, 100)),
    R('Red', '#d21034', rect(150, 0, 150, 100)),
    R('Blue', '#005293', rect(0, 100, 150, 100)),
    R('Blue', '#005293', star(75, 50, 24, 5)),
    R('Red', '#d21034', star(225, 150, 24, 5)),
  ]);

  return F;
}

export const FLAGS = buildFlags();

// ── Rendering helpers ──────────────────────────────────────────────────

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Render a flag as inline SVG markup.
 * mode 'full'    — every region in its correct colour (thumbnails, results)
 * mode 'outline' — white regions with dashed outlines (colouring start state)
 * fills          — optional {regionId: color} overrides (player progress)
 */
export function flagSVG(code, { mode = 'full', fills = {}, cls = '' } = {}) {
  const spec = FLAGS[code];
  if (!spec) return '';
  const paths = spec.regions
    .map((r) => {
      const fill = fills[r.id] ?? (mode === 'full' ? r.color : '#ffffff');
      const stroke = r.stroke && mode === 'full' ? ` stroke="${esc(r.stroke)}" stroke-width="${r.strokeWidth || 1}"` : '';
      return `<path d="${esc(r.d)}" fill="${esc(fill)}" fill-rule="evenodd"${stroke}/>`;
    })
    .join('');
  const outline =
    mode === 'outline'
      ? spec.regions
          .map((r) => `<path d="${esc(r.d)}" fill="none" fill-rule="evenodd" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>`)
          .join('')
      : '';
  return (
    `<svg class="flag-svg ${esc(cls)}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Flag">` +
    `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>` +
    paths + outline +
    `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#0f172a22" stroke-width="2" rx="2"/>` +
    `</svg>`
  );
}

/** Unique palette (colour + friendly name) for one flag. */
export function flagPalette(code) {
  const seen = new Map();
  for (const r of FLAGS[code].regions) {
    if (!seen.has(r.color)) seen.set(r.color, r.name);
  }
  return [...seen.entries()].map(([color, name]) => ({ color, name }));
}

/** A few decoy colours that are NOT in the flag, to keep kids thinking. */
const DECOYS = [
  { color: '#9333ea', name: 'Purple' },
  { color: '#f472b6', name: 'Pink' },
  { color: '#14b8a6', name: 'Teal' },
  { color: '#a16207', name: 'Brown' },
  { color: '#94a3b8', name: 'Grey' },
  { color: '#fb923c', name: 'Orange' },
];

export function paletteWithDecoys(code, rng = Math.random) {
  const real = flagPalette(code);
  const used = new Set(real.map((c) => c.color));
  const candidates = DECOYS.filter((d) => !used.has(d.color) && !real.some((r) => r.name === d.name));
  const decoys = [];
  const pool = [...candidates];
  while (decoys.length < 2 && pool.length) {
    decoys.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return [...real, ...decoys];
}
