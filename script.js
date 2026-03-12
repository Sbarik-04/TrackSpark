/* ====== CONSTANTS & STATE ====== */
const EMOJIS = [
  '🌅','🏃','💪','🧘','📚','💧','🥗','😴','🚭','🍺',
  '📵','🧹','🎯','✍️','🎨','🎵','💻','🌿','🐾','⚡',
  '🧠','📝','🚿','🥊','🎤'
];

const QUOTES = [
  { q: '"We are what we repeatedly do. Excellence, then, is not an act, but a habit."',       a: '— Aristotle' },
  { q: '"Motivation is what gets you started. Habit is what keeps you going."',                a: '— Jim Ryun' },
  { q: '"The secret of your future is hidden in your daily routine."',                         a: '— Mike Murdock' },
  { q: '"Small daily improvements over time lead to stunning results."',                       a: '— Robin Sharma' },
  { q: '"A habit is a cable; we weave a thread of it each day, and at last we cannot break it."', a: '— Horace Mann' },
  { q: '"You\'ll never change your life until you change something you do daily."',            a: '— John C. Maxwell' },
  { q: '"Success is the sum of small efforts, repeated day in and day out."',                  a: '— Robert Collier' },
  { q: '"Chains of habit are too light to be felt until they are too heavy to be broken."',   a: '— Warren Buffett' },
];

let selEmoji = EMOJIS[0];
const today  = new Date();
let curY     = today.getFullYear();
let curM     = today.getMonth();
let curUser  = null;
let wkOffset = 0; // weeks from current week (0 = this week)

/* ====== LOCAL STORAGE HELPERS ====== */
function getH() {
  return JSON.parse(localStorage.getItem(`h_${curUser || 'g'}`) || 'null') || [
    { id: 1, name: 'Wake Up Early (10am)', emoji: '🌅' },
    { id: 2, name: 'Morning Cardio',       emoji: '🏃' },
    { id: 4, name: 'No clubbing',          emoji: '🕺' },
    { id: 5, name: 'Sober days only',      emoji: '🍃' },
    { id: 6, name: 'Offline Hours',        emoji: '📵' },
    { id: 7, name: 'Project Work',         emoji: '💻' },
  ];
}
function setH(h) { localStorage.setItem(`h_${curUser || 'g'}`, JSON.stringify(h)); }
function getC()  { return JSON.parse(localStorage.getItem(`c_${curUser || 'g'}`) || '{}'); }
function setC(c) { localStorage.setItem(`c_${curUser || 'g'}`, JSON.stringify(c)); }

/* ====== DATE UTILITIES ====== */
function dim(y, m)    { return new Date(y, m + 1, 0).getDate(); }
function dk(y, m, d)  { return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function isT(y, m, d) { return y === today.getFullYear() && m === today.getMonth() && d === today.getDate(); }
function isFut(y, m, d) {
  return new Date(y, m, d) > new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

/* ====== AUTH ====== */
function switchFTab(t, btn) {
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('inFields').style.display = t === 'in' ? '' : 'none';
  document.getElementById('upFields').style.display = t === 'up' ? '' : 'none';
  hideMsg();
}

function shakeField(id) {
  const el = document.getElementById(id);
  el.style.animation = 'none';
  el.offsetHeight; // trigger reflow
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

function showMsg(msg, type) {
  let el = document.getElementById('authMsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'authMsg';
    el.style.cssText = 'margin-top:14px;padding:11px 16px;border-radius:10px;font-size:0.83rem;text-align:center;transition:opacity 0.3s;';
    document.querySelector('.form-box').appendChild(el);
  }
  const isErr = type !== 'ok';
  el.style.cssText += isErr
    ? ';background:rgba(255,107,107,0.12);border:1px solid rgba(255,107,107,0.3);color:var(--coral)'
    : ';background:rgba(67,230,181,0.1);border:1px solid rgba(67,230,181,0.3);color:var(--mint)';
  el.textContent = msg;
  el.style.display = 'block';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.style.display = 'none', 300);
  }, 3500);
}

function hideMsg() {
  const el = document.getElementById('authMsg');
  if (el) el.style.display = 'none';
}

