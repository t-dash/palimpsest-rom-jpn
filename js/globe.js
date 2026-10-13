// Canvas orthographic globe (d3-geo + topojson).
//   const topo = await Globe.loadTopology();
//   const g = new Globe(container, topo, { idle: true, draggable: true });
//   g.setScene({ focus, fills, arrows, labels });
(function () {
  const COLORS = {
    oceanInner: '#0a3a6e',
    oceanOuter: '#03254c',
    land: '#2a4a75',
    border: 'rgba(224, 231, 255, 0.22)',
    graticule: 'rgba(224, 231, 255, 0.07)',
    glow: 'rgba(120, 170, 255, 0.28)',
    arrow: '#f0c040',
    label: '#e0e7ff',
  };

  // Hand-placed anchors where a country's centroid is misleading
  // (overseas territories, huge extents) or for merged groups.
  const ANCHORS = {
    'Japan': [138.5, 36.5],
    'Romania': [25.0, 45.9],
    'France': [2.4, 46.6],
    'Netherlands': [5.3, 52.2],
    'Portugal': [-8.2, 39.6],
    'United States of America': [-98.5, 39.5],
    'United Kingdom': [-1.8, 52.8],
    'Russia': [37.6, 55.75],
    'USSR': [37.6, 55.75],
    'China': [108.9, 34.3],
    'Norway': [9.5, 61.0],
  };

  let topoPromise = null;

  class Globe {
    static loadTopology(url = 'vendor/countries-50m.json') {
      if (!topoPromise) topoPromise = fetch(url).then(r => r.json());
      return topoPromise;
    }

    constructor(container, topo, opts = {}) {
      this.container = container;
      this.opts = Object.assign({ idle: false, draggable: false, idleSpeed: 0.004, tilt: -18 }, opts);
      this.groups = opts.groups || {};

      this.canvas = document.createElement('canvas');
      this.canvas.setAttribute('role', 'img');
      this.canvas.setAttribute('aria-label', opts.ariaLabel || 'Rotating globe');
      container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');

      const obj = topo.objects.countries;
      this.topo = topo;
      this.countries = topojson.feature(topo, obj).features;
      this.byName = new Map(this.countries.map(f => [f.properties.name, f]));
      this.borders = topojson.mesh(topo, obj, (a, b) => a !== b);
      this.landFC = { type: 'FeatureCollection', features: this.countries };
      this.graticule = d3.geoGraticule10();
      this.mergedCache = new Map();

      this.projection = d3.geoOrthographic().clipAngle(90).precision(0.6);
      this.path = d3.geoPath(this.projection, this.ctx);

      this.view = { center: [20, 30], scale: 1 };
      this.scene = { fills: [], arrows: [], labels: [] };
      this.sceneStart = 0;
      this.anim = null;
      this.visible = true;
      this.idle = this.opts.idle;
      this.scaleFactor = 1; // relative to base scale

      this.resize();
      new ResizeObserver(() => this.resize()).observe(container);
      new IntersectionObserver(entries => {
        this.visible = entries[0].isIntersecting;
        if (this.visible) this.kick();
      }).observe(container);

      if (this.opts.draggable) this.enableDrag();
      this.kick();
    }

    // ── geometry helpers ───────────────────────────────

    feature(name) {
      if (this.groups[name]) {
        if (!this.mergedCache.has(name)) {
          const members = new Set(this.groups[name]);
          const geoms = this.topo.objects.countries.geometries.filter(g => members.has(g.properties.name));
          this.mergedCache.set(name, {
            type: 'Feature',
            properties: { name },
            geometry: topojson.merge(this.topo, geoms),
          });
        }
        return this.mergedCache.get(name);
      }
      return this.byName.get(name);
    }

    anchor(name) {
      if (ANCHORS[name]) return ANCHORS[name];
      const f = this.feature(name);
      return f ? d3.geoCentroid(f) : null;
    }

    // Center + scale that fit the given country names.
    fit(names) {
      const anchors = names.map(n => this.anchor(n)).filter(Boolean);
      if (!anchors.length) return { center: this.view.center, scale: 1 };
      const center = d3.geoCentroid({ type: 'MultiPoint', coordinates: anchors });
      let r = 0;
      for (const n of names) {
        const f = this.feature(n);
        if (!f) continue;
        const [[x0, y0], [x1, y1]] = d3.geoBounds(f);
        const pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1], this.anchor(n)];
        for (const p of pts) r = Math.max(r, d3.geoDistance(center, p));
      }
      // keep the bounds sane for continent-sized shapes
      r = Math.max(r, 0.12);
      const scale = r >= Math.PI / 2.3 ? 1 : Math.min(4.5, 1 / (Math.sin(r) * 1.35));
      return { center, scale: Math.max(1, scale) };
    }

    // ── scene ──────────────────────────────────────────

    // scene: { focus: [names], fills: [{name, color}], arrows: [[from, to]], labels: [names] }
    setScene(scene, { animate = true } = {}) {
      this.idle = false;
      this.scene = {
        fills: (scene.fills || []).map(f => ({ ...f, feature: this.feature(f.name) })).filter(f => f.feature),
        arrows: (scene.arrows || [])
          .map(([a, b]) => [this.anchor(a), this.anchor(b)])
          .filter(([a, b]) => a && b),
        labels: (scene.labels || []).map(n => ({ name: n === 'United States of America' ? 'United States' : n, at: this.anchor(n) }))
          .filter(l => l.at),
      };
      this.sceneStart = performance.now();
      const target = this.fit(scene.focus || []);
      if (!animate) {
        this.view = { center: target.center, scale: target.scale };
        this.anim = null;
      } else {
        const from = { center: this.view.center.slice(), scale: this.view.scale };
        const ang = d3.geoDistance(from.center, target.center);
        this.anim = {
          from, to: target, start: performance.now(),
          dur: 700 + Math.min(ang, Math.PI) * 450,
          interp: d3.geoInterpolate(from.center, target.center),
          dip: Math.min(1, ang / 1.2),
        };
      }
      this.kick();
    }

    setIdle(on) {
      this.idle = on;
      this.kick();
    }

    // ── rendering ──────────────────────────────────────

    resize() {
      const { clientWidth: w, clientHeight: h } = this.container;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = w; this.h = h; this.dpr = dpr;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.baseScale = Math.min(w, h) / 2 * 0.86;
      this.kick(true);
    }

    kick(force) {
      if (force && this.visible) this.draw(performance.now());
      if (this.raf || !this.visible) return;
      this.last = performance.now();
      const loop = now => {
        const dt = Math.min(now - this.last, 64);
        this.last = now;
        const busy = this.step(now, dt);
        this.draw(now);
        this.raf = busy && this.visible ? requestAnimationFrame(loop) : null;
      };
      this.raf = requestAnimationFrame(loop);
    }

    // Advance animation state. Returns whether more frames are needed.
    step(now, dt) {
      if (this.anim) {
        const a = this.anim;
        const t = Math.min(1, (now - a.start) / a.dur);
        const e = d3.easeCubicInOut(t);
        this.view.center = a.interp(e);
        const s = a.from.scale + (a.to.scale - a.from.scale) * e;
        this.view.scale = s * (1 - 0.3 * a.dip * Math.sin(Math.PI * e));
        if (t >= 1) this.anim = null;
      } else if (this.idle && !this.dragging) {
        this.view.center = [this.view.center[0] + dt * this.opts.idleSpeed * 360 / 100, this.opts.tilt * -1];
      }
      // keep animating while arrows are flowing or something is moving
      return true;
    }

    draw(now) {
      const { ctx, projection, path, w, h, dpr } = this;
      if (!w) return;
      const scale = this.baseScale * this.view.scale;
      projection
        .translate([w / 2, h / 2])
        .scale(scale)
        .rotate([-this.view.center[0], -this.view.center[1], 0]);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // When zoomed past the frame, show the globe through a circular lens.
      const lensR = Math.min(scale, Math.min(w, h) / 2 * 0.97);
      const lensed = scale > lensR + 0.5;

      // atmosphere glow
      const glow = ctx.createRadialGradient(w / 2, h / 2, lensR * 0.95, w / 2, h / 2, lensR * 1.18);
      glow.addColorStop(0, COLORS.glow);
      glow.addColorStop(1, 'rgba(120, 170, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, lensR * 1.18, 0, 2 * Math.PI);
      ctx.fill();

      ctx.save();
      if (lensed) {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, lensR, 0, 2 * Math.PI);
        ctx.clip();
      }

      // ocean
      const ocean = ctx.createRadialGradient(w / 2 - scale * 0.35, h / 2 - scale * 0.4, scale * 0.1, w / 2, h / 2, scale);
      ocean.addColorStop(0, COLORS.oceanInner);
      ocean.addColorStop(1, COLORS.oceanOuter);
      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.fillStyle = ocean;
      ctx.fill();

      ctx.beginPath();
      path(this.graticule);
      ctx.strokeStyle = COLORS.graticule;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.beginPath();
      path(this.landFC);
      ctx.fillStyle = COLORS.land;
      ctx.fill();

      ctx.beginPath();
      path(this.borders);
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // highlights fade in after a scene change
      const age = now - this.sceneStart;
      const fade = Math.min(1, age / 500);
      for (const f of this.scene.fills) {
        ctx.globalAlpha = fade;
        ctx.beginPath();
        path(f.feature);
        ctx.fillStyle = f.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(2, 16, 17, 0.45)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const grow = Math.min(1, Math.max(0, (age - 350) / 900));
      for (const [a, b] of this.scene.arrows) this.drawArrow(a, b, grow, now);

      if (fade > 0) this.drawLabels(fade);
      ctx.restore();

      if (lensed) {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, lensR, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(224, 231, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    visibleAt(p) {
      const c = this.view.center;
      return d3.geoDistance(p, c) < Math.PI / 2 - 0.02;
    }

    drawArrow(a, b, grow, now) {
      if (grow <= 0) return;
      const { ctx, projection, w, h } = this;
      const interp = d3.geoInterpolate(a, b);
      const dist = d3.geoDistance(a, b);
      const lift = 0.03 + 0.18 * (dist / Math.PI);
      const n = 72;
      const cx = w / 2, cy = h / 2;
      const segs = [];
      let cur = [];
      for (let i = 0; i <= n * grow; i++) {
        const t = i / n;
        const p = interp(t);
        // allow lifted points slightly past the limb
        if (d3.geoDistance(p, this.view.center) > Math.PI / 2 + lift * Math.sin(Math.PI * t) * 0.8) {
          if (cur.length > 1) segs.push(cur);
          cur = [];
          continue;
        }
        const [x, y] = projection(p);
        const k = 1 + lift * Math.sin(Math.PI * t);
        cur.push([cx + (x - cx) * k, cy + (y - cy) * k]);
      }
      if (cur.length > 1) segs.push(cur);
      if (!segs.length) return;

      ctx.save();
      ctx.lineCap = 'round';
      for (const pass of [0, 1]) {
        ctx.beginPath();
        for (const s of segs) {
          ctx.moveTo(s[0][0], s[0][1]);
          for (let i = 1; i < s.length; i++) ctx.lineTo(s[i][0], s[i][1]);
        }
        if (pass === 0) {
          ctx.setLineDash([]);
          ctx.strokeStyle = 'rgba(2, 16, 17, 0.55)';
          ctx.lineWidth = 4;
        } else {
          ctx.setLineDash([7, 6]);
          ctx.lineDashOffset = -now * 0.025;
          ctx.strokeStyle = COLORS.arrow;
          ctx.lineWidth = 2.2;
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // arrowhead at the current tip
      const last = segs[segs.length - 1];
      if (last.length >= 2) {
        const [x1, y1] = last[last.length - 2];
        const [x2, y2] = last[last.length - 1];
        const ang = Math.atan2(y2 - y1, x2 - x1);
        const L = 10;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - L * Math.cos(ang - 0.45), y2 - L * Math.sin(ang - 0.45));
        ctx.lineTo(x2 - L * Math.cos(ang + 0.45), y2 - L * Math.sin(ang + 0.45));
        ctx.closePath();
        ctx.fillStyle = COLORS.arrow;
        ctx.strokeStyle = 'rgba(2, 16, 17, 0.55)';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    drawLabels(alpha) {
      const { ctx, projection } = this;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '600 12px "Source Sans 3", "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      for (const l of this.scene.labels) {
        if (!this.visibleAt(l.at)) continue;
        const [x, y] = projection(l.at);
        const text = l.name.toUpperCase();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = 'rgba(2, 16, 17, 0.85)';
        ctx.strokeText(text, x, y - 10);
        ctx.fillStyle = COLORS.label;
        ctx.fillText(text, x, y - 10);
      }
      ctx.restore();
    }

    // ── interaction ────────────────────────────────────

    enableDrag() {
      const c = this.canvas;
      c.style.cursor = 'grab';
      c.style.touchAction = 'pan-y';
      let start = null;
      c.addEventListener('pointerdown', e => {
        start = { x: e.clientX, y: e.clientY, center: this.view.center.slice() };
        this.dragging = true;
        c.setPointerCapture(e.pointerId);
        c.style.cursor = 'grabbing';
      });
      c.addEventListener('pointermove', e => {
        if (!start) return;
        const k = 90 / (this.baseScale * this.view.scale);
        this.view.center = [
          start.center[0] - (e.clientX - start.x) * k,
          Math.max(-80, Math.min(80, start.center[1] + (e.clientY - start.y) * k)),
        ];
        this.kick();
      });
      const end = () => {
        start = null;
        this.dragging = false;
        c.style.cursor = 'grab';
      };
      c.addEventListener('pointerup', end);
      c.addEventListener('pointercancel', end);
    }
  }

  window.Globe = Globe;
})();
