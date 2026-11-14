/* DOMiNANCE Q Bank — single-page app (no build step).
   Flow: Home → Year (→ Semester for HB1) → Course → Collection (topics) → Setup → Quiz → Results/Review. */
(function () {
  'use strict';

  /* ---------- tiny helpers ---------- */
  const $app = document.getElementById('app');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nl = s => esc(s).replace(/\n/g, '<br>');
  const LET = 'ABCDEFGH';
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const fmtTime = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } },
    keys(prefix) { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(prefix) === 0) out.push(k); } } catch (e) { } return out; }
  };

  const I = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    folders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M7 9a2 2 0 0 1 2-2h3l2 2h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M17 7V6a2 2 0 0 0-2-2h-4l-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M5 12h3l2-3 3 6 2-3h4"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/></svg>',
    bone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M17 3a3 3 0 0 0-2.8 4L7 14.2A3 3 0 1 0 4.2 17 3 3 0 1 0 7 19.8 3 3 0 0 0 9.8 17L17 9.8A3 3 0 1 0 19.8 7 3 3 0 0 0 17 3z"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/></svg>',
    archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
  };

  /* ---------- state ---------- */
  const S = {
    catalog: null, comments: {}, cache: {}, route: null,
    attempt: null, last: null, reviewFilter: 'all', sheet: null, fx: null, timerId: null, inlineErr: ''
  };
  const defaultSetup = { count: 'all', custom: '', marking: 'go', markOn: 'check', timer: 'off', timerMin: 30, xpo: true };
  const getSetup = () => Object.assign({}, defaultSetup, store.get('dq.setup', {}));
  const putSetup = s => store.set('dq.setup', s);

  /* ---------- theme ---------- */
  function applyTheme() { document.documentElement.dataset.theme = store.get('dq.theme', 'dark'); }
  function toggleTheme() { store.set('dq.theme', store.get('dq.theme', 'dark') === 'dark' ? 'light' : 'dark'); applyTheme(); render(); }

  /* ---------- catalog lookups ---------- */
  function yearById(id) { return S.catalog.years.find(y => y.id === id); }
  function coursesFor(year, sem) { return sem ? (sem.courses || []) : (year.courses || []); }
  function courseKeyOf(r) { return r.year + (r.sem ? '.' + r.sem : '') + '/' + r.course; }
  function baseHash(r, upto) {
    const parts = [r.year]; if (r.sem) parts.push(r.sem);
    if (upto === 'year') return '#/' + parts.join('/');
    parts.push(r.course); if (upto === 'course') return '#/' + parts.join('/');
    parts.push(r.coll); if (upto === 'topics') return '#/' + parts.join('/');
    return '#/' + parts.join('/') + '/setup';
  }
  const COLL = { past: 'Past questions', curated: 'Curated by DOMiNANCE' };

  /* ---------- routing ---------- */
  function parseHash() {
    const h = (location.hash || '').replace(/^#\/?/, '');
    const seg = h ? h.split('/').filter(Boolean) : [];
    if (!seg.length) return { view: 'init' };
    if (seg[0] === 'home') return { view: 'home' };
    if (seg[0] === 'quiz') return { view: 'quiz' };
    if (seg[0] === 'results') return { view: 'results' };
    if (seg[0] === 'review') return { view: 'review' };
    const year = yearById(seg[0]); if (!year) return { view: 'home' };
    const r = { year: year.id, view: 'year' };
    let i = 1;
    if (year.semesters) { if (!seg[1]) return r; r.sem = seg[1]; i = 2; r.view = 'sem'; }
    if (seg[i]) { r.course = seg[i]; r.view = 'course'; }
    if (seg[i + 1]) { r.coll = seg[i + 1] === 'curated' ? 'curated' : 'past'; r.view = 'topics'; }
    if (seg[i + 2] === 'setup') r.view = 'setup';
    return r;
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function clearBubbles() { clearTimeout(S.bubbleT); document.querySelectorAll('.bubble').forEach(b => b.remove()); }
  async function route() {
    stopTimer(); clearBubbles();
    S.sheet = null; S.inlineErr = '';
    const r = parseHash();
    if (r.view === 'init') {
      const y = store.get('dq.year', null);
      location.replace(y && yearById(y) && yearById(y).status === 'live' ? '#/' + y : '#/home');
      return;
    }
    S.route = r;
    if (r.year && (r.view === 'year' || r.view === 'sem')) store.set('dq.year', r.year);
    if (r.course) {
      const year = yearById(r.year), sem = r.sem ? (year.semesters || []).find(s => s.id === r.sem) : null;
      const course = coursesFor(year, sem).find(c => c.id === r.course);
      if (!course || course.status !== 'live') { go(baseHash(r, 'year')); return; }
      try { await loadCourse(courseKeyOf(r), course); } catch (e) { $app.innerHTML = '<div class="wrap"><p class="banner">Questions could not load. Check your connection and refresh.</p></div>'; return; }
    }
    if (r.view === 'quiz' && !S.attempt) { go('#/home'); return; }
    if ((r.view === 'results' || r.view === 'review') && !S.last) { go('#/home'); return; }
    render();
    window.scrollTo(0, 0);
    if (r.view === 'quiz') startTimer();
  }

  /* ---------- data loading + normalisation ---------- */
  async function getJSON(url) { const res = await fetch(url, { cache: 'no-cache' }); if (!res.ok) throw new Error(url); return res.json(); }
  async function loadCourse(key, course) {
    if (S.cache[key]) return S.cache[key];
    const data = { key, course, topics: [], past: [], curated: [] };
    for (const sys of course.systems || []) {
      const topics = sys.topics ? await getJSON(sys.topics) : [];
      topics.sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(t => data.topics.push({ id: t.id, title: t.title, short: t.short || t.title, sys: sys.id, sysTitle: sys.title }));
      for (const f of sys.past || []) {
        const j = await getJSON(f);
        (j.sets || []).forEach(set => (set.questions || []).forEach(q => data.past.push(normPast(q, sys.id))));
      }
      for (const f of sys.curated || []) {
        const j = await getJSON(f);
        (j.questions || []).forEach(q => data.curated.push(normCurated(q, sys.id)));
      }
    }
    const known = new Set(data.topics.map(t => t.id));
    [...data.past, ...data.curated].forEach(q => { if (!known.has(q.topic)) { q.topic = 'other-' + q.sys; } });
    (course.systems || []).forEach(sys => {
      if ([...data.past, ...data.curated].some(q => q.topic === 'other-' + sys.id)) data.topics.push({ id: 'other-' + sys.id, title: 'Other ' + sys.title + ' questions', short: 'Other', sys: sys.id, sysTitle: sys.title });
    });
    data.byId = {};
    [...data.past, ...data.curated].forEach(q => { data.byId[q.id] = q; });
    S.cache[key] = data;
    return data;
  }
  function normPast(q, sys) {
    const tf = q.type === 'true-false';
    return {
      id: q.id, src: 'past', sys, type: tf ? 'tf' : 'sba', stem: q.stem,
      opts: (q.options || []).map((o, i) => ({ k: o.label || LET[i], t: o.text != null ? o.text : String(o) })),
      ans: q.correctAnswer, tf: q.answerByOption || null,
      why: q.why || '', notes: q.notes || {}, topic: q.topicId, sub: q.subtopic || '',
      diff: q.difficulty || 'medium', lock: !!q.lockOrder
    };
  }
  function normCurated(q, sys) {
    return {
      id: q.id, src: 'curated', sys, type: 'sba', stem: q.stem,
      opts: (q.options || []).map((o, i) => ({ k: LET[i], t: typeof o === 'string' ? o : o.text })),
      ans: q.answer, tf: null, why: q.why || '', notes: q.notes || {},
      topic: q.topicId, sub: q.subtopic || '', diff: q.difficulty || 'medium', lock: !!q.lockOrder
    };
  }
  function currentData() { return S.route && S.route.course ? S.cache[courseKeyOf(S.route)] : null; }
  function dataForAttempt(a) { return S.cache[a.courseKey]; }

  /* ---------- selected topics (remembered per course + collection) ---------- */
  function selKey(r) { return 'dq.sel.' + courseKeyOf(r) + '.' + r.coll; }
  function getSel(r) { return store.get(selKey(r), []); }
  function putSel(r, v) { store.set(selKey(r), v); }
  function pool(data, coll, topicIds) { const set = new Set(topicIds); return data[coll].filter(q => set.has(q.topic)); }

  /* ---------- shared chrome ---------- */
  function topbar() {
    const dark = store.get('dq.theme', 'dark') === 'dark';
    return '<header class="topbar"><a class="brand" href="#/home"><span class="mark">D</span><span>DOMiNANCE<small>Q Bank</small></span></a>' +
      '<button class="iconbtn" data-a="theme" aria-label="Switch to ' + (dark ? 'light' : 'dark') + ' theme">' + (dark ? I.sun : I.moon) + '</button></header>';
  }
  function crumbs(items) {
    const parent = items.length > 1 ? items[items.length - 2].href : '#/home';
    const up = items.slice(0, -1);
    return '<nav class="crumbs" aria-label="Breadcrumb"><a class="back" href="' + parent + '" aria-label="Back">' + I.back + '</a>' +
      up.map((it, i) => '<a href="' + it.href + '">' + esc(it.label) + '</a>' + (i < up.length - 1 ? '<span class="sep">›</span>' : '')).join('') + '</nav>';
  }
  function trail(r, upto) {
    const year = yearById(r.year), out = [{ label: 'Home', href: '#/home' }, { label: year.title, href: '#/' + year.id }];
    if (r.sem) { const sem = year.semesters.find(s => s.id === r.sem); out.push({ label: sem ? sem.title : r.sem, href: '#/' + year.id + '/' + r.sem }); }
    if (upto === 'year' || upto === 'sem') return out;
    const course = courseObj(r); out.push({ label: course.title, href: baseHash(r, 'course') });
    if (upto === 'course') return out;
    out.push({ label: COLL[r.coll], href: baseHash(r, 'topics') });
    if (upto === 'topics') return out;
    out.push({ label: 'Setup', href: baseHash(r, 'setup') });
    return out;
  }
  function courseObj(r) { const y = yearById(r.year), sem = r.sem ? y.semesters.find(s => s.id === r.sem) : null; return coursesFor(y, sem).find(c => c.id === r.course); }
  function wrap(inner, foot) { return '<div class="wrap" id="main">' + inner + (foot ? '<p class="foot">DOMiNANCE · Understand • Practise • Master</p>' : '') + '</div>'; }

  /* ---------- saved quizzes (one per course) ---------- */
  const saveKey = ck => 'dq.save.' + ck;
  function persistAttempt() { const a = S.attempt; if (a && !a.finished) store.set(saveKey(a.courseKey), a); }
  function savedAttempts() { return store.keys('dq.save.').map(k => store.get(k, null)).filter(a => a && a.qids && !a.finished); }
  function resumeCards(filterKey) {
    const list = savedAttempts().filter(a => !filterKey || a.courseKey === filterKey);
    return list.map(a => {
      const answered = a.qids.filter(id => isAnswered(id, a)).length;
      return '<div class="resume"><div class="txt"><span class="t">Continue: ' + esc(a.courseTitle) + ' · ' + esc(COLL[a.coll]) + '</span><span class="s">' + answered + ' of ' + a.qids.length + ' answered · ' + esc(a.label) + '</span></div>' +
        '<button class="btn small" data-a="discard" data-k="' + esc(a.courseKey) + '">Discard</button><button class="btn primary small" data-a="resume" data-k="' + esc(a.courseKey) + '">' + I.play + 'Resume</button></div>';
    }).join('');
  }

  /* ---------- views: home / year / semester / course ---------- */
  function viewHome() {
    const mine = store.get('dq.year', null);
    const years = S.catalog.years.map(y => {
      const live = y.status === 'live';
      return live
        ? '<a class="year' + (y.id === mine ? ' mine' : '') + '" href="#/' + y.id + '"><b>' + esc(y.title) + '</b><span>' + esc(y.subtitle) + '</span></a>'
        : '<div class="year soon" aria-disabled="true"><b>' + esc(y.title) + '</b><span>' + esc(y.subtitle) + '</span><span class="badge" style="margin-top:6px;align-self:flex-start">Soon</span></div>';
    }).join('');
    return wrap(topbar() + '<section class="hero"><h1>Get locked in and <span>dominate</span>.</h1><p class="lead">Past questions and curated questions, sorted by topic, with explanations for every answer.</p></section>' +
      resumeCards() + '<h2>Choose your year</h2><div class="years">' + years + '</div>', true);
  }
  function courseRows(r, list) {
    if (!list.length) return '<p class="empty">Courses for this year are coming soon.</p>';
    return '<div class="list">' + list.map(c => {
      const ico = I[c.icon] || I.book;
      if (c.status !== 'live') return '<div class="row soon" aria-disabled="true"><span class="ico">' + ico + '</span><span class="txt"><span class="t">' + esc(c.title) + '</span><span class="s">Coming soon</span></span></div>';
      const href = '#/' + r.year + (r.sem ? '/' + r.sem : '') + '/' + c.id;
      const sys = (c.systems || []).map(s => s.title).join(', ');
      return '<a class="row" href="' + href + '"><span class="ico">' + ico + '</span><span class="txt"><span class="t">' + esc(c.title) + '</span><span class="s">' + esc(sys) + '</span></span><span class="chev">' + I.chev + '</span></a>';
    }).join('') + '</div>';
  }
  function viewYear(r) {
    const y = yearById(r.year);
    let body;
    if (y.semesters) {
      body = '<div class="list">' + y.semesters.map(s => '<a class="row" href="#/' + y.id + '/' + s.id + '"><span class="ico">' + I.cal + '</span><span class="txt"><span class="t">' + esc(s.title) + '</span><span class="s">' + ((s.courses || []).length ? (s.courses.length + ' courses') : 'Coming soon') + '</span></span><span class="chev">' + I.chev + '</span></a>').join('') + '</div>';
    } else body = courseRows(r, y.courses || []);
    return wrap(topbar() + crumbs(trail(r, 'year')) + '<h1>' + esc(y.title) + ' · ' + esc(y.subtitle) + '</h1><p class="lead">' + (y.semesters ? 'Pick a semester.' : 'Pick a course.') + ' <button class="linkbtn" data-a="changeyear">Change year</button></p>' + resumeCards() + body);
  }
  function viewSem(r) {
    const y = yearById(r.year), sem = y.semesters.find(s => s.id === r.sem);
    return wrap(topbar() + crumbs(trail(r, 'sem')) + '<h1>' + esc(sem ? sem.title : '') + '</h1><p class="lead">Pick a course.</p>' + courseRows(r, sem ? sem.courses || [] : []));
  }
  function viewCourse(r) {
    const d = currentData(), c = courseObj(r), ck = courseKeyOf(r);
    const hist = store.get('dq.hist.' + ck, []).slice(0, 5);
    const coll = k => '<a class="row" href="' + baseHash(Object.assign({}, r, { coll: k }), 'topics') + '"><span class="ico">' + (k === 'past' ? I.archive : I.spark) + '</span><span class="txt"><span class="t">' + COLL[k] + '</span><span class="s">' + d[k].length + ' questions</span></span><span class="chev">' + I.chev + '</span></a>';
    return wrap(topbar() + crumbs(trail(r, 'course')) + '<h1>' + esc(c.title) + '</h1><p class="lead">Choose a collection. Both are sorted by topic.</p>' + resumeCards(ck) +
      '<div class="list">' + coll('past') + coll('curated') + '</div>' +
      '<h2>Your recent scores</h2>' + (hist.length ? '<div class="history">' + hist.map(h => '<div class="hi"><b>' + h.pct + '%</b><span>' + esc(COLL[h.coll]) + ' · ' + esc(h.label) + '<br><small>' + h.got + '/' + h.total + ' marks · ' + esc(new Date(h.at).toLocaleDateString()) + '</small></span></div>').join('') + '</div>' : '<p class="empty">Finish a quiz and your scores will show here.</p>'));
  }

  /* ---------- view: topic folders ---------- */
  function viewTopics(r) {
    const d = currentData();
    const counts = {}; d[r.coll].forEach(q => { counts[q.topic] = (counts[q.topic] || 0) + 1; });
    const topics = d.topics.filter(t => counts[t.id]);
    const sel = new Set(getSel(r).filter(id => counts[id]));
    const all = topics.length && topics.every(t => sel.has(t.id));
    const n = pool(d, r.coll, [...sel]).length;
    let html = '<div class="folders" role="group" aria-label="Topics"><button class="folder all" data-a="topicall" aria-pressed="' + all + '"><span class="tick">' + I.check + '</span><span class="fi">' + I.folders + '</span><span class="ft">All topics</span><span class="fc">' + d[r.coll].length + ' questions</span></button></div>';
    let sys = null;
    topics.forEach(t => {
      if (t.sys !== sys) { if (sys !== null) html += '</div>'; sys = t.sys; html += '<div class="syshead">' + esc(t.sysTitle) + '</div><div class="folders" role="group" aria-label="' + esc(t.sysTitle) + ' topics">'; }
      html += '<button class="folder" data-a="topic" data-id="' + esc(t.id) + '" aria-pressed="' + sel.has(t.id) + '"><span class="tick">' + I.check + '</span><span class="fi">' + I.folder + '</span><span class="ft">' + esc(t.title) + '</span><span class="fc">' + counts[t.id] + ' question' + (counts[t.id] === 1 ? '' : 's') + '</span></button>';
    });
    if (sys !== null) html += '</div>';
    const dock = '<div class="dock"><div class="in"><div class="info">' + (sel.size ? '<b>' + sel.size + ' topic' + (sel.size === 1 ? '' : 's') + '</b> · ' + n + ' questions' : 'Tap folders to pick one or more topics') + '</div><button class="btn primary" data-a="continue">Continue</button></div></div>';
    return wrap(topbar() + crumbs(trail(r, 'topics')) + '<h1>' + COLL[r.coll] + '</h1><p class="lead">Tap to pick one or more topics.</p>' + html) + dock;
  }

  /* ---------- view: setup ---------- */
  function countOptions(n) { return [10, 20, 50].filter(v => v < n); }
  function viewSetup(r) {
    const d = currentData(), sel = getSel(r).filter(id => d.topics.some(t => t.id === id));
    if (!sel.length) { setTimeout(() => go(baseHash(r, 'topics')), 0); return ''; }
    const n = pool(d, r.coll, sel).length, st = getSetup();
    if (typeof st.count === 'number' && st.count >= n) st.count = 'all';
    const titles = sel.map(id => (d.topics.find(t => t.id === id) || {}).title).filter(Boolean);
    const shown = titles.slice(0, 5).map(t => '<span class="tchip">' + esc(t) + '</span>').join('') + (titles.length > 5 ? '<span class="tchip">+' + (titles.length - 5) + ' more</span>' : '');
    const chip = (val, label) => '<button class="chip" data-a="count" data-v="' + val + '" aria-pressed="' + (String(st.count) === String(val)) + '">' + label + '</button>';
    const seg = (name, val, label) => '<button data-a="' + name + '" data-v="' + val + '" aria-pressed="' + (st[name] === val) + '">' + label + '</button>';
    const timerChip = (val, label) => '<button class="chip" data-a="timer" data-v="' + val + '" aria-pressed="' + (st.timer === val) + '">' + label + '</button>';
    const planned = st.count === 'all' ? n : st.count === 'custom' ? (parseInt(st.custom, 10) || 0) : st.count;
    const body =
      '<section class="card"><div class="setup-head"><div><h1 style="font-size:22px">Quiz setup</h1></div>' +
      '<label class="xpo" title="DOMiNANCE EXPERIENCE: streaks, reactions, confetti and comments"><input type="checkbox" data-a="xpo"' + (st.xpo ? ' checked' : '') + '>DMC XPO</label></div>' +
      '<div class="topicchips">' + shown + ' <button class="linkbtn" data-a="changetopics">Change</button></div>' +
      '<div class="field"><span class="lbl">How many questions?</span><div class="chips">' + chip('all', 'All ' + n) + countOptions(n).map(v => chip(v, v)).join('') + chip('custom', 'Custom') + '</div>' +
      (st.count === 'custom' ? '<div class="inline"><label for="custom" class="sr">Number of questions</label><input id="custom" class="num" type="number" inputmode="numeric" min="1" max="' + n + '" step="1" value="' + esc(st.custom) + '" placeholder="15"><span class="empty">of ' + n + '</span></div>' : '') +
      (S.inlineErr ? '<p class="err" role="alert">' + esc(S.inlineErr) + '</p>' : '') + '</div>' +
      '<div class="field"><span class="lbl">Marking</span><div class="seg">' + seg('marking', 'go', 'Mark as you go') + seg('marking', 'end', 'Submit at the end') + '</div>' +
      (st.marking === 'go' ? '<div class="sub"><span class="lbl">When should it mark?</span><div class="seg">' + seg('markOn', 'check', 'When I tap Check') + seg('markOn', 'tap', 'As soon as I tap') + '</div></div>' : '') + '</div>' +
      '<div class="field"><span class="lbl">Timer</span><div class="chips">' + timerChip('off', 'Off') + timerChip('auto', 'Auto · 1 min per question') + timerChip('custom', 'Custom') + '</div>' +
      (st.timer === 'custom' ? '<div class="inline"><label for="tmin" class="sr">Minutes</label><input id="tmin" class="num" type="number" inputmode="numeric" min="1" max="300" step="1" value="' + esc(st.timerMin) + '"><span class="empty">minutes</span></div>' : '') + '</div>' +
      '</section>';
    const dock = '<div class="dock"><div class="in"><div class="info"><b>' + (planned > 0 ? planned : '—') + ' question' + (planned === 1 ? '' : 's') + '</b> · ' + (st.marking === 'go' ? 'Mark as you go' : 'Submit at the end') + '</div><button class="btn primary" data-a="start">Start quiz</button></div></div>';
    return wrap(topbar() + crumbs(trail(r, 'setup')) + body) + dock;
  }

  /* ---------- building an attempt ---------- */
  function buildAttempt(r, qids, st, label) {
    const d = currentData(), c = courseObj(r);
    const order = {};
    qids.forEach(id => { const q = d.byId[id]; const keys = q.opts.map(o => o.k); order[id] = q.lock ? keys : shuffle(keys); });
    const limit = st.timer === 'auto' ? qids.length * 60 : st.timer === 'custom' ? Math.max(1, parseInt(st.timerMin, 10) || 30) * 60 : null;
    return {
      courseKey: courseKeyOf(r), courseTitle: c.title, route: { year: r.year, sem: r.sem || null, course: r.course, coll: r.coll },
      coll: r.coll, label, settings: { marking: st.marking, markOn: st.markOn, xpo: !!st.xpo, timer: st.timer },
      qids, order, ans: {}, marked: {}, flags: {}, idx: 0, elapsed: 0, limit, warned: false, timeUp: false,
      streak: 0, best: 0, wrongRun: 0, markCount: 0, lastComment: -9, used: [], seen: {}, finished: false, started: Date.now()
    };
  }
  function topicLabel(d, ids, coll) {
    const titles = ids.map(id => (d.topics.find(t => t.id === id) || {}).title).filter(Boolean);
    const total = new Set(d[coll].map(q => q.topic)).size;
    if (ids.length >= total) return 'All topics';
    return titles.length <= 2 ? titles.join(' + ') : titles[0] + ' + ' + (titles.length - 1) + ' more';
  }
  function startFromSetup() {
    const r = S.route, d = currentData(), sel = getSel(r), st = getSetup();
    const p = pool(d, r.coll, sel); const n = p.length;
    let want = st.count === 'all' ? n : st.count === 'custom' ? parseInt(st.custom, 10) : st.count;
    if (st.count === 'custom' && (!Number.isInteger(want) || want < 1 || want > n)) { S.inlineErr = 'Enter a number from 1 to ' + n + '.'; render(); const el = document.getElementById('custom'); if (el) el.focus(); return; }
    if (st.timer === 'custom') { const m = parseInt(st.timerMin, 10); if (!Number.isInteger(m) || m < 1 || m > 300) { S.inlineErr = ''; toast('Enter timer minutes from 1 to 300'); return; } }
    const qids = shuffle(p.map(q => q.id)).slice(0, want);
    const saved = store.get(saveKey(courseKeyOf(r)), null);
    if (saved && !saved.finished) {
      S.sheet = { kind: 'replace', qids, label: topicLabel(d, sel, r.coll) }; render(); return;
    }
    beginAttempt(buildAttempt(r, qids, st, topicLabel(d, sel, r.coll)));
  }
  function beginAttempt(a) { S.attempt = a; persistAttempt(); go('#/quiz'); }

  /* ---------- grading ---------- */
  function qOf(id, a) { const d = dataForAttempt(a || S.attempt); return d && d.byId[id]; }
  function isAnswered(id, a) {
    const ans = a.ans[id]; if (ans == null) return false;
    const q = S.cache[a.courseKey] && S.cache[a.courseKey].byId[id];
    if (q && q.type === 'tf') return q.opts.every(o => ans[o.k]);
    return true;
  }
  function grade(q, ans) {
    if (q.type === 'tf') {
      const total = q.opts.length; let got = 0, answered = 0;
      q.opts.forEach(o => { const v = ans && ans[o.k]; if (v) { answered++; if (v === q.tf[o.k]) got++; } });
      return { total, got, answered, correct: got === total, wrongMarks: answered - got, missing: total - answered };
    }
    const answered = ans ? 1 : 0, got = ans && ans === q.ans ? 1 : 0;
    return { total: 1, got, answered, correct: !!got, wrongMarks: answered - got, missing: 1 - answered };
  }
  function displayMap(a, q) { const map = {}; (a.order[q.id] || q.opts.map(o => o.k)).forEach((k, i) => { map[k] = LET[i]; }); return map; }
  function remapExp(text, map) {
    if (!text) return '';
    let t = text.replace(/(^|\n)([A-E]) (?=True|False|Disputed)/g, (m, p, l) => p + (map[l] || l) + ' ');
    t = t.replace(/\bNot ([A-E](?:(?:, and |, | or | and )[A-E])*)(?=:)/g, (m, g) => 'Not ' + g.replace(/[A-E]/g, l => map[l] || l));
    t = t.replace(/(^|[^A-Za-z])([A-E])(?= is (?:correct|the exception|the false statement|therefore correct|wrong|false|also correct|the intended answer|only partly true)\b)/g, (m, p, l) => p + (map[l] || l));
    return t;
  }
  function tfWord(v) { return v === 'T' ? 'True' : 'False'; }
  function explainSBA(a, q, ans, openOthers) {
    const map = displayMap(a, q), order = a.order[q.id] || q.opts.map(o => o.k);
    let h = '<p class="ans">Answer: ' + map[q.ans] + '</p>';
    if (ans && ans !== q.ans && q.notes[ans]) h += '<span class="k">Your pick · ' + map[ans] + '</span><p>' + nl(remapExp(q.notes[ans], map)) + '</p>';
    if (q.why) h += '<span class="k">Why ' + map[q.ans] + '</span><p>' + nl(remapExp(q.why, map)) + '</p>';
    const rest = order.filter(k => k !== q.ans && k !== ans && q.notes[k]);
    if (rest.length) {
      const groups = []; rest.forEach(k => { const t = q.notes[k]; const g = groups.find(x => x.t === t); if (g) g.ks.push(map[k]); else groups.push({ t, ks: [map[k]] }); });
      h += '<details' + (openOthers ? ' open' : '') + '><summary>Why not the others (' + rest.length + ')</summary><ul class="oth">' + groups.map(g => '<li><b>' + g.ks.join(', ') + '</b>' + esc(remapExp(g.t, map)) + '</li>').join('') + '</ul></details>';
    }
    return h;
  }

  /* ---------- view: quiz ---------- */
  function viewQuiz() {
    const a = S.attempt, q = qOf(a.qids[a.idx]); const n = a.qids.length;
    const go_ = a.settings.marking === 'go', marked = !!a.marked[q.id];
    const map = displayMap(a, q), order = a.order[q.id] || q.opts.map(o => o.k);
    const byKey = {}; q.opts.forEach(o => { byKey[o.k] = o; });
    const ans = a.ans[q.id];
    const timer = a.limit ? '<span class="timer' + (a.limit - a.elapsed <= 60 ? ' low' : '') + '" id="timer" aria-live="off">' + fmtTime(a.limit - a.elapsed) + '</span>' : '';
    const top = '<div class="qtop"><div class="qbar"><button class="iconbtn" data-a="exit" aria-label="Exit quiz">' + I.x + '</button><div class="pos">' + (a.idx + 1) + ' of ' + n + '</div>' + timer +
      '<button class="iconbtn" data-a="navigator" aria-label="Question navigator">' + I.grid + '</button><button class="iconbtn flagbtn" data-a="flag" aria-pressed="' + !!a.flags[q.id] + '" aria-label="' + (a.flags[q.id] ? 'Remove flag' : 'Flag for review') + '">' + I.star + '</button></div>' +
      '<div class="progress" aria-hidden="true"><div style="width:' + Math.round((a.idx + 1) / n * 100) + '%"></div></div></div>';
    const topic = (dataForAttempt(a).topics.find(t => t.id === q.topic) || {}).short || '';
    let body = '';
    if (q.type === 'tf') {
      body = '<div role="list">' + order.map(k => {
        const o = byKey[k], v = ans && ans[k], showMark = go_ && (marked || (a.settings.markOn === 'tap' && v));
        const cls = showMark ? (v === q.tf[k] ? ' ok' : ' no') : '';
        const sym = showMark ? (v === q.tf[k] ? '<span class="tfmark" style="color:var(--good)">✓</span>' : '<span class="tfmark" style="color:var(--bad)">✗</span>') : '';
        const dis = showMark ? ' disabled' : '';
        const rightT = showMark && v !== q.tf[k] && q.tf[k] === 'T' ? ' right' : '', rightF = showMark && v !== q.tf[k] && q.tf[k] === 'F' ? ' right' : '';
        const why = showMark ? '<p class="tfwhy"><b>' + tfWord(q.tf[k]) + '.</b> ' + esc(remapExp(q.notes[k] || '', map)) + '</p>' : '';
        return '<div class="tfrow" role="listitem"><span class="st"><b>' + map[k] + '.</b>' + esc(o.t) + '</span>' + sym + '<span class="tfsw' + cls + '" role="group" aria-label="Statement ' + map[k] + '"><button class="' + rightT + '" data-a="tf" data-k="' + k + '" data-v="T" aria-pressed="' + (v === 'T') + '"' + dis + '>True</button><button class="' + rightF + '" data-a="tf" data-k="' + k + '" data-v="F" aria-pressed="' + (v === 'F') + '"' + dis + '>False</button></span>' + why + '</div>';
      }).join('') + '</div>';
    } else {
      body = '<div class="opts" role="radiogroup" aria-label="Options">' + order.map(k => {
        const o = byKey[k]; let cls = '';
        if (go_ && marked) { if (k === q.ans) cls = ' ok'; else if (k === ans) cls = ' no'; }
        else if (ans === k) cls = ' sel';
        return '<button class="opt' + cls + '" data-a="pick" data-k="' + k + '" role="radio" aria-checked="' + (ans === k) + '"' + (go_ && marked ? ' disabled' : '') + '><span class="L">' + map[k] + '</span><span>' + esc(o.t) + '</span></button>';
      }).join('') + '</div>';
    }
    let fb = '';
    if (go_ && marked) {
      if (q.type === 'tf') { if (q.why) fb = '<div class="feedback" aria-live="polite"><span class="k" style="margin-top:0">Key point</span><p>' + nl(remapExp(q.why, map)) + '</p></div>'; }
      else fb = '<div class="feedback" aria-live="polite">' + explainSBA(a, q, ans, false) + '</div>';
    }
    const last = a.idx === n - 1;
    let primary;
    if (go_ && !marked && a.settings.markOn === 'check') primary = '<button class="btn primary" data-a="check">Check answer</button>';
    else primary = '<button class="btn primary" data-a="' + (last ? 'finish' : 'next') + '">' + (last ? (go_ ? 'Finish' : 'Submit') : 'Next') + '</button>';
    const nav = '<div class="qnav"><button class="btn" data-a="prev"' + (a.idx === 0 ? ' aria-disabled="true"' : '') + '>Previous</button>' + primary + '</div>' + (S.inlineErr ? '<p class="inline-err" role="alert">' + esc(S.inlineErr) + '</p>' : '');
    const streak = a.settings.xpo && a.streak >= 3 ? '<span class="streak" aria-live="polite">🔥 ' + a.streak + ' in a row</span>' : '';
    const banner = a.timeUp && go_ ? '<p class="banner">Time\'s up. You can keep going at your own pace.</p>' : '';
    return '<div class="wrap" id="main">' + top + banner + '<article class="qcard" id="qcard"><p class="qtag"><span>' + esc(topic) + (q.type === 'tf' ? ' · True or false' : '') + '</span>' + streak + '</p><p class="qstem">' + esc(q.stem) + '</p>' + body + fb + '</article>' + nav + '</div>' + sheetHtml();
  }

  /* ---------- sheets (exit, navigator, submit, replace) ---------- */
  function sheetHtml() {
    const sh = S.sheet; if (!sh) return '';
    const a = S.attempt;
    if (sh.kind === 'exit') {
      return '<div class="overlay" data-a="closesheet"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop="1"><h3 id="sh-t">Leave this quiz?</h3><p>You\'re on question ' + (a.idx + 1) + ' of ' + a.qids.length + '.</p>' +
        '<label class="check"><input type="checkbox" id="keep" checked> Save my progress so I can continue later</label>' +
        '<div class="acts"><button class="btn" data-a="closesheet">Keep going</button><button class="btn primary" data-a="leave">Leave</button></div></div></div>';
    }
    if (sh.kind === 'nav') {
      const go_ = a.settings.marking === 'go';
      const dots = a.qids.map((id, i) => {
        const q = qOf(id); let cls = 'dot';
        if (go_ && a.marked[id]) cls += grade(q, a.ans[id]).correct ? ' okd' : ' nod';
        else if (isAnswered(id, a)) cls += ' done';
        if (i === a.idx) cls += ' cur';
        return '<button class="' + cls + '" data-a="jump" data-i="' + i + '" aria-label="Question ' + (i + 1) + '">' + (i + 1) + (a.flags[id] ? '<span class="fl" aria-hidden="true"></span>' : '') + '</button>';
      }).join('');
      const legend = go_ ? '<i style="background:var(--good-bg);border:1px solid var(--good)"></i>Correct <i style="background:var(--bad-bg);border:1px solid var(--bad)"></i>Wrong ' : '<i style="background:var(--panel2);border:1px solid var(--edge2)"></i>Answered ';
      return '<div class="overlay" data-a="closesheet"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop="1"><h3 id="sh-t">Questions</h3><div class="grid">' + dots + '</div><p class="legend">' + legend + '<span><i style="background:var(--gold);border-radius:50%"></i>Flagged</span></p><div class="acts"><button class="btn" data-a="closesheet">Close</button></div></div></div>';
    }
    if (sh.kind === 'submit') {
      const missing = a.qids.map((id, i) => isAnswered(id, a) ? null : i).filter(i => i !== null);
      return '<div class="overlay" data-a="closesheet"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop="1"><h3 id="sh-t">' + missing.length + ' question' + (missing.length === 1 ? '' : 's') + ' not finished</h3><p>Tap a number to go back to it, or finish now. Unanswered parts score zero.</p><div class="grid">' +
        missing.map(i => '<button class="dot" data-a="jump" data-i="' + i + '">' + (i + 1) + '</button>').join('') + '</div><div class="acts"><button class="btn" data-a="jump" data-i="' + missing[0] + '">Go to first</button><button class="btn primary" data-a="submitnow">' + (a.settings.marking === 'go' ? 'Finish anyway' : 'Submit anyway') + '</button></div></div></div>';
    }
    if (sh.kind === 'replace') {
      return '<div class="overlay" data-a="closesheet"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop="1"><h3 id="sh-t">Replace your saved quiz?</h3><p>You have an unfinished quiz in this course. Starting a new one will replace it.</p><div class="acts"><button class="btn" data-a="resume" data-k="' + esc(courseKeyOf(S.route)) + '">Resume saved</button><button class="btn primary" data-a="replacego">Start new</button></div></div></div>';
    }
    return '';
  }

  /* ---------- answering + DMC XPO ---------- */
  function markQuestion(q) {
    const a = S.attempt; if (a.marked[q.id]) return;
    a.marked[q.id] = true; a.markCount++;
    const g = grade(q, a.ans[q.id]);
    const fx = { kind: g.correct ? 'ok' : 'no', hard: g.correct && q.diff === 'hard', comment: null };
    if (g.correct) {
      a.streak++; a.best = Math.max(a.best, a.streak); a.wrongRun = 0;
      if (q.diff === 'hard') fx.comment = { group: 'hardCorrect', priority: true };
      if (a.streak === 3) fx.comment = fx.comment || { group: 'streak3', priority: true };
      else if (a.streak === 5) fx.comment = { group: 'streak5', priority: true };
      else if (a.streak >= 10 && a.streak % 5 === 0) fx.comment = { group: 'streak10', priority: true };
    } else {
      a.streak = 0; a.wrongRun++;
      if (q.diff === 'easy') fx.comment = { group: 'easyWrong' };
      else if (a.wrongRun >= 3 && a.wrongRun % 3 === 0) fx.comment = { group: 'wrongRun' };
    }
    S.fx = fx;
  }
  function onPick(k) {
    const a = S.attempt, q = qOf(a.qids[a.idx]);
    if (a.settings.marking === 'go' && a.marked[q.id]) return;
    a.ans[q.id] = k; S.inlineErr = '';
    if (a.settings.marking === 'go' && a.settings.markOn === 'tap') markQuestion(q);
    persistAttempt(); render();
  }
  function onTF(k, v) {
    const a = S.attempt, q = qOf(a.qids[a.idx]);
    if (a.settings.marking === 'go' && a.marked[q.id]) return;
    const cur = Object.assign({}, a.ans[q.id] || {});
    if (a.settings.marking === 'go' && a.settings.markOn === 'tap' && cur[k]) return;
    cur[k] = v; a.ans[q.id] = cur; S.inlineErr = '';
    if (a.settings.marking === 'go' && a.settings.markOn === 'tap' && q.opts.every(o => cur[o.k])) markQuestion(q);
    persistAttempt(); render();
  }
  function onCheck() {
    const a = S.attempt, q = qOf(a.qids[a.idx]);
    if (q.type === 'tf') { if (!isAnswered(q.id, a)) { S.inlineErr = 'Answer every statement first.'; render(); return; } }
    else if (!a.ans[q.id]) { S.inlineErr = 'Pick an answer first.'; render(); return; }
    S.inlineErr = ''; markQuestion(q); persistAttempt(); render();
  }
  function move(delta) {
    const a = S.attempt; const ni = a.idx + delta;
    if (ni < 0 || ni >= a.qids.length) return;
    a.idx = ni; S.inlineErr = ''; persistAttempt();
    navComment(); render(); window.scrollTo(0, 0);
  }
  function navComment() {
    const a = S.attempt, n = a.qids.length; if (n < 6) return;
    if (a.idx === Math.floor(n / 2) && !a.seen.halfway) { a.seen.halfway = 1; S.fx = { comment: { group: 'halfway' } }; }
    else if (a.idx === n - 1 && !a.seen.last) { a.seen.last = 1; S.fx = { comment: { group: 'lastQuestion' } }; }
  }
  function tryFinish() {
    const a = S.attempt;
    const missing = a.qids.some(id => !isAnswered(id, a) || (a.settings.marking === 'go' && !a.marked[id]));
    if (missing && a.qids.some(id => !isAnswered(id, a))) { S.sheet = { kind: 'submit' }; render(); return; }
    finish();
  }

  function runFx() {
    const fx = S.fx; S.fx = null; if (!fx) return;
    const a = S.attempt; if (!a || !a.settings.xpo) return;
    const card = document.getElementById('qcard'); const rm = reduceMotion();
    if (fx.kind === 'ok' && card) {
      const tgt = card.querySelector('.opt.ok') || card.querySelector('.tfsw.ok') || card;
      if (!rm) tgt.classList.add(fx.hard ? 'gold' : 'pulse-ok');
      if (fx.hard && !rm) confetti(14, tgt);
    }
    if (fx.kind === 'no') {
      if (card && !rm) card.classList.add('shake');
      try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) { }
    }
    if (fx.comment) maybeComment(fx.comment);
  }
  function maybeComment(c) {
    const a = S.attempt, nav = c.group === 'halfway' || c.group === 'lastQuestion';
    if (nav) { if (document.querySelector('.bubble')) return; }
    else { const gap = a.markCount - a.lastComment; if (!(gap >= 3 || (c.priority && gap >= 2))) return; }
    const lines = (S.comments[c.group] || []).filter(l => a.used.indexOf(l) < 0);
    if (!lines.length) return;
    const line = pick(lines); a.used.push(line); if (!nav) a.lastComment = a.markCount; persistAttempt();
    clearTimeout(S.bubbleT); S.bubbleT = setTimeout(() => { if (S.route && S.route.view === 'quiz' && !S.sheet) bubble(line); }, nav ? 150 : 550);
  }
  function bubble(text) { document.querySelectorAll('.bubble').forEach(b => b.remove()); const b = document.createElement('div'); b.className = 'bubble'; b.setAttribute('role', 'status'); b.textContent = text; document.body.appendChild(b); setTimeout(() => b.remove(), 2500); }
  function toast(text) { document.querySelectorAll('.toast').forEach(b => b.remove()); const b = document.createElement('div'); b.className = 'toast'; b.setAttribute('role', 'status'); b.textContent = text; document.body.appendChild(b); setTimeout(() => b.remove(), 2500); }
  function confetti(count, anchor) {
    if (reduceMotion()) return;
    const colors = ['#ffc745', '#2fbf71', '#7fa6ff', '#ef5b6e', '#ffffff'];
    let x = window.innerWidth / 2, y = window.innerHeight / 3;
    if (anchor && anchor.getBoundingClientRect) { const r = anchor.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span'); p.className = 'conf';
      p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = colors[i % colors.length];
      document.body.appendChild(p);
      const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * (count > 30 ? 260 : 120);
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 40;
      p.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + (dy + 120) + 'px)) rotate(' + (Math.random() * 540) + 'deg)', opacity: 0 }], { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
      setTimeout(() => p.remove(), 1600);
    }
  }

  /* ---------- timer ---------- */
  function startTimer() {
    stopTimer(); const a = S.attempt; if (!a || a.finished) return;
    let lastTick = Date.now();
    S.timerId = setInterval(() => {
      const now = Date.now(); a.elapsed += (now - lastTick) / 1000; lastTick = now;
      if (Math.round(a.elapsed) % 5 === 0) persistAttempt();
      if (!a.limit) return;
      const left = a.limit - a.elapsed, el = document.getElementById('timer');
      if (el) { el.textContent = fmtTime(left); el.classList.toggle('low', left <= 60); }
      if (left <= 60 && !a.warned && left > 0) { a.warned = true; toast('1 minute left'); }
      if (left <= 0 && !a.timeUp) {
        a.timeUp = true;
        if (a.settings.marking === 'end') { stopTimer(); toast('Time\'s up. Your quiz was submitted.'); finish(); }
        else { a.limit = null; persistAttempt(); render(); toast('Time\'s up'); }
      }
    }, 1000);
  }
  function stopTimer() { if (S.timerId) { clearInterval(S.timerId); S.timerId = null; } }

  /* ---------- finish + results ---------- */
  function finish() {
    const a = S.attempt; stopTimer(); a.finished = true;
    const d = dataForAttempt(a);
    let got = 0, total = 0, wrong = 0, missing = 0, run = 0, best = 0; const topics = {};
    a.qids.forEach(id => {
      const q = d.byId[id], g = grade(q, a.ans[id]);
      got += g.got; total += g.total; wrong += g.wrongMarks; missing += g.missing;
      if (g.correct) { run++; best = Math.max(best, run); } else run = 0;
      const t = topics[q.topic] || (topics[q.topic] = { got: 0, total: 0 }); t.got += g.got; t.total += g.total;
    });
    const pct = total ? Math.round(got / total * 100) : 0;
    const group = pct === 100 ? 'resultPerfect' : pct >= 80 ? 'resultHigh' : pct >= 50 ? 'resultMid' : 'resultLow';
    S.last = { a, got, total, wrong, missing, pct, best: Math.max(best, a.best), topics, msg: pick(S.comments[group] || ['Quiz complete']), celebrate: true };
    const hk = 'dq.hist.' + a.courseKey, hist = store.get(hk, []);
    hist.unshift({ at: Date.now(), coll: a.coll, label: a.label, pct, got, total }); store.set(hk, hist.slice(0, 30));
    store.del(saveKey(a.courseKey)); S.attempt = null; S.sheet = null; S.reviewFilter = 'all';
    go('#/results');
  }
  function viewResults() {
    const L = S.last, a = L.a, d = dataForAttempt(a), r = a.route;
    const xpo = a.settings.xpo;
    const tKeys = Object.keys(L.topics);
    const byTopic = tKeys.length > 1 ? '<h2>By topic</h2><div class="bytopic">' + tKeys.map(k => { const t = L.topics[k], p = Math.round(t.got / t.total * 100); return { k, p, t }; }).sort((x, y) => x.p - y.p).map(o => '<div class="bt"><span>' + esc((d.topics.find(t => t.id === o.k) || {}).title || o.k) + '</span><b>' + o.p + '%</b><div class="bar"><div style="width:' + o.p + '%"></div></div></div>').join('') + '</div>' : '';
    const metric = (lbl, val) => '<div class="metric"><span>' + lbl + '</span><b>' + val + '</b></div>';
    const base = Object.assign({}, r);
    return wrap(topbar() +
      '<p class="lead" style="margin:0 0 4px">' + esc(a.courseTitle) + ' · ' + esc(COLL[a.coll]) + ' · ' + esc(a.label) + '</p><h1>Results</h1>' +
      '<div class="score"><div class="ring" style="--p:' + L.pct + '"><div>' + L.pct + '%</div></div><div><div class="msg">' + (xpo ? esc(L.msg) : 'Quiz complete') + '</div><div class="s">' + L.got + ' of ' + L.total + ' marks · ' + a.qids.length + ' questions</div></div></div>' +
      '<div class="metrics">' + metric('Correct', L.got) + metric('Wrong', L.wrong) + metric('Unanswered', L.missing) + metric('Time', fmtTime(a.elapsed)) + (xpo ? metric('Longest streak', L.best) : '') + '</div>' +
      byTopic +
      '<div class="acts-col"><button class="btn primary" data-a="review">Review answers</button><button class="btn" data-a="retrywrong">Retry wrong ones</button></div>' +
      '<div class="goto"><span>Go to</span><a class="btn small" href="' + baseHash(base, 'setup') + '">Setup</a><a class="btn small" href="' + baseHash(base, 'topics') + '">Topics</a><a class="btn small" href="#/home">Home</a></div>');
  }
  function viewReview() {
    const L = S.last, a = L.a, d = dataForAttempt(a);
    const f = S.reviewFilter;
    const items = a.qids.map((id, i) => ({ i, q: d.byId[id], g: grade(d.byId[id], a.ans[id]), ans: a.ans[id], flag: !!a.flags[id] }))
      .filter(x => f === 'all' || (f === 'wrong' && !x.g.correct) || (f === 'flagged' && x.flag));
    const fbtn = (k, l) => '<button class="chip" data-a="rfilter" data-v="' + k + '" aria-pressed="' + (f === k) + '">' + l + '</button>';
    const list = items.map(x => {
      const q = x.q, map = displayMap(a, q), byKey = {}; q.opts.forEach(o => { byKey[o.k] = o; });
      const st = x.g.answered === 0 ? 'na' : x.g.correct ? 'ok' : 'no';
      let ansHtml;
      if (q.type === 'tf') {
        ansHtml = (a.order[q.id] || q.opts.map(o => o.k)).map(k => { const v = x.ans && x.ans[k]; const right = v === q.tf[k]; return '<p class="a"><b>' + map[k] + '.</b> ' + esc(byKey[k].t) + ' — ' + (v ? '<span class="' + (right ? 'c' : 'y') + '">You: ' + tfWord(v) + '</span>' : '<span class="y">Not answered</span>') + (right ? '' : ' · <span class="c">Answer: ' + tfWord(q.tf[k]) + '</span>') + '</p><p class="tfwhy">' + esc(remapExp(q.notes[k] || '', map)) + '</p>'; }).join('') + (q.why ? '<div class="feedback"><span class="k" style="margin-top:0">Key point</span><p>' + nl(remapExp(q.why, map)) + '</p></div>' : '');
      } else {
        ansHtml = '<p class="a">You: ' + (x.ans ? '<span class="' + (x.g.correct ? 'c' : 'y') + '">' + map[x.ans] + '. ' + esc(byKey[x.ans].t) + '</span>' : '<span class="y">Not answered</span>') + '</p>' + '<div class="feedback">' + explainSBA(a, q, x.ans, false) + '</div>';
      }
      return '<article class="rv ' + st + '"><p class="q">' + (x.i + 1) + '. ' + esc(q.stem) + (x.flag ? ' ★' : '') + '</p>' + ansHtml + '</article>';
    }).join('');
    return wrap(topbar() + '<nav class="crumbs"><a class="back" href="#/results" aria-label="Back to results">' + I.back + '</a><a href="#/results">Results</a><span class="sep">›</span><span class="here">Review</span></nav><h1>Review answers</h1>' +
      '<div class="filters">' + fbtn('all', 'All ' + a.qids.length) + fbtn('wrong', 'Wrong') + fbtn('flagged', 'Flagged') + '</div>' +
      (items.length ? '<div class="review">' + list + '</div>' : '<p class="empty">' + (f === 'wrong' ? 'Nothing wrong. Clean sheet!' : 'You didn\'t flag any questions.') + '</p>') +
      '<div class="acts-col"><button class="btn" data-a="retrywrong">Retry wrong ones</button><a class="btn" href="#/results">Back to results</a></div>');
  }
  function retryWrong() {
    const L = S.last, a = L.a, d = dataForAttempt(a);
    const ids = a.qids.filter(id => !grade(d.byId[id], a.ans[id]).correct);
    if (!ids.length) { toast('Nothing to retry. Perfect score!'); return; }
    const r = Object.assign({}, a.route); S.route = Object.assign({ view: 'setup' }, r);
    const st = Object.assign(getSetup(), { marking: a.settings.marking, markOn: a.settings.markOn, xpo: a.settings.xpo, timer: a.settings.timer === 'off' ? 'off' : 'auto' });
    beginAttempt(buildAttempt(r, shuffle(ids), st, 'Retry: ' + a.label));
  }

  /* ---------- render ---------- */
  function render() {
    const r = S.route || { view: 'home' };
    let html = '';
    switch (r.view) {
      case 'home': html = viewHome(); break;
      case 'year': html = viewYear(r); break;
      case 'sem': html = viewSem(r); break;
      case 'course': html = viewCourse(r); break;
      case 'topics': html = viewTopics(r); break;
      case 'setup': html = viewSetup(r); break;
      case 'quiz': html = viewQuiz(); break;
      case 'results': html = viewResults(); break;
      case 'review': html = viewReview(); break;
      default: html = viewHome();
    }
    $app.innerHTML = html;
    if (S.sheet) clearBubbles();
    if (r.view === 'quiz') runFx();
    if (r.view === 'results' && S.last && S.last.celebrate) {
      S.last.celebrate = false;
      if (S.last.a.settings.xpo) { if (S.last.pct === 100) confetti(70); else if (S.last.pct >= 80) confetti(40); }
    }
    const sheet = document.querySelector('.sheet'); if (sheet) { const f = sheet.querySelector('input,button.primary,button'); if (f) f.focus(); }
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-a]'); if (!el) return;
    const act = el.dataset.a;
    if (act === 'closesheet' && el.classList.contains('overlay') && e.target !== el) return; // click inside sheet
    const r = S.route;
    switch (act) {
      case 'theme': toggleTheme(); break;
      case 'changeyear': go('#/home'); break;
      case 'resume': {
        const a = store.get(saveKey(el.dataset.k), null); if (!a) { render(); return; }
        const year = yearById(a.route.year), sem = a.route.sem ? year.semesters.find(s => s.id === a.route.sem) : null;
        const course = coursesFor(year, sem).find(c => c.id === a.route.course);
        loadCourse(a.courseKey, course).then(() => { a.qids = a.qids.filter(id => S.cache[a.courseKey].byId[id]); S.route = Object.assign({ view: 'setup' }, a.route); S.attempt = a; S.sheet = null; go('#/quiz'); });
        break;
      }
      case 'discard': store.del(saveKey(el.dataset.k)); toast('Saved quiz discarded'); render(); break;
      case 'topic': case 'topicall': {
        const d = currentData(), counts = {}; d[r.coll].forEach(q => { counts[q.topic] = 1; });
        const ids = d.topics.filter(t => counts[t.id]).map(t => t.id);
        let sel = new Set(getSel(r).filter(id => counts[id]));
        if (act === 'topicall') sel = ids.every(id => sel.has(id)) ? new Set() : new Set(ids);
        else { const id = el.dataset.id; sel.has(id) ? sel.delete(id) : sel.add(id); }
        putSel(r, ids.filter(id => sel.has(id))); render(); break;
      }
      case 'continue': if (!getSel(r).length) { toast('Pick at least one topic'); return; } go(baseHash(r, 'setup')); break;
      case 'changetopics': go(baseHash(r, 'topics')); break;
      case 'count': { const st = getSetup(); const v = el.dataset.v; st.count = (v === 'all' || v === 'custom') ? v : parseInt(v, 10); S.inlineErr = ''; putSetup(st); render(); if (v === 'custom') { const c = document.getElementById('custom'); if (c) c.focus(); } break; }
      case 'marking': case 'markOn': case 'timer': { const st = getSetup(); st[act] = el.dataset.v; putSetup(st); render(); break; }
      case 'start': startFromSetup(); break;
      case 'replacego': { const sh = S.sheet; S.sheet = null; beginAttempt(buildAttempt(r, sh.qids, getSetup(), sh.label)); break; }
      case 'pick': onPick(el.dataset.k); break;
      case 'tf': onTF(el.dataset.k, el.dataset.v); break;
      case 'check': onCheck(); break;
      case 'next': move(1); break;
      case 'prev': move(-1); break;
      case 'finish': tryFinish(); break;
      case 'submitnow': S.sheet = null; finish(); break;
      case 'flag': { const a = S.attempt, id = a.qids[a.idx]; a.flags[id] = !a.flags[id]; persistAttempt(); render(); break; }
      case 'navigator': S.sheet = { kind: 'nav' }; render(); break;
      case 'jump': { const a = S.attempt; a.idx = parseInt(el.dataset.i, 10) || 0; S.sheet = null; S.inlineErr = ''; persistAttempt(); render(); window.scrollTo(0, 0); break; }
      case 'exit': S.sheet = { kind: 'exit' }; render(); break;
      case 'closesheet': S.sheet = null; render(); break;
      case 'leave': {
        const a = S.attempt, keep = document.getElementById('keep');
        stopTimer();
        if (keep && keep.checked) { persistAttempt(); toast('Progress saved'); } else store.del(saveKey(a.courseKey));
        S.attempt = null; S.sheet = null; go(baseHash(a.route, 'topics')); break;
      }
      case 'review': go('#/review'); break;
      case 'rfilter': S.reviewFilter = el.dataset.v; render(); break;
      case 'retrywrong': retryWrong(); break;
    }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset && t.dataset.a === 'xpo') { const st = getSetup(); st.xpo = t.checked; putSetup(st); render(); }
  });
  document.addEventListener('input', e => {
    const t = e.target, st = getSetup();
    if (t.id === 'custom') { st.custom = t.value; S.inlineErr = ''; putSetup(st); const info = document.querySelector('.dock .info b'); if (info) { const v = parseInt(t.value, 10) || 0; info.textContent = (v > 0 ? v : '—') + ' question' + (v === 1 ? '' : 's'); } const er = document.querySelector('.err'); if (er) er.remove(); }
    if (t.id === 'tmin') { st.timerMin = t.value; putSetup(st); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && S.sheet) { S.sheet = null; render(); return; }
    if (!S.route || S.route.view !== 'quiz' || S.sheet || !S.attempt) return;
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    const a = S.attempt, q = qOf(a.qids[a.idx]), key = e.key.toLowerCase();
    if (q.type === 'sba' && /^[a-h]$/.test(key)) { const order = a.order[q.id]; const i = key.charCodeAt(0) - 97; if (order[i]) { onPick(order[i]); e.preventDefault(); } }
    else if (e.key === 'ArrowRight') { move(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { move(-1); e.preventDefault(); }
    else if (e.key === 'Enter') { const b = document.querySelector('.qnav .btn.primary'); if (b) { b.click(); e.preventDefault(); } }
  });
  let tx = null, ty = null;
  document.addEventListener('touchstart', e => { if (S.route && S.route.view === 'quiz' && !S.sheet && e.touches.length === 1) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; } else tx = null; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (tx == null || !S.attempt) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 40) move(dx < 0 ? 1 : -1);
  }, { passive: true });
  window.addEventListener('hashchange', route);
  window.addEventListener('pagehide', persistAttempt);

  /* ---------- boot ---------- */
  applyTheme();
  Promise.all([getJSON('data/catalog.json'), getJSON('data/comments.json').catch(() => ({}))]).then(([cat, com]) => {
    S.catalog = cat; S.comments = com; route();
  }).catch(() => { $app.innerHTML = '<div class="wrap"><p class="banner">The question bank could not load. Check your connection and refresh.</p></div>'; });
})();
