'use strict';
document.documentElement.classList.remove('no-js');

const LINKEDIN = 'https://www.linkedin.com/in/melusindoro';
const $ = id => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/* ---------- demo content: a fictional project, written to be honest about uncertainty ---------- */
const scenarios = {
  recovery: {
    label: 'Needs a closer look', title: 'Two recovery figures. One question to resolve.',
    copy: 'The investor deck uses 92% recovery. The technical report records 85% for its tested material. Before using either figure, confirm whether they describe the same ore and process.',
    evidence: [
      { label: 'Investor deck assumption', value: '92%', unit: 'recovery', source: 'Investor deck · slide 14', doc: 'deck' },
      { label: 'Technical test result', value: '85%', unit: 'recovery', source: 'Technical report · page 86', doc: 'report' }
    ],
    note: '<strong>A possible mismatch, not a verdict.</strong> Different material or processing assumptions could explain the difference.',
    action: 'Confirm the recovery basis', detail: 'Suggested owner: technical lead',
    done: 'Review assigned to the technical lead. The finding stays open until the evidence is reviewed.'
  },
  permit: {
    label: 'Evidence gap', title: 'The milestone is here. Its supporting document isn’t.',
    copy: 'The investor deck says a water-use permit is expected before the next field programme. No permit decision appears in these three example documents. The project team needs to confirm its status.',
    evidence: [
      { label: 'Planned milestone', value: 'Water use', unit: 'permit', source: 'Investor deck · slide 18', doc: 'permit-plan' },
      { label: 'Evidence in this pack', value: 'Not found', unit: 'in 3 files', source: 'Open the document index', doc: 'index' }
    ],
    note: '<strong>Missing from this pack does not mean missing in reality.</strong> Ask the project owner for the latest decision or application update.',
    action: 'Request the permit evidence', detail: 'Suggested owner: project director',
    done: 'Evidence request assigned to the project director. The permit status remains unconfirmed.'
  },
  changes: {
    label: 'Change to review', title: 'The budget moved. The source explains where.',
    copy: 'The current programme budget is US$2.4m, compared with US$2.1m in the previous column. The example workbook attributes the difference to additional testwork and an expanded drilling allowance.',
    evidence: [
      { label: 'Previous review column', value: '$2.1m', unit: 'USD', source: 'Budget · Summary!B5', doc: 'budget-old' },
      { label: 'Current review column', value: '$2.4m', unit: 'USD', source: 'Budget · Summary!C5', doc: 'budget-new' }
    ],
    note: '<strong>A US$0.3m increase in this example.</strong> Both columns use the same currency and programme scope labels. The comparison does not approve the revised budget.',
    action: 'Review the budget movement', detail: 'Suggested owner: project director',
    done: 'Budget review assigned to the project director. The previous review remains unchanged.'
  }
};
const documents = {
  deck: { filename: 'Kestrel-investor-deck.pdf', title: 'Metallurgical assumptions', date: 'Illustrative investor presentation · 18 September 2026', content: '<p>The development case assumes <mark>92% metallurgical recovery</mark>, subject to further testwork and confirmation of the process route.</p><p>Basis: management planning assumption. The source testwork and applicable ore domain are not identified on this slide.</p>', page: 'Slide 14 · Synthetic data for demonstration only' },
  report: { filename: 'Kestrel-technical-report.pdf', title: 'Bench-scale recovery testwork', date: 'Illustrative technical report · Effective 30 June 2026', content: '<p>The composite sample returned <mark>85% recovery under the tested bench-scale conditions</mark>.</p><p>Further work is required to establish whether this result represents all material domains and the proposed operating process.</p>', page: 'PDF page 86 · Printed page 78 · Synthetic data' },
  'permit-plan': { filename: 'Kestrel-investor-deck.pdf', title: 'Field programme milestones', date: 'Illustrative investor presentation · 18 September 2026', content: '<p>The next field programme is expected to begin after the <mark>water-use permit decision</mark> and mobilisation of the drilling contractor.</p><p>The decision date and reference number are not supplied in this example slide.</p>', page: 'Slide 18 · Synthetic data' },
  index: { filename: 'Example-document-index', title: 'Documents in this example pack', date: 'Three fictional source documents', content: '<p>1. Kestrel investor deck, 18 September 2026.</p><p>2. Kestrel technical report, effective 30 June 2026.</p><p>3. Kestrel programme budget, September 2026, with previous and current review columns.</p><p><mark>No standalone permit decision is included.</mark> This is an index of the example pack, not the company’s complete records.</p>', page: 'Document index · Synthetic data' },
  'budget-old': { filename: 'Kestrel-programme-budget.xlsx', title: 'Programme budget: previous review', date: 'Illustrative workbook · Summary sheet', content: '<p>Cell B5, previous review total: <mark>US$2,100,000</mark>.</p><p>Column B is the previous review snapshot. The currency is USD throughout this example.</p>', page: 'Summary!B5 · Synthetic data' },
  'budget-new': { filename: 'Kestrel-programme-budget.xlsx', title: 'Programme budget: current review', date: 'Illustrative workbook · Summary sheet', content: '<p>Cell C5, current review total: <mark>US$2,400,000</mark>.</p><p>Change note: an additional US$180,000 of metallurgical testwork and US$120,000 of drilling allowance.</p><p>Review state: proposed, pending approval.</p>', page: 'Summary!C5 and Notes!A2:A3 · Synthetic data' }
};

