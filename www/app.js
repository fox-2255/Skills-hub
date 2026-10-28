(function () {
  'use strict';

  const SKILLS = Array.isArray(window.SKILLS) ? window.SKILLS : [];
  const byId = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

  const PACKS = [
    { id: 'everyday', label: 'Everyday' },
    { id: 'dev', label: 'Dev' },
    { id: 'bonus', label: 'Bonus' },
  ];

  const CATS = {
    'health-firstaid': ['Health and first aid', '🩺'],
    'money-budgeting': ['Money and budgeting', '💰'],
    'home-repair': ['Home repair', '🔧'],
    'cooking-food': ['Cooking and food', '🍳'],
    'safety-emergency': ['Safety and emergency', '🚨'],
    'work-career': ['Work and career', '💼'],
    'study-learning': ['Study and learning', '📚'],
    'travel-commute': ['Travel and commute', '🧳'],
    'digital-life': ['Digital life', '📱'],
    'communication-relationships': ['Communication', '💬'],
    'android-termux': ['Android and Termux', '🤖'],
    coding: ['Coding', '💻'],
    'bots-trading': ['Bots and trading', '📈'],
    'ai-agents': ['AI agents', '🧠'],
    'radio-audio': ['Radio and audio', '📻'],
    'networking-security': ['Networking and security', '🔒'],
    productivity: ['Productivity', '✅'],
  };
  const catInfo = (id) => CATS[id] || [id.replace(/-/g, ' '), '📄'];

  const view = document.getElementById('view');
  const toastEl = document.getElementById('toast');
  let lastTab = 'home';
  let searchQuery = '';
  let searchPack = 'all';
  let current = null;
  let toastTimer = null;

  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
        /* storage unavailable: keep in memory only */
      }
    },
  };

  const live = (arr) => (Array.isArray(arr) ? arr.filter((id) => byId[id]) : []);
  let pins = live(store.get('sh.pins', []));
  let recent = live(store.get('sh.recent', []));
  let browsePack = store.get('sh.pack', 'everyday');
  if (!PACKS.some((p) => p.id === browsePack)) browsePack = 'everyday';

  const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inline = (t) =>
    esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  function render(md) {
    const lines = md.split('\n');
    let out = '';
    let list = '';
    let i = 0;
    const close = () => {
      if (list) {
        out += `</${list}>`;
        list = '';
      }
    };
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith('```')) {
        close();
        const buf = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
        i++;
        const code = buf.join('\n');
        out += `<div class="code"><button type="button" class="copy">Copy</button><pre><code data-tpl="${esc(code)}">${esc(code)}</code></pre></div>`;
        continue;
      }
      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) {
        close();
        const n = h[1].length + 1;
        out += `<h${n}>${inline(h[2])}</h${n}>`;
        i++;
        continue;
      }
      if (line.trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
        close();
        const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        const head = cells(line);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]));
        out += `<div class="tbl"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`;
        continue;
      }
      const li = line.match(/^\s*([-*]|\d+\.)\s+(.*)$/);
      if (li) {
        const tag = /\d/.test(li[1]) ? 'ol' : 'ul';
        if (list !== tag) {
          close();
          out += `<${tag}>`;
          list = tag;
        }
        const task = li[2].match(/^\[( |x)\]\s+(.*)$/i);
        out += task
          ? `<li class="task"><label><input type="checkbox"${task[1].toLowerCase() === 'x' ? ' checked' : ''}><span>${inline(task[2])}</span></label></li>`
          : `<li>${inline(li[2])}</li>`;
        i++;
        continue;
      }
      close();
      if (line.trim()) out += `<p>${inline(line)}</p>`;
      i++;
    }
    close();
    return out;
  }

  function row(s) {
    return `<a class="row" href="#/skill/${encodeURIComponent(s.id)}"><div class="row-top"><span class="row-name">${esc(s.name)}</span><span class="badge t-${esc(s.type)}">${esc(s.type)}</span></div><p>${esc(s.description)}</p></a>`;
  }

  function section(title, ids, empty) {
    return `<section><h2 class="sec">${title}</h2>${
      ids.length ? ids.map((id) => row(byId[id])).join('') : `<p class="empty">${empty}</p>`
    }</section>`;
  }

  function viewHome() {
    if (!SKILLS.length) {
      view.innerHTML = '<header class="top"><h1>Skills hub</h1></header><p class="empty">Walang skills data. Patakbuhin ang tools/build-index.js bago mag-build.</p>';
      return;
    }
    const counts = PACKS.map((p) => `${SKILLS.filter((s) => s.pack === p.id).length} ${p.label}`).join(' · ');
    view.innerHTML =
      `<header class="top"><h1>Skills hub</h1><p class="sub">${SKILLS.length} skills · ${esc(counts)}</p></header>` +
      section('Pinned', pins, 'I-pin ang skill para lumabas dito.') +
      section('Recently opened', recent.slice(0, 5), 'Wala pang nabuksan.');
  }

  function viewBrowse(pack, cat) {
    if (pack && cat) return viewCategory(pack, cat);
    const cats = {};
    SKILLS.filter((s) => s.pack === browsePack).forEach((s) => {
      cats[s.category] = (cats[s.category] || 0) + 1;
    });
    const cards = Object.keys(cats)
      .sort()
      .map((c) => {
        const [label, icon] = catInfo(c);
        return `<a class="card" href="#/browse/${browsePack}/${encodeURIComponent(c)}"><span class="ico">${icon}</span><b>${esc(label)}</b><small>${cats[c]} skills</small></a>`;
      })
      .join('');
    view.innerHTML =
      `<header class="top"><h1>Browse</h1></header>` +
      `<div class="seg">${PACKS.map((p) => `<button type="button" data-pack="${p.id}" class="${p.id === browsePack ? 'on' : ''}">${p.label}</button>`).join('')}</div>` +
      `<div class="grid">${cards || '<p class="empty">Walang skills sa pack na ito.</p>'}</div>`;
  }

  function viewCategory(pack, cat) {
    const [label, icon] = catInfo(cat);
    const list = SKILLS.filter((s) => s.pack === pack && s.category === cat);
    view.innerHTML = `<header class="top"><a class="back" href="#/browse">← Browse</a><h1>${icon} ${esc(label)}</h1></header>${
      list.length ? list.map((s) => row(s)).join('') : '<p class="empty">Walang skills dito.</p>'
    }`;
  }

  function viewSaved() {
    view.innerHTML =
      '<header class="top"><h1>Saved</h1></header>' +
      (pins.length
        ? pins.map((id) => row(byId[id])).join('')
        : '<p class="empty">Wala pang naka-pin. Buksan ang skill at i-tap ang Pin.</p>');
  }

  const hay = (s) => [s.name, s.id, s.description, s.category, s.tags.join(' ')].join(' ').toLowerCase();

  function renderResults() {
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const list = SKILLS.filter(
      (s) => (searchPack === 'all' || s.pack === searchPack) && terms.every((t) => hay(s).includes(t))
    );
    document.getElementById('results').innerHTML = list.length
      ? list.map((s) => row(s)).join('')
      : '<p class="empty">Walang nahanap.</p>';
  }

  function viewSearch() {
    const chips = [{ id: 'all', label: 'All' }, ...PACKS];
    view.innerHTML =
      `<header class="top"><h1>Search</h1></header>` +
      `<input id="q" class="search" type="search" placeholder="Search skills" value="${esc(searchQuery)}" autocomplete="off">` +
      `<div class="chips">${chips.map((p) => `<button type="button" data-spack="${p.id}" class="${p.id === searchPack ? 'on' : ''}">${p.label}</button>`).join('')}</div>` +
      `<div id="results"></div>`;
    renderResults();
  }

  function viewSkill(id) {
    const s = byId[id];
    if (!s) {
      current = null;
      view.innerHTML = '<header class="top"><a class="back" href="#/home">← Home</a></header><p class="empty">Hindi nahanap ang skill.</p>';
      return;
    }
    current = s;
    recent = [id, ...recent.filter((x) => x !== id)].slice(0, 10);
    store.set('sh.recent', recent);
    const vars = s.type === 'prompt' ? [...new Set([...s.body.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))] : [];
    const rel = s.related.filter((r) => byId[r]);
    const pinned = pins.includes(id);
    view.innerHTML =
      `<header class="top"><button type="button" class="back" data-act="back">← Back</button><h1>${esc(s.name)}</h1>` +
      `<p class="sub">${esc(catInfo(s.category)[0])} · <span class="badge t-${esc(s.type)}">${esc(s.type)}</span> · v${esc(s.version)}</p></header>` +
      `<p class="desc">${esc(s.description)}</p>` +
      `<div class="actions"><button type="button" data-act="copy">Copy</button><button type="button" data-act="share">Share</button><button type="button" data-act="pin" class="${pinned ? 'on' : ''}">${pinned ? 'Pinned' : 'Pin'}</button></div>` +
      (vars.length
        ? `<div class="vars"><p class="sec">Fill in</p>${vars.map((v) => `<label>${esc(v)}<textarea rows="2" data-var="${esc(v)}"></textarea></label>`).join('')}</div>`
        : '') +
      `<article class="md">${render(s.body)}</article>` +
      (rel.length ? `<section><h2 class="sec">Related</h2>${rel.map((r) => row(byId[r])).join('')}</section>` : '');
  }

  function fillVars() {
    const vals = {};
    view.querySelectorAll('[data-var]').forEach((el) => {
      vals[el.dataset.var] = el.value;
    });
    view.querySelectorAll('code[data-tpl]').forEach((c) => {
      c.textContent = c.dataset.tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => vals[k] || m);
    });
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1400);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        ta.remove();
      }
    }
    toast('Copied');
  }

  function skillText() {
    const code = current.type === 'prompt' ? view.querySelector('code[data-tpl]') : null;
    return code ? code.textContent : `# ${current.name}\n\n${current.body}`;
  }

  async function act(name, btn) {
    if (name === 'back') {
      if (history.length > 1) history.back();
      else location.hash = '#/home';
      return;
    }
    if (!current) return;
    if (name === 'copy') return copyText(skillText());
    if (name === 'share') {
      if (!navigator.share) return copyText(skillText());
      try {
        await navigator.share({ title: current.name, text: skillText() });
      } catch (e) {
        if (e.name !== 'AbortError') toast('Hindi na-share');
      }
      return;
    }
    if (name === 'pin') {
      pins = pins.includes(current.id) ? pins.filter((x) => x !== current.id) : [current.id, ...pins];
      store.set('sh.pins', pins);
      const on = pins.includes(current.id);
      btn.classList.toggle('on', on);
      btn.textContent = on ? 'Pinned' : 'Pin';
    }
  }

  view.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.pack) {
      browsePack = t.dataset.pack;
      store.set('sh.pack', browsePack);
      viewBrowse();
    } else if (t.dataset.spack) {
      searchPack = t.dataset.spack;
      viewSearch();
    } else if (t.classList.contains('copy')) {
      copyText(t.parentElement.querySelector('code').textContent);
    } else if (t.dataset.act) {
      act(t.dataset.act, t);
    }
  });

  view.addEventListener('input', (e) => {
    if (e.target.id === 'q') {
      searchQuery = e.target.value;
      renderResults();
    } else if (e.target.dataset && e.target.dataset.var) {
      fillVars();
    }
  });

  function safeDecode(s) {
    try {
      return decodeURIComponent(s);
    } catch (e) {
      return s;
    }
  }

  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(safeDecode);
    const views = {
      home: viewHome,
      browse: () => viewBrowse(parts[1], parts[2]),
      saved: viewSaved,
      search: viewSearch,
      skill: () => viewSkill(parts[1]),
    };
    const name = views[parts[0]] ? parts[0] : 'home';
    views[name]();
    if (name !== 'skill') lastTab = name;
    document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === lastTab));
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  route();
})();
