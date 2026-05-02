/**
 * Generate 8 demo artwork images using Playwright + HTML Canvas 2D
 * Each artwork gets its own browser context to avoid canvas tainting.
 */
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

const playwrightPath = path.resolve(__dirname, '../node_modules/.pnpm/@playwright+test@1.59.1/node_modules/playwright');
const requirePlaywright = createRequire(playwrightPath + '/package.json');
const { chromium } = requirePlaywright('playwright');

const OUTPUT_DIR = path.resolve(__dirname, '../apps/web/public/demo/artworks');
const SIZE = 1024;

const artworks = [
  {
    id: 'mira-volk-berlin-abstract',
    name: 'Mira Volk',
    title: 'Chromatic Drift',
    drawFn: /* javascript */ `
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(0, 0, W, H);
      function noise(x, y, t) {
        return Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t * 0.7) *
               Math.sin((x + y) * 0.005 + t * 1.3);
      }
      for (let i = 0; i < 400; i++) {
        let x = Math.random() * W, y = Math.random() * H;
        const hue = (200 + i * 0.5 + Math.random() * 60) % 360;
        ctx.strokeStyle = \`hsla(\${hue}, 70%, 60%, 0.15)\`;
        ctx.lineWidth = 1 + Math.random() * 3;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let s = 0; s < 60; s++) {
          const angle = noise(x, y, i * 0.1) * Math.PI * 4;
          x += Math.cos(angle) * 3; y += Math.sin(angle) * 3;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let i = 0; i < 20; i++) {
        const hue = Math.random() > 0.5 ? 340 : 45;
        ctx.strokeStyle = \`hsla(\${hue}, 80%, 55%, 0.6)\`;
        ctx.lineWidth = 4 + Math.random() * 8;
        ctx.beginPath();
        ctx.moveTo(Math.random() * W, Math.random() * H);
        ctx.bezierCurveTo(Math.random() * W, Math.random() * H, Math.random() * W, Math.random() * H, Math.random() * W, Math.random() * H);
        ctx.stroke();
      }
    `
  },
  {
    id: 'kenji-aoki-tokyo-cyberpunk',
    name: 'Kenji Aoki',
    title: 'Neon Rain',
    drawFn: /* javascript */ `
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 30; i++) {
        const y = H * 0.3 + i * i * 0.8;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let i = -20; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(W/2 + i * 30, H * 0.3);
        ctx.lineTo(W/2 + i * 120, H);
        ctx.stroke();
      }
      const neons = ['#ff00aa', '#00ffcc', '#ff4400', '#aa00ff', '#00ff66'];
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * W, y = Math.random() * H * 0.7 + H * 0.1;
        const color = neons[Math.floor(Math.random() * neons.length)];
        const r = 2 + Math.random() * 6;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r + 15);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, r + 15, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        ctx.strokeStyle = \`rgba(100, 200, 255, \${0.1 + Math.random() * 0.2})\`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 30); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255, 0, 170, 0.08)';
      ctx.fillRect(W * 0.15, H * 0.2, W * 0.7, H * 0.6);
      ctx.strokeStyle = 'rgba(255, 0, 170, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(W * 0.15, H * 0.2, W * 0.7, H * 0.6);
    `
  },
  {
    id: 'helena-moraes-glitch',
    name: 'Helena Moraes',
    title: 'Data Corruption #7',
    drawFn: /* javascript */ `
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);
      const colors = ['#ff0044', '#00ff88', '#0088ff', '#ffaa00'];
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(Math.random() * W, Math.random() * H, 20 + Math.random() * 200, 5 + Math.random() * 40);
      }
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = \`rgba(0, 0, 0, \${0.3 + Math.random() * 0.3})\`;
        ctx.fillRect(0, y, W, 1);
      }
      // Glitch blocks (no drawImage — draw fresh rectangles instead)
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * W * 0.8;
        const y = Math.random() * H * 0.8;
        const w = 30 + Math.random() * 150;
        const h = 5 + Math.random() * 20;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 50, w, h);
      }
      // Noise pixels via small rects
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
        ctx.fillRect(x, y, 2, 2);
      }
    `
  },
  {
    id: 'theo-karagiannis-mediterranean',
    name: 'Theo Karagiannis',
    title: 'Aegean Tomorrow',
    drawFn: /* javascript */ `
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#001a33');
      grad.addColorStop(0.5, '#004080');
      grad.addColorStop(1, '#0066aa');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      for (let i = 0; i < 12; i++) {
        const x = W * 0.1 + Math.random() * W * 0.8;
        const y = H * 0.3 + Math.random() * H * 0.5;
        const w = 40 + Math.random() * 120;
        const h = 30 + Math.random() * 80;
        ctx.fillRect(x, y, w, h);
        ctx.beginPath(); ctx.arc(x + w/2, y, w/2, Math.PI, 0); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, H * 0.65);
      for (let x = 0; x <= W; x += 10) {
        ctx.lineTo(x, H * 0.65 + Math.sin(x * 0.01) * 20);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 20; i++) {
        const y = H * 0.65 + i * 20;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      const sunGrad = ctx.createRadialGradient(W*0.7, H*0.3, 0, W*0.7, H*0.3, 150);
      sunGrad.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
      sunGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(W*0.7 - 150, H*0.3 - 150, 300, 300);
    `
  },
  {
    id: 'sasha-wren-dark-surreal',
    name: 'Sasha Wren',
    title: 'The Hollow Between',
    drawFn: /* javascript */ `
      ctx.fillStyle = '#080510';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 30; i++) {
        const x = W/2 + (Math.random() - 0.5) * W * 0.8;
        const y = H/2 + (Math.random() - 0.5) * H * 0.8;
        const r = 20 + Math.random() * 100;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, \`rgba(60, 30, 80, \${0.1 + Math.random() * 0.3})\`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      const ex = W * 0.5, ey = H * 0.45;
      const eyeGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 120);
      eyeGrad.addColorStop(0, 'rgba(200, 180, 255, 0.3)');
      eyeGrad.addColorStop(0.5, 'rgba(100, 50, 150, 0.2)');
      eyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = eyeGrad;
      ctx.beginPath(); ctx.ellipse(ex, ey, 120, 80, 0, 0, Math.PI * 2); ctx.fill();
      const shaftGrad = ctx.createLinearGradient(W*0.35, 0, W*0.65, H);
      shaftGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shaftGrad.addColorStop(0.5, 'rgba(150, 100, 200, 0.08)');
      shaftGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shaftGrad;
      ctx.fillRect(W*0.35, 0, W*0.3, H);
      ctx.fillStyle = 'rgba(200, 200, 220, 0.15)';
      ctx.beginPath(); ctx.arc(W * 0.8, H * 0.2, 40, 0, Math.PI * 2); ctx.fill();
    `
  },
  {
    id: 'lior-k-minimal-techno',
    name: 'Lior K.',
    title: 'Pulse 4/4',
    drawFn: /* javascript */ `
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      const spacing = 64;
      for (let x = spacing; x < W; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = spacing; y < H; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let i = 0; i < 20; i++) {
        const size = 50 + i * 25;
        const alpha = 0.4 - i * 0.015;
        ctx.strokeStyle = \`rgba(255, 255, 255, \${Math.max(0, alpha)})\`;
        ctx.lineWidth = 1;
        ctx.strokeRect(W/2 - size/2, H/2 - size/2, size, size);
      }
      for (let x = spacing; x < W; x += spacing * 2) {
        for (let y = spacing; y < H; y += spacing * 2) {
          const dist = Math.sqrt((x - W/2)**2 + (y - H/2)**2);
          const alpha = Math.max(0, 0.8 - dist / 400);
          ctx.fillStyle = \`rgba(255, 255, 255, \${alpha})\`;
          ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.strokeStyle = 'rgba(255, 50, 50, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, H * 0.75); ctx.lineTo(W, H * 0.75); ctx.stroke();
    `
  },
  {
    id: 'nightform-ambient',
    name: 'Nightform',
    title: 'Dew Point',
    drawFn: /* javascript */ `
      const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.7);
      grad.addColorStop(0, '#1a2a3a');
      grad.addColorStop(0.5, '#0d1b2a');
      grad.addColorStop(1, '#050a10');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 15; i++) {
        const hue = 160 + Math.random() * 80;
        ctx.fillStyle = \`hsla(\${hue}, 50%, 40%, 0.1)\`;
        ctx.beginPath();
        let x = Math.random() * W, y = Math.random() * H;
        ctx.moveTo(x, y);
        for (let s = 0; s < 8; s++) {
          x += (Math.random() - 0.5) * 200; y += (Math.random() - 0.5) * 200;
          ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 100, x, y);
        }
        ctx.fill();
      }
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        const r = 2 + Math.random() * 8;
        const orbGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        orbGrad.addColorStop(0, 'rgba(180, 230, 255, 0.6)');
        orbGrad.addColorStop(1, 'rgba(180, 230, 255, 0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 10; i++) {
        const yBase = H * 0.3 + i * 40;
        ctx.strokeStyle = \`rgba(150, 220, 255, \${0.05 + Math.random() * 0.1})\`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 5) {
          const y = yBase + Math.sin(x * 0.01 + i) * 30 + Math.sin(x * 0.003) * 50;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    `
  },
  {
    id: 'velvetrace-house',
    name: 'Velvetrace',
    title: 'Golden Hour Rewind',
    drawFn: /* javascript */ `
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#ff6b35');
      grad.addColorStop(0.3, '#f7931e');
      grad.addColorStop(0.6, '#ffcc00');
      grad.addColorStop(1, '#ff0066');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      const sunGrad = ctx.createRadialGradient(W*0.5, H*0.55, 0, W*0.5, H*0.55, 200);
      sunGrad.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
      sunGrad.addColorStop(0.5, 'rgba(255, 200, 100, 0.5)');
      sunGrad.addColorStop(1, 'rgba(255, 100, 50, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        const y = H * 0.5 + i * i * 1.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let i = -15; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(W/2 + i * 40, H * 0.5);
        ctx.lineTo(W/2 + i * 150, H);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      for (let r = 100; r < 350; r += 8) {
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(W * 0.75, H * 0.3, r, 0, Math.PI * 2); ctx.stroke();
      }
      const shapes = ['#ff0066', '#00ffcc', '#ffcc00', '#ffffff'];
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = shapes[Math.floor(Math.random() * shapes.length)];
        ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        const x = Math.random() * W, y = Math.random() * H * 0.5;
        const s = 10 + Math.random() * 30;
        if (Math.random() > 0.5) ctx.fillRect(x, y, s, s);
        else { ctx.beginPath(); ctx.arc(x, y, s/2, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    `
  }
];

async function generate() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const art of artworks) {
    console.log(`Generating: ${art.id} (${art.name} — ${art.title})`);

    // Fresh context per artwork to avoid canvas tainting
    const context = await browser.newContext({ viewport: { width: SIZE, height: SIZE } });
    const page = await context.newPage();

    await page.setContent(/* html */ `
      <!DOCTYPE html>
      <html><head><style>body{margin:0;background:#000;}</style></head>
      <body><canvas id="c" width="${SIZE}" height="${SIZE}"></canvas>
      <script>
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const W = ${SIZE}, H = ${SIZE};
        ${art.drawFn}
        window.__done = true;
      </script></body></html>
    `);

    await page.waitForFunction(() => window.__done === true, { timeout: 5000 });
    await page.waitForTimeout(100); // extra render tick

    const canvas = await page.$('#c');
    await canvas.screenshot({
      path: path.join(OUTPUT_DIR, `${art.id}.png`),
      type: 'png'
    });

    await context.close();
    console.log(`  ✓ Saved: ${art.id}.png`);
  }

  await browser.close();
  console.log(`\nAll ${artworks.length} artworks generated in: ${OUTPUT_DIR}`);
}

generate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
