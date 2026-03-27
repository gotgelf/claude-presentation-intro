#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const slideCount = config.slides.length;
const htmlPath = 'file://' + path.resolve('index.html');
const outPath = path.resolve('claude-code-presentation.pdf');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Load page and dismiss intro
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const intro = document.getElementById('introOverlay');
    if (intro) intro.classList.add('hidden');
  });
  await new Promise(r => setTimeout(r, 500));

  const slides = [];

  for (let i = 0; i < slideCount; i++) {
    // Navigate to slide
    await page.evaluate((idx) => { goTo(idx); }, i);
    await new Promise(r => setTimeout(r, 300));

    // Screenshot each slide
    const screenshot = await page.screenshot({ type: 'png', fullPage: false });
    slides.push(screenshot);
    console.log('Captured slide ' + (i + 1) + '/' + slideCount);
  }

  // Create a single-page-per-slide PDF
  // We'll create a temporary HTML with all screenshots as full-page images
  const imagesHtml = slides.map((buf, i) => {
    const b64 = buf.toString('base64');
    return '<div style="page-break-after:always;page-break-inside:avoid;margin:0;padding:0;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:#F7F7EF"><img src="data:image/png;base64,' + b64 + '" style="max-width:100%;max-height:100%;object-fit:contain"/></div>';
  }).join('\n');

  const pdfHtml = '<!DOCTYPE html><html><head><style>*{margin:0;padding:0}body{background:#F7F7EF}@page{size:1440px 900px;margin:0}</style></head><body>' + imagesHtml + '</body></html>';

  await page.setContent(pdfHtml, { waitUntil: 'domcontentloaded', timeout: 120000 });

  await page.pdf({
    path: outPath,
    width: '1440px',
    height: '900px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log('PDF saved to ' + outPath);
})();
