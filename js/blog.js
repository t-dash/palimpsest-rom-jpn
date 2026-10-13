// Blog page: renders data/eras.json into sections + a left outline drawer.
(function () {
  const content = document.getElementById('blog-content');
  const list = document.getElementById('outline-list');
  const toggle = document.getElementById('outline-toggle');
  const scrim = document.getElementById('outline-scrim');
  const wide = window.matchMedia('(min-width: 1101px)');
  const SIDES = [['romania', 'Romania'], ['japan', 'Japan']];

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Drawer
  function setOpen(open) {
    document.body.classList.toggle('outline-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('outline-open')));
  scrim.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  setOpen(wide.matches);

  function renderExamples(examples) {
    if (!examples || !examples.length) return '';
    return '<ul class="examples">' + examples.map((ex) =>
      '<li>' +
      (ex.script ? `<span class="jp w">${esc(ex.script)}</span>` : '') +
      `<span class="${ex.script ? '' : 'w'}">${esc(ex.word)}</span> ` +
      `<span class="m">${esc(ex.meaning)}</span></li>`).join('') + '</ul>';
  }

  function renderCitations(cites) {
    const body = cites && cites.length
      ? '<ol>' + cites.map((c) => `<li>${esc(c)}</li>`).join('') + '</ol>'
      : '<p class="none">Citations to come.</p>';
    return `<div class="sources"><div class="sources-label">Sources</div>${body}</div>`;
  }

  function render(eras) {
    let html = '';
    let nav = '';
    eras.forEach((era) => {
      nav += `<div class="group"><div class="group-title">${esc(era.period)}</div>`;
      SIDES.forEach(([side, label]) => {
        const d = era[side];
        if (!d) return;
        const id = `${side}-${era.id}`;
        const title = d.blogTitle || `${label}, ${era.period}`;
        const cls = side === 'romania' ? 'side-ro' : 'side-jp';
        const paras = (d.blog || []).map((p) => `<p>${esc(p)}</p>`).join('');
        html +=
          `<section class="post side-${side}" id="${id}">` +
          `<p class="kicker"><span class="period">${esc(era.period)}</span><span class="dot">/</span>` +
          `<span class="${cls}">${label}</span>${d.draft ? '<span class="draft-tag">Draft</span>' : ''}</p>` +
          `<h2>${esc(title)}</h2>${paras}${renderExamples(d.examples)}${renderCitations(d.citations)}` +
          '</section>';
        nav += `<a href="#${id}" class="side-${side}" data-target="${id}">` +
          `<span class="side-label">${label}</span>${esc(title)}</a>`;
      });
      nav += '</div>';
    });
    content.innerHTML = html;
    list.innerHTML = nav;
  }

  function setCurrent(id) {
    list.querySelectorAll('a.current').forEach((a) => a.classList.remove('current'));
    const a = list.querySelector(`a[data-target="${CSS.escape(id)}"]`);
    if (a) {
      a.classList.add('current');
      const box = list.closest('.outline');
      const r = a.getBoundingClientRect(), b = box.getBoundingClientRect();
      if (r.top < b.top || r.bottom > b.bottom) a.scrollIntoView({ block: 'nearest' });
    }
  }

  // Current section = the last one whose top has passed 30% of the viewport.
  function observe() {
    const sections = [...content.querySelectorAll('section.post')];
    let ticking = false;
    const update = () => {
      ticking = false;
      const line = window.innerHeight * 0.3;
      let cur = sections[0];
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= line) cur = s;
        else break;
      }
      if (cur) setCurrent(cur.id);
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function jumpTo(id, smooth) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1400);
    setCurrent(id);
  }

  list.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-target]');
    if (!a) return;
    e.preventDefault();
    const id = a.dataset.target;
    history.replaceState(null, '', '#' + id);
    jumpTo(id, true);
    if (!wide.matches) setOpen(false);
  });

  window.addEventListener('hashchange', () => jumpTo(decodeURIComponent(location.hash.slice(1)), true));

  fetch('data/eras.json')
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((data) => {
      render(data.eras || []);
      observe();
      if (location.hash) {
        const id = decodeURIComponent(location.hash.slice(1));
        requestAnimationFrame(() => jumpTo(id, false));
      }
    })
    .catch((err) => {
      content.innerHTML = '<p class="loading">Could not load the blog content.</p>';
      console.error(err);
    });
})();
