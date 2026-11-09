// ============================================================
// POŠTENO SUĐENJE - JAVASCRIPT
// ============================================================

const API_URL_AKTIVNA = "https://script.google.com/macros/s/AKfycbzA4T8Nt1bfqBIrjT4JV9KMFtQRe8ErwpqUOwN6qA3bFdmBBzJeC2B13byrDZC26OfdYg/exec";
const API_URL_PROŠLA = "https://script.google.com/macros/s/AKfycbxY7F-FzP93x4aT7J0x9l2BYurPDbi6Sve5gGjBH1IOGVx3cCY7Gab8HJHLcwu9NMmCiA/exec";

const SEZONE = [
  { id: 'UKUPNO', naziv: 'Sve sezone (ukupno)', aktivna: false, kombinirano: true },
  { id: 'AKTIVNA', naziv: '2026/27', url: API_URL_AKTIVNA, aktivna: true },
  { id: '2025-26', naziv: '2025/26', url: API_URL_PROŠLA, aktivna: false }
];

let TRENUTNA_SEZONA = 'AKTIVNA';
let sortListenersInitialized = false;

const CACHE_TTL = 15 * 60 * 1000;
const THEME_KEY = 'posteno_sudenje_theme';

let UTakmice = [];
let UTakmiceKompletne = [];
let kluboviCache = {};
let sortState = { key: null, dir: -1 };
let sviSuci = [];
let sviKlubovi = [];
let zutiChartInstance = null;
let trenutniModal = null;

const num = v => {
  const n = Number(v);
  return isFinite(n) ? n : 0;
};

const IKONA_ZUTI = '<span class="karton-ikona zuti" aria-hidden="true"></span>';
const IKONA_CRVENI = '<span class="karton-ikona crveni" aria-hidden="true"></span>';
const IKONA_ZUTI_VELIKI = '<span class="karton-ikona veliki zuti" aria-hidden="true"></span>';
const IKONA_CRVENI_VELIKI = '<span class="karton-ikona veliki crveni" aria-hidden="true"></span>';

const IKONA_VAR_PRIZNAT = '<i class="fas fa-video" style="color:var(--green);" aria-hidden="true"></i>';
const IKONA_VAR_PONISTEN = '<i class="fas fa-video-slash" style="color:var(--text-muted);" aria-hidden="true"></i>';
const IKONA_VAR_PRIZNAT_BADGE = '<i class="fas fa-video" style="color:var(--green);" aria-hidden="true"></i>';
const IKONA_VAR_PONISTEN_BADGE = '<i class="fas fa-video-slash" style="color:var(--text-muted);" aria-hidden="true"></i>';

const GRBOVI_KLUBOVA = {
  "Dinamo": "https://hnl.hr/static/images/clubs/mq/dinamo.png",
  "GNK Dinamo": "https://hnl.hr/static/images/clubs/mq/dinamo.png",
  "Dinamo Zagreb": "https://hnl.hr/static/images/clubs/mq/dinamo.png",
  "GNK Dinamo Zagreb": "https://hnl.hr/static/images/clubs/mq/dinamo.png",
  "Gorica": "https://hnl.hr/static/images/clubs/mq/gorica.png",
  "HNK Gorica": "https://hnl.hr/static/images/clubs/mq/gorica.png",
  "Hajduk": "https://hnl.hr/static/images/clubs/mq/hajduk.png",
  "Hajduk Split": "https://hnl.hr/static/images/clubs/mq/hajduk.png",
  "HNK Hajduk": "https://hnl.hr/static/images/clubs/mq/hajduk.png",
  "HNK Hajduk Split": "https://hnl.hr/static/images/clubs/mq/hajduk.png",
  "Istra": "https://hnl.hr/static/images/clubs/mq/istra.png",
  "Istra 1961": "https://hnl.hr/static/images/clubs/mq/istra.png",
  "NK Istra": "https://hnl.hr/static/images/clubs/mq/istra.png",
  "NK Istra 1961": "https://hnl.hr/static/images/clubs/mq/istra.png",
  "Lokomotiva": "https://hnl.hr/static/images/clubs/mq/lokomotiva.png",
  "NK Lokomotiva": "https://hnl.hr/static/images/clubs/mq/lokomotiva.png",
  "Lokomotiva Zagreb": "https://hnl.hr/static/images/clubs/mq/lokomotiva.png",
  "NK Lokomotiva Zagreb": "https://hnl.hr/static/images/clubs/mq/lokomotiva.png",
  "Osijek": "https://hnl.hr/static/images/clubs/mq/osijek.png",
  "NK Osijek": "https://hnl.hr/static/images/clubs/mq/osijek.png",
  "Rijeka": "https://hnl.hr/static/images/clubs/mq/rijeka.png",
  "HNK Rijeka": "https://hnl.hr/static/images/clubs/mq/rijeka.png",
  "Rudeš": "https://hnl.hr/static/images/clubs/mq/rudes.png",
  "NK Rudeš": "https://hnl.hr/static/images/clubs/mq/rudes.png",
  "Rudeš Zagreb": "https://hnl.hr/static/images/clubs/mq/rudes.png",
  "Slaven": "https://hnl.hr/static/images/clubs/mq/slaven.png",
  "Slaven Belupo": "https://hnl.hr/static/images/clubs/mq/slaven.png",
  "NK Slaven Belupo": "https://hnl.hr/static/images/clubs/mq/slaven.png",
  "NK Slaven": "https://hnl.hr/static/images/clubs/mq/slaven.png",
  "Varaždin": "https://hnl.hr/static/images/clubs/mq/varazdin.png",
  "Varazdin": "https://hnl.hr/static/images/clubs/mq/varazdin.png",
  "NK Varaždin": "https://hnl.hr/static/images/clubs/mq/varazdin.png",
  "NK Varazdin": "https://hnl.hr/static/images/clubs/mq/varazdin.png",
  "Vukovar": "https://hnl.hr/static/images/clubs/mq/vukovar.png",
  "HNK Vukovar": "https://hnl.hr/static/images/clubs/mq/vukovar.png",
  "Vukovar 1991": "https://hnl.hr/static/images/clubs/mq/vukovar.png",
  "HNK Vukovar 1991": "https://hnl.hr/static/images/clubs/mq/vukovar.png"
};

// ============================================================
// THEME
// ============================================================
function toggleTheme_old() {
  const trenutna = document.documentElement.getAttribute('data-theme') || 'dark';
  const nova = trenutna === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nova);
  localStorage.setItem(THEME_KEY, nova);
  if (UTakmiceKompletne.length > 0) nacrtajZutiChart();
}

// ============================================================
// UTIL
// ============================================================
function getGrbUrl(klub) {
  if (!klub) return null;
  if (GRBOVI_KLUBOVA[klub]) return GRBOVI_KLUBOVA[klub];
  const u = UTakmice.find(x => x["Domaćin"] === klub && x["Grb"]);
  if (u && u["Grb"]) return u["Grb"];
  const u2 = UTakmice.find(x => x["Gost"] === klub && x["Grb G"]);
  if (u2 && u2["Grb G"]) return u2["Grb G"];
  return null;
}

function grbHtml(klub, size = "") {
  const url = getGrbUrl(klub);
  const sizeClass = size ? " " + size : "";
  if (url) {
    return `<img src="${url}" alt="Grb ${escapeHtml(klub)}" class="klub-grb${sizeClass}" loading="lazy" decoding="async" onerror="this.outerHTML='<span class=\\'klub-grb fallback${sizeClass}\\'><i class=\\'fas fa-shield-alt\\'></i></span>'">`;
  }
  return `<span class="klub-grb fallback${sizeClass}"><i class="fas fa-shield-alt" aria-hidden="true"></i></span>`;
}

function getCacheKey(sezona) { return 'posteno_sudenje_' + sezona + '_v33'; }
function getCachedData(sezona = TRENUTNA_SEZONA) {
  try {
    const raw = localStorage.getItem(getCacheKey(sezona));
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) { localStorage.removeItem(getCacheKey(sezona)); return null; }
    return data;
  } catch (e) { return null; }
}
function setCachedData(data, sezona = TRENUTNA_SEZONA) {
  try { localStorage.setItem(getCacheKey(sezona), JSON.stringify({ timestamp: Date.now(), data })); } catch (e) {}
}

function updateSEOForSection(section) {
  const titles = {
    pregled: 'Pošteno suđenje | Analiza sudaca, klubova i utakmica HNL-a',
    statistika: 'Statistika sudaca i klubova | Pošteno suđenje – HNL analiza',
    utakmice: 'Utakmice po kolima | Pošteno suđenje – HNL analiza',
    usporedba: 'Usporedba sudaca i klubova | Pošteno suđenje – HNL'
  };
  document.title = titles[section] || titles.pregled;
}

function ulogaSuca(u, ime) {
  if (u["Glavni sudac"] === ime) return "Glavni";
  if (u["Pomoćni 1"] === ime || u["Pomoćni 2"] === ime) return "Pomoćni";
  if (u["VAR"] === ime) return "VAR";
  if (u["AVAR"] === ime) return "AVAR";
  return null;
}

function jeKoloKompletno(utakmiceUKolu) {
  const odigrane = utakmiceUKolu.filter(u =>
    (u["Domaćin"]||"").trim() && (u["Gost"]||"").trim()
  );
  return odigrane.length >= 5;
}

function filtrirajKompletneKola(sveUtakmice) {
  const poKolu = {};
  sveUtakmice.forEach(u => {
    const k = num(u.Kolo);
    if (!poKolu[k]) poKolu[k] = [];
    poKolu[k].push(u);
  });
  const filtrirane = [];
  Object.keys(poKolu).forEach(k => {
    if (jeKoloKompletno(poKolu[k])) filtrirane.push(...poKolu[k]);
  });
  return filtrirane;
}

function filtrirajUtakmice(data) {
  if (!Array.isArray(data)) return [];
  return data.filter(u => {
    const k = num(u.Kolo);
    return k >= 1 && k <= 36 && ((u["Domaćin"]||"").trim() !== "" || (u["Gost"]||"").trim() !== "");
  });
}

function koloImaOdluku(k) {
  const utakmiceKola = UTakmice.filter(u => num(u.Kolo) === k);
  return utakmiceKola.some(u =>
    num(u["Žuti D"]) + num(u["Žuti G"]) +
    num(u["Crveni D"]) + num(u["Crveni G"]) +
    num(u["Penal D"]) + num(u["Penal G"]) +
    num(u["VAR priznat D"]) + num(u["VAR priznat G"]) +
    num(u["VAR poništen D"]) + num(u["VAR poništen G"]) > 0
  );
}

function slugify(tekst) {
  return tekst.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/č/g, 'c').replace(/ć/g, 'c').replace(/š/g, 's')
    .replace(/ž/g, 'z').replace(/đ/g, 'd')
    .replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}
