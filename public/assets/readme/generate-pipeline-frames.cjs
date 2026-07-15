const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const stages = [
  { n: 1, label: 'Idea', sub: 'Strategist' },
  { n: 2, label: 'Interview', sub: "Richard's take" },
  { n: 3, label: 'Research', sub: 'Sources' },
  { n: 4, label: 'Write', sub: 'MDX draft' },
  { n: 5, label: 'Images', sub: 'Hero + inline' },
  { n: 6, label: 'SEO', sub: 'Review' },
  { n: 7, label: 'Proofread', sub: 'Tone, grammar' },
  { n: 8, label: 'Publish', sub: 'Draft PR' },
  { n: 9, label: 'Merge', sub: 'Richard' },
];

const xStart = 90;
const xStep = (1106 - 90) / 8;
const y = 170;

function nodeSvg(stage, i, state) {
  // state: 'pending' | 'active' | 'done'
  const x = xStart + i * xStep;
  const circleFill = state === 'pending' ? '#252836' : 'url(#node)';
  const circleStroke = state === 'pending' ? '#2E3147' : 'none';
  const strokeWidth = state === 'pending' ? '2' : '0';
  const labelFill = state === 'pending' ? '#475569' : '#F1F5F9';
  const subFill = state === 'pending' ? '#334155' : '#64748B';
  const numFill = state === 'pending' ? '#64748B' : '#0F1117';
  const glow = state === 'active' ? `<circle cx="${x}" cy="${y}" r="34" fill="none" stroke="#38BDF8" stroke-width="2" opacity="0.5"><animate attributeName="r" values="26;36;26" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0;0.6" dur="1.2s" repeatCount="indefinite"/></circle>` : '';
  return `
    ${glow}
    <circle cx="${x}" cy="${y}" r="24" fill="${circleFill}" stroke="${circleStroke}" stroke-width="${strokeWidth}"/>
    <text x="${x}" y="${y + 5}" text-anchor="middle" font-family="'DejaVu Sans Mono', monospace" font-size="13" font-weight="700" fill="${numFill}">${stage.n}</text>
    <text x="${x}" y="${y + 52}" text-anchor="middle" font-family="'DejaVu Sans', Arial, sans-serif" font-size="15" font-weight="700" fill="${labelFill}">${stage.label}</text>
    <text x="${x}" y="${y + 70}" text-anchor="middle" font-family="'DejaVu Sans', Arial, sans-serif" font-size="11" fill="${subFill}">${stage.sub}</text>`;
}

function lineSegment(i, litUpTo) {
  const x1 = xStart + i * xStep;
  const x2 = xStart + (i + 1) * xStep;
  const lit = i < litUpTo;
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${lit ? '#2DD4BF' : '#2E3147'}" stroke-width="2"/>`;
}

function buildFrame(activeIndex) {
  // activeIndex: -1 = all pending (start), 0..8 = that stage active, 9 = all done (hold)
  let nodes = '';
  let lines = '';
  for (let i = 0; i < 9; i++) {
    let state;
    if (activeIndex === 9) state = 'done';
    else if (i < activeIndex) state = 'done';
    else if (i === activeIndex) state = 'active';
    else state = 'pending';
    nodes += nodeSvg(stages[i], i, state);
  }
  const litUpTo = activeIndex === 9 ? 9 : Math.max(activeIndex, 0);
  for (let i = 0; i < 8; i++) {
    lines += lineSegment(i, litUpTo);
  }

  return `<svg viewBox="0 0 1200 340" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F1117"/>
      <stop offset="100%" stop-color="#1A1D27"/>
    </linearGradient>
    <linearGradient id="node" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2DD4BF"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="340" fill="url(#bg)"/>
  <text x="600" y="42" text-anchor="middle" font-family="'DejaVu Sans', Arial, sans-serif" font-size="20" font-weight="700" fill="#94A3B8" letter-spacing="1">CONTENT PIPELINE</text>
  ${lines}
  ${nodes}
  <text x="600" y="305" text-anchor="middle" font-family="'DejaVu Sans', Arial, sans-serif" font-size="12" fill="#64748B">No single agent both writes and approves its own work</text>
</svg>`;
}

async function main() {
  const outDir = path.join(__dirname, 'frames');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  // sequence: pending start (held x2), then each stage active (x2 each for pacing), then all-done hold (x4)
  const sequence = [
    -1, -1,
    0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8,
    9, 9, 9, 9,
  ];

  for (let f = 0; f < sequence.length; f++) {
    const svg = buildFrame(sequence[f]);
    const frameNum = String(f).padStart(2, '0');
    await sharp(Buffer.from(svg)).resize(1200, 340).png().toFile(path.join(outDir, `frame-${frameNum}.png`));
  }
  console.log('Generated', sequence.length, 'frames in', outDir);
}

main().catch(err => { console.error(err); process.exit(1); });