/* ---------- small helpers ---------- */
let toastTimer;
function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
function onScrollFrame(fn) {
  let queued = false;
  const run = () => { queued = false; fn(); };
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  request();
}

/* ---------- page load: hero settles, pins appear, thread draws ---------- */
function drawHeroThread() {
  const pins = $('hero-pins');
  pins.style.setProperty('--sky', innerWidth < 810 ? document.querySelector('.hero-content').offsetTop + 'px' : '');
  const box = pins.getBoundingClientRect();
  const centre = key => {
    const pin = document.querySelector(`.pin[data-pin="${key}"]`);
    if (!pin || getComputedStyle(pin).display === 'none') return null;
    const r = pin.querySelector('.pin-dot').getBoundingClientRect();
    return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
  };
  const a = centre('a'), b = centre('b'), c = centre('c');
  const path = $('hero-thread-path');
  if (!a || !b) { path.setAttribute('d', ''); return; }
  let d;
  if (c) {
    d = `M${a.x},${a.y} C${a.x + 120},${a.y + 8} ${c.x + 34},${c.y - 58} ${c.x},${c.y} C${c.x - 18},${c.y + 48} ${b.x + 90},${b.y - 46} ${b.x},${b.y}`;
  } else {
    d = `M${a.x},${a.y} C${a.x - 40},${a.y + 80} ${b.x + 120},${b.y - 60} ${b.x},${b.y}`;
  }
  path.setAttribute('d', d);
  path.style.setProperty('--len', Math.ceil(path.getTotalLength()) + 1);
}
function boot() {
  drawHeroThread();
  requestAnimationFrame(() => document.body.classList.add('loaded'));
}
const heroImg = document.querySelector('.hero-media img');
if (heroImg.complete) boot(); else { heroImg.addEventListener('load', boot, { once: true }); setTimeout(boot, 1600); }
let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawHeroThread, 120); });

/* ---------- reveal on scroll ---------- */
const revealer = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));

/* ---------- nav: solid once scrolled, tucks away on the way down ---------- */
const nav = $('nav');
let lastY = window.scrollY;
onScrollFrame(() => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  const menuOpen = !$('mobile-menu').hidden;
  nav.classList.toggle('hide', !menuOpen && y > 700 && y > lastY + 2);
  if (y < lastY - 2) nav.classList.remove('hide');
  lastY = y;
});
const burger = document.querySelector('.burger');
function setMenu(open) {
  $('mobile-menu').hidden = !open;
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
burger.addEventListener('click', () => setMenu($('mobile-menu').hidden));
$('mobile-menu').addEventListener('click', e => { if (e.target.closest('a,button')) setMenu(false); });

/* ---------- the thread rail: scroll progress down the page ---------- */
const rail = document.querySelector('.rail');
onScrollFrame(() => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  $('rail-fill').style.transform = `scaleY(${p})`;
  rail.classList.toggle('show', scrollY > innerHeight * 0.6);
});

/* ---------- statement: words light up as you read ---------- */
(function statement() {
  const el = $('statement-text');
  const walk = node => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) frag.append(part);
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s); }
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && !child.classList.contains('inline-img')) walk(child);
    }
  };
  walk(el);
  const items = [...el.querySelectorAll('.w, .inline-img')];
  if (reduceMotion.matches) { items.forEach(i => i.classList.add('on')); return; }
  onScrollFrame(() => {
    const r = el.getBoundingClientRect();
    const start = innerHeight * 0.85, end = innerHeight * 0.3;
    const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.6)));
    const lit = Math.round(p * items.length);
    items.forEach((w, i) => w.classList.toggle('on', i < lit));
  });
})();

