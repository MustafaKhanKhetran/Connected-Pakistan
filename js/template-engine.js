function loadTemplate(templatePath, dataPath) {
  Promise.all([
    fetch(templatePath).then(r => r.text()),
    fetch(dataPath).then(r => r.json())
  ])
  .then(([tpl, data]) => {
    document.getElementById('content').innerHTML = render(tpl, data);
  })
  .catch(err => {
    console.error(err);
    document.getElementById('content').innerHTML = '<div class="section">Error loading content.</div>';
  });
}

function render(tpl, ctx) {
  tpl = expandEachBlocks(tpl, ctx);     // expand loops first
  tpl = expandIfBlocks(tpl, ctx);       // then conditionals
  tpl = replaceThis(tpl, ctx);
  tpl = replaceKeys(tpl, ctx);
  return tpl;
}


// --- Balanced {{#each ...}} ... {{/each}} expander ---
function expandEachBlocks(tpl, ctx) {
  const openRe = /\{\{#each\s+([\w.]+)\}\}/g;
  while (true) {
    openRe.lastIndex = 0;
    const m = openRe.exec(tpl);
    if (!m) break;

    const path = m[1];
    const startIdx = m.index;
    const openLen = m[0].length;

    const closeInfo = findMatchingEachClose(tpl, startIdx + openLen);
    if (!closeInfo) break;

    const inner = tpl.slice(startIdx + openLen, closeInfo.closeIdx);
    const arr = get(ctx, path);
    let rendered = '';

    if (Array.isArray(arr) && arr.length) {
      rendered = arr.map(item => render(inner, { ...ctx, this: item })).join('');
    }

    tpl = tpl.slice(0, startIdx) + rendered + tpl.slice(closeInfo.closeIdx + closeInfo.closeLen);
  }
  return tpl;
}

function findMatchingEachClose(tpl, from) {
  const tokenRe = /(\{\{#each\s+[\w.]+\}\}|\{\{\/each\}\})/g;
  tokenRe.lastIndex = from;
  let depth = 1, m;
  while ((m = tokenRe.exec(tpl))) {
    if (m[0].startsWith('{{#each')) depth++;
    else if (m[0] === '{{/each}}') {
      depth--;
      if (depth === 0) {
        return { closeIdx: m.index, closeLen: m[0].length };
      }
    }
  }
  return null;
}

function expandIfBlocks(tpl, ctx) {
  // Matches: {{#if path}} ... {{else}} ... {{/if}}  (else part is optional)
  const ifBlockRe = /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/;

  while (true) {
    const m = ifBlockRe.exec(tpl);
    if (!m) break;

    const path = m[1];
    const innerTrue  = m[2] || "";
    const innerFalse = m[3] || "";

    // Resolve condition: try ctx, then ctx.this
    let v = get(ctx, path);
    if (v === undefined && ctx && ctx.this) v = get(ctx.this, path);

    const truthy = !!(v && (!(Array.isArray(v)) || v.length > 0));
    const chosen = truthy ? innerTrue : innerFalse;

    const rendered = render(chosen, ctx); // recursively render chosen branch
    tpl = tpl.slice(0, m.index) + rendered + tpl.slice(m.index + m[0].length);
  }
  return tpl;
}




// --- Replacements ---
function replaceThis(tpl, ctx) {
  return tpl.replace(/\{\{\s*this(?:\.([\w.]+))?\s*\}\}/g, (_, sub) => {
    const v = sub ? get(ctx.this, sub) : ctx.this;
    return toStr(v);
  });
}

function replaceKeys(tpl, ctx) {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    let v = get(ctx, path);
    if (v === undefined && ctx && ctx.this) v = get(ctx.this, path);
    return toStr(v);
  });
}

// --- utils ---
function get(obj, path) {
  if (!obj) return undefined;
  return path.split('.').reduce((o, k) => (o != null && (k in o) ? o[k] : undefined), obj);
}
function toStr(v) {
  if (v == null) return '';
  return typeof v === 'object' ? '' : String(v);
}
