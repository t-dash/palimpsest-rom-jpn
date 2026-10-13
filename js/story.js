// Home screen + scrolling story: builds the cards from data/eras.json,
// drives the globe on scroll, and handles the Romania/Japan switch.
(async function () {
  const COLOR = { romania: '#6fa8dc', japan: '#c23b22', source: '#f0c040' };
  const DEST = { romania: 'Romania', japan: 'Japan' };
  const SIDE_LABEL = { romania: 'Romania', japan: 'Japan' };

  const [data, topo] = await Promise.all([
    fetch('data/eras.json').then(r => r.json()),
    Globe.loadTopology(),
  ]);

  const story = document.getElementById('story');
  const stepsEl = document.getElementById('steps');
  const timelineEl = document.getElementById('timeline');
  const toggle = document.getElementById('side-toggle');
  const toggleLabel = document.getElementById('side-toggle-label');
  const periodEl = document.getElementById('era-period');
  const layerEl = document.getElementById('era-layer');

  const hero = new Globe(document.getElementById('hero-globe'), topo, {
    idle: true, draggable: true, groups: data.groups, ariaLabel: 'Idle rotating globe',
  });
  hero.view.center = [60, 18];

  const globe = new Globe(document.getElementById('story-globe'), topo, {
    groups: data.groups, ariaLabel: 'Globe showing where each era\'s loanwords came from',
  });

  let side = 'romania';
  let current = 0;

  // ── steps: intro, one per era, kaki ─────────────────

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const steps = [
    { kind: 'intro' },
    ...data.eras.map(era => ({ kind: 'era', era })),
    { kind: 'kaki' },
  ];

  function headwordHTML(h) {
    if (!h) return '';
    const script = h.script ? `<span class="script">${esc(h.script)}</span>` : '';
    return `<div class="headword">${script}<span class="word">${esc(h.word)}</span>` +
      `<span class="meaning">${esc(h.meaning)}</span>` +
      (h.origin ? `<span class="origin">from ${esc(h.origin)}</span>` : '') + '</div>';
  }

  function eraCard(era, s) {
    const d = era[s];
    const ex = (d.examples || []).map(e =>
      `<li>${e.script ? `<span class="jp">${esc(e.script)}</span>` : ''}<b>${esc(e.word)}</b> <span class="gloss">${esc(e.meaning)}</span></li>`).join('');
    return `<div class="card ${s === 'romania' ? 'ro' : 'jp'}">
      <div class="kicker"><span class="side">${SIDE_LABEL[s]}</span><span>${esc(era.period)}</span>${d.draft ? '<span class="draft-tag">Draft</span>' : ''}</div>
      <h2>${esc(d.layer)}</h2>
      ${headwordHTML(d.headword)}
      <p class="summary">${esc(d.summary)}</p>
      ${ex ? `<ul class="examples">${ex}</ul>` : ''}
      <a class="more" href="blog.html#${s}-${era.id}">Read more in the blog &rarr;</a>
    </div>`;
  }

  function stepHTML(step) {
    if (step.kind === 'intro') {
      const card = s => `<div class="card intro ${s === 'romania' ? 'ro' : 'jp'}">
        <div class="kicker"><span class="side">${SIDE_LABEL[s]}</span></div>
        <h2>Two languages on the edges of empires</h2>
        <p class="summary">Romanian and Japanese each grew up beside much larger powers: Rome, the Slavs, the Ottomans and Russia on one side; China, Europe and America on the other.</p>
        <p class="summary">Every era left a layer of borrowed words. Scroll through time to see where each one came from.</p>
        <p class="summary" style="font-family:var(--sans);font-size:14px;color:var(--navy-2)">Use the triangle button or the &larr; &rarr; keys to switch between Romania (west) and Japan (east).</p>
      </div>`;
      return card('romania') + card('japan');
    }
    if (step.kind === 'kaki') {
      const k = data.kaki;
      const card = s => `<div class="card intro ${s === 'romania' ? 'ro' : 'jp'}">
        <div class="kicker"><span class="side">Interlude</span><span>${esc(k.path)}</span></div>
        <div class="headword"><span class="script">${esc(k.script)}</span><span class="word">${esc(k.word)}</span><span class="meaning">${esc(k.meaning)}</span></div>
        <p class="summary">${esc(k.note)}</p>
        <a class="more" href="blog.html">Read the full blog &rarr;</a>
      </div>`;
      return card('romania') + card('japan');
    }
    return eraCard(step.era, 'romania') + eraCard(step.era, 'japan');
  }

  stepsEl.innerHTML = steps.map((s, i) => `<article class="step" data-index="${i}">${stepHTML(s)}</article>`).join('');
  const stepEls = [...stepsEl.children];

  timelineEl.innerHTML = data.eras.map((era, i) =>
    `<li data-index="${i + 1}"><button type="button" title="${esc(era.period)}">${esc(era.period.replace(' CE', ''))}</button></li>`).join('');
  timelineEl.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (li) stepEls[+li.dataset.index].scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // ── scenes ──────────────────────────────────────────

  function sceneFor(step, s) {
    if (step.kind === 'intro') {
      return {
        focus: ['Romania', 'Japan'],
        fills: [{ name: 'Romania', color: COLOR.romania }, { name: 'Japan', color: COLOR.japan }],
        labels: ['Romania', 'Japan'],
      };
    }
    if (step.kind === 'kaki') {
      return {
        focus: ['Japan', 'France', 'Romania'],
        fills: [
          { name: 'Japan', color: COLOR.japan },
          { name: 'France', color: COLOR.source },
          { name: 'Romania', color: COLOR.romania },
        ],
        arrows: [['Japan', 'France'], ['France', 'Romania']],
        labels: ['Japan', 'France', 'Romania'],
      };
    }
    const d = step.era[s];
    const dest = DEST[s];
    const sources = d.sources || [];
    const highlight = d.highlight || sources;
    return {
      focus: [dest, ...sources],
      fills: [...highlight.map(name => ({ name, color: COLOR.source })), { name: dest, color: COLOR[s] }],
      arrows: sources.map(src => [src, dest]),
      labels: [dest, ...sources],
    };
  }

  function render(animate = true) {
    const step = steps[current];
    globe.setScene(sceneFor(step, side), { animate });

    if (step.kind === 'era') {
      periodEl.textContent = step.era.period;
      layerEl.textContent = step.era[side].layer;
      window.setBlogTarget(`${side}-${step.era.id}`);
    } else {
      periodEl.textContent = step.kind === 'kaki' ? 'Interlude' : 'Romania & Japan';
      layerEl.textContent = step.kind === 'kaki' ? 'The road of the persimmon' : 'Two outliers';
      window.setBlogTarget(step.kind === 'kaki' ? '' : `${side}-${data.eras[0].id}`);
    }

    stepEls.forEach((el, i) => el.classList.toggle('active', i === current));
    [...timelineEl.children].forEach(li => li.classList.toggle('active', +li.dataset.index === current));
  }

  // ── scroll trigger ──────────────────────────────────

  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const i = +e.target.dataset.index;
      if (i !== current) { current = i; render(); }
    }
  }, { rootMargin: '-45% 0px -45% 0px' });
  stepEls.forEach(el => io.observe(el));

  new IntersectionObserver(([e]) => {
    document.body.classList.toggle('in-story', e.isIntersecting);
    if (!e.isIntersecting) window.setBlogTarget('');
    else render(false);
  }, { rootMargin: '-40% 0px -40% 0px' }).observe(story);

  // ── side switch: slide the globe and cards past each other ──

  let switching = false;
  function setSide(next) {
    if (next === side || switching) return;
    switching = true;
    story.classList.add('switching');
    setTimeout(() => {
      side = next;
      story.classList.toggle('side-romania', side === 'romania');
      story.classList.toggle('side-japan', side === 'japan');
      document.body.classList.toggle('side-japan', side === 'japan');
      const other = side === 'romania' ? 'japan' : 'romania';
      toggleLabel.textContent = SIDE_LABEL[other];
      toggle.setAttribute('aria-label', `Switch to ${SIDE_LABEL[other]}`);
      render();
      setTimeout(() => {
        story.classList.remove('switching');
        switching = false;
      }, 450);
    }, 220);
  }

  toggle.addEventListener('click', () => setSide(side === 'romania' ? 'japan' : 'romania'));
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft') setSide('romania');
    if (e.key === 'ArrowRight') setSide('japan');
  });

  render(false);
  window.setBlogTarget('');
})();
