/**
 * Guided counter-surveillance sweeps. This is the highest-value, 100%-reliable
 * part of the app — a methodical checklist of where covert devices hide and how
 * to check, written for non-experts (Airbnb / hotel / rental scenarios).
 */

export const SWEEPS = [
  {
    id: 'arrival',
    title: 'Quick Arrival Sweep',
    minutes: 5,
    blurb: 'The 5-minute check to do the moment you walk in.',
    icon: '🚪',
    steps: [
      { id: 'wifi', title: 'List the Wi-Fi devices', body: 'Open the Network scan. Unfamiliar “camera”, “IPC”, “cam”, or unknown-brand devices on the network are a red flag.' },
      { id: 'lights', title: 'Kill the lights, scan for IR', body: 'Turn the room dark and use the IR/Lens scanner. Hidden cameras with night vision glow as small purple/white dots through your phone camera.' },
      { id: 'glint', title: 'Look for lens glints', body: 'Slowly pan the Lens scanner across the room. A pinhole lens reflects light back as a tiny bright sparkle — check smoke detectors, alarm clocks, vents, chargers, picture frames.' },
      { id: 'usual', title: 'Eyeball the “line of sight” spots', body: 'Anything aimed at the bed, shower or sofa: smoke detectors, USB chargers, clocks, speakers, air purifiers, tissue boxes, hooks.' },
      { id: 'trackers', title: 'Scan for trackers', body: 'Run the Tracker radar to catch AirTags / Tile / SmartTags that may have been slipped into a bag or the room.' },
    ],
  },
  {
    id: 'bedroom',
    title: 'Bedroom & Bathroom Deep Sweep',
    minutes: 15,
    blurb: 'The high-risk rooms — be thorough here.',
    icon: '🛏️',
    steps: [
      { id: 'smoke', title: 'Smoke & CO detectors', body: 'The #1 hiding spot. A detector pointed at the bed (not the ceiling center) or with a pinhole is suspicious. Check with the Lens scanner up close.' },
      { id: 'electronics', title: 'Powered electronics near the bed', body: 'Alarm clocks, chargers, speakers, routers, air fresheners. Devices that are warm or always plugged in deserve a magnetometer + lens check.' },
      { id: 'mirrors', title: 'Two-way mirror check', body: 'In a dark room, shine a light at the mirror. If you can see through to a space behind it, or your fingertip touches its reflection with no gap, treat it as suspect.' },
      { id: 'vents', title: 'Vents, shelves & décor', body: 'Air vents, fake plants, picture frames, wall clocks and shelf trinkets with a clear line of sight to the bed.' },
      { id: 'bathroom', title: 'Bathroom fixtures', body: 'Shampoo bottles, hooks, toothbrush holders, extractor fans, and the underside of shelves facing the shower/toilet.' },
      { id: 'mag', title: 'Magnetometer pass', body: 'Sweep the Magnetometer slowly over suspicious objects. A sharp spike near a small object that “shouldn’t” contain electronics is worth a closer look.' },
    ],
  },
  {
    id: 'found',
    title: 'I Think I Found Something',
    minutes: 3,
    blurb: 'What to do if you find a device. Read before you touch anything.',
    icon: '🚨',
    danger: true,
    steps: [
      { id: 'dont', title: 'Do NOT unplug or dismantle it yet', body: 'Tampering can destroy evidence and may escalate the situation. Document first.' },
      { id: 'photo', title: 'Photograph it in place', body: 'Take clear photos/video of the device, its location and what it points at. Note the time.' },
      { id: 'cover', title: 'Block it for now', body: 'Cover the lens (tape, a towel, or unplug only if you feel unsafe) so you regain privacy while you act.' },
      { id: 'report', title: 'Report it', body: 'Contact local police (non-emergency) and the platform (Airbnb/hotel) — covert recording in private spaces is illegal in most places. Keep your evidence.' },
      { id: 'leave', title: 'Prioritise your safety', body: 'If you feel unsafe, leave and call for help. A booking is replaceable; your safety is not.' },
    ],
  },
];

export const SWEEP_BY_ID = Object.fromEntries(SWEEPS.map((s) => [s.id, s]));
export function totalSteps(sweepId) { return SWEEP_BY_ID[sweepId]?.steps.length ?? 0; }
