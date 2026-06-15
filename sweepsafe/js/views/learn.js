import { html, raw } from '../ui.js';

const ARTICLES = [
  { q: 'Where are hidden cameras usually placed?', a: 'Anywhere with a clear line of sight to a bed, sofa, shower or toilet: smoke/CO detectors, alarm clocks, USB chargers and power strips, Wi-Fi routers, speakers, air purifiers, tissue boxes, wall clocks, picture frames, fake plants, vents and clothing hooks. Detectors mounted on a wall (aimed at the bed) rather than the ceiling centre are a classic giveaway.' },
  { q: 'How do the lens & IR scans actually work?', a: 'Camera lenses are retro-reflective — they bounce light straight back, so a moving light source makes a pinhole sparkle (the "glint"). Night-vision cameras use infrared LEDs that are invisible to your eye but show up as faint purple/white dots through a phone camera in the dark. Both are real, established techniques — but they require patience and a dark room.' },
  { q: 'Can a phone detect "bugs" / radio transmitters?', a: 'No. Real RF detection needs dedicated radio hardware your phone does not have. Any app claiming over-the-air "RF/bug detection" on a stock phone is misleading. SweepSafe deliberately omits it. What a phone CAN do: camera-lens/IR detection, magnetic-field anomalies, and Bluetooth tracker scanning.' },
  { q: 'How do I find an unwanted tracker (AirTag/Tile)?', a: 'Trackers broadcast over Bluetooth. The Tracker Radar lists nearby tags and shows signal strength so you can "warmer/colder" your way to one. iPhones (iOS 17.5+) also alert you to unknown trackers automatically. If you find one moving with you, do not assume it is harmless — document it and contact authorities.' },
  { q: 'What should I do if I find a device?', a: 'Do not dismantle it (preserve evidence). Photograph it and what it points at, block the lens to regain privacy, then report to local police and the booking platform — covert recording in private spaces is illegal almost everywhere. If you feel unsafe, leave first. See the "I Think I Found Something" sweep.' },
  { q: 'Is using this app legal?', a: 'Detecting devices to protect your own privacy in a space you are occupying is legal and reasonable. This app is for personal safety and counter-surveillance — not for surveilling others.' },
];

export function render(root) {
  root.innerHTML = html`
    <header class="page-head"><h1>Learn</h1><p>Straight answers on covert devices and what really works.</p></header>
    ${raw(ARTICLES.map((x) => html`
      <details class="card">
        <summary style="cursor:pointer;font-weight:700;font-size:1.02rem;list-style:none">${x.q}</summary>
        <p class="muted" style="margin:10px 0 0;line-height:1.55">${x.a}</p>
      </details>`).join(''))}
    <div class="notice" style="margin-top:16px">SweepSafe helps you check a space, but no tool can guarantee a room is clean. Treat results as signals, combine them with the guided sweep, and trust your instincts.</div>
  `;
}