function pronadjiIzSluga(slug, lista) {
  if (!slug) return null;
  const cilj = slug.toLowerCase();
  return lista.find(x => slugify(x) === cilj) || null;
}
function postaviURL(tip, ime) {
  if (!history.replaceState) return;
  const url = new URL(window.location.href);
  url.searchParams.delete('sudac');
  url.searchParams.delete('klub');
  if (tip === 'sudac') url.searchParams.set('sudac', slugify(ime));
  if (tip === 'klub') url.searchParams.set('klub', slugify(ime));
  history.replaceState({}, '', url.toString());
}
function ocistiURL() {
  if (!history.replaceState) return;
  const url = new URL(window.location.href);
  url.searchParams.delete('sudac');
  url.searchParams.delete('klub');
  const novaUrl = url.pathname + (url.search ? url.search : '');
  history.replaceState({}, '', novaUrl);
}
function provjeriURL() {
  const params = new URLSearchParams(window.location.search);
  const sudacSlug = params.get('sudac');
  const klubSlug = params.get('klub');
  if (sudacSlug) {
    const sudac = pronadjiIzSluga(sudacSlug, sviSuci);
    if (sudac) {
      document.querySelectorAll(".menu-item[data-section]").forEach(m => m.classList.remove("active"));
      document.querySelector('.menu-item[data-section="statistika"]').classList.add("active");
      document.querySelectorAll(".section-panel").forEach(s => s.classList.remove("active"));
      document.getElementById("section-statistika").classList.add("active");
      prikaziModalSudac(sudac);
      return;
    }
  }
  if (klubSlug) {
    const klub = pronadjiIzSluga(klubSlug, sviKlubovi);
    if (klub) {
      document.querySelectorAll(".menu-item[data-section]").forEach(m => m.classList.remove("active"));
      document.querySelector('.menu-item[data-section="statistika"]').classList.add("active");
      document.querySelectorAll(".section-panel").forEach(s => s.classList.remove("active"));
      document.getElementById("section-statistika").classList.add("active");
      prikaziModalKlub(klub);
    }
  }
}

// ============================================================
// COPY LINK
// ============================================================
async function kopirajLink() {
  if (!trenutniModal) return;
  const btn = document.getElementById("modalCopyBtn");
  const url = new URL(window.location.href);
  url.searchParams.delete('sudac');
  url.searchParams.delete('klub');
  if (trenutniModal.tip === 'sudac') url.searchParams.set('sudac', slugify(trenutniModal.ime));
  else url.searchParams.set('klub', slugify(trenutniModal.ime));
  const link = url.toString();
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(link);
    } else {
      const ta = document.createElement("textarea");
      ta.value = link;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    btn.classList.add("copied");
    btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = '<i class="fas fa-link" aria-hidden="true"></i>';
    }, 2000);
  } catch (e) { console.error("Kopiranje nije uspjelo:", e); }
}