function handleSignin() {
  const eEl = document.getElementById('siEmail');
  const pEl = document.getElementById('siPass');
  const e = eEl.value.trim(), p = pEl.value;
  if (!e)           { shakeField('siEmail'); eEl.focus(); showMsg('Please enter your email.');    return; }
  if (!p)           { shakeField('siPass');  pEl.focus(); showMsg('Please enter your password.'); return; }
  const us = JSON.parse(localStorage.getItem('su') || '{}');
  if (!us[e])       { shakeField('siEmail'); showMsg('No account found — create one first!');     return; }
  if (us[e].p !== p){ shakeField('siPass');  pEl.value = ''; pEl.focus(); showMsg('Incorrect password. Try again.'); return; }
  login(e, us[e].n);
}

function handleSignup() {
  const nEl = document.getElementById('suName');
  const eEl = document.getElementById('suEmail');
  const pEl = document.getElementById('suPass');
  const n = nEl.value.trim(), e = eEl.value.trim(), p = pEl.value;
  if (!n)              { shakeField('suName');  nEl.focus(); showMsg('Please enter your name.');           return; }
  if (!e || !e.includes('@')) { shakeField('suEmail'); eEl.focus(); showMsg('Enter a valid email address.'); return; }
  if (p.length < 4)   { shakeField('suPass');  pEl.focus(); showMsg('Password needs at least 4 characters.'); return; }
  const us = JSON.parse(localStorage.getItem('su') || '{}');
  if (us[e])           { shakeField('suEmail'); showMsg('Account already exists — sign in instead!'); return; }
  us[e] = { n, p };
  localStorage.setItem('su', JSON.stringify(us));
  showMsg('Account created! Signing you in…', 'ok');
  setTimeout(() => login(e, n), 700);
}

function enterGuest() { login('g', 'Guest'); }

function login(id, name) {
  curUser = id;
  localStorage.setItem('ss', JSON.stringify({ id, name }));
  const ini = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('uav').textContent = ini;
  document.getElementById('unm').textContent = name;
  document.getElementById('signinPage').style.display = 'none';
  document.getElementById('appPage').style.display    = 'block';
  setTimeout(() => render(), 50);
}

function logout() {
  localStorage.removeItem('ss');
  curUser = null;
  document.getElementById('appPage').style.display   = 'none';
  document.getElementById('signinPage').style.display = 'flex';
}

/* ====== KEYBOARD + AUTO-LOGIN ====== */
window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('siEmail').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('siPass').focus(); });
  document.getElementById('siPass') .addEventListener('keydown', e => { if (e.key === 'Enter') handleSignin(); });
  document.getElementById('suName') .addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('suEmail').focus(); });
  document.getElementById('suEmail').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('suPass').focus(); });
  document.getElementById('suPass') .addEventListener('keydown', e => { if (e.key === 'Enter') handleSignup(); });

  // Restore saved session
  const s = localStorage.getItem('ss');
  if (s) { try { const d = JSON.parse(s); login(d.id, d.name); } catch (ex) { localStorage.removeItem('ss'); } }
});

/* ====== NAVIGATION ====== */
function changeMonth(dir) {
  curM += dir;
  if (curM < 0)  { curM = 11; curY--; }
  if (curM > 11) { curM = 0;  curY++; }
  render();
}

