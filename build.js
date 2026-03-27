#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Read CSS and JS
const css = fs.readFileSync('styles.css', 'utf8');
const js = fs.readFileSync('script.js', 'utf8');

// Read and assemble slides
const slidesHtml = config.slides.map((file, i) => {
  let html = fs.readFileSync(file, 'utf8');
  // Only first slide gets "active" class
  if (i === 0) {
    html = html.replace('class="slide ', 'class="slide active ');
  }
  return html;
}).join('\n');

// Read intro overlay
const intro = fs.readFileSync('shell/intro.html', 'utf8');

// Read prompt bar
const promptBar = fs.readFileSync('shell/prompt-bar.html', 'utf8');

// Build prompts array for JS
const promptsJson = JSON.stringify(config.prompts);

// Assemble full HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${config.title}</title>
<style>
${css}
</style>
</head>
<body>

${intro}

<!-- Top Bar -->
<div class="topbar">
  <div class="topbar-brand">
    <div class="topbar-logo"><img src="${config.logo}" alt="T1" /></div>
    <div class="topbar-title">${config.topbarTitle}</div>
  </div>
  <div class="topbar-nav">
    <a href="claude-code-presentation.pdf" download class="download-btn" title="Download PDF">&#8595; PDF</a>
    <button id="prevBtn" onclick="navigate(-1)" disabled>&#8592;</button>
    <span class="slide-counter" id="counter">1 / ${config.slides.length}</span>
    <button id="nextBtn" onclick="navigate(1)">&#8594;</button>
  </div>
</div>

<div class="layout">
  <div class="sidebar" id="sidebar"></div>
  <div class="main"><div class="slide-viewport">

${slidesHtml}

  </div></div>
</div>

${promptBar}

<script>
// Injected from config.json
const PROMPTS = ${promptsJson};
${js}
</script>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('Built index.html (' + config.slides.length + ' slides, ' + Math.round(html.length / 1024) + 'kb)');
