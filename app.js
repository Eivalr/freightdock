// ── NAVIGATION ─────────────────────────────────────────────
const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('.nav-item[data-page], .tool-btn[data-page]');
const breadcrumb = document.getElementById('breadcrumb');

const pageNames = {
  dashboard: 'Dashboard',
  loader: '3D Loader',
  rates: 'Rate Finder',
  converter: 'Unit Converter',
  library: 'Library',
  docai: 'Doc AI',
  crm: 'CRM',
  holidays: 'World Holidays',
  settings: 'Settings'
};

function navigate(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  navItems.forEach(n => n.classList.remove('active'));

  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item[data-page="' + pageId + '"]')
    .forEach(n => n.classList.add('active'));

  if (breadcrumb) breadcrumb.textContent = pageNames[pageId] || pageId;
  window.scrollTo(0, 0);
}

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.getAttribute('data-page');
    if (page) navigate(page);
  });
});

// ── SIDEBAR COLLAPSE ───────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOpenBtn = document.getElementById('sidebarOpenBtn');

function collapseSidebar() {
  sidebar.classList.add('collapsed');
  if (sidebarOpenBtn) sidebarOpenBtn.style.display = 'flex';
}

function expandSidebar() {
  sidebar.classList.remove('collapsed');
  if (sidebarOpenBtn) sidebarOpenBtn.style.display = 'none';
}

if (sidebarToggle) sidebarToggle.addEventListener('click', () => {
  if (sidebar.classList.contains('collapsed')) {
    expandSidebar();
  } else {
    collapseSidebar();
  }
});

if (sidebarOpenBtn) sidebarOpenBtn.addEventListener('click', expandSidebar);

// ── THEME ──────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('fd-theme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('themeBtnLabel');
  if (btn) btn.textContent = isDark ? 'Light mode' : 'Dark mode';
}

const savedTheme = localStorage.getItem('fd-theme') || 'light';
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  const btn = document.getElementById('themeBtnLabel');
  if (btn) btn.textContent = savedTheme === 'dark' ? 'Dark mode' : 'Light mode';
}

document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