// ============================================================
// CSV EXPORT
// ============================================================
function escapeCSV(v) {
  const s = String(v == null ? '' : v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function preuzmiCSV() {
  if (!trenutniModal) return;
  const ime = trenutniModal.ime;
  const tip = trenutniModal.tip;
  const datum = new Date().toISOString();
  let csv = '\uFEFF';

  if (tip === 'sudac') {
    csv += '# Izvještaj suca: ' + ime + '\n# Sezona: ' + TRENUTNA_SEZONA + '\n# Generirano: ' + datum + '\n# Izvor: postenosudenje.com\n\n';
    csv += 'Klub,Utakmice,Žuti,Crveni,Penal,VAR priznat,VAR poništen,Ukupno\n';
    const poKlubu = {};
    let ukZ=0, ukC=0, ukP=0, ukVp=0, ukVpo=0, ukBr=0;
    UTakmiceKompletne.forEach(u => {
      if (!ulogaSuca(u, ime)) return;
      ukBr++;
      [["Domaćin","D"],["Gost","G"]].forEach(([key, suf]) => {
        const klub = u[key];
        if (!klub || !klub.trim()) return;
        const z = num(u["Žuti "+suf]), c = num(u["Crveni "+suf]), p = num(u["Penal "+suf]);
        const v1 = num(u["VAR priznat "+suf]), v2 = num(u["VAR poništen "+suf]);
        ukZ+=z; ukC+=c; ukP+=p; ukVp+=v1; ukVpo+=v2;
        if (!poKlubu[klub]) poKlubu[klub] = { ut:0, z:0, c:0, p:0, vp:0, vpo:0 };
        poKlubu[klub].ut++; poKlubu[klub].z+=z; poKlubu[klub].c+=c;
        poKlubu[klub].p+=p; poKlubu[klub].vp+=v1; poKlubu[klub].vpo+=v2;
      });
    });
    Object.entries(poKlubu).sort((a,b)=>{
      const ua=a[1].z+a[1].c+a[1].p+a[1].vp+a[1].vpo;
      const ub=b[1].z+b[1].c+b[1].p+b[1].vp+b[1].vpo;
      return ub-ua;
    }).forEach(([klub, d]) => {
      const uk = d.z+d.c+d.p+d.vp+d.vpo;
      csv += [escapeCSV(klub), d.ut, d.z, d.c, d.p, d.vp, d.vpo, uk].join(',') + '\n';
    });
    const uk = ukZ+ukC+ukP+ukVp+ukVpo;
    csv += '\n' + ['UKUPNO', ukBr, ukZ, ukC, ukP, ukVp, ukVpo, uk].join(',') + '\n';
  } else {
    csv += '# Izvještaj kluba: ' + ime + '\n# Sezona: ' + TRENUTNA_SEZONA + '\n# Generirano: ' + datum + '\n# Izvor: postenosudenje.com\n\n';
    csv += 'Sudac,Utakmice,Žuti,Crveni,Penal,VAR priznat,VAR poništen,Ukupno\n';
    const poSudcu = {};
    let ukZ=0, ukC=0, ukP=0, ukVp=0, ukVpo=0, ukBr=0;
    UTakmiceKompletne.forEach(u => {
      const jd = u["Domaćin"] === ime, jg = u["Gost"] === ime;
      if (!jd && !jg) return;
      ukBr++;
      const suf = jd ? "D" : "G";
      const z = num(u["Žuti "+suf]), c = num(u["Crveni "+suf]), p = num(u["Penal "+suf]);
      const v1 = num(u["VAR priznat "+suf]), v2 = num(u["VAR poništen "+suf]);
      ukZ+=z; ukC+=c; ukP+=p; ukVp+=v1; ukVpo+=v2;
      ["Glavni sudac","Pomoćni 1","Pomoćni 2","VAR","AVAR"].forEach(k => {
        const s = u[k];
        if (!s || !s.trim()) return;
        const imeS = s.trim();
        if (!poSudcu[imeS]) poSudcu[imeS] = { ut:0, z:0, c:0, p:0, vp:0, vpo:0 };
        poSudcu[imeS].ut++; poSudcu[imeS].z+=z; poSudcu[imeS].c+=c;
        poSudcu[imeS].p+=p; poSudcu[imeS].vp+=v1; poSudcu[imeS].vpo+=v2;
      });
    });
    Object.entries(poSudcu).sort((a,b)=>{
      const ua=a[1].z+a[1].c+a[1].p+a[1].vp+a[1].vpo;
      const ub=b[1].z+b[1].c+b[1].p+b[1].vp+b[1].vpo;
      return ub-ua;
    }).forEach(([sudac, d]) => {
      const uk = d.z+d.c+d.p+d.vp+d.vpo;
      csv += [escapeCSV(sudac), d.ut, d.z, d.c, d.p, d.vp, d.vpo, uk].join(',') + '\n';
    });
    const uk = ukZ+ukC+ukP+ukVp+ukVpo;
    csv += '\n' + ['UKUPNO', ukBr, ukZ, ukC, ukP, ukVp, ukVpo, uk].join(',') + '\n';
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `izvjestaj-${tip}-${slugify(ime)}-${TRENUTNA_SEZONA}-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// MODAL
// ============================================================
function openModal() {
  document.getElementById("modalOverlay").classList.add("visible");
  document.body.classList.add("modal-open");
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("visible");
  document.body.classList.remove("modal-open");
  trenutniModal = null;
  ocistiURL();
}

// ============================================================
// MODAL KLUBA
// ============================================================
function prikaziModalKlub(klub) {
  const podaci = kluboviCache[klub];
  if (!podaci) return;
  trenutniModal = { tip: 'klub', ime: klub };
  postaviURL('klub', klub);

  let zuti=0, crveni=0, penal=0, vp=0, vpo=0, brojUtakmica=0;
  const poSudcu = {};
  UTakmiceKompletne.forEach(u => {
    const jd = u["Domaćin"] === klub, jg = u["Gost"] === klub;
    if (!jd && !jg) return;
    brojUtakmica++;
    const suf = jd ? "D" : "G";
    const zU = num(u["Žuti "+suf]), cU = num(u["Crveni "+suf]), pU = num(u["Penal "+suf]);
    const vpU = num(u["VAR priznat "+suf]), vpoU = num(u["VAR poništen "+suf]);
    zuti+=zU; crveni+=cU; penal+=pU; vp+=vpU; vpo+=vpoU;
    ["Glavni sudac","Pomoćni 1","Pomoćni 2","VAR","AVAR"].forEach(k => {
      const s = u[k];
      if (!s || !s.trim()) return;
      const ime = s.trim();
      const uloga = (k === "Pomoćni 1" || k === "Pomoćni 2") ? "Pomoćni" : (k === "Glavni sudac" ? "Glavni" : k);
      if (!poSudcu[ime]) poSudcu[ime] = { utakmica:0, zuti:0, crveni:0, penal:0, vp:0, vpo:0, pozicije:{} };
      poSudcu[ime].utakmica++;
      poSudcu[ime].zuti+=zU; poSudcu[ime].crveni+=cU; poSudcu[ime].penal+=pU;
      poSudcu[ime].vp+=vpU; poSudcu[ime].vpo+=vpoU;
      poSudcu[ime].pozicije[uloga] = (poSudcu[ime].pozicije[uloga] || 0) + 1;
    });
  });

  const grbUrl = getGrbUrl(klub);
  document.getElementById("modalIcon").innerHTML = grbUrl
    ? `<img src="${grbUrl}" alt="Grb ${escapeHtml(klub)}" onerror="this.outerHTML='<i class=\\'fas fa-shield-alt\\'></i>'">`
    : '<i class="fas fa-shield-alt" aria-hidden="true"></i>';
  document.getElementById("modalTitle").textContent = klub;
  const sezonaInfo = SEZONE.find(s => s.id === TRENUTNA_SEZONA);
  const sezonaNaziv = sezonaInfo ? sezonaInfo.naziv : TRENUTNA_SEZONA;
  document.getElementById("modalSubtitle").textContent = brojUtakmica + " utakmica u HNL-u (" + sezonaNaziv + ")";

  const suciSort = Object.entries(poSudcu)
    .map(([ime, d]) => ({ ime, ...d, ukupno: d.zuti+d.crveni+d.penal+d.vp+d.vpo }))
    .sort((a, b) => b.ukupno - a.ukupno || a.ime.localeCompare(b.ime, "hr"));

  let html = `
    <div class="modal-section">
      <div class="stats-grid">
        <div class="stat-item"><div class="label">${IKONA_ZUTI} Žuti</div><div class="value yellow">${zuti}</div><div class="per-match">${(zuti/(brojUtakmica||1)).toFixed(2)} po utakmici</div></div>
        <div class="stat-item"><div class="label">${IKONA_CRVENI} Crveni</div><div class="value red">${crveni}</div><div class="per-match">${(crveni/(brojUtakmica||1)).toFixed(2)} po utakmici</div></div>
        <div class="stat-item"><div class="label"><i class="fas fa-futbol" style="color:var(--blue);"></i> Penal</div><div class="value penalty">${penal}</div><div class="per-match">${(penal/(brojUtakmica||1)).toFixed(2)} po utakmici</div></div>
        <div class="stat-item"><div class="label">${IKONA_VAR_PRIZNAT} VAR priznati</div><div class="value var">${vp}</div><div class="per-match">${(vp/(brojUtakmica||1)).toFixed(2)} po utakmici</div></div>
        <div class="stat-item"><div class="label">${IKONA_VAR_PONISTEN} VAR poništeni</div><div class="value var">${vpo}</div><div class="per-match">${(vpo/(brojUtakmica||1)).toFixed(2)} po utakmici</div></div>
      </div>
    </div>
    <p class="table-info" style="margin-top:0;">
      <i class="fas fa-info-circle" aria-hidden="true"></i>
      <span><strong>Napomena:</strong> U slučaju drugog žutog, odnosno isključujućeg crvenog kartona, brišu se žuti kartoni i pretvaraju u 1 crveni.</span>
    </p>
  `;

  if (suciSort.length > 0) {
    html += `
      <div class="modal-section">
        <div class="modal-section-title"><i class="fas fa-user-tie"></i> Suci na utakmicama kluba (${suciSort.length})</div>
        <div class="modal-list">
          ${suciSort.map(s => {
            const pozStr = Object.entries(s.pozicije).map(([p, n]) => n > 1 ? `${p} ×${n}` : p).join(", ");
            return `
              <div class="modal-list-item" data-open="sudac" data-name="${escapeHtml(s.ime)}">
                <div class="item-name"><i class="fas fa-user-tie" style="color:var(--yellow);opacity:0.7;"></i> ${escapeHtml(s.ime)}<span class="item-role">${pozStr}</span></div>
                <div class="item-badges">
                  <span class="item-badge" style="color:var(--blue);"><i class="fas fa-futbol"></i> ${s.utakmica}</span>
                  ${s.zuti > 0 ? `<span class="item-badge">${IKONA_ZUTI} ${s.zuti}</span>` : ''}
                  ${s.crveni > 0 ? `<span class="item-badge">${IKONA_CRVENI} ${s.crveni}</span>` : ''}
                  ${s.penal > 0 ? `<span class="item-badge"><i class="fas fa-futbol" style="color:var(--blue);"></i> ${s.penal}</span>` : ''}
                  ${s.vp > 0 ? `<span class="item-badge">${IKONA_VAR_PRIZNAT_BADGE} ${s.vp}</span>` : ''}
                  ${s.vpo > 0 ? `<span class="item-badge">${IKONA_VAR_PONISTEN_BADGE} ${s.vpo}</span>` : ''}
                  <span class="item-badge total">Ukupno: ${s.ukupno}</span>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  document.getElementById("modalBody").innerHTML = html;
  openModal();
}

// ============================================================
// MODAL SUCA
// ============================================================
function prikaziModalSudac(ime) {
  trenutniModal = { tip: 'sudac', ime: ime };
  postaviURL('sudac', ime);

  let zuti=0, crveni=0, penal=0, vp=0, vpo=0, broj=0;
  const poKlubu = {};
  UTakmiceKompletne.forEach(u => {
    const uloga = ulogaSuca(u, ime);
    if (!uloga) return;
    broj++;
    const dZ=num(u["Žuti D"]), dC=num(u["Crveni D"]), dP=num(u["Penal D"]);
    const dVP=num(u["VAR priznat D"]), dVPO=num(u["VAR poništen D"]);
    const gZ=num(u["Žuti G"]), gC=num(u["Crveni G"]), gP=num(u["Penal G"]);
    const gVP=num(u["VAR priznat G"]), gVPO=num(u["VAR poništen G"]);
    zuti+=dZ+gZ; crveni+=dC+gC; penal+=dP+gP; vp+=dVP+gVP; vpo+=dVPO+gVPO;
    if (u["Domaćin"]?.trim()) {
      const klub = u["Domaćin"].trim();
      if (!poKlubu[klub]) poKlubu[klub] = { zuti:0, crveni:0, penal:0, vp:0, vpo:0, pozicije:{} };
      poKlubu[klub].zuti+=dZ; poKlubu[klub].crveni+=dC; poKlubu[klub].penal+=dP;
      poKlubu[klub].vp+=dVP; poKlubu[klub].vpo+=dVPO;
      poKlubu[klub].pozicije[uloga] = (poKlubu[klub].pozicije[uloga] || 0) + 1;
    }
    if (u["Gost"]?.trim()) {
      const klub = u["Gost"].trim();
      if (!poKlubu[klub]) poKlubu[klub] = { zuti:0, crveni:0, penal:0, vp:0, vpo:0, pozicije:{} };
      poKlubu[klub].zuti+=gZ; poKlubu[klub].crveni+=gC; poKlubu[klub].penal+=gP;
      poKlubu[klub].vp+=gVP; poKlubu[klub].vpo+=gVPO;
      poKlubu[klub].pozicije[uloga] = (poKlubu[klub].pozicije[uloga] || 0) + 1;
    }
  });

  const sezonaInfo = SEZONE.find(s => s.id === TRENUTNA_SEZONA);
  const sezonaNaziv = sezonaInfo ? sezonaInfo.naziv : TRENUTNA_SEZONA;

  document.getElementById("modalIcon").innerHTML = '<i class="fas fa-user-tie" aria-hidden="true"></i>';
  document.getElementById("modalTitle").textContent = ime;
  document.getElementById("modalSubtitle").textContent = broj + " utakmica u HNL-u (" + sezonaNaziv + ")";

  if (broj === 0) {
    document.getElementById("modalBody").innerHTML = `
      <div class="usporedba-prazno">
        <i class="fas fa-user-slash"></i>
        Nema podataka za ovog suca u sezoni ${sezonaNaziv}.
      </div>
    `;
    openModal();
    return;
  }

  const n = broj || 1;
  const pozicijeUkupno = { "Glavni":0, "Pomoćni":0, "VAR":0, "AVAR":0 };
  UTakmiceKompletne.forEach(u => {
    const uloga = ulogaSuca(u, ime);
    if (!uloga) return;
    if (pozicijeUkupno[uloga] !== undefined) pozicijeUkupno[uloga]++;
  });

  const kluboviSort = Object.entries(poKlubu)
    .map(([klub, d]) => {
      const ukupno = d.zuti+d.crveni+d.penal+d.vp+d.vpo;
      const pozicijeStr = Object.entries(d.pozicije).map(([p, cnt]) => cnt > 1 ? `${p} ×${cnt}` : p).join(", ");
      return { klub, ...d, ukupno, pozicijeStr };
    })
    .filter(k => k.ukupno > 0)
    .sort((a, b) => b.ukupno - a.ukupno);

  let html = `
    <div class="modal-section">
      <div class="stats-grid">
        <div class="stat-item"><div class="label">${IKONA_ZUTI} Žuti</div><div class="value yellow">${zuti}</div><div class="per-match">${(zuti/n).toFixed(2)} po utakmici</div></div>
        <div class="stat-item"><div class="label">${IKONA_CRVENI} Crveni</div><div class="value red">${crveni}</div><div class="per-match">${(crveni/n).toFixed(2)} po utakmici</div></div>
        <div class="stat-item"><div class="label"><i class="fas fa-futbol" style="color:var(--blue);"></i> Penal</div><div class="value penalty">${penal}</div><div class="per-match">${(penal/n).toFixed(2)} po utakmici</div></div>
        <div class="stat-item"><div class="label">${IKONA_VAR_PRIZNAT} VAR priznati</div><div class="value var">${vp}</div><div class="per-match">${(vp/n).toFixed(2)} po utakmici</div></div>
        <div class="stat-item"><div class="label">${IKONA_VAR_PONISTEN} VAR poništeni</div><div class="value var">${vpo}</div><div class="per-match">${(vpo/n).toFixed(2)} po utakmici</div></div>
      </div>
    </div>
    <p class="table-info" style="margin-top:0;">
      <i class="fas fa-info-circle" aria-hidden="true"></i>
      <span><strong>Napomena:</strong> U slučaju drugog žutog, odnosno isključujućeg crvenog kartona, brišu se žuti kartoni i pretvaraju u 1 crveni.</span>
    </p>
    <div class="modal-section">
      <div class="modal-section-title"><i class="fas fa-user-tag"></i> Pozicije u sudačkoj ekipi</div>
      <div class="stats-grid">
        <div class="stat-item"><div class="label"><i class="fas fa-user-tie" style="color:var(--yellow);"></i> Glavni</div><div class="value yellow">${pozicijeUkupno["Glavni"]}</div><div class="per-match">${broj > 0 ? ((pozicijeUkupno["Glavni"]/broj)*100).toFixed(0) : 0}% utakmica</div></div>
        <div class="stat-item"><div class="label"><i class="fas fa-flag" style="color:var(--blue);"></i> Pomoćni</div><div class="value penalty">${pozicijeUkupno["Pomoćni"]}</div><div class="per-match">${broj > 0 ? ((pozicijeUkupno["Pomoćni"]/broj)*100).toFixed(0) : 0}% utakmica</div></div>
        <div class="stat-item"><div class="label"><i class="fas fa-video" style="color:var(--green);"></i> VAR</div><div class="value var">${pozicijeUkupno["VAR"]}</div><div class="per-match">${broj > 0 ? ((pozicijeUkupno["VAR"]/broj)*100).toFixed(0) : 0}% utakmica</div></div>
        <div class="stat-item"><div class="label"><i class="fas fa-headset" style="color:var(--text-muted);"></i> AVAR</div><div class="value" style="color:var(--text-muted);">${pozicijeUkupno["AVAR"]}</div><div class="per-match">${broj > 0 ? ((pozicijeUkupno["AVAR"]/broj)*100).toFixed(0) : 0}% utakmica</div></div>
      </div>
    </div>
  `;

  if (kluboviSort.length > 0) {
    html += `
      <div class="modal-section">
        <div class="modal-section-title"><i class="fas fa-shield-alt"></i> Klubovi (${kluboviSort.length})</div>
        <div class="modal-list">
          ${kluboviSort.map(k => `
            <div class="modal-list-item" data-open="klub" data-name="${escapeHtml(k.klub)}">
              <div class="item-name">${grbHtml(k.klub, 'srednji')} ${escapeHtml(k.klub)}<span class="item-role">${k.pozicijeStr}</span></div>
              <div class="item-badges">
                ${k.zuti > 0 ? `<span class="item-badge">${IKONA_ZUTI} ${k.zuti}</span>` : ''}
                ${k.crveni > 0 ? `<span class="item-badge">${IKONA_CRVENI} ${k.crveni}</span>` : ''}
                ${k.penal > 0 ? `<span class="item-badge"><i class="fas fa-futbol" style="color:var(--blue);"></i> ${k.penal}</span>` : ''}
                ${k.vp > 0 ? `<span class="item-badge">${IKONA_VAR_PRIZNAT_BADGE} ${k.vp}</span>` : ''}
                ${k.vpo > 0 ? `<span class="item-badge">${IKONA_VAR_PONISTEN_BADGE} ${k.vpo}</span>` : ''}
                <span class="item-badge total">Ukupno: ${k.ukupno}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  document.getElementById("modalBody").innerHTML = html;
  openModal();
}

// ============================================================
// UČITAVANJE PODATAKA
// ============================================================
const STATIC_DATA = { [API_URL_AKTIVNA]: 'data/aktivna.json', [API_URL_PROŠLA]: 'data/2025-26.json' };

// Prvo statična datoteka (brza, CDN), a ako ne postoji ili je prazna, Apps Script.
async function fetchSezona(url) {
  const st = STATIC_DATA[url];
  if (st) {
    try {
      const r = await fetchWithTimeout(st, 8000);
      if (r.ok) { const d = await r.clone().json(); if (Array.isArray(d) && d.length) return r; }
    } catch (e) { console.warn('Statični podaci nedostupni, koristim API', e); }
  }
  return fetchWithTimeout(url, 60000);
}

async function fetchWithTimeout(url, timeout = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const r = await fetch(url, { signal: controller.signal, cache: 'default', redirect: 'follow' });
    clearTimeout(timer);
    return r;
  } catch (e) { clearTimeout(timer); throw e; }
}

async function ucitajSezonu(sezona) {
  if (sezona === 'UKUPNO') return ucitajSveSezone();
  const cached = getCachedData(sezona);
  if (cached) return cached;
  const obj = SEZONE.find(s => s.id === sezona);
  if (!obj || !obj.url) return [];
  try {
    const r = await fetchSezona(obj.url);
    const data = filtrirajUtakmice(await r.json());
    if (data.length) setCachedData(data, sezona);
    return data;
  } catch (e) { console.warn(sezona, e); return []; }
}

let zahtjevId = 0;

async function ucitajSveSezone() {
  const sveUtakmice = [];
  try {
    let aktivnaData = getCachedData('AKTIVNA');
    if (!aktivnaData) {
      const r = await fetchSezona(API_URL_AKTIVNA);
      aktivnaData = await r.json();
      if (Array.isArray(aktivnaData) && aktivnaData.length > 0) {
        aktivnaData = filtrirajUtakmice(aktivnaData);
        setCachedData(aktivnaData, 'AKTIVNA');
      }
    }
    if (Array.isArray(aktivnaData)) {
      aktivnaData.forEach(u => { u._sezona = 'AKTIVNA'; });
      sveUtakmice.push(...aktivnaData);
    }
  } catch (e) { console.warn('Aktivna:', e); }
  try {
    let prošlaData = getCachedData('2025-26');
    if (!prošlaData) {
      const r = await fetchSezona(API_URL_PROŠLA);
      prošlaData = await r.json();
      if (Array.isArray(prošlaData) && prošlaData.length > 0) {
        prošlaData = filtrirajUtakmice(prošlaData);
        setCachedData(prošlaData, '2025-26');
      }
    }
    if (Array.isArray(prošlaData)) {
      prošlaData.forEach(u => { u._sezona = '2025-26'; });
      sveUtakmice.push(...prošlaData);
    }
  } catch (e) { console.warn('Prošla:', e); }
  return sveUtakmice;
}

async function ucitajPodatke(sezona = TRENUTNA_SEZONA) {
  const id = ++zahtjevId;
  document.getElementById("errorBox").style.display = "none";

  if (sezona === 'UKUPNO') {
    document.getElementById("skeleton").style.display = "grid";
    document.getElementById("app").style.display = "none";
    try {
      const sve = await ucitajSveSezone();
      if (!sve || sve.length === 0) throw new Error("Nema podataka ni u jednoj sezoni");
      UTakmice = filtrirajUtakmice(sve);
      if (id === zahtjevId) requestAnimationFrame(() => pokreni());
    } catch (err) {
      document.getElementById("skeleton").style.display = "none";
      const e = document.getElementById("errorBox");
      e.style.display = "block";
      e.innerHTML = `<b>Greška:</b> ${escapeHtml(err.message)} <button type="button" class="retry-btn" onclick="location.reload()">Pokušaj ponovno</button>`;
    }
    return;
  }

  const sezonaObj = SEZONE.find(s => s.id === sezona);
  if (!sezonaObj || !sezonaObj.url) return;

  const cached = getCachedData(sezona);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    UTakmice = cached;
    if (id === zahtjevId) requestAnimationFrame(() => pokreni());
    return;
  }

  try {
    const r = await fetchSezona(sezonaObj.url);
    const data = await r.json();
    if (data.error) throw new Error(data.error);
    if (!Array.isArray(data) || data.length === 0) throw new Error("Nema podataka za sezonu " + sezonaObj.naziv);
    UTakmice = filtrirajUtakmice(data);
    setCachedData(UTakmice, sezona);
    if (id === zahtjevId) requestAnimationFrame(() => pokreni());
  } catch (err) {
    document.getElementById("skeleton").style.display = "none";
    const e = document.getElementById("errorBox");
    e.style.display = "block";
    e.innerHTML = `<b>Greška:</b> ${escapeHtml(err.message)} <button type="button" class="retry-btn" onclick="location.reload()">Pokušaj ponovno</button>`;
  }
}

async function ucitajSveOdjednom() {
  try { await ucitajPodatke(TRENUTNA_SEZONA); } catch (e) { console.warn(e); }
  try {
    if (!getCachedData('2025-26')) {
      const sezonaObj = SEZONE.find(s => s.id === '2025-26');
      if (sezonaObj && sezonaObj.url) {
        const r = await fetchSezona(sezonaObj.url);
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          setCachedData(filtrirajUtakmice(data), '2025-26');
        }
      }
    }
  } catch (e) { /* ignore */ }
}

function pokreni() {
  const sk = document.getElementById("skeleton");
  if (sk) sk.style.display = "none";
  document.getElementById("app").style.display = "block";

  UTakmiceKompletne = filtrirajKompletneKola(UTakmice);

  sazetak();
  popuniSudce();
  popuniKlubove();
  popuniKola();
  izracunajKlubove();
  popuniUsporedbaComboboxove();

  const sviSuciSet = new Set();
  UTakmice.forEach(u => {
    ["Glavni sudac","Pomoćni 1","Pomoćni 2","VAR","AVAR"].forEach(k => {
      if (u[k] && u[k].trim()) sviSuciSet.add(u[k].trim());
    });
  });

  const sezonaInfo = SEZONE.find(s => s.id === TRENUTNA_SEZONA);
  const sezonaNaziv = sezonaInfo ? sezonaInfo.naziv : TRENUTNA_SEZONA;

  const svaKola = [...new Set(UTakmice.map(u => num(u.Kolo)))].filter(k => k >= 1 && k <= 36);
  const kolaSOdlukama = svaKola.filter(k => koloImaOdluku(k));

  if (TRENUTNA_SEZONA === 'UKUPNO') {
    document.getElementById("heroChips").innerHTML = `
      <span class="hero-chip"><i class="fas fa-layer-group"></i> Sve sezone (ukupno)</span>
      <span class="hero-chip"><i class="fas fa-futbol"></i> ${UTakmice.length} utakmica</span>
      <span class="hero-chip"><i class="fas fa-user-tie"></i> ${sviSuciSet.size} sudaca</span>
      <span class="hero-chip"><i class="fas fa-shield-alt"></i> ${Object.keys(kluboviCache).length} klubova</span>
    `;
  } else {
    document.getElementById("heroChips").innerHTML = `
      <span class="hero-chip"><i class="fas fa-calendar-alt"></i> Sezona ${sezonaNaziv}</span>
      <span class="hero-chip"><i class="fas fa-futbol"></i> ${UTakmice.length} utakmica</span>
      <span class="hero-chip"><i class="fas fa-calendar-alt"></i> ${kolaSOdlukama.length} kola</span>
      <span class="hero-chip"><i class="fas fa-user-tie"></i> ${sviSuciSet.size} sudaca</span>
      <span class="hero-chip"><i class="fas fa-shield-alt"></i> ${Object.keys(kluboviCache).length} klubova</span>
    `;
  }

  renderKlubTablicu();
  nacrtajZutiChart();
  provjeriURL();

  if (!sortListenersInitialized) {
    sortListenersInitialized = true;
    document.querySelectorAll("#klubTablica th.sortable").forEach(th => {
      th.addEventListener("click", () => {
        const key = th.dataset.key;
        if (sortState.key === key) sortState.dir *= -1;
        else { sortState.key = key; sortState.dir = -1; }
        renderKlubTablicu();
      });
    });

    document.querySelectorAll("#mainMenu .menu-item[data-section]").forEach(it => {
      it.addEventListener("click", function() {
        document.querySelectorAll("#mainMenu .menu-item[data-section]").forEach(m => m.classList.remove("active"));
        this.classList.add("active");
        document.querySelectorAll(".section-panel").forEach(s => s.classList.remove("active"));
        const sekcija = this.dataset.section;
        document.getElementById("section-" + sekcija).classList.add("active");
        updateSEOForSection(sekcija);
      });
    });

    const koloSel = document.getElementById("koloSelect");
    if (koloSel) {
      koloSel.addEventListener("change", e => prikaziKolo(Number(e.target.value)));
    }
  }
}

async function promijeniSezonu(novaSezona) {
  if (novaSezona === TRENUTNA_SEZONA) return;
  const sezonaObj = SEZONE.find(s => s.id === novaSezona);
  if (!sezonaObj) return;
  TRENUTNA_SEZONA = novaSezona;
  document.getElementById("app").style.display = "none";
  document.getElementById("skeleton").style.display = "grid";
  document.getElementById("errorBox").style.display = "none";
  UTakmice = [];
  UTakmiceKompletne = [];
  kluboviCache = {};
  sortState = { key: null, dir: -1 };
  sviSuci = [];
  sviKlubovi = [];
  const selSudac = document.getElementById("sudacSezonaSelect");
  const selKlub = document.getElementById("klubSezonaSelect");
  if (selSudac) selSudac.value = novaSezona;
  if (selKlub) selKlub.value = novaSezona;
  document.querySelectorAll("#seasonPicker .menu-item").forEach(btn => {
    const aktivan = btn.dataset.season === novaSezona;
    btn.classList.toggle("active", aktivan);
    btn.setAttribute("aria-pressed", aktivan ? "true" : "false");
  });
  await ucitajPodatke(novaSezona);
  const url = new URL(window.location.href);
  if (novaSezona === 'AKTIVNA') url.searchParams.delete('season');
  else url.searchParams.set('season', novaSezona);
  history.replaceState({}, '', url.toString());
}

// ============================================================
// SAŽETAK
// ============================================================
function sazetak() {
  let zuti=0, crveni=0, penal=0, vp=0, vpo=0;
  UTakmiceKompletne.forEach(u => {
    zuti += num(u["Žuti D"]) + num(u["Žuti G"]);
    crveni += num(u["Crveni D"]) + num(u["Crveni G"]);
    penal += num(u["Penal D"]) + num(u["Penal G"]);
    vp += num(u["VAR priznat D"]) + num(u["VAR priznat G"]);
    vpo += num(u["VAR poništen D"]) + num(u["VAR poništen G"]);
  });
  const n = UTakmiceKompletne.length || 1;
  document.getElementById("summaryCards").innerHTML = `
    <div class="card accent-yellow"><div class="card-icon-wrap">${IKONA_ZUTI_VELIKI}</div><div><h3>Žuti kartoni</h3><div class="broj">${zuti} <small>/ ${n} utakmica</small></div><div class="per-match">${(zuti/n).toFixed(2)} po utakmici</div></div></div>
    <div class="card accent-red"><div class="card-icon-wrap">${IKONA_CRVENI_VELIKI}</div><div><h3>Crveni kartoni</h3><div class="broj">${crveni} <small>/ ${n} utakmica</small></div><div class="per-match">${(crveni/n).toFixed(2)} po utakmici</div></div></div>
    <div class="card"><i class="fas fa-futbol" style="color:var(--blue);"></i><div><h3>Penali</h3><div class="broj">${penal} <small>/ ${n} utakmica</small></div><div class="per-match">${(penal/n).toFixed(2)} po utakmici</div></div></div>
    <div class="card"><i class="fas fa-video" style="color:var(--green);"></i><div><h3>VAR priznati</h3><div class="broj">${vp} <small>/ ${n} utakmica</small></div><div class="per-match">${(vp/n).toFixed(2)} po utakmici</div></div></div>
    <div class="card"><i class="fas fa-video-slash" style="color:var(--text-muted);"></i><div><h3>VAR poništeni</h3><div class="broj">${vpo} <small>/ ${n} utakmica</small></div><div class="per-match">${(vpo/n).toFixed(2)} po utakmici</div></div></div>
  `;
}

function nacrtajZutiChart() {
  const blok = document.getElementById("zutiChartBlok");
  const sakrij = TRENUTNA_SEZONA === 'UKUPNO';
  if (blok) blok.hidden = sakrij;
  if (sakrij) {
    if (zutiChartInstance) { zutiChartInstance.destroy(); zutiChartInstance = null; }
    return;
  }
  const canvas = document.getElementById("zutiChart");
  if (!canvas || typeof Chart === 'undefined') return;
  const poKolu = {};
  UTakmiceKompletne.forEach(u => {
    const k = num(u.Kolo);
    if (k < 1) return;
    if (!poKolu[k]) poKolu[k] = 0;
    poKolu[k] += num(u["Žuti D"]) + num(u["Žuti G"]);
  });
  const kola = Object.keys(poKolu).map(Number).sort((a,b)=>a-b);
  const vrijednosti = kola.map(k => poKolu[k]);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (zutiChartInstance) zutiChartInstance.destroy();

  const cs = getComputedStyle(document.documentElement);
  const yellowColor = cs.getPropertyValue('--yellow').trim() || '#f5c518';
  const textMuted = cs.getPropertyValue('--text-muted').trim() || '#8a8a8a';
  const borderColor = cs.getPropertyValue('--border').trim() || '#262626';
  const gridColor = document.documentElement.getAttribute('data-theme') === 'light'
    ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, document.documentElement.getAttribute('data-theme') === 'light'
    ? 'rgba(184,134,11,0.25)' : 'rgba(245,197,24,0.35)');
  gradient.addColorStop(1, 'rgba(245,197,24,0.02)');
  zutiChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: kola.map(k => `K${k}`),
      datasets: [{
        label: 'Žuti kartoni',
        data: vrijednosti,
        borderColor: yellowColor,
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: yellowColor,
        pointBorderColor: borderColor,
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion ? false : { duration: 700 },
      interaction: { intersect: false, mode: 'index' },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textMuted, font: { size: 11 } } },
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textMuted, font: { size: 11 }, precision: 0 } }
      }
    }
  });
}

// ============================================================
// COMBOBOX
// ============================================================
function setupCombobox(wrapperId, inputId, listId, sveOpcije, onSelect) {
  const wrapper = document.getElementById(wrapperId);
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!wrapper || !input || !list) return;
  let currentIndex = -1;
  let filtrirane = [...sveOpcije];

  function renderLista(prikaz) {
    list.innerHTML = "";
    if (prikaz.length === 0) {
      const empty = document.createElement("div");
      empty.className = "combobox-empty";
      empty.textContent = "Nema rezultata";
      list.appendChild(empty);
      return;
    }
    prikaz.forEach((opt, i) => {
      const el = document.createElement("div");
      el.className = "combobox-option";
      if (i === currentIndex) el.classList.add("highlighted");
      if (opt === input.value) el.classList.add("selected");
      el.textContent = opt;
      el.setAttribute("role", "option");
      el.addEventListener("mousedown", e => {
        e.preventDefault();
        input.value = opt;
        closeList();
        if (onSelect) onSelect(opt);
      });
      list.appendChild(el);
    });
  }

  function openList() {
    wrapper.classList.add("open");
    input.setAttribute("aria-expanded", "true");
    const val = input.value.trim().toLowerCase();
    filtrirane = val === "" ? [...sveOpcije] : sveOpcije.filter(o => o.toLowerCase().includes(val));
    currentIndex = -1;
    renderLista(filtrirane);
  }

  function closeList() {
    wrapper.classList.remove("open");
    input.setAttribute("aria-expanded", "false");
    currentIndex = -1;
  }

  input.addEventListener("focus", openList);
  input.addEventListener("click", openList);
  input.addEventListener("input", () => {
    if (!wrapper.classList.contains("open")) {
      wrapper.classList.add("open");
      input.setAttribute("aria-expanded", "true");
    }
    const val = input.value.trim().toLowerCase();
    filtrirane = val === "" ? [...sveOpcije] : sveOpcije.filter(o => o.toLowerCase().includes(val));
    currentIndex = -1;
    renderLista(filtrirane);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!wrapper.classList.contains("open")) openList();
      if (filtrirane.length === 0) return;
      currentIndex = (currentIndex + 1) % filtrirane.length;
      renderLista(filtrirane);
      const el = list.children[currentIndex];
      if (el) el.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!wrapper.classList.contains("open")) openList();
      if (filtrirane.length === 0) return;
      currentIndex = currentIndex <= 0 ? filtrirane.length - 1 : currentIndex - 1;
      renderLista(filtrirane);
      const el = list.children[currentIndex];
      if (el) el.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentIndex >= 0 && filtrirane[currentIndex]) {
        input.value = filtrirane[currentIndex];
        closeList();
        if (onSelect) onSelect(input.value);
      } else if (sveOpcije.includes(input.value.trim())) {
        closeList();
        if (onSelect) onSelect(input.value.trim());
      }
    } else if (e.key === "Escape") {
      closeList();
      input.blur();
    } else if (e.key === "Tab") {
      closeList();
    }
  });

  document.addEventListener("click", e => { if (!wrapper.contains(e.target)) closeList(); });
  input.addEventListener("change", () => {
    const val = input.value.trim();
    if (sveOpcije.includes(val) && onSelect) onSelect(val);
  });
}

function popuniSudce() {
  const suci = new Set();
  UTakmice.forEach(u => {
    ["Glavni sudac","Pomoćni 1","Pomoćni 2","VAR","AVAR"].forEach(k => {
      if (u[k] && u[k].trim()) suci.add(u[k].trim());
    });
  });
  sviSuci = [...suci].sort((a,b) => a.localeCompare(b, "hr"));
  setupCombobox("sudacCombobox", "sudacInput", "sudacComboboxList", sviSuci, (val) => prikaziSuca(val));
}

function popuniKlubove() {
  const klubovi = new Set();
  UTakmice.forEach(u => {
    if (u["Domaćin"] && u["Domaćin"].trim()) klubovi.add(u["Domaćin"].trim());
    if (u["Gost"] && u["Gost"].trim()) klubovi.add(u["Gost"].trim());
  });
  sviKlubovi = [...klubovi].sort((a,b) => a.localeCompare(b, "hr"));
  setupCombobox("klubCombobox", "klubInput", "klubComboboxList", sviKlubovi, (val) => prikaziKlub(val));
}

function popuniKola() {
  const sel = document.getElementById("koloSelect");
  sel.innerHTML = "";

  const svaKola = [...new Set(UTakmice.map(u => num(u.Kolo)))]
    .filter(k => k >= 1 && k <= 36)
    .sort((a,b) => a-b);

  const kolaSOdlukama = svaKola.filter(k => koloImaOdluku(k));

  kolaSOdlukama.forEach(k => {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = "Kolo " + k;
    sel.appendChild(o);
  });

  if (kolaSOdlukama.length > 0) {
    const zadnjeKolo = kolaSOdlukama[kolaSOdlukama.length - 1];
    sel.value = zadnjeKolo;
    prikaziKolo(zadnjeKolo);
  } else {
    document.getElementById("matchesGrid").innerHTML =
      `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted); font-style:italic;">Nema kola s evidentiranim odlukama.</div>`;
  }
}

// ============================================================
// PRIKAZ SUCA U STATISTICI
// ============================================================
async function prikaziSuca(ime) {
  const div = document.getElementById("sudacStats");
  if (!ime) { div.classList.remove("visible"); return; }
  const sel = document.getElementById("sudacSezonaSelect");
  const sezona = sel ? sel.value : TRENUTNA_SEZONA;
  div.classList.add("visible");
  div.setAttribute("aria-busy", "true");
  document.getElementById("sudacIme").textContent = ime;
  document.getElementById("statsGrid").innerHTML = `<div class="stat-item" style="grid-column:1/-1; text-align:center; padding:2rem;"><i class="fas fa-spinner fa-spin" style="font-size:1.5rem; color:var(--yellow);"></i></div>`;
  document.getElementById("sudacKluboviList").innerHTML = "";

  const utakmice = await ucitajSezonu(sezona);
  const kompletne = filtrirajKompletneKola(utakmice);

  let zuti=0, crveni=0, penal=0, vp=0, vpo=0, broj=0;
  const poKlubu = {};
  kompletne.forEach(u => {
    const uloga = ulogaSuca(u, ime);
    if (!uloga) return;
    broj++;
    const dZ=num(u["Žuti D"]), dC=num(u["Crveni D"]), dP=num(u["Penal D"]);
    const dVP=num(u["VAR priznat D"]), dVPO=num(u["VAR poništen D"]);
    const gZ=num(u["Žuti G"]), gC=num(u["Crveni G"]), gP=num(u["Penal G"]);
    const gVP=num(u["VAR priznat G"]), gVPO=num(u["VAR poništen G"]);
    zuti+=dZ+gZ; crveni+=dC+gC; penal+=dP+gP; vp+=dVP+gVP; vpo+=dVPO+gVPO;
    if (u["Domaćin"]?.trim()) {
      const klub = u["Domaćin"].trim();
      if (!poKlubu[klub]) poKlubu[klub] = { zuti:0, crveni:0, penal:0, vp:0, vpo:0, pozicije:{} };
      poKlubu[klub].zuti+=dZ; poKlubu[klub].crveni+=dC; poKlubu[klub].penal+=dP;
      poKlubu[klub].vp+=dVP; poKlubu[klub].vpo+=dVPO;
      poKlubu[klub].pozicije[uloga] = (poKlubu[klub].pozicije[uloga] || 0) + 1;
    }
    if (u["Gost"]?.trim()) {
      const klub = u["Gost"].trim();
      if (!poKlubu[klub]) poKlubu[klub] = { zuti:0, crveni:0, penal:0, vp:0, vpo:0, pozicije:{} };
      poKlubu[klub].zuti+=gZ; poKlubu[klub].crveni+=gC; poKlubu[klub].penal+=gP;
      poKlubu[klub].vp+=gVP; poKlubu[klub].vpo+=gVPO;
      poKlubu[klub].pozicije[uloga] = (poKlubu[klub].pozicije[uloga] || 0) + 1;
    }
  });
  div.removeAttribute("aria-busy");

  const sezonaInfo = SEZONE.find(s => s.id === sezona);
  const sezonaNaziv = sezonaInfo ? sezonaInfo.naziv : sezona;

  if (broj === 0) {
    document.getElementById("sudacIme").innerHTML = `<span class="klikabilno" data-open="sudac" data-name="${escapeHtml(ime)}">${escapeHtml(ime)}</span> <span style="font-size:0.75rem; color:var(--text-muted);">— ${sezonaNaziv}</span>`;
    document.getElementById("statsGrid").innerHTML = `<div class="stat-item" style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">Nema podataka za ovog suca u sezoni ${sezonaNaziv}.</div>`;
    return;
  }

  document.getElementById("sudacIme").innerHTML = `<span class="klikabilno" data-open="sudac" data-name="${escapeHtml(ime)}">${escapeHtml(ime)}</span> <span style="font-size:0.75rem; color:var(--text-muted);">— ${sezonaNaziv}</span>`;
  const n = broj || 1;
  document.getElementById("statsGrid").innerHTML = `
    <div class="stat-item"><div class="label">${IKONA_ZUTI} Žuti</div><div class="value yellow">${zuti}</div><div class="per-match">${(zuti/n).toFixed(2)} / utakmica</div></div>
    <div class="stat-item"><div class="label">${IKONA_CRVENI} Crveni</div><div class="value red">${crveni}</div><div class="per-match">${(crveni/n).toFixed(2)} / utakmica</div></div>
    <div class="stat-item"><div class="label"><i class="fas fa-futbol" style="color:var(--blue);"></i> Penal</div><div class="value penalty">${penal}</div><div class="per-match">${(penal/n).toFixed(2)} / utakmica</div></div>
    <div class="stat-item"><div class="label">${IKONA_VAR_PRIZNAT} VAR+</div><div class="value var">${vp}</div><div class="per-match">${(vp/n).toFixed(2)} / utakmica</div></div>
    <div class="stat-item"><div class="label">${IKONA_VAR_PONISTEN} VAR−</div><div class="value var">${vpo}</div><div class="per-match">${(vpo/n).toFixed(2)} / utakmica</div></div>
  `;

  const kluboviSort = Object.entries(poKlubu)
    .map(([klub, d]) => {
      const ukupno = d.zuti+d.crveni+d.penal+d.vp+d.vpo;
      const pozicijeStr = Object.entries(d.pozicije).map(([p, cnt]) => cnt > 1 ? `${p} ×${cnt}` : p).join(", ");
      return { klub, ...d, ukupno, pozicijeStr };
    })
    .filter(k => k.ukupno > 0)
    .sort((a, b) => b.ukupno - a.ukupno);

  document.getElementById("sudacKluboviList").innerHTML = kluboviSort.length > 0
    ? kluboviSort.map(k => `
      <div class="modal-list-item" data-open="klub" data-name="${escapeHtml(k.klub)}">
        <div class="item-name">${grbHtml(k.klub, 'srednji')} ${escapeHtml(k.klub)}<span class="item-role">${k.pozicijeStr}</span></div>
        <div class="item-badges">
          ${k.zuti > 0 ? `<span class="item-badge">${IKONA_ZUTI} ${k.zuti}</span>` : ''}
          ${k.crveni > 0 ? `<span class="item-badge">${IKONA_CRVENI} ${k.crveni}</span>` : ''}
          ${k.penal > 0 ? `<span class="item-badge"><i class="fas fa-futbol" style="color:var(--blue);"></i> ${k.penal}</span>` : ''}
          ${k.vp > 0 ? `<span class="item-badge">${IKONA_VAR_PRIZNAT_BADGE} ${k.vp}</span>` : ''}
          ${k.vpo > 0 ? `<span class="item-badge">${IKONA_VAR_PONISTEN_BADGE} ${k.vpo}</span>` : ''}
          <span class="item-badge total">Ukupno: ${k.ukupno}</span>
        </div>
      </div>`).join('')
    : `<div style="color:var(--text-muted); font-style:italic; padding:1rem; text-align:center;">Nema zabilježenih odluka.</div>`;
}

// ============================================================
// PRIKAZ KLUBA U STATISTICI
// ============================================================
async function prikaziKlub(klub) {
  const div = document.getElementById("klubStats");
  if (!klub) { div.classList.remove("visible"); return; }
  const sel = document.getElementById("klubSezonaSelect");
  const sezona = sel ? sel.value : TRENUTNA_SEZONA;
  div.classList.add("visible");
  div.setAttribute("aria-busy", "true");
  document.getElementById("klubIme").innerHTML = grbHtml(klub) + ' ' + klub;
  document.getElementById("klubStatsGrid").innerHTML = `<div class="stat-item" style="grid-column:1/-1; text-align:center; padding:2rem;"><i class="fas fa-spinner fa-spin" style="font-size:1.5rem; color:var(--yellow);"></i></div>`;
  document.getElementById("klubSuciList").innerHTML = "";

  const utakmice = await ucitajSezonu(sezona);
  const kompletne = filtrirajKompletneKola(utakmice);

  let zuti=0, crveni=0, penal=0, vp=0, vpo=0, broj=0;
  const poSudcu = {};
  kompletne.forEach(u => {
    const jd = u["Domaćin"] === klub, jg = u["Gost"] === klub;
    if (!jd && !jg) return;
    broj++;
    const suf = jd ? "D" : "G";
    const zU=num(u["Žuti "+suf]), cU=num(u["Crveni "+suf]), pU=num(u["Penal "+suf]);
    const vpU=num(u["VAR priznat "+suf]), vpoU=num(u["VAR poništen "+suf]);
    zuti+=zU; crveni+=cU; penal+=pU; vp+=vpU; vpo+=vpoU;
    ["Glavni sudac","Pomoćni 1","Pomoćni 2","VAR","AVAR"].forEach(k => {
      const s = u[k];
      if (!s || !s.trim()) return;
      const ime = s.trim();
      const uloga = (k === "Pomoćni 1" || k === "Pomoćni 2") ? "Pomoćni" : (k === "Glavni sudac" ? "Glavni" : k);
      if (!poSudcu[ime]) poSudcu[ime] = { utakmica:0, zuti:0, crveni:0, penal:0, vp:0, vpo:0, pozicije:{} };
      poSudcu[ime].utakmica++;
      poSudcu[ime].zuti+=zU; poSudcu[ime].crveni+=cU; poSudcu[ime].penal+=pU;
      poSudcu[ime].vp+=vpU; poSudcu[ime].vpo+=vpoU;
      poSudcu[ime].pozicije[uloga] = (poSudcu[ime].pozicije[uloga] || 0) + 1;
    });
  });
  div.removeAttribute("aria-busy");

  const sezonaInfo = SEZONE.find(s => s.id === sezona);
  const sezonaNaziv = sezonaInfo ? sezonaInfo.naziv : sezona;

  if (broj === 0) {
    document.getElementById("klubIme").innerHTML = `${grbHtml(klub)} <span class="klikabilno" data-open="klub" data-name="${escapeHtml(klub)}">${escapeHtml(klub)}</span> <span style="font-size:0.75rem; color:var(--text-muted);">— ${sezonaNaziv}</span>`;
    document.getElementById("klubStatsGrid").innerHTML = `<div class="stat-item" style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">Nema podataka za ovaj klub u sezoni ${sezonaNaziv}.</div>`;
    return;
  }

  document.getElementById("klubIme").innerHTML = `${grbHtml(klub)} <span class="klikabilno" data-open="klub" data-name="${escapeHtml(klub)}">${escapeHtml(klub)}</span> <span style="font-size:0.75rem; color:var(--text-muted);">— ${sezonaNaziv}</span>`;
  const n = broj || 1;
  document.getElementById("klubStatsGrid").innerHTML = `
    <div class="stat-item"><div class="label">${IKONA_ZUTI} Žuti</div><div class="value yellow">${zuti}</div><div class="per-match">${(zuti/n).toFixed(2)} / utakmica</div></div>
    <div class="stat-item"><div class="label">${IKONA_CRVENI} Crveni</div><div class="value red">${crveni}</div><div class="per-match">${(crveni/n).toFixed(2)} / utakmica</div></div>
    <div class="stat-item"><div class="label"><i class="fas fa-futbol" style="color:var(--blue);"></i> Penal</div><div class="value penalty">${penal}</div><div class="per-match">${(penal/n).toFixed(2)} / utakmica</div></div>
    <div class="stat-item"><div class="label">${IKONA_VAR_PRIZNAT} VAR+</div><div class="value var">${vp}</div><div class="per-match">${(vp/n).toFixed(2)} / utakmica</div></div>
    <div class="stat-item"><div class="label">${IKONA_VAR_PONISTEN} VAR−</div><div class="value var">${vpo}</div><div class="per-match">${(vpo/n).toFixed(2)} / utakmica</div></div>
  `;

  const suciSort = Object.entries(poSudcu)
    .map(([ime, d]) => ({ ime, ...d, ukupno: d.zuti+d.crveni+d.penal+d.vp+d.vpo }))
    .sort((a, b) => b.ukupno - a.ukupno || a.ime.localeCompare(b.ime, "hr"));

  document.getElementById("klubSuciList").innerHTML = suciSort.map(s => {
    const pozStr = Object.entries(s.pozicije).map(([p, cnt]) => cnt > 1 ? `${p} ×${cnt}` : p).join(", ");
    return `
      <div class="modal-list-item" data-open="sudac" data-name="${escapeHtml(s.ime)}">
        <div class="item-name"><i class="fas fa-user-tie" style="color:var(--yellow);opacity:0.7;"></i> ${escapeHtml(s.ime)}<span class="item-role">${pozStr}</span></div>
        <div class="item-badges">
          <span class="item-badge" style="color:var(--blue);"><i class="fas fa-futbol"></i> ${s.utakmica}</span>
          ${s.zuti > 0 ? `<span class="item-badge">${IKONA_ZUTI} ${s.zuti}</span>` : ''}
          ${s.crveni > 0 ? `<span class="item-badge">${IKONA_CRVENI} ${s.crveni}</span>` : ''}
          ${s.penal > 0 ? `<span class="item-badge"><i class="fas fa-futbol" style="color:var(--blue);"></i> ${s.penal}</span>` : ''}
          ${s.vp > 0 ? `<span class="item-badge">${IKONA_VAR_PRIZNAT_BADGE} ${s.vp}</span>` : ''}
          ${s.vpo > 0 ? `<span class="item-badge">${IKONA_VAR_PONISTEN_BADGE} ${s.vpo}</span>` : ''}
          <span class="item-badge total">Ukupno: ${s.ukupno}</span>
        </div>
      </div>`;
  }).join('');
}

// ============================================================
// PRIKAZ KOLA
// ============================================================
function prikaziKolo(kolo) {
  const grid = document.getElementById("matchesGrid");
  const utakmiceKola = UTakmice.filter(u => num(u.Kolo) === kolo);
  if (utakmiceKola.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted); font-style:italic;">Nema utakmica za ovo kolo.</div>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  utakmiceKola.forEach(u => {
    const zD = num(u["Žuti D"]), zG = num(u["Žuti G"]);
    const cD = num(u["Crveni D"]), cG = num(u["Crveni G"]);
    const pD = num(u["Penal D"]), pG = num(u["Penal G"]);
    const vpD = num(u["VAR priznat D"]), vpG = num(u["VAR priznat G"]);
    const vpoD = num(u["VAR poništen D"]), vpoG = num(u["VAR poništen G"]);
    const vpUkupno = vpD + vpG;
    const vpoUkupno = vpoD + vpoG;
    const card = document.createElement("article");
    card.className = "match-card";
    const d = u["Domaćin"] || "";
    const g = u["Gost"] || "";
    card.innerHTML = `
      <div class="match-teams">
        <span class="team-btn" data-open="klub" data-name="${escapeHtml(d)}">${grbHtml(u["Domaćin"])} ${escapeHtml(u["Domaćin"])}</span>
        <span class="vs">vs</span>
        <span class="team-btn away" data-open="klub" data-name="${escapeHtml(g)}">${escapeHtml(u["Gost"])} ${grbHtml(u["Gost"])}</span>
      </div>
      <div class="match-meta">
        <div class="row"><i class="fas fa-user-tie icon-glavni"></i><span><span class="sudac-label">Glavni:</span> <span class="sudac-ime">${escapeHtml(u["Glavni sudac"])}</span></span></div>
        <div class="row"><i class="fas fa-flag icon-pomocni"></i><span><span class="sudac-label">Pomoćni:</span> <span class="sudac-ime">${escapeHtml(u["Pomoćni 1"])}, ${escapeHtml(u["Pomoćni 2"])}</span></span></div>
        <div class="row"><i class="fas fa-video icon-var"></i><span><span class="sudac-label">VAR:</span> <span class="sudac-ime">${escapeHtml(u["VAR"])}</span> <span class="sudac-label" style="margin-left:8px;">AVAR:</span> <span class="sudac-ime">${escapeHtml(u["AVAR"])}</span></span></div>
      </div>
      <div class="match-stats-row">
        <span class="match-stat-badge">${IKONA_ZUTI} ${zD+zG}</span>
        <span class="match-stat-badge">${IKONA_CRVENI} ${cD+cG}</span>
        <span class="match-stat-badge"><i class="fas fa-futbol" style="color:var(--blue);"></i> ${pD+pG}</span>
        ${vpUkupno > 0 ? `<span class="match-stat-badge">${IKONA_VAR_PRIZNAT_BADGE} ${vpUkupno}</span>` : ''}
        ${vpoUkupno > 0 ? `<span class="match-stat-badge">${IKONA_VAR_PONISTEN_BADGE} ${vpoUkupno}</span>` : ''}
      </div>
    `;
    fragment.appendChild(card);
  });
  grid.innerHTML = "";
  grid.appendChild(fragment);
}

// ============================================================
// IZRAČUN I TABLICA
// ============================================================
function izracunajKlubove() {
  kluboviCache = {};
  UTakmiceKompletne.forEach(u => {
    [["Domaćin","D"],["Gost","G"]].forEach(([key, suf]) => {
      const k = u[key];
      if (!k || !k.trim()) return;
      if (!kluboviCache[k]) kluboviCache[k] = {naziv:k, zuti:0, crveni:0, penal:0, vp:0, vpo:0};
      kluboviCache[k].zuti += num(u["Žuti "+suf]);
      kluboviCache[k].crveni += num(u["Crveni "+suf]);
      kluboviCache[k].penal += num(u["Penal "+suf]);
      kluboviCache[k].vp += num(u["VAR priznat "+suf]);
      kluboviCache[k].vpo += num(u["VAR poništen "+suf]);
    });
  });
}

function renderKlubTablicu() {
  const tb = document.querySelector("#klubTablica tbody");
  let arr = Object.values(kluboviCache);
  if (sortState.key) {
    const k = sortState.key;
    arr.sort((a, b) => (a[k] - b[k]) * sortState.dir);
  } else {
    arr.sort((a, b) => a.naziv.localeCompare(b.naziv, "hr"));
  }
  document.querySelectorAll("#klubTablica th.sortable").forEach(th => {
    const isActive = th.dataset.key === sortState.key;
    th.classList.toggle("active", isActive);
    const arrow = th.querySelector(".arrow");
    arrow.textContent = isActive ? (sortState.dir === 1 ? "▲" : "▼") : "▲▼";
  });
  const fragment = document.createDocumentFragment();
  arr.forEach(d => {
    const tr = document.createElement("tr");
    
    tr.innerHTML = `
      <td><span class="klub-badge" data-open="klub" data-name="${escapeHtml(d.naziv)}">${grbHtml(d.naziv)} ${escapeHtml(d.naziv)} <i class="fas fa-arrow-up-right-from-square"></i></span></td>
      <td style="color:var(--yellow); font-weight:700;">${d.zuti}</td>
      <td style="color:var(--red-soft); font-weight:700;">${d.crveni}</td>
      <td style="color:var(--blue); font-weight:600;">${d.penal}</td>
      <td style="color:var(--green); font-weight:600;">${d.vp}</td>
      <td style="color:var(--text-muted); font-weight:600;">${d.vpo}</td>
    `;
    fragment.appendChild(tr);
  });
  tb.innerHTML = "";
  tb.appendChild(fragment);
}

// ============================================================
// USPOREDBA
// ============================================================
function popuniUsporedbaComboboxove() {
  setupCombobox("usporedbaSudacACombobox", "usporedbaSudacA", "usporedbaSudacAList", sviSuci, (val) => azurirajUsporedbuSudaca(val, null));
  setupCombobox("usporedbaSudacBCombobox", "usporedbaSudacB", "usporedbaSudacBList", sviSuci, (val) => azurirajUsporedbuSudaca(null, val));
  setupCombobox("usporedbaKlubACombobox", "usporedbaKlubA", "usporedbaKlubAList", sviKlubovi, (val) => azurirajUsporedbuKlubova(val, null));
  setupCombobox("usporedbaKlubBCombobox", "usporedbaKlubB", "usporedbaKlubBList", sviKlubovi, (val) => azurirajUsporedbuKlubova(null, val));

  const selA = document.getElementById("usporedbaSudacASezona");
  const selB = document.getElementById("usporedbaSudacBSezona");
  const selKA = document.getElementById("usporedbaKlubASezona");
  const selKB = document.getElementById("usporedbaKlubBSezona");
  if (selA && !selA.dataset.listenerAdded) { selA.dataset.listenerAdded = "1"; selA.addEventListener("change", () => azurirajUsporedbuSudaca(null, null)); }
  if (selB && !selB.dataset.listenerAdded) { selB.dataset.listenerAdded = "1"; selB.addEventListener("change", () => azurirajUsporedbuSudaca(null, null)); }
  if (selKA && !selKA.dataset.listenerAdded) { selKA.dataset.listenerAdded = "1"; selKA.addEventListener("change", () => azurirajUsporedbuKlubova(null, null)); }
  if (selKB && !selKB.dataset.listenerAdded) { selKB.dataset.listenerAdded = "1"; selKB.addEventListener("change", () => azurirajUsporedbuKlubova(null, null)); }
}

async function izracunajStatSudacZaSezonu(ime, sezona) {
  if (!ime) return null;
  const utakmice = await ucitajSezonu(sezona);
  const kompletne = filtrirajKompletneKola(utakmice);
  let z=0, c=0, p=0, v1=0, v2=0, br=0;
  kompletne.forEach(u => {
    if (!ulogaSuca(u, ime)) return;
    br++;
    z += num(u["Žuti D"]) + num(u["Žuti G"]);
    c += num(u["Crveni D"]) + num(u["Crveni G"]);
    p += num(u["Penal D"]) + num(u["Penal G"]);
    v1 += num(u["VAR priznat D"]) + num(u["VAR priznat G"]);
    v2 += num(u["VAR poništen D"]) + num(u["VAR poništen G"]);
  });
  return { ime, br, z, c, p, v1, v2, ukupno: z+c+p+v1+v2, sezona };
}

async function izracunajStatKlubZaSezonu(ime, sezona) {
  if (!ime) return null;
  const utakmice = await ucitajSezonu(sezona);
  const kompletne = filtrirajKompletneKola(utakmice);
  let z=0, c=0, p=0, v1=0, v2=0, br=0;
  kompletne.forEach(u => {
    const jd = u["Domaćin"] === ime, jg = u["Gost"] === ime;
    if (!jd && !jg) return;
    br++;
    const suf = jd ? "D" : "G";
    z += num(u["Žuti "+suf]);
    c += num(u["Crveni "+suf]);
    p += num(u["Penal "+suf]);
    v1 += num(u["VAR priznat "+suf]);
    v2 += num(u["VAR poništen "+suf]);
  });
  return { ime, br, z, c, p, v1, v2, ukupno: z+c+p+v1+v2, sezona };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function napraviUsporedbaHTML(a, b, tip, sezonaA, sezonaB) {
  if (!a || !b) {
    return `<div class="usporedba-prazno"><i class="fas fa-users"></i>Odaberi dva ${tip === 'sudac' ? 'suca' : 'kluba'} za usporedbu</div>`;
  }
  const A = tip === 'sudac' ? await izracunajStatSudacZaSezonu(a, sezonaA) : await izracunajStatKlubZaSezonu(a, sezonaA);
  const B = tip === 'sudac' ? await izracunajStatSudacZaSezonu(b, sezonaB) : await izracunajStatKlubZaSezonu(b, sezonaB);
  if (!A || !B || (A.br === 0 && B.br === 0)) {
    return `<div class="usporedba-prazno"><i class="fas fa-exclamation-circle"></i>Nema dovoljno podataka.</div>`;
  }
  function klasa(va, vb) { if (va === vb) return ''; return va > vb ? 'pobjednik' : ''; }
  const pctA = A.br || 1, pctB = B.br || 1;
  function nazivSezone(id) {
    if (id === 'UKUPNO') return 'Sve sezone';
    const s = SEZONE.find(x => x.id === id);
    return s ? s.naziv : id;
  }
  return `
    <table class="usporedba-tablica">
      <thead><tr>
        <th class="usporedba-kategorija">Kategorija</th>
        <th class="usporedba-a">${escapeHtml(A.ime)}<br><small style="font-weight:400;opacity:0.7;">${nazivSezone(sezonaA)}</small></th>
        <th class="usporedba-b">${escapeHtml(B.ime)}<br><small style="font-weight:400;opacity:0.7;">${nazivSezone(sezonaB)}</small></th>
      </tr></thead>
      <tbody>
        <tr><td class="usporedba-kategorija">Ukupno odluka</td><td class="${klasa(A.ukupno, B.ukupno)}">${A.ukupno}</td><td class="${klasa(B.ukupno, A.ukupno)}">${B.ukupno}</td></tr>
        <tr><td class="usporedba-kategorija">Ukupno utakmica</td><td class="${klasa(A.br, B.br)}">${A.br}</td><td class="${klasa(B.br, A.br)}">${B.br}</td></tr>
        <tr><td class="usporedba-kategorija">Prosjek po utakmici</td><td class="${klasa(A.ukupno/pctA, B.ukupno/pctB)}">${(A.ukupno/pctA).toFixed(2)}</td><td class="${klasa(B.ukupno/pctB, A.ukupno/pctA)}">${(B.ukupno/pctB).toFixed(2)}</td></tr>
        <tr><td class="usporedba-kategorija">Žuti kartoni</td><td class="${klasa(A.z, B.z)}">${A.z}</td><td class="${klasa(B.z, A.z)}">${B.z}</td></tr>
        <tr><td class="usporedba-kategorija">Crveni kartoni</td><td class="${klasa(A.c, B.c)}">${A.c}</td><td class="${klasa(B.c, A.c)}">${B.c}</td></tr>
        <tr><td class="usporedba-kategorija">Penali</td><td class="${klasa(A.p, B.p)}">${A.p}</td><td class="${klasa(B.p, A.p)}">${B.p}</td></tr>
        <tr><td class="usporedba-kategorija">VAR priznati</td><td class="${klasa(A.v1, B.v1)}">${A.v1}</td><td class="${klasa(B.v1, A.v1)}">${B.v1}</td></tr>
        <tr><td class="usporedba-kategorija">VAR poništeni</td><td class="${klasa(A.v2, B.v2)}">${A.v2}</td><td class="${klasa(B.v2, A.v2)}">${B.v2}</td></tr>
      </tbody>
    </table>
  `;
}

async function azurirajUsporedbuSudaca(a, b) {
  const inputA = document.getElementById("usporedbaSudacA");
  const inputB = document.getElementById("usporedbaSudacB");
  const selA = document.getElementById("usporedbaSudacASezona");
  const selB = document.getElementById("usporedbaSudacBSezona");
  const valA = a !== null ? a : inputA.value.trim();
  const valB = b !== null ? b : inputB.value.trim();
  const sezonaA = selA ? selA.value : TRENUTNA_SEZONA;
  const sezonaB = selB ? selB.value : TRENUTNA_SEZONA;
  const rezultat = document.getElementById("usporedbaSudacRezultat");
  rezultat.innerHTML = `<div class="usporedba-prazno"><i class="fas fa-spinner fa-spin"></i></div>`;
  rezultat.innerHTML = await napraviUsporedbaHTML(valA, valB, 'sudac', sezonaA, sezonaB);
}

async function azurirajUsporedbuKlubova(a, b) {
  const inputA = document.getElementById("usporedbaKlubA");
  const inputB = document.getElementById("usporedbaKlubB");
  const selA = document.getElementById("usporedbaKlubASezona");
  const selB = document.getElementById("usporedbaKlubBSezona");
  const valA = a !== null ? a : inputA.value.trim();
  const valB = b !== null ? b : inputB.value.trim();
  const sezonaA = selA ? selA.value : TRENUTNA_SEZONA;
  const sezonaB = selB ? selB.value : TRENUTNA_SEZONA;
  const rezultat = document.getElementById("usporedbaKlubRezultat");
  rezultat.innerHTML = `<div class="usporedba-prazno"><i class="fas fa-spinner fa-spin"></i></div>`;
  rezultat.innerHTML = await napraviUsporedbaHTML(valA, valB, 'klub', sezonaA, sezonaB);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  document.getElementById("modalCopyBtn").addEventListener("click", kopirajLink);
  document.getElementById("modalCsvBtn").addEventListener("click", preuzmiCSV);
  document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target.id === "modalOverlay") closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
  document.getElementById("modalClose").addEventListener("click", closeModal);

  const mq = window.matchMedia('(prefers-color-scheme: light)');
  const mqHandler = e => {
    if (!localStorage.getItem(THEME_KEY)) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark');
      if (UTakmiceKompletne.length > 0) nacrtajZutiChart();
    }
  };
  if (mq.addEventListener) mq.addEventListener('change', mqHandler);
  else if (mq.addListener) mq.addListener(mqHandler);

  const params = new URLSearchParams(window.location.search);
  const sezonaIzURL = params.get('season');
  if (sezonaIzURL && SEZONE.find(s => s.id === sezonaIzURL)) {
    TRENUTNA_SEZONA = sezonaIzURL;
  }

  const seasonPicker = document.getElementById("seasonPicker");
  function osvjeziSeasonPicker() {
    if (!seasonPicker) return;
    seasonPicker.querySelectorAll(".menu-item").forEach(btn => {
      const aktivan = btn.dataset.season === TRENUTNA_SEZONA;
      btn.classList.toggle("active", aktivan);
      btn.setAttribute("aria-pressed", aktivan ? "true" : "false");
    });
  }
  if (seasonPicker) {
    seasonPicker.addEventListener("click", e => {
      const btn = e.target.closest(".menu-item");
      if (!btn || !btn.dataset.season) return;
      const nova = btn.dataset.season;
      if (nova === TRENUTNA_SEZONA) return;
      osvjeziSeasonPicker();
      promijeniSezonu(nova);
    });
    osvjeziSeasonPicker();
  }

  const selSudac = document.getElementById("sudacSezonaSelect");
  const selKlub = document.getElementById("klubSezonaSelect");
  if (selSudac) {
    selSudac.value = TRENUTNA_SEZONA;
    selSudac.addEventListener("change", () => {
      const ime = document.getElementById("sudacInput").value.trim();
      if (ime) prikaziSuca(ime);
    });
  }
  if (selKlub) {
    selKlub.value = TRENUTNA_SEZONA;
    selKlub.addEventListener("change", () => {
      const ime = document.getElementById("klubInput").value.trim();
      if (ime) prikaziKlub(ime);
    });
  }

  ucitajSveOdjednom();
});

// patch.js — učitati NAKON script.js: <script src="patch.js" defer></script>
// Nadjačava postojeće globalne funkcije; kasnije ih spojite u script.js.
(() => {
  const SEKCIJE = ['pregled', 'statistika', 'utakmice', 'usporedba'];
  const OPISI = {
    pregled: 'Statistika suđenja u SuperSport HNL-u: kartoni, penali i VAR odluke po sucu i klubu, ažurirano nakon svakog kola.',
    statistika: 'Detaljna statistika sudaca i klubova SuperSport HNL-a: žuti i crveni kartoni, penali, VAR i prosjeci po utakmici.',
    utakmice: 'Sve utakmice SuperSport HNL-a po kolima: sudac, kartoni, penali i VAR odluke za svaku utakmicu.',
    usporedba: 'Usporedite suce ili klubove SuperSport HNL-a: kartoni, penali i VAR odluke jedni uz druge.'
  };
  const NASLOVI = {
    pregled: 'Pošteno suđenje | Analiza sudaca, klubova i utakmica HNL-a',
    statistika: 'Statistika sudaca i klubova | Pošteno suđenje – HNL analiza',
    utakmice: 'Utakmice po kolima | Pošteno suđenje – HNL analiza',
    usporedba: 'Usporedba sudaca i klubova | Pošteno suđenje – HNL'
  };

  // 1) Sigurna tema (localStorage može baciti grešku u privatnom načinu)
  window.toggleTheme = function () {
    const nova = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nova;
    try { localStorage.setItem(THEME_KEY, nova); } catch (e) {}
    if (UTakmiceKompletne.length) nacrtajZutiChart();
  };

  // 2) Grb: escapeanje alt-a, bez inline onerror
  window.grbHtml = function (klub, size = '') {
    const url = getGrbUrl(klub), cls = size ? ' ' + size : '';
    return url
      ? `<img src="${escapeHtml(url)}" alt="Grb ${escapeHtml(klub)}" class="klub-grb${cls}" loading="lazy" decoding="async">`
      : `<span class="klub-grb fallback${cls}"><i class="fas fa-shield-alt" aria-hidden="true"></i></span>`;
  };
  document.addEventListener('error', e => {
    const img = e.target;
    if (img.tagName !== 'IMG' || !img.classList.contains('klub-grb')) return;
    const s = document.createElement('span');
    s.className = img.className + ' fallback';
    s.innerHTML = '<i class="fas fa-shield-alt" aria-hidden="true"></i>';
    img.replaceWith(s);
  }, true);

  // 3) Sekcije: rade i prije učitavanja podataka, podržavaju ?section= iz sitemapa
  function prikaziSekciju(id, azurirajURL = true) {
    if (!SEKCIJE.includes(id)) id = 'pregled';
    const prebaci = () => {
      document.querySelectorAll('#mainMenu .menu-item').forEach(m => {
        const a = m.dataset.section === id;
        m.classList.toggle('active', a);
        m.setAttribute('aria-current', a ? 'page' : 'false');
      });
      document.querySelectorAll('.section-panel').forEach(s => s.classList.toggle('active', s.id === 'section-' + id));
      document.body.dataset.section = id;
    };
    document.startViewTransition && azurirajURL ? document.startViewTransition(prebaci) : prebaci();
    document.title = NASLOVI[id];
    const url = location.origin + '/' + (id === 'pregled' ? '' : '?section=' + id);
    const postavi = (sel, v) => { const el = document.querySelector(sel); if (el) el.content = v; };
    postavi('meta[name=description]', OPISI[id]);
    postavi('meta[property="og:title"]', NASLOVI[id]);
    postavi('meta[property="og:description"]', OPISI[id]);
    postavi('meta[property="og:url"]', url);
    postavi('meta[name="twitter:title"]', NASLOVI[id]);
    postavi('meta[name="twitter:description"]', OPISI[id]);
    const u = new URL(location.href);
    id === 'pregled' ? u.searchParams.delete('section') : u.searchParams.set('section', id);
    if (azurirajURL) history.replaceState({}, '', u);
    const c = document.querySelector('link[rel=canonical]');
    if (c) c.href = location.origin + '/' + (id === 'pregled' ? '' : '?section=' + id);
  }
  window.prikaziSekciju = prikaziSekciju;

  // 4) Modal: fokus se vraća, tipkovnica radi na klikabilnim elementima
  let prijeModala = null;
  const _open = window.openModal, _close = window.closeModal;
  window.openModal = function () {
    prijeModala = document.activeElement;
    _open();
    document.getElementById('modalClose').focus();
  };
  window.closeModal = function () {
    _close();
    prijeModala?.focus?.();
  };

  const KLIK = '[data-open]';
  function oznaci(root) {
    root.querySelectorAll?.(KLIK).forEach(el => {
      if (el.hasAttribute('tabindex')) return;
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
    });
  }
  new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(n => n.nodeType === 1 && oznaci(n))))
    .observe(document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.(KLIK)) {
      e.preventDefault();
      e.target.click();
    }
  });

  // 5) Combobox ARIA
  document.querySelectorAll('.combobox').forEach(w => {
    const i = w.querySelector('input'), l = w.querySelector('.combobox-list');
    if (i && l) { i.setAttribute('role', 'combobox'); i.setAttribute('aria-controls', l.id); i.setAttribute('aria-autocomplete', 'list'); }
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#mainMenu .menu-item').forEach(b =>
      b.addEventListener('click', () => prikaziSekciju(b.dataset.section)));
    prikaziSekciju(new URLSearchParams(location.search).get('section') || 'pregled', false);
    oznaci(document.body);
  });
})();

// Delegirani klikovi (zamjena za inline onclick)
document.addEventListener('click', e => {
  const t = e.target.closest('[data-open]');
  if (!t) return;
  (t.dataset.open === 'sudac' ? prikaziModalSudac : prikaziModalKlub)(t.dataset.name);
});


// Prikaz vremena zadnjeg ažuriranja podataka
fetch('data/meta.json').then(r => r.ok ? r.json() : null).then(m => {
  const el = document.getElementById('zadnjeAzurirano');
  if (!m || !el) return;
  el.textContent = 'Podaci ažurirani: ' + new Date(m.updated).toLocaleString('hr-HR', { dateStyle: 'medium', timeStyle: 'short' });
  el.hidden = false;
}).catch(() => {});