function switchView(v, btn) {
  document.querySelectorAll('.vb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('monthlyView').style.display = v === 'monthly' ? ''      : 'none';
  document.getElementById('weeklyView') .style.display = v === 'weekly'  ? 'block' : 'none';
  if (v === 'weekly') { wkOffset = 0; renderWeekly(); }
}

function toggleCheck(hid, y, m, d) {
  if (isFut(y, m, d)) return;
  const c = getC();
  const k = `${hid}_${dk(y, m, d)}`;
  c[k] = !c[k];
  setC(c);
  render();
}

/* ====== RENDER: MONTHLY GRID ====== */
function renderMonthly() {
  const y = curY, mo = curM, days = dim(y, mo);
  const habits = getH(), checks = getC();
  const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MO  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  document.getElementById('monthLabel').textContent = `${MO[mo]} ${y}`;

  // Build weeks array
  const fd = new Date(y, mo, 1).getDay();
  let weeks = [], week = [];
  for (let i = 0; i < fd; i++) week.push(null);
  for (let d = 1; d <= days; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

  // Build table HTML
  let h = '<thead><tr>';
  h += `<th class="th-hab" rowspan="3">My Habits</th>`;
  weeks.forEach((wk, wi) => {
    const c = wk.filter(Boolean).length;
    h += `<th colspan="${c}" class="th-wk">Week ${wi + 1}</th>`;
  });
  h += '</tr><tr>';
  weeks.forEach(wk => wk.forEach(d => {
    if (d != null) {
      const t = isT(y, mo, d);
      h += `<th class="th-dw${t ? ' th-tdw' : ''}">${DOW[new Date(y, mo, d).getDay()]}</th>`;
    }
  }));
  h += '</tr><tr>';
  weeks.forEach(wk => wk.forEach(d => {
    if (d != null) {
      const t = isT(y, mo, d);
      h += `<th class="th-dn${t ? ' th-tdn' : ''}">${d}</th>`;
    }
  }));
  h += '</tr></thead><tbody>';

  // Habit rows
  habits.forEach(hab => {
    h += `<tr><td class="td-name">
      <span style="margin-right:6px">${hab.emoji}</span>${hab.name}
      <button onclick="deleteHabit(${hab.id})"
        style="float:right;background:none;border:none;cursor:pointer;color:var(--txt3);font-size:0.8rem;padding:0 3px;transition:color 0.15s"
        onmouseover="this.style.color='var(--coral)'" onmouseout="this.style.color='var(--txt3)'">✕</button>
    </td>`;
    weeks.forEach(wk => wk.forEach(d => {
      if (d != null) {
        const k   = `${hab.id}_${dk(y, mo, d)}`;
        const ok  = !!checks[k];
        const fut = isFut(y, mo, d);
        const t   = isT(y, mo, d);
        h += `<td class="td-chk${t ? ' ctd' : ''}">
          <div class="cbox${ok ? ' cok' : ''}${fut ? ' cfut' : ''}"
            onclick="toggleCheck(${hab.id},${y},${mo},${d})">${ok ? '✓' : ''}</div>
        </td>`;
      }
    }));
    h += '</tr>';
  });

  // Progress / Done / Not Done rows
  const td = (y === today.getFullYear() && mo === today.getMonth()) ? today.getDate() : days;
  const pr = (lbl, cls, fn) => {
    let r = `<tr class="tr-p"><td class="td-pn">${lbl}</td>`;
    weeks.forEach(wk => wk.forEach(d => {
      if (d != null) r += `<td class="${cls}">${fn(d)}</td>`;
    }));
    return r + '</tr>';
  };
  h += pr('Progress', 'pc',  d => {
    if (d > td) return '—';
    const ok = habits.filter(hb => !!checks[`${hb.id}_${dk(y,mo,d)}`]).length;
    return habits.length ? Math.round(ok / habits.length * 100) + '%' : '0%';
  });
  h += pr('Done',     'dc2', d => habits.filter(hb => !!checks[`${hb.id}_${dk(y,mo,d)}`]).length);
  h += pr('Not Done', 'mc',  d => habits.length - habits.filter(hb => !!checks[`${hb.id}_${dk(y,mo,d)}`]).length);
  h += '</tbody>';

  document.getElementById('habitGrid').innerHTML = h;
}

/* ====== RENDER: ANALYSIS SECTION ====== */
function renderAnalysis() {
  const y = curY, mo = curM, days = dim(y, mo);
  const habits = getH(), checks = getC();
  const td = (y === today.getFullYear() && mo === today.getMonth()) ? today.getDate() : days;

  let tot = 0, pos = 0;
  const rows = habits.map(hb => {
    let done = 0;
    for (let d = 1; d <= td; d++) if (checks[`${hb.id}_${dk(y, mo, d)}`]) done++;
    tot += done; pos += td;
    const pct = td > 0 ? Math.round(done / td * 100) : 0;
    return { hb, done, goal: td, pct };
  });

  const op = pos > 0 ? Math.round(tot / pos * 100) : 0;
  document.getElementById('hpD').textContent  = tot;
  document.getElementById('hpT').textContent  = pos;
  document.getElementById('hpP').textContent  = op + '%';
  document.getElementById('hpF').style.width  = op + '%';

  // Best streak
  let best = 0, cur = 0;
  for (let d = 1; d <= td; d++) {
    if (habits.length && habits.every(hb => !!checks[`${hb.id}_${dk(y,mo,d)}`])) {
      cur++; best = Math.max(best, cur);
    } else cur = 0;
  }
  document.getElementById('hpS').textContent = best;

  // Habit analysis rows
  let aH = '';
  rows.forEach(({ hb, done, goal, pct }) => {
    aH += `<div class="atr">
      <span class="ath-n">${hb.emoji} ${hb.name}</span>
      <span class="ath-num">${goal}</span>
      <span class="ath-num ath-act">${done}</span>
      <div class="mpw">
        <div class="mpt"><div class="mpf" style="width:${pct}%"></div></div>
        <span class="mpp">${pct}%</span>
      </div>
    </div>`;
  });
  document.getElementById('aRows').innerHTML = aH || '<p style="color:var(--txt3);font-size:0.82rem;padding:8px 0">Add habits to see analysis.</p>';

  // Stats grid
  let perf = 0;
  for (let d = 1; d <= td; d++) {
    if (habits.length && habits.every(hb => !!checks[`${hb.id}_${dk(y,mo,d)}`])) perf++;
  }
  document.getElementById('sGrid').innerHTML = `
    <div class="sgc"><div class="sgv" style="background:var(--grad-hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${op}%</div><div class="sgl">Overall</div></div>
    <div class="sgc"><div class="sgv" style="background:var(--grad-cool);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${tot}</div><div class="sgl">Done</div></div>
    <div class="sgc"><div class="sgv" style="color:var(--coral)">${pos - tot}</div><div class="sgl">Missed</div></div>
    <div class="sgc"><div class="sgv" style="color:var(--gold)">🔥${best}</div><div class="sgl">Best Streak</div></div>
    <div class="sgc"><div class="sgv" style="background:var(--grad-lav);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${perf}</div><div class="sgl">Perfect Days</div></div>
    <div class="sgc"><div class="sgv" style="color:var(--lavender)">${habits.length}</div><div class="sgl">Habits</div></div>`;
}

/* ====== WEEKLY: STATE & NAV ====== */
function getWeekStart(offset) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  t.setDate(t.getDate() - t.getDay() + offset * 7); // Sunday
  return t;
}
function changeWeek(dir)  { wkOffset += dir; renderWeekly(); }
function jumpWeekToday()  { wkOffset = 0;    renderWeekly(); }

/* ====== RENDER: WEEKLY DASHBOARD ====== */
function renderWeekly() {
  const habits = getH(), checks = getC();
  const DOW_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const DOW_SH   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MOS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Build 7 days for this week offset
  const ws = getWeekStart(wkOffset);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    days.push(d);
  }

  // Range label in header
  const s0 = days[0], s6 = days[6];
  document.getElementById('wkRange').textContent =
    `${DOW_SH[s0.getDay()]} ${s0.getDate()} ${MOS[s0.getMonth()]} – ` +
    `${DOW_SH[s6.getDay()]} ${s6.getDate()} ${MOS[s6.getMonth()]} ${s6.getFullYear()}`;

  // Helpers
  const chk = (hid, d) => {
    const key = `${hid}_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return !!checks[key];
  };
  const isFuture  = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()) > new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday2  = d => d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();

  // Compute week totals
  let wkDone = 0, wkPossible = 0, wkPerfect = 0;
  const dayDone = [];
  days.forEach(d => {
    const fut = isFuture(d);
    const cnt = habits.filter(h => chk(h.id, d)).length;
    dayDone.push(cnt);
    if (!fut) { wkDone += cnt; wkPossible += habits.length; }
    if (!fut && habits.length > 0 && cnt === habits.length) wkPerfect++;
  });
  const wkPct    = wkPossible > 0 ? Math.round(wkDone / wkPossible * 100) : 0;
  const wkMissed = wkPossible - wkDone;

  // Best streak this week
  let bestStr = 0, curStr = 0;
  days.forEach(d => {
    if (!isFuture(d) && habits.length > 0 && habits.every(h => chk(h.id, d))) { curStr++; bestStr = Math.max(bestStr, curStr); }
    else curStr = 0;
  });

  // Big ring
  const bigC = 326.73;
  document.getElementById('wkBigPct').textContent = wkPct + '%';
  document.getElementById('wkBigRingProg').style.strokeDashoffset = bigC * (1 - wkPct / 100);

  // 4 floating circles
  const maxFC = habits.length * 7 || 1;
  const setFC = (id, n, max, numId) => {
    const C  = 188.5;
    const el = document.getElementById(id);
    if (el) el.style.strokeDashoffset = C * (1 - Math.min(n / max, 1));
    const nel = document.getElementById(numId);
    if (nel) nel.textContent = n;
  };
  setFC('wkFC1', wkDone,    maxFC, 'wkFN1');
  setFC('wkFC2', wkMissed,  maxFC, 'wkFN2');
  setFC('wkFC3', wkPerfect, 7,     'wkFN3');
  setFC('wkFC4', bestStr,   7,     'wkFN4');

  // Text stats
  const pastDays = days.filter(d => !isFuture(d)).length;
  document.getElementById('wkTextStats').innerHTML = `
    <div class="wkts-row"><span class="wkts-icon">📅</span><span class="wkts-label">Days tracked</span><span class="wkts-val" style="color:var(--mint2)">${pastDays}/7</span></div>
    <div class="wkts-row"><span class="wkts-icon">✅</span><span class="wkts-label">Total habits done</span><span class="wkts-val" style="color:var(--mint)">${wkDone}</span></div>
    <div class="wkts-row"><span class="wkts-icon">❌</span><span class="wkts-label">Habits missed</span><span class="wkts-val" style="color:var(--coral)">${wkMissed}</span></div>
    <div class="wkts-row"><span class="wkts-icon">⭐</span><span class="wkts-label">Perfect days</span><span class="wkts-val" style="color:var(--gold)">${wkPerfect}</span></div>
    <div class="wkts-row"><span class="wkts-icon">🔥</span><span class="wkts-label">Best streak</span><span class="wkts-val" style="color:var(--coral2)">${bestStr} day${bestStr !== 1 ? 's' : ''}</span></div>
    <div class="wkts-row"><span class="wkts-icon">🎯</span><span class="wkts-label">Habits tracked</span><span class="wkts-val" style="color:var(--lavender)">${habits.length}</span></div>`;

  // 7 Day column cards
  const C7 = 2 * Math.PI * 24;
  let daysHTML = '';
  days.forEach((d, i) => {
    const fut  = isFuture(d), isT = isToday2(d);
    const done = dayDone[i], tot = habits.length;
    const pct  = tot > 0 && !fut ? Math.round(done / tot * 100) : 0;
    const off  = C7 * (1 - pct / 100);
    const ringColor = isT ? '#FF6B6B' : pct === 100 ? '#FFD166' : '#43E6B5';

    daysHTML += `<div class="wkd${isT ? ' wkd-today' : ''}">
      <div class="wkd-hdr">
        <div class="wkd-dow">${DOW_FULL[d.getDay()]}</div>
        <div class="wkd-date">${d.getDate()} ${MOS[d.getMonth()]}</div>
      </div>
      <div class="wkd-circ-wrap">
        <svg class="wkd-svg" width="64" height="64" viewBox="0 0 64 64">
          <circle class="ring-track" cx="32" cy="32" r="24"/>
          <circle class="ring-prog" cx="32" cy="32" r="24"
            stroke="${ringColor}"
            stroke-dasharray="${C7.toFixed(2)}"
            stroke-dashoffset="${fut ? C7.toFixed(2) : off.toFixed(2)}"
            transform="rotate(-90 32 32)"/>
          <text class="ring-txt" x="32" y="32" font-size="${pct === 100 ? '8' : '9'}">${fut ? '—' : pct + '%'}</text>
        </svg>
        <div class="wkd-circ-sub">${fut ? 'upcoming' : done + '/' + tot + ' done'}</div>
      </div>
      <div class="wkd-list">`;

    habits.forEach(h => {
      const ok  = chk(h.id, d);
      const y2  = d.getFullYear(), m2 = d.getMonth(), dd2 = d.getDate();
      const key = `${h.id}_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      daysHTML += `<div class="wkd-item${!ok && !fut ? ' wkd-missed' : ''}">
        <div class="wkd-chk${ok ? ' wkd-chk-ok' : ''}${fut ? ' wkd-chk-fut' : ''}"
          onclick="(function(){
            const now = new Date(${today.getFullYear()},${today.getMonth()},${today.getDate()});
            const dd  = new Date(${y2},${m2},${dd2});
            if (dd > now) return;
            const c = getC(); c['${key}'] = !c['${key}']; setC(c); renderWeekly();
          })()">
          ${ok ? '✓' : ''}
        </div>
        <span class="wkd-habit-name">${h.emoji} ${h.name}</span>
      </div>`;
    });

    daysHTML += `</div></div>`;
  });
  document.getElementById('wkDaysGrid').innerHTML = daysHTML;

  // Per-habit breakdown
  let breakHTML = '';
  habits.forEach(h => {
    const doneCount = days.filter(d => !isFuture(d) && chk(h.id, d)).length;
    const possCount = days.filter(d => !isFuture(d)).length;
    const pct2 = possCount > 0 ? Math.round(doneCount / possCount * 100) : 0;
    const R2 = 13, C2 = 2 * Math.PI * R2;
    const off2 = C2 * (1 - pct2 / 100);
    const col  = pct2 >= 80 ? '#43E6B5' : pct2 >= 50 ? '#FFD166' : '#FF6B6B';

    let chips = '';
    days.forEach(d => {
      const fut = isFuture(d), ok = chk(h.id, d);
      chips += `<div class="wkah-chip ${fut ? 'fut' : ok ? 'ok' : 'miss'}" title="${DOW_FULL[d.getDay()]}">${DOW_SH[d.getDay()][0]}</div>`;
    });

    breakHTML += `<div class="wkah-row">
      <div class="wkah-mini-ring">
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle fill="none" stroke="var(--bg3)" stroke-width="3.5" cx="18" cy="18" r="${R2}"/>
          <circle fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round"
            cx="18" cy="18" r="${R2}"
            stroke-dasharray="${C2.toFixed(2)}" stroke-dashoffset="${off2.toFixed(2)}"
            transform="rotate(-90 18 18)" style="transition:stroke-dashoffset 0.6s ease"/>
          <text x="18" y="18" text-anchor="middle" dominant-baseline="middle"
            font-family="'Clash Display',sans-serif" font-weight="700" font-size="7" fill="${col}">${pct2}%</text>
        </svg>
      </div>
      <div class="wkah-info">
        <div class="wkah-name">${h.emoji} ${h.name}</div>
        <div class="wkah-bar-wrap">
          <div class="wkah-bar-track"><div class="wkah-bar-fill" style="width:${pct2}%;background:linear-gradient(90deg,${col},${col}aa)"></div></div>
          <span class="wkah-counts">${doneCount}/${possCount}</span>
        </div>
        <div class="wkah-days">${chips}</div>
      </div>
    </div>`;
  });
  document.getElementById('wkHabitBreakdown').innerHTML = breakHTML ||
    '<p style="color:var(--txt3);font-size:0.82rem;padding:8px 0">Add habits to see breakdown.</p>';

  // Weekly per-day floating circles
  const C3 = 2 * Math.PI * 22;
  let circHTML = '';
  days.forEach((d, i) => {
    const fut  = isFuture(d), isT = isToday2(d);
    const done = dayDone[i], tot = habits.length;
    const pct3 = tot > 0 && !fut ? Math.round(done / tot * 100) : 0;
    const off3 = C3 * (1 - pct3 / 100);
    const col3 = isT ? '#FF6B6B' : pct3 === 100 ? '#FFD166' : '#43E6B5';

    circHTML += `<div class="wk-circ-item">
      <div style="position:relative;width:58px;height:58px">
        <svg width="58" height="58" viewBox="0 0 58 58" style="display:block">
          <circle fill="none" stroke="var(--bg3)" stroke-width="5" cx="29" cy="29" r="22"/>
          <circle fill="none" stroke="${col3}" stroke-width="5" stroke-linecap="round"
            cx="29" cy="29" r="22"
            stroke-dasharray="${C3.toFixed(2)}"
            stroke-dashoffset="${fut ? C3.toFixed(2) : off3.toFixed(2)}"
            transform="rotate(-90 29 29)"
            style="transition:stroke-dashoffset 0.8s ease"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <span style="font-family:'Clash Display',sans-serif;font-size:0.72rem;font-weight:700;color:${col3};line-height:1">
            ${fut ? '—' : pct3 + '%'}
          </span>
        </div>
      </div>
      <div class="wk-circ-label" style="color:${isT ? 'var(--coral)' : 'var(--txt3)'}">${DOW_SH[d.getDay()]}<br>${d.getDate()}</div>
    </div>`;
  });
  document.getElementById('wkCircRow').innerHTML = circHTML;
}

