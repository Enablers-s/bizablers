// Bizabler-S setup cost calculator: live, ungated, itemised, every zone compared.
// Prices and zone rules live in calculator-data.js; this file only reads inputs, prices and renders.
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const D = window.BIZ_CALC_DATA;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- site chrome (same behaviour as main.js) ----------
  const LIVE = { enabler: 'https://enabler-s.vercel.app/', finablers: 'https://finablers.vercel.app/', movera: 'https://moveraglobal.com/' };
  const LOCAL = { enabler: '../webpage1/index.html', finablers: '../finablers/index.html', movera: 'https://moveraglobal.com/' };
  const isLocal = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  const SITES = isLocal ? LOCAL : LIVE;
  document.querySelectorAll('[data-link]').forEach((a) => { if (SITES[a.dataset.link]) a.href = SITES[a.dataset.link]; });
  const toggle = document.querySelector('.menu-toggle');
  const menu = $('menu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $('year').textContent = new Date().getFullYear();
  document.querySelectorAll('[data-checked]').forEach((el) => { el.textContent = D.CHECKED; });

  const PHONE = '971545586455';
  const EMAIL = 'Hello@enabler-s.com';

  // ---------- state (mirrored in the URL hash so a quote can be shared) ----------
  const DEFAULTS = { a: 'consulting', c: 'intl', owners: 1, investors: 1, employees: 0, dependants: 0, inside: 0, w: 'flexi', r: 1, x: [], cur: 'AED', z: '' };
  const state = { ...DEFAULTS };
  try {
    const p = new URLSearchParams(location.hash.slice(1));
    for (const k of Object.keys(DEFAULTS)) {
      if (!p.has(k)) continue;
      const v = p.get(k);
      if (k === 'x') state.x = v ? v.split(',') : [];
      else state[k] = typeof DEFAULTS[k] === 'number' ? Math.max(0, parseInt(v, 10) || 0) : v;
    }
    if (!D.CURRENCIES[state.cur]) state.cur = 'AED';
    if (state.owners < 1) state.owners = 1;
  } catch (e) { /* bad hash: keep defaults */ }

  const writeHash = () => {
    const p = new URLSearchParams();
    for (const k of Object.keys(DEFAULTS)) {
      const v = k === 'x' ? state.x.join(',') : String(state[k]);
      if (v !== (k === 'x' ? '' : String(DEFAULTS[k]))) p.set(k, v);
    }
    history.replaceState(null, '', `${location.pathname}${location.search}${p.toString() ? '#' + p : ''}`);
  };

  // ---------- money ----------
  const money = (aed) => {
    const cur = D.CURRENCIES[state.cur];
    let v = aed * cur.rate;
    if (state.cur !== 'AED') v = Math.round(v / 10) * 10;
    return new Intl.NumberFormat('en', { style: 'currency', currency: state.cur, maximumFractionDigits: 0, currencyDisplay: 'code' })
      .format(v).replace(/ /g, ' ');
  };
  const sum = (lines) => lines.reduce((t, l) => t + l.amount, 0);

  // ---------- pricing ----------
  const activityLabel = () => D.ACTIVITIES.find((a) => a.id === state.a)?.label || '';

  function maxVisas(z) {
    if (z.type === 'offshore') return 0;
    if (state.w === 'office') return null; // set by office size
    if (z.type === 'mainland') return 3;   // a flexi-desk Ejari usually carries 1–3 visas
    return z.maxVisas;
  }

  function eligibility(z) {
    const visas = state.investors + state.employees;
    const fit = z.fit[state.a];
    if (fit === 'no') return z.type === 'offshore'
      ? 'Offshore companies cannot trade or hold a UAE operating licence'
      : `Does not licence ${activityLabel().toLowerCase()}`;
    if (z.type === 'offshore' && (visas || state.dependants)) return 'Offshore companies cannot sponsor UAE visas';
    if (z.type === 'offshore' && state.c !== 'intl') return 'Offshore companies cannot trade inside the UAE';
    if (z.type === 'freezone' && state.c === 'local' && state.a === 'retail') return 'Free zone companies cannot serve walk-in UAE customers directly';
    const max = maxVisas(z);
    if (max !== null && visas > max) return `Flexi-desk allows up to ${max} visa${max === 1 ? '' : 's'}; choose a private office for more`;
    return '';
  }

  function quote(z) {
    const C = D.VISA_COMMON;
    const visas = state.investors + state.employees;
    const people = visas + state.dependants;
    const conf = z.conf;
    const y1 = [];
    const add = (arr, group, label, amount, c, note) => { if (amount > 0) arr.push({ group, label, amount, conf: c, note }); };

    // company
    add(y1, 'Licence & company', z.type === 'offshore' ? 'Incorporation & registered agent' : 'Trade licence & registration', z.licence, conf.licence);
    const extraSh = Math.max(0, state.owners - z.extraShareholder.included);
    add(y1, 'Licence & company', `Extra shareholders (${extraSh} × ${money(z.extraShareholder.fee)})`, extraSh * z.extraShareholder.fee, 'pub');
    if (visas) add(y1, 'Licence & company', 'Establishment & immigration card', z.visaUplift, conf.visaUplift);

    // workspace
    let rent = 0;
    if (z.type === 'mainland') {
      rent = z.rent[state.w];
      add(y1, 'Workspace', state.w === 'office' ? 'Office lease with Ejari, first year (small office)' : 'Flexi-desk lease with Ejari, first year', rent, conf.rent);
      add(y1, 'Licence & company', `Rent-linked licence fee (${z.rentLinkedFee * 100}% of rent)`, Math.round(rent * z.rentLinkedFee), 'pub');
    } else if (z.type === 'freezone' && state.w === 'office') {
      rent = D.FZ_OFFICE_UPGRADE;
      add(y1, 'Workspace', 'Private office instead of flexi-desk, first year', rent, 'est');
    }

    // people
    add(y1, 'Visas & people', `Owner / investor visa × ${state.investors}`, state.investors * z.investorVisa, conf.visa);
    add(y1, 'Visas & people', `Employee visa × ${state.employees}`, state.employees * z.employeeVisa, conf.visa);
    if (!z.medEidIncluded && visas) {
      add(y1, 'Visas & people', `${C.medical.label} × ${visas}`, visas * C.medical.amount, C.medical.conf);
      add(y1, 'Visas & people', `${C.eid.label} × ${visas}`, visas * C.eid.amount, C.eid.conf);
    }
    add(y1, 'Visas & people', `${C.dependant.label} × ${state.dependants}`, state.dependants * C.dependant.amount, C.dependant.conf);
    if (state.inside) add(y1, 'Visas & people', `${C.changeOfStatus.label} × ${people}`, people * C.changeOfStatus.amount, C.changeOfStatus.conf);
    add(y1, 'Visas & people', `${C.insurance.label} × ${people}`, people * C.insurance.amount, C.insurance.conf);

    // add-ons and our fee
    const addons = D.ADDONS.filter((a) => state.x.includes(a.id));
    addons.forEach((a) => add(y1, 'Add-ons', a.label, a.amount, 'fixed'));
    add(y1, 'Bizabler-S', D.SERVICE_FEE.label, D.SERVICE_FEE.amount, 'fixed');

    // year 2: renewals only (visas last 2 years)
    const y2 = [];
    add(y2, 'Renewal', 'Licence renewal', z.renewal, conf.renewal);
    if (visas) add(y2, 'Renewal', 'Establishment & immigration card renewal', z.visaUpliftRenewal, conf.visaUplift);
    if (rent) add(y2, 'Renewal', 'Office / desk rent', rent, 'est');
    if (z.type === 'mainland') add(y2, 'Renewal', 'Rent-linked licence fee', Math.round(rent * z.rentLinkedFee), 'pub');
    add(y2, 'Renewal', `Health insurance × ${people}`, people * C.insurance.amount, C.insurance.conf);
    addons.filter((a) => a.yearly).forEach((a) => add(y2, 'Renewal', a.label.replace(', first year', ''), a.amount, 'fixed'));

    // year 3: like year 2, plus 2-year visa renewals
    const y3 = y2.slice();
    const visaRenew = state.investors * z.investorVisa + state.employees * z.employeeVisa + state.dependants * C.dependant.amount
      + (z.medEidIncluded ? 0 : visas * (C.medical.amount + C.eid.amount));
    add(y3, 'Renewal', 'Visa renewals (visas last 2 years)', visaRenew, 'est');

    const deposits = [];
    add(deposits, 'Refundable', `${C.dependantDeposit.label} × ${state.dependants}`, state.dependants * C.dependantDeposit.amount, C.dependantDeposit.conf);
    if (z.shareCapital) add(deposits, 'Refundable', 'Paid-up share capital (stays your money, in your bank)', z.shareCapital, 'pub');

    const t1 = sum(y1); const t2 = sum(y2); const t3 = sum(y3);
    return { y1, y2, y3, deposits, t1, t2, three: t1 + t2 + t3 };
  }

  function score(z) {
    const f = z.fit[state.a];
    let s = f === 'strong' ? 2 : 0;
    if (z.type === 'mainland') s += state.c === 'local' ? 3 : state.c === 'b2b' ? 1 : 0;
    if (z.type === 'freezone' && state.c === 'intl') s += 1;
    return s;
  }

  function rankAll() {
    const rows = D.ZONES.map((z) => ({ z, why: eligibility(z), q: quote(z), s: score(z) }));
    // Cost-led: 3-year cost, with 10% off per fit point so a zone built for the activity can edge a slightly cheaper one
    rows.forEach((r) => { r.rank = r.q.three * (1 - 0.1 * r.s); });
    const ok = rows.filter((r) => !r.why).sort((a, b) => a.rank - b.rank);
    const no = rows.filter((r) => r.why).sort((a, b) => a.q.t1 - b.q.t1);
    return { ok, no };
  }

  function reasons(row, ok) {
    const z = row.z;
    const out = [];
    if (z.fit[state.a] === 'strong') out.push(`Strong fit for ${activityLabel().toLowerCase()}`);
    const cheapest = ok.length && Math.min(...ok.map((r) => r.q.t1)) === row.q.t1;
    if (cheapest && ok.length > 1) out.push(`Lowest year-1 cost of the ${ok.length} options that fit your setup`);
    const cheapest3 = ok.length && Math.min(...ok.map((r) => r.q.three)) === row.q.three;
    if (cheapest3 && ok.length > 1) out.push('Lowest 3-year cost, renewals included');
    if (z.type === 'mainland' && state.c !== 'intl') out.push('Can sell directly to UAE customers and bid for government work');
    if (z.type === 'freezone' && state.c === 'intl') out.push('100% foreign ownership and no local market restrictions for overseas clients');
    if (z.medEidIncluded && state.investors + state.employees) out.push('Visa fee already covers medical test and Emirates ID');
    out.push(z.note);
    return out;
  }

  // ---------- tax and compliance flags ----------
  function flags() {
    const f = ['Corporate tax registration is required for every company (0% on profit up to AED 375,000, 9% above).'];
    if (state.r === 0) f.push('VAT registration is not required until taxable sales pass AED 375,000 a year.');
    if (state.r === 1) f.push('You can register for VAT voluntarily (above AED 187,500); it becomes mandatory at AED 375,000.');
    if (state.r >= 2) f.push('VAT registration is mandatory: taxable sales above AED 375,000 a year.');
    if (state.r <= 2) f.push('Small Business Relief may apply while revenue stays under AED 3M.');
    if (state.r === 3) f.push('Above AED 3M revenue: plan for audited accounts and full corporate tax filing.');
    return f;
  }

  const EXCLUDED = [
    'Extra approvals for regulated activities (e.g. health, education, food, transport)',
    'Bank minimum balance (AED 0 to 50,000 depending on the bank)',
    'Audit and annual accounting, unless added above',
    'Office fit-out, furniture and utilities',
    'Golden visa (needs AED 2M company capital or AED 250k a year in tax)',
  ];

  // ---------- render ----------
  const badge = (c) => c === 'pub' ? '<span class="tag-pub">Published</span>' : c === 'est' ? '<span class="tag-est">Estimate</span>' : '<span class="tag-fixed">Fixed</span>';

  function table(lines) {
    const groups = [...new Set(lines.map((l) => l.group))];
    return groups.map((g) => `
      <tbody>
        <tr class="g"><th colspan="2">${esc(g)}</th></tr>
        ${lines.filter((l) => l.group === g).map((l) => `
          <tr><td>${esc(l.label)} ${badge(l.conf)}</td><td class="amt">${money(l.amount)}</td></tr>`).join('')}
      </tbody>`).join('');
  }

  function renderPick(row, ok, isAuto) {
    const { z, q } = row;
    const r = reasons(row, ok);
    const people = state.investors + state.employees;
    $('pick').innerHTML = `
      <header class="pick-head">
        <span class="pick-badge">${isAuto ? 'Best match for you' : 'Your selection'}</span>
        <h2>${esc(z.name)}</h2>
        <p class="pick-sub">${esc(z.emirate)} · ${z.type === 'freezone' ? 'Free zone' : z.type === 'mainland' ? 'Mainland' : 'Offshore'}${z.office && !(state.w === 'office' && z.type === 'freezone') ? ' · ' + esc(z.office) : ''}</p>
      </header>
      <div class="totals">
        <div class="t-main"><span>Year 1, all in</span><b>${money(q.t1)}</b></div>
        <div><span>Year 2 renewal</span><b>${money(q.t2)}</b></div>
        <div><span>3-year total</span><b>${money(q.three)}</b></div>
      </div>
      <ul class="why-list">${r.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>

      <h3>Year 1 breakdown</h3>
      <table class="lines">${table(q.y1)}
        <tfoot><tr><td>Total year 1</td><td class="amt">${money(q.t1)}</td></tr></tfoot>
      </table>

      <details>
        <summary>Year 2 and year 3: what renews</summary>
        <table class="lines">${table(q.y2)}<tfoot><tr><td>Total year 2</td><td class="amt">${money(q.t2)}</td></tr></tfoot></table>
        <p class="small">Year 3 is ${money(sum(q.y3))}: the same renewals plus visa renewals, because UAE residence visas last 2 years.</p>
      </details>

      ${q.deposits.length ? `
      <div class="deposits">
        <h3>Money you get back</h3>
        <table class="lines">${table(q.deposits)}</table>
      </div>` : ''}

      <div class="flags">
        <h3>Tax &amp; compliance for your revenue</h3>
        <ul>${flags().map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      </div>

      <details>
        <summary>Not included in this price</summary>
        <ul class="excl">${EXCLUDED.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
      </details>

      <p class="pick-src">Source: ${esc(z.src)}. Checked ${esc(D.CHECKED)}.</p>
      <div class="next">
        <a href="${SITES.finablers}">Bank account &amp; tax with <b>Finablers</b> →</a>
        ${people ? `<a href="${SITES.movera}" target="_blank" rel="noopener">Visas &amp; hiring with <b>Movera</b> →</a>` : ''}
      </div>`;
  }

  function renderCompare(ok, no, pickId) {
    const low1 = Math.min(...ok.map((r) => r.q.t1));
    const li = (row, i) => {
      const { z, q, why } = row;
      const tags = [z.fit[state.a] === 'strong' ? '<span class="fit">Strong fit</span>' : '', !why && q.t1 === low1 ? '<span class="fit">Lowest year 1</span>' : '']
        .filter(Boolean).join(' · ');
      const nums = why ? '<span class="c-num c-na">Not available</span>' : `
            <span class="c-num"><small>Year 1</small>${money(q.t1)}</span>
            <span class="c-num"><small>Year 2</small>${money(q.t2)}</span>
            <span class="c-num c-3"><small>3 years</small>${money(q.three)}</span>`;
      return `
        <li class="${why ? 'off' : ''}${z.id === pickId ? ' on' : ''}">
          <button type="button" data-zone="${z.id}" ${why ? 'disabled' : ''} aria-pressed="${z.id === pickId}">
            <span class="c-rank">${why ? '–' : i + 1}</span>
            <span class="c-name"><b>${esc(z.name)}</b><small>${esc(z.emirate)}${tags ? ' · ' : ''}${tags}</small>${why ? `<em>${esc(why)}</em>` : ''}</span>${nums}
          </button>
        </li>`;
    };
    $('compare-list').innerHTML = ok.map(li).join('') + no.map((r) => li(r, 0)).join('');
  }

  let current = null;
  function render() {
    const { ok, no } = rankAll();
    let row = ok.find((r) => r.z.id === state.z);
    const isAuto = !row;
    if (!row) { row = ok[0]; state.z = ''; }
    current = row;
    if (row) renderPick(row, ok, isAuto);
    else $('pick').innerHTML = '<p class="empty">No option fits this exact combination. Try fewer visas or a private office, or <a href="index.html#contact">ask us</a>.</p>';
    $('peek-total').textContent = row ? money(row.q.t1) : '–';
    $('peek-zone').textContent = row ? `${row.z.name} · see breakdown` : 'No option fits';
    renderCompare(ok, no, row?.z.id);
    syncInputs();
    writeHash();
    updateShare(); // after writeHash so the shared link carries this exact quote
  }

  // ---------- inputs ----------
  function chips(el, items, key) {
    el.innerHTML = items.map((it) => `<button type="button" class="chip" data-value="${it.id}" aria-pressed="false">${esc(it.label)}</button>`).join('');
    bindChips(el, key);
  }
  function bindChips(el, key) {
    el.addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      state[key] = typeof DEFAULTS[key] === 'number' ? Number(b.dataset.value) : b.dataset.value;
      render();
    });
  }
  chips($('in-activity'), D.ACTIVITIES, 'a');
  chips($('in-customers'), D.CUSTOMERS, 'c');
  bindChips($('in-office'), 'w');
  bindChips($('in-revenue'), 'r');

  document.querySelectorAll('.stepper').forEach((s) => {
    const key = s.dataset.key;
    s.insertAdjacentHTML('beforeend', `
      <span class="s-ctl">
        <button type="button" data-d="-1" aria-label="Fewer">−</button>
        <output aria-live="polite"></output>
        <button type="button" data-d="1" aria-label="More">+</button>
      </span>`);
    s.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-d]');
      if (!b) return;
      const min = Number(s.dataset.min); const max = Number(s.dataset.max);
      state[key] = Math.min(max, Math.max(min, state[key] + Number(b.dataset.d)));
      render();
    });
  });

  const inside = document.querySelector('input[name="inside"]');
  inside.addEventListener('change', () => { state.inside = inside.checked ? 1 : 0; render(); });

  $('in-addons').innerHTML = D.ADDONS.map((a) => `
    <label class="check"><input type="checkbox" value="${a.id}"> ${esc(a.label)} <b>${'+'}<span data-addon="${a.id}"></span></b></label>`).join('');
  $('in-addons').addEventListener('change', (e) => {
    const id = e.target.value;
    state.x = e.target.checked ? [...new Set([...state.x, id])] : state.x.filter((x) => x !== id);
    render();
  });

  const curSel = $('in-currency');
  curSel.innerHTML = Object.keys(D.CURRENCIES).map((c) => `<option value="${c}">${c}</option>`).join('');
  curSel.addEventListener('change', () => { state.cur = curSel.value; render(); });

  $('compare-list').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-zone]');
    if (!b) return;
    state.z = b.dataset.zone;
    render();
    $('pick').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  function syncInputs() {
    const press = (el, val) => el.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === String(val))));
    press($('in-activity'), state.a);
    press($('in-customers'), state.c);
    press($('in-office'), state.w);
    press($('in-revenue'), state.r);
    document.querySelectorAll('.stepper').forEach((s) => {
      s.querySelector('output').textContent = state[s.dataset.key];
      s.querySelector('[data-d="-1"]').disabled = state[s.dataset.key] <= Number(s.dataset.min);
      s.querySelector('[data-d="1"]').disabled = state[s.dataset.key] >= Number(s.dataset.max);
    });
    inside.checked = !!state.inside;
    $('in-addons').querySelectorAll('input').forEach((i) => { i.checked = state.x.includes(i.value); });
    D.ADDONS.forEach((a) => { document.querySelector(`[data-addon="${a.id}"]`).textContent = money(a.amount); });
    curSel.value = state.cur;
  }

  // ---------- share ----------
  function summary() {
    if (!current) return '';
    const { z, q } = current;
    return [
      'Hello Bizabler-S, I used your setup cost calculator:',
      `• Option: ${z.name} (${z.emirate})`,
      `• Activity: ${activityLabel()}`,
      `• Shareholders: ${state.owners}, investor visas: ${state.investors}, employee visas: ${state.employees}, family visas: ${state.dependants}`,
      `• Workspace: ${state.w === 'office' ? 'private office' : 'flexi-desk'}`,
      `• Year 1: ${money(q.t1)} · Year 2: ${money(q.t2)} · 3 years: ${money(q.three)}`,
      `Quote link: ${location.href}`,
      'Please confirm this quote.',
    ].join('\n');
  }
  function updateShare() {
    const text = summary();
    $('act-wa').href = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
    $('peek-wa').href = $('act-wa').href;
    $('act-mail').href = `mailto:${EMAIL}?subject=${encodeURIComponent('Setup quote: ' + (current?.z.name || ''))}&body=${encodeURIComponent(text)}`;
  }
  $('act-link').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      $('share-status').textContent = 'Link copied. Anyone with it sees this exact quote.';
    } catch (e) {
      $('share-status').textContent = `Copy this link: ${location.href}`;
    }
  });
  // Optional "confirm this quote" form → Google Form (lead-form.js), with the quote attached
  const qf = $('quote-form');
  const qfStatus = $('qf-status');
  const qfBtn = qf.querySelector('button[type="submit"]');
  qf.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(qf));
    const L = window.BIZ_LEAD;
    if (!d.name.trim() || !L.validEmail(d.email) || !L.validPhone(d.phone)) {
      qfStatus.textContent = 'Please add your name, a valid email and a phone or WhatsApp number.';
      return;
    }
    if (!current) { qfStatus.textContent = 'Choose a setup that fits first, or message us on WhatsApp.'; return; }
    const { z, q } = current;
    const aed = (n) => new Intl.NumberFormat('en').format(Math.round(n));
    const typeLabel = z.type === 'freezone' ? 'Free zone' : z.type === 'mainland' ? 'Mainland' : 'Offshore';
    const details = [
      d.message.trim(),
      `Year 2: AED ${aed(q.t2)} · 3 years: AED ${aed(q.three)}`,
      `Shareholders: ${state.owners} · Workspace: ${state.w === 'office' ? 'private office' : 'flexi-desk'} · Visa holders inside UAE: ${state.inside ? 'yes' : 'no'}`,
      state.x.length ? `Add-ons: ${D.ADDONS.filter((a) => state.x.includes(a.id)).map((a) => a.label).join(', ')}` : '',
    ].filter(Boolean).join('\n');
    qfBtn.disabled = true;
    qfStatus.textContent = 'Sending…';
    try {
      await L.send({
        name: d.name, email: d.email, phone: d.phone,
        need: `New company: ${typeLabel.toLowerCase()} (calculator quote)`,
        message: details,
        option: `${z.name} (${z.emirate})`,
        activity: activityLabel(),
        visas: `${state.investors} investor, ${state.employees} employee, ${state.dependants} family`,
        estimate: aed(q.t1),
        quoteLink: location.href,
        source: 'Calculator',
      });
      qf.reset();
      qfStatus.textContent = 'Thank you. Your quote request has been sent and our team will be in touch soon.';
    } catch (err) {
      qfStatus.textContent = 'Sorry, it could not be sent. Please use the WhatsApp button above instead.';
    } finally {
      qfBtn.disabled = false;
    }
  });

  $('act-print').addEventListener('click', () => {
    document.querySelectorAll('.calc-out details').forEach((d) => { d.open = true; });
    window.print();
  });

  // Hide the phone price bar once the results are on screen
  const peek = $('peek');
  // While the bar shows, its own WhatsApp icon stands in for the floating one (which would cover the + buttons)
  new IntersectionObserver(([en]) => {
    peek.classList.toggle('hide', en.isIntersecting);
    document.body.classList.toggle('peek-on', !en.isIntersecting);
  }, { threshold: 0.05 })
    .observe(document.querySelector('.calc-out'));

  render();
})();