// ── DATE ───────────────────────────────────────────────────
const dateEl = document.getElementById('currentDate');
if (dateEl) {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ── UNIT CONVERTER ─────────────────────────────────────────
const converterConfigs = {
  weight: {
    units: ['kg', 'lbs', 'MT', 'LT', 'ST'],
    factors: { kg: 1, lbs: 0.453592, MT: 1000, LT: 1016.05, ST: 907.185 },
    label: 'Weight'
  },
  volume: {
    units: ['m³', 'ft³', 'L', 'gal (US)', 'bbl'],
    factors: { 'm³': 1, 'ft³': 0.0283168, L: 0.001, 'gal (US)': 0.00378541, bbl: 0.158987 },
    label: 'Volume'
  },
  length: {
    units: ['m', 'cm', 'mm', 'ft', 'in'],
    factors: { m: 1, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254 },
    label: 'Length'
  },
  cbm: {
    units: ['CBM', 'RT (1CBM)', 'RT (1000kg)'],
    factors: { CBM: 1, 'RT (1CBM)': 1, 'RT (1000kg)': 1 },
    label: 'CBM / Revenue Ton',
    custom: true
  },
  temp: {
    units: ['°C', '°F', 'K'],
    factors: {},
    label: 'Temperature',
    custom: true
  }
};

const convTabs = document.querySelectorAll('.conv-tab');
let activeConv = 'weight';

function buildConverter(type) {
  const body = document.getElementById('converterBody');
  if (!body) return;
  const cfg = converterConfigs[type];

  if (type === 'cbm') {
    body.innerHTML = `
      <div class="conv-row">
        <div class="conv-group">
          <span class="conv-label">Length (cm)</span>
          <div class="conv-input-wrap">
            <input class="conv-input" id="cbm-l" type="number" value="120" placeholder="0">
          </div>
        </div>
        <div class="conv-arrow">×</div>
        <div class="conv-group">
          <span class="conv-label">Width (cm)</span>
          <div class="conv-input-wrap">
            <input class="conv-input" id="cbm-w" type="number" value="100" placeholder="0">
          </div>
        </div>
      </div>
      <div class="conv-row">
        <div class="conv-group">
          <span class="conv-label">Height (cm)</span>
          <div class="conv-input-wrap">
            <input class="conv-input" id="cbm-h" type="number" value="100" placeholder="0">
          </div>
        </div>
        <div class="conv-arrow">×</div>
        <div class="conv-group">
          <span class="conv-label">Qty</span>
          <div class="conv-input-wrap">
            <input class="conv-input" id="cbm-q" type="number" value="1" placeholder="1">
          </div>
        </div>
      </div>
      <div class="conv-row">
        <div class="conv-group">
          <span class="conv-label">Gross Weight (kg)</span>
          <div class="conv-input-wrap">
            <input class="conv-input" id="cbm-kg" type="number" value="500" placeholder="0">
          </div>
        </div>
        <div class="conv-arrow"></div>
        <div class="conv-group">
          <span class="conv-label">&nbsp;</span>
          <div style="height:44px;"></div>
        </div>
      </div>
      <div class="conv-formula" id="cbm-result">—</div>
    `;
    const update = () => {
      const l = parseFloat(document.getElementById('cbm-l').value) || 0;
      const w = parseFloat(document.getElementById('cbm-w').value) || 0;
      const h = parseFloat(document.getElementById('cbm-h').value) || 0;
      const q = parseFloat(document.getElementById('cbm-q').value) || 1;
      const kg = parseFloat(document.getElementById('cbm-kg').value) || 0;
      const cbm = (l * w * h / 1000000) * q;
      const wt_ton = kg / 1000;
      const rt = Math.max(cbm, wt_ton);
      const chargeable = rt.toFixed(4);
      document.getElementById('cbm-result').textContent =
        `CBM: ${cbm.toFixed(4)} m³   |   Weight Ton: ${wt_ton.toFixed(4)} MT   |   Chargeable (RT): ${chargeable}`;
    };
    body.querySelectorAll('input').forEach(i => i.addEventListener('input', update));
    update();
    return;
  }

  if (type === 'temp') {
    body.innerHTML = `
      <div class="conv-row">
        <div class="conv-group">
          <span class="conv-label">From</span>
          <div class="conv-input-wrap">
            <input class="conv-input" id="temp-from" type="number" value="20" placeholder="0">
            <select class="conv-unit-select" id="temp-from-unit">
              <option>°C</option><option>°F</option><option>K</option>
            </select>
          </div>
        </div>
        <div class="conv-arrow">→</div>
        <div class="conv-group">
          <span class="conv-label">Result</span>
          <div class="conv-input-wrap">
            <input class="conv-input" id="temp-to" type="text" readonly placeholder="—" style="color:var(--accent-2)">
            <select class="conv-unit-select" id="temp-to-unit">
              <option>°F</option><option>°C</option><option>K</option>
            </select>
          </div>
        </div>
      </div>
      <div class="conv-formula" id="temp-formula">—</div>
    `;
    const update = () => {
      const val = parseFloat(document.getElementById('temp-from').value);
      const from = document.getElementById('temp-from-unit').value;
      const to = document.getElementById('temp-to-unit').value;
      let celsius;
      if (from === '°C') celsius = val;
      else if (from === '°F') celsius = (val - 32) * 5/9;
      else celsius = val - 273.15;
      let result;
      if (to === '°C') result = celsius;
      else if (to === '°F') result = celsius * 9/5 + 32;
      else result = celsius + 273.15;
      document.getElementById('temp-to').value = isNaN(result) ? '—' : result.toFixed(2);
      document.getElementById('temp-formula').textContent =
        isNaN(val) ? '—' : `${val} ${from} = ${result.toFixed(4)} ${to}`;
    };
    body.querySelectorAll('input,select').forEach(i => i.addEventListener('change', update));
    body.querySelectorAll('input').forEach(i => i.addEventListener('input', update));
    update();
    return;
  }

  const units = cfg.units;
  body.innerHTML = `
    <div class="conv-row">
      <div class="conv-group">
        <span class="conv-label">From</span>
        <div class="conv-input-wrap">
          <input class="conv-input" id="conv-from" type="number" value="1" placeholder="0">
          <select class="conv-unit-select" id="conv-from-unit">
            ${units.map(u => `<option>${u}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="conv-arrow">→</div>
      <div class="conv-group">
        <span class="conv-label">Result</span>
        <div class="conv-input-wrap">
          <input class="conv-input" id="conv-to" type="text" readonly placeholder="—" style="color:var(--accent-2)">
          <select class="conv-unit-select" id="conv-to-unit">
            ${units.map((u, i) => `<option${i===1?' selected':''}>${u}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
    <div class="conv-formula" id="conv-formula">—</div>
  `;
  const update = () => {
    const val = parseFloat(document.getElementById('conv-from').value);
    const fromUnit = document.getElementById('conv-from-unit').value;
    const toUnit = document.getElementById('conv-to-unit').value;
    const base = val * cfg.factors[fromUnit];
    const result = base / cfg.factors[toUnit];
    document.getElementById('conv-to').value = isNaN(result) ? '—' : result.toFixed(6).replace(/\.?0+$/, '');
    document.getElementById('conv-formula').textContent =
      isNaN(val) ? '—' : `1 ${fromUnit} = ${(cfg.factors[fromUnit] / cfg.factors[toUnit]).toFixed(6).replace(/\.?0+$/, '')} ${toUnit}`;
  };
  body.querySelectorAll('input,select').forEach(i => {
    i.addEventListener('input', update);
    i.addEventListener('change', update);
  });
  update();
}

convTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    convTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeConv = tab.getAttribute('data-conv');
    buildConverter(activeConv);
  });
});