/* ====== MODAL: ADD HABIT ====== */
function openModal() {
  selEmoji = EMOJIS[0];
  document.getElementById('hni').value = '';
  document.getElementById('mo').classList.add('open');
  renderEG();
  setTimeout(() => document.getElementById('hni').focus(), 100);
}
function closeModal() { document.getElementById('mo').classList.remove('open'); }

function renderEG() {
  document.getElementById('eg').innerHTML = EMOJIS
    .map(e => `<button class="eb${e === selEmoji ? ' esel' : ''}" onclick="pickE('${e}')">${e}</button>`)
    .join('');
}
function pickE(e) { selEmoji = e; renderEG(); }

function saveHabit() {
  const n = document.getElementById('hni').value.trim();
  if (!n) { document.getElementById('hni').focus(); return; }
  const h = getH();
  h.push({ id: Date.now(), name: n, emoji: selEmoji });
  setH(h);
  closeModal();
  render();
}

function deleteHabit(id) {
  if (!confirm('Remove this habit?')) return;
  setH(getH().filter(h => h.id !== id));
  render();
}

// Close modal on backdrop click
document.getElementById('mo').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

/* ====== FOOTER ====== */
function renderFooter() {
  // Current year
  const yEl = document.getElementById('footerYear');
  if (yEl) yEl.textContent = new Date().getFullYear();

  // Random motivational quote
  const q   = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const qEl = document.getElementById('footerQuote');
  const aEl = document.getElementById('footerAuthor');
  if (qEl) qEl.textContent = q.q;
  if (aEl) aEl.textContent = q.a;

  // Live mini rings — monthly %, weekly %, habits count
  const habits = getH(), checks = getC();
  const y = curY, mo = curM, days = dim(y, mo);
  const td = (y === today.getFullYear() && mo === today.getMonth()) ? today.getDate() : days;

  let mDone = 0, mPos = 0;
  habits.forEach(h => {
    for (let d = 1; d <= td; d++) if (checks[`${h.id}_${dk(y, mo, d)}`]) mDone++;
    mPos += td;
  });
  const mPct = mPos > 0 ? Math.round(mDone / mPos * 100) : 0;

  const ws = getWeekStart(0);
  let wDone = 0, wPos = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws); d.setDate(ws.getDate() + i);
    const dNorm = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const tNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (dNorm <= tNorm) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      habits.forEach(h => { if (checks[`${h.id}_${dateStr}`]) wDone++; });
      wPos += habits.length;
    }
  }
  const wPct = wPos > 0 ? Math.round(wDone / wPos * 100) : 0;

  const ringsEl = document.getElementById('footerRings');
  if (!ringsEl) return;

  const makeRing = (pct, color, label, size = 50) => {
    const r   = size * 0.36;
    const C   = 2 * Math.PI * r;
    const off = C * (1 - pct / 100);
    return `<div class="fr-item">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle fill="none" stroke="var(--bg3)" stroke-width="4" cx="${size/2}" cy="${size/2}" r="${r}"/>
        <circle fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"
          cx="${size/2}" cy="${size/2}" r="${r}"
          stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"
          transform="rotate(-90 ${size/2} ${size/2})"/>
        <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="middle"
          font-family="'Clash Display',sans-serif" font-weight="700" font-size="${size * 0.18}" fill="${color}">${pct}%</text>
      </svg>
      <div class="fr-lbl">${label}</div>
    </div>`;
  };

  const hR   = 2 * Math.PI * 13.5;
  const hOff = hR * (1 - Math.min(habits.length / 10, 1));
  ringsEl.innerHTML =
    makeRing(mPct, '#FF8E53', 'Month', 52) +
    makeRing(wPct, '#43E6B5', 'Week',  44) +
    `<div class="fr-item">
      <svg width="38" height="38" viewBox="0 0 38 38">
        <circle fill="none" stroke="var(--bg3)" stroke-width="3.5" cx="19" cy="19" r="13.5"/>
        <circle fill="none" stroke="#A78BFA" stroke-width="3.5" stroke-linecap="round"
          cx="19" cy="19" r="13.5"
          stroke-dasharray="${hR.toFixed(2)}" stroke-dashoffset="${hOff.toFixed(2)}"
          transform="rotate(-90 19 19)"/>
        <text x="19" y="19" text-anchor="middle" dominant-baseline="middle"
          font-family="'Clash Display',sans-serif" font-weight="700" font-size="7" fill="#A78BFA">${habits.length}</text>
      </svg>
      <div class="fr-lbl">Habits</div>
    </div>`;
}

/* ====== MASTER RENDER ====== */
function render() {
  renderMonthly();
  renderAnalysis();
  if (document.getElementById('weeklyView').style.display === 'block') renderWeekly();
  renderFooter();
}