/* ---------- how it works: sticky stage follows the active step ---------- */
const steps = [...document.querySelectorAll('.step')];
const visuals = [...document.querySelectorAll('.stage .visual')];
steps.forEach((step, i) => {
  const holder = document.createElement('div');
  holder.className = 'step-visual';
  holder.setAttribute('aria-hidden', 'true');
  holder.append(visuals[i].cloneNode(true));
  step.append(holder);
});
function activateStep(i) {
  steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
  visuals.forEach((v, k) => v.classList.toggle('is-active', k === i));
}
activateStep(0);
function initStepObserver() {
  const stepObserver = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) activateStep(Number(e.target.dataset.step));
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => stepObserver.observe(s));
}

/* ---------- demo workbench ---------- */
let current = 'recovery';
const reviewed = new Set();
function renderScenario(key, animate) {
  current = key;
  const s = scenarios[key];
  document.querySelectorAll('[data-scenario]').forEach(b => {
    const on = b.dataset.scenario === key;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
    b.id = 'question-' + b.dataset.scenario;
    b.setAttribute('aria-controls', 'scenario-answer');
  });
  document.querySelector('.answer').id = 'scenario-answer';
  document.querySelector('.answer').setAttribute('aria-labelledby', 'question-' + key);
  $('finding-label').textContent = s.label;
  $('finding-position').textContent = `Finding ${Object.keys(scenarios).indexOf(key) + 1} of 3`;
  $('answer-title').textContent = s.title;
  $('answer-copy').textContent = s.copy;
  $('answer-note').innerHTML = s.note;
  $('action-title').textContent = s.action;
  $('action-detail').textContent = s.detail;
  $('evidence-grid').innerHTML = s.evidence.map(e => `<button class="ev" type="button" data-doc="${e.doc}"><span class="ev-label">${esc(e.label)}</span><span class="ev-value">${esc(e.value)}<small>${esc(e.unit)}</small></span><span class="ev-source">${esc(e.source)}<span aria-hidden="true">Open ↗</span></span></button>`).join('');
  const done = reviewed.has(key);
  const btn = $('review-button');
  btn.disabled = done;
  btn.innerHTML = done ? 'Review assigned' : 'Assign a review<span class="btn-arrow" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg></span>';
  $('review-confirmation').textContent = done ? s.done : '';
  if (animate && !reduceMotion.matches) {
    const answer = document.querySelector('.answer');
    answer.classList.remove('swap');
    void answer.offsetWidth;
    answer.classList.add('swap');
  }
}
document.querySelectorAll('[data-scenario]').forEach(b => b.addEventListener('click', () => renderScenario(b.dataset.scenario, true)));
document.querySelector('.questions').addEventListener('keydown', e => {
  if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  e.preventDefault();
  const keys = Object.keys(scenarios);
  const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
  const next = keys[(keys.indexOf(current) + dir + keys.length) % keys.length];
  renderScenario(next, true);
  document.querySelector(`[data-scenario="${next}"]`).focus();
});
$('evidence-grid').addEventListener('click', e => {
  const b = e.target.closest('[data-doc]');
  if (!b) return;
  const d = documents[b.dataset.doc];
  $('source-filename').textContent = d.filename;
  $('source-heading').textContent = d.title;
  $('source-date').textContent = d.date;
  $('source-content').innerHTML = d.content;
  $('source-page').textContent = d.page;
  $('source-dialog').showModal();
});
$('review-button').addEventListener('click', () => {
  reviewed.add(current);
  renderScenario(current);
  toast('Review assigned in the demo. Nothing was sent.');
});
$('reset-demo').addEventListener('click', () => {
  reviewed.clear();
  renderScenario('recovery', true);
  toast('The fictional project has been reset.');
});
$('download-example').addEventListener('click', () => {
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Orethread · fictional diligence example</title><style>body{font:16px/1.7 system-ui,sans-serif;max-width:760px;margin:48px auto;padding:0 20px;color:#0b0a09;background:#f7f4ef}h1,h2,h3{line-height:1.15;letter-spacing:-.02em}article{margin:36px 0;padding:24px;border:1px solid #ddd5c8;border-radius:16px;background:#fff}mark{background:#f3d5c2}small{display:block;color:#6a645a;font-family:ui-monospace,monospace}</style><h1>Kestrel Copper · illustrative review</h1><p>Fictional data. This is a product demonstration, not an assessment of a real mining project.</p>${Object.values(scenarios).map(s => `<article><h2>${esc(s.title)}</h2><p>${esc(s.copy)}</p>${s.evidence.map(e => `<p><strong>${esc(e.value)} ${esc(e.unit)}</strong><small>${esc(e.source)}</small></p>`).join('')}<p>${s.note}</p><p>Next action: ${esc(s.action)}. ${esc(s.detail)}.</p></article>`).join('')}<h2>Source excerpts</h2>${Object.values(documents).map(d => `<article><h3>${esc(d.title)}</h3><small>${esc(d.filename)} · ${esc(d.page)}</small>${d.content}</article>`).join('')}<p><small>Created from the Orethread interactive demo.</small></p></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orethread-fictional-diligence-example.html';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Your fictional example is downloading.');
});
renderScenario('recovery');

/* ---------- moments accordion ---------- */
document.querySelectorAll('.moment-head').forEach(head => head.addEventListener('click', () => {
  const item = head.closest('.moment');
  const open = !item.classList.contains('is-open');
  document.querySelectorAll('.moment').forEach(m => {
    const on = m === item && open;
    m.classList.toggle('is-open', on);
    m.querySelector('.moment-head').setAttribute('aria-expanded', String(on));
  });
}));

/* ---------- dialogs ---------- */
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => $(b.dataset.close).close()));
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => {
  if (e.target !== d) return;
  const r = d.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
}));