// ── DOC AI ─────────────────────────────────────────────────
function handleDocUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  showDocResult(file);
}

const dropZone = document.getElementById('docDropZone');
if (dropZone) {
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) showDocResult(file);
  });
}

function showDocResult(file) {
  document.getElementById('docDropZone').style.display = 'none';
  const result = document.getElementById('docaiResult');
  result.style.display = 'block';
  document.getElementById('docFileName').textContent = file.name;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result.split(',')[1];
    const mediaType = file.type || 'application/octet-stream';
    await analyzeDocWithClaude(base64, mediaType, file.name);
  };
  reader.readAsDataURL(file);
}

async function analyzeDocWithClaude(base64Data, mediaType, filename) {
  const resultBody = document.getElementById('docResultBody');
  resultBody.innerHTML = `
    <div class="ai-thinking">
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <span>Analyzing ${filename}...</span>
    </div>`;

  try {
    const isImage = mediaType.startsWith('image/');
    const isPdf = mediaType === 'application/pdf';

    let contentBlock;
    if (isImage) {
      contentBlock = {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64Data }
      };
    } else if (isPdf) {
      contentBlock = {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64Data }
      };
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or image.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a freight document analyst. Analyze the freight document and return ONLY a JSON object with NO markdown, NO backticks, NO explanation text. Structure exactly:
{
  "docType": "Bill of Lading|Commercial Invoice|Packing List|Air Waybill|CMR|Certificate of Origin|Other",
  "shipper": "...",
  "consignee": "...",
  "origin": "...",
  "destination": "...",
  "commodity": "...",
  "weight": "...",
  "volume": "...",
  "pieces": "...",
  "references": {"bl":"...","booking":"...","invoice":"..."},
  "flags": ["list any issues, missing fields, discrepancies, or risks"],
  "summary": "2-3 sentence plain English summary of this document"
}
Use "—" for any field not found. Be precise and concise.`,
        messages: [
          {
            role: 'user',
            content: [
              contentBlock,
              { type: 'text', text: 'Analyze this freight document.' }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.content?.map(c => c.text || '').join('').trim();

    let parsed;
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new Error('Could not parse AI response. Raw: ' + text.substring(0, 200));
    }

    renderDocResult(parsed);
  } catch (err) {
    resultBody.innerHTML = `
      <div class="ai-response">
        <div class="ai-section" style="border-color:var(--red)">
          <div class="ai-field">
            <span class="ai-field-key">Error</span>
            <span class="ai-field-val" style="color:var(--red)">${err.message}</span>
          </div>
        </div>
      </div>`;
  }
}

function renderDocResult(data) {
  const resultBody = document.getElementById('docResultBody');
  const flags = data.flags || [];
  const flagsHtml = flags.length
    ? flags.map(f => `<div class="ai-field"><span class="ai-field-key ai-flag">⚠ Flag</span><span class="ai-field-val ai-flag">${f}</span></div>`).join('')
    : `<div class="ai-field"><span class="ai-field-key ai-flag-ok">✓ Clear</span><span class="ai-field-val ai-flag-ok">No issues detected</span></div>`;

  resultBody.innerHTML = `
    <div class="ai-response">
      <h4>Document Type</h4>
      <div class="ai-section">
        <div class="ai-field">
          <span class="ai-field-key">Type</span>
          <span class="ai-field-val">${data.docType || '—'}</span>
        </div>
        <div class="ai-field">
          <span class="ai-field-key">Summary</span>
          <span class="ai-field-val">${data.summary || '—'}</span>
        </div>
      </div>
      <h4>Parties & Route</h4>
      <div class="ai-section">
        <div class="ai-field"><span class="ai-field-key">Shipper</span><span class="ai-field-val">${data.shipper || '—'}</span></div>
        <div class="ai-field"><span class="ai-field-key">Consignee</span><span class="ai-field-val">${data.consignee || '—'}</span></div>
        <div class="ai-field"><span class="ai-field-key">Origin</span><span class="ai-field-val">${data.origin || '—'}</span></div>
        <div class="ai-field"><span class="ai-field-key">Destination</span><span class="ai-field-val">${data.destination || '—'}</span></div>
      </div>
      <h4>Cargo Details</h4>
      <div class="ai-section">
        <div class="ai-field"><span class="ai-field-key">Commodity</span><span class="ai-field-val">${data.commodity || '—'}</span></div>
        <div class="ai-field"><span class="ai-field-key">Weight</span><span class="ai-field-val">${data.weight || '—'}</span></div>
        <div class="ai-field"><span class="ai-field-key">Volume</span><span class="ai-field-val">${data.volume || '—'}</span></div>
        <div class="ai-field"><span class="ai-field-key">Pieces</span><span class="ai-field-val">${data.pieces || '—'}</span></div>
      </div>
      <h4>References</h4>
      <div class="ai-section">
        <div class="ai-field"><span class="ai-field-key">BL / AWB</span><span class="ai-field-val">${data.references?.bl || '—'}</span></div>
        <div class="ai-field"><span class="ai-field-key">Booking</span><span class="ai-field-val">${data.references?.booking || '—'}</span></div>
        <div class="ai-field"><span class="ai-field-key">Invoice</span><span class="ai-field-val">${data.references?.invoice || '—'}</span></div>
      </div>
      <h4>Flags & Warnings</h4>
      <div class="ai-section">${flagsHtml}</div>
    </div>`;
}

function resetDocAI() {
  document.getElementById('docDropZone').style.display = 'flex';
  document.getElementById('docaiResult').style.display = 'none';
  document.getElementById('docFileInput').value = '';
}

// ── INIT ───────────────────────────────────────────────────
buildConverter('weight');
navigate('dashboard');

// ── TRACKER ────────────────────────────────────────────────
let trackType = 'container';
let selectedCarrier = null;

function setTrackType(type) {
  trackType = type;
  document.getElementById('typeBtnCont').classList.toggle('active', type === 'container');
  document.getElementById('typeBtnBL').classList.toggle('active', type === 'bl');
  const hint = document.getElementById('trackerHint');
  if (type === 'bl') {
    hint.textContent = 'Enter your B/L number and select the carrier below.';
  } else {
    hint.textContent = 'Carrier is detected automatically from container prefix. For B/L numbers, select carrier below.';
  }
  trackerOnInput();
}

function trackerOnInput() {
  const val = document.getElementById('trackerInput').value.trim();
  const clearBtn = document.getElementById('trackerClear');
  const detectedEl = document.getElementById('trackerDetected');
  const detectedName = document.getElementById('trackerDetectedName');

  clearBtn.style.display = val ? 'block' : 'none';

  if (trackType === 'container' && val.length >= 4) {
    const carrier = detectCarrier(val);
    if (carrier) {
      detectedEl.style.display = 'flex';
      detectedName.textContent = carrier.name + ' ✓';
      selectedCarrier = carrier;
    } else {
      detectedEl.style.display = 'none';
      selectedCarrier = null;
    }
  } else {
    detectedEl.style.display = 'none';
  }
}

function trackerClearInput() {
  document.getElementById('trackerInput').value = '';
  document.getElementById('trackerClear').style.display = 'none';
  document.getElementById('trackerDetected').style.display = 'none';
  selectedCarrier = null;
}

function trackerSearch() {
  const val = document.getElementById('trackerInput').value.trim().toUpperCase();
  if (!val) {
    document.getElementById('trackerInput').focus();
    return;
  }

  let carrier = selectedCarrier;

  if (trackType === 'container') {
    carrier = detectCarrier(val) || carrier;
    if (!carrier) {
      alert('Could not detect carrier from container prefix. Please select a carrier from the grid below, or switch to B/L mode.');
      return;
    }
    const url = carrier.containerUrl.replace('{ID}', val);
    openTracking(url, val, carrier.name, 'Container');
  } else {
    if (!carrier) {
      alert('Please select a carrier from the grid below for B/L tracking.');
      return;
    }
    const url = carrier.blUrl.replace('{ID}', val);
    openTracking(url, val, carrier.name, 'B/L');
  }
}

function openTracking(url, ref, carrierName, type) {
  saveRecentSearch(ref, carrierName, type);
  window.open(url, '_blank', 'noopener');
  renderRecentSearches();
}

function saveRecentSearch(ref, carrier, type) {
  const recent = JSON.parse(localStorage.getItem('fd-tracker-recent') || '[]');
  const entry = { ref, carrier, type, ts: Date.now() };
  const filtered = recent.filter(r => r.ref !== ref);
  filtered.unshift(entry);
  localStorage.setItem('fd-tracker-recent', JSON.stringify(filtered.slice(0, 10)));
}

function renderRecentSearches() {
  const recent = JSON.parse(localStorage.getItem('fd-tracker-recent') || '[]');
  const container = document.getElementById('trackerRecent');
  const list = document.getElementById('recentList');
  if (!recent.length) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  list.innerHTML = recent.map(r => `
    <div class="recent-item" onclick="reTrack('${r.ref}','${r.carrier}','${r.type}')">
      <span class="recent-ref">${r.ref}</span>
      <div class="recent-meta">
        <span class="recent-carrier">${r.carrier}</span>
        <span class="recent-type">${r.type}</span>
        <span class="recent-open">Track ↗</span>
      </div>
    </div>`).join('');
}

function reTrack(ref, carrierName, type) {
  const carrier = window.CARRIERS.find(c => c.name === carrierName);
  if (!carrier) return;
  const url = type === 'B/L' ? carrier.blUrl.replace('{ID}', ref) : carrier.containerUrl.replace('{ID}', ref);
  window.open(url, '_blank', 'noopener');
}

function clearRecentSearches() {
  localStorage.removeItem('fd-tracker-recent');
  renderRecentSearches();
}

function buildCarrierGrid() {
  const grid = document.getElementById('carrierGrid');
  if (!grid || !window.CARRIERS) return;
  grid.innerHTML = window.CARRIERS.map(c => `
    <div class="carrier-card" id="carrier-${c.code}" onclick="selectCarrier('${c.code}')">
      <div class="carrier-avatar" style="background:${c.color}">${c.logo}</div>
      <span class="carrier-name">${c.name}</span>
      <span class="carrier-track-btn">Select</span>
    </div>`).join('');
}

function selectCarrier(code) {
  selectedCarrier = window.CARRIERS.find(c => c.code === code);
  document.querySelectorAll('.carrier-card').forEach(el => el.classList.remove('selected'));
  document.getElementById('carrier-' + code)?.classList.add('selected');

  if (trackType === 'container') {
    const val = document.getElementById('trackerInput').value.trim();
    if (val) {
      const url = selectedCarrier.containerUrl.replace('{ID}', val.toUpperCase());
      openTracking(url, val.toUpperCase(), selectedCarrier.name, 'Container');
    }
  }
}

document.querySelectorAll('.nav-item[data-page="tracker"], .tool-btn[data-page="tracker"]').forEach(el => {
  el.addEventListener('click', () => {
    setTimeout(() => {
      buildCarrierGrid();
      renderRecentSearches();
    }, 50);
  });
});

if (document.getElementById('page-tracker')?.classList.contains('active')) {
  buildCarrierGrid();
  renderRecentSearches();
}