/* ---------- enquiry: prepares a note for LinkedIn, sends nothing ---------- */
const topics = {
  pilot: { heading: 'What are you working on?', org: 'Company and project', message: 'What decision is coming up, and when?' },
  seat: { heading: 'Build Orethread with us.', org: 'A link to your work (GitHub, portfolio or LinkedIn)', message: 'What have you built, and which seat interests you?' },
  other: { heading: 'How can we help?', org: 'Company or organisation', message: 'Your message' }
};
const seatNames = { ai: 'AI & document engineer', product: 'Product engineer', mining: 'Mining technologist' };
let topic = 'pilot', seat = '';
function setTopic(next) {
  topic = next;
  document.querySelectorAll('[data-topic]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.topic === next)));
  $('enquiry-heading').textContent = topics[next].heading;
  $('org-label').textContent = topics[next].org;
  $('message-label').textContent = topics[next].message;
}
document.querySelectorAll('[data-topic]').forEach(b => b.addEventListener('click', () => { seat = ''; setTopic(b.dataset.topic); }));
document.querySelectorAll('[data-enquire]').forEach(b => b.addEventListener('click', () => {
  const kind = b.dataset.enquire;
  seat = seatNames[kind] || '';
  setTopic(seat ? 'seat' : 'pilot');
  $('enquiry-form').reset();
  $('enquiry-form').querySelectorAll('[aria-invalid]').forEach(f => f.removeAttribute('aria-invalid'));
  $('enquiry-form').hidden = false;
  $('enquiry-done').hidden = true;
  $('enquiry-dialog').showModal();
}));
$('enquiry-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.currentTarget;
  let firstBad = null;
  for (const field of form.querySelectorAll('input, textarea')) {
    const bad = !field.value.trim();
    field.toggleAttribute('aria-invalid', bad);
    if (bad) field.setAttribute('aria-invalid', 'true');
    if (bad && !firstBad) firstBad = field;
  }
  if (firstBad) { firstBad.focus(); toast('Please fill in each field.'); return; }
  const f = new FormData(form);
  const name = String(f.get('name')).trim();
  const subject = topic === 'pilot' ? 'a pilot for one of our projects' : topic === 'seat' ? `the ${seat || 'founding'} seat at Orethread` : 'Orethread';
  const orgLine = topic === 'seat' ? 'My work' : 'Organisation';
  const note = `Hi Melusi,\n\nI’d like to talk about ${subject}.\n\n${orgLine}: ${String(f.get('org')).trim()}\n\n${String(f.get('message')).trim()}\n\nThanks,\n${name}`;
  const box = $('prepared-message');
  box.value = note;
  form.hidden = true;
  $('enquiry-done').hidden = false;
  box.focus();
  box.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
  if (navigator.clipboard) navigator.clipboard.writeText(note).catch(() => {});
  window.open(LINKEDIN, '_blank', 'noopener');
  toast(copied ? 'Copied. Paste it into a LinkedIn message.' : 'Your note is ready to copy below.');
});

/* ---------- drill core band: one copy of the strip makes the loop seamless ---------- */
const coreTrack = $('core-track');
[...coreTrack.children].forEach(piece => {
  const copy = piece.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  coreTrack.append(copy);
});

$('pause-core').addEventListener('click', e => {
  const paused = document.querySelector('.core').classList.toggle('is-paused');
  e.currentTarget.setAttribute('aria-pressed', String(paused));
  e.currentTarget.textContent = paused ? 'Resume motion' : 'Pause motion';
});
/* ---------- start step tracking last, after the clones exist ---------- */
initStepObserver();
