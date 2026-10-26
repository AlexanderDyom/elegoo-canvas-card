/*
 * Elegoo Canvas Card — Lovelace cards for the elegoo_printer integration
 * https://github.com/danielcherubini/elegoo-homeassistant
 *
 * Cards:
 *   custom:elegoo-canvas-card   — Canvas filament slots A1–A4
 *   custom:elegoo-printer-card  — printer status, camera, temps, controls
 *   custom:elegoo-combo-card    — printer + Canvas in one card
 */

const VERSION = "0.1.1";
const DOMAIN = "elegoo_printer";

// ---------------------------------------------------------------------------
// Entity map: key -> allowed domains + entity_id suffix candidates
// ---------------------------------------------------------------------------
const KEYS = {
  print_status: { d: ["sensor"], c: ["print_status"] },
  current_status: { d: ["sensor"], c: ["current_status"] },
  progress: { d: ["sensor"], c: ["percent_complete", "progress"] },
  remaining: { d: ["sensor"], c: ["remaining_print_time", "ticks_remaining", "time_remaining"] },
  current_layer: { d: ["sensor"], c: ["current_layer"] },
  total_layers: { d: ["sensor"], c: ["total_layers"] },
  current_z: { d: ["sensor"], c: ["current_z", "z_height"] },
  filename: { d: ["sensor"], c: ["file_name", "filename"] },
  nozzle_temp: { d: ["sensor"], c: ["nozzle_temperature", "nozzle_temp"] },
  bed_temp: { d: ["sensor"], c: ["bed_temperature", "bed_temp"] },
  box_temp: { d: ["sensor"], c: ["box_temp", "box_temperature", "enclosure_temperature"] },
  nozzle_target: { d: ["number", "sensor"], c: ["target_nozzle_temp", "target_nozzle_temperature", "nozzle_target_temperature"] },
  bed_target: { d: ["number", "sensor"], c: ["target_bed_temp", "target_bed_temperature", "bed_target_temperature"] },
  light: { d: ["light"], c: ["chamber_light", "second_light", "light"], any: true },
  fan: { d: ["fan"], c: ["model_fan", "fan"], any: true },
  pause: { d: ["button"], c: ["pause_print", "pause"] },
  resume: { d: ["button"], c: ["resume_print", "resume"] },
  stop: { d: ["button"], c: ["stop_print", "stop"] },
  print_tray: { d: ["select"], c: ["print_tray"] },
  active_tray: { d: ["sensor"], c: ["active_tray_id", "active_tray"] },
  canvas_connected: { d: ["binary_sensor"], c: ["canvas_connected", "ams_connected"] },
  camera: { d: ["camera"], c: ["chamber_camera", "camera"], any: true },
  thumbnail: { d: ["image"], c: ["cover_image", "thumbnail", "print_thumbnail"], any: true },
};
for (let n = 1; n <= 4; n++) {
  KEYS[`a${n}_color`] = { d: ["sensor"], c: [`a${n}_color`] };
  KEYS[`a${n}_name`] = { d: ["sensor"], c: [`a${n}_name`] };
  KEYS[`a${n}_type`] = { d: ["sensor"], c: [`a${n}_attributes`, `a${n}_type`] };
  KEYS[`a${n}_grams`] = { d: ["sensor"], c: [`a${n}_grams`] };
}

// Physical Canvas layout (as on the printer screen): left column A1 over A2,
// right column A4 over A3.
const GRID_ORDER = [0, 3, 1, 2];

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------
const I18N = {
  en: {
    canvas: "Canvas", feeding: "feeding", empty: "Empty", tray: "Tray", auto: "Auto",
    connected: "Connected", disconnected: "Not connected", ready: "Ready",
    nozzle: "Nozzle", bed: "Bed", box: "Chamber", layer: "Layer", left: "{t} left", eta: "ETA",
    idle_text: "Printer is idle", pause: "Pause", resume: "Resume", stop: "Stop",
    stop_confirm: "Stop the current print?", h: "h", m: "min", g: "g",
    no_device: "No Elegoo printer found. Pick a device in the card settings.",
    no_canvas: "No Canvas slots found for this device.",
    light: "Light", fan: "Fan",
    open_camera: "Open camera", back_to_model: "Back to model", fullscreen: "Fullscreen",
    status: {},
  },
  ru: {
    canvas: "Canvas", feeding: "подаётся", empty: "Пусто", tray: "Лоток", auto: "Авто",
    connected: "Подключён", disconnected: "Не подключён", ready: "Готов",
    nozzle: "Сопло", bed: "Стол", box: "Корпус", layer: "Слой", left: "ост. {t}", eta: "готово в",
    idle_text: "Принтер свободен", pause: "Пауза", resume: "Продолжить", stop: "Стоп",
    stop_confirm: "Остановить текущую печать?", h: "ч", m: "мин", g: "г",
    no_device: "Принтер Elegoo не найден. Выберите устройство в настройках карточки.",
    no_canvas: "Слоты Canvas для этого устройства не найдены.",
    light: "Свет", fan: "Вентилятор",
    open_camera: "Открыть камеру", back_to_model: "Назад к модели", fullscreen: "На весь экран",
    status: {
      idle: "Ожидание", printing: "Печать", paused: "Пауза", pausing: "Приостановка",
      stopping: "Остановка", stopped: "Остановлено", complete: "Завершено", homing: "Парковка",
      preheating: "Нагрев", leveling: "Калибровка стола", file_checking: "Проверка файла",
      loading: "Загрузка", auto_feeding: "Подача филамента", filament_unloading: "Выгрузка филамента",
      filament_unload_abnormal: "Ошибка выгрузки", filament_unload_paused: "Выгрузка на паузе",
      error: "Ошибка", resuming: "Возобновление", recovery: "Восстановление",
      printing_recovery: "Восстановление печати", resonance_testing: "Тест резонанса",
      print_started: "Старт печати", dropping: "Опускание", lifting: "Подъём",
      printers_checking: "Самопроверка", auto_leveling_completed: "Калибровка завершена",
      preheating_completed: "Нагрев завершён", homing_completed: "Парковка завершена",
      resonance_testing_completed: "Тест резонанса завершён", unrecognized: "Неизвестно",
      file_transferring: "Передача файла", exposure_testing: "Тест засветки",
      devices_testing: "Самопроверка", input_shaping: "Input shaping",
      loading_unloading: "Загрузка/выгрузка", pid_tuning: "PID-калибровка",
      unavailable: "Недоступен", unknown: "Неизвестно",
    },
  },
};

const lang = (hass) => {
  const l = (hass?.locale?.language || hass?.language || document.documentElement.lang || "en").slice(0, 2);
  return I18N[l] ? l : "en";
};

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
const ACTIVE = new Set([
  "printing", "print_started", "homing", "dropping", "lifting", "preheating", "leveling",
  "auto_feeding", "loading", "file_checking", "resuming", "printers_checking",
  "resonance_testing", "auto_leveling_completed", "preheating_completed", "homing_completed",
  "resonance_testing_completed", "recovery", "printing_recovery", "filament_unloading",
]);
const PAUSED = new Set(["pausing", "paused", "filament_unload_paused"]);
const ERROR = new Set(["error", "filament_unload_abnormal"]);

function statusCategory(s) {
  if (!s || s === "unavailable" || s === "unknown") return "off";
  if (ERROR.has(s)) return "error";
  if (PAUSED.has(s)) return "paused";
  if (s === "complete") return "complete";
  if (ACTIVE.has(s)) return "active";
  return "idle";
}

function statusLabel(t, s) {
  if (!s) return "—";
  if (t.status[s]) return t.status[s];
  const txt = s.replace(/_/g, " ");
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------
const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const isBad = (s) => s == null || s === "unknown" || s === "unavailable" || s === "" || s === "None";

function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function normColor(v) {
  if (isBad(v)) return null;
  let s = String(v).trim();
  if (/^rgb/i.test(s)) return s;
  s = s.replace(/^#/, "").replace(/^0x/i, "");
  if (/^[0-9a-f]{3}$/i.test(s)) s = s.split("").map((c) => c + c).join("");
  if (/^[0-9a-f]{8}$/i.test(s)) s = s.slice(0, 6);
  return /^[0-9a-f]{6}$/i.test(s) ? `#${s.toUpperCase()}` : null;
}

function luminance(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return 0.5;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toMinutes(stateObj) {
  if (!stateObj || isBad(stateObj.state)) return null;
  const v = num(stateObj.state);
  if (v == null) return null;
  const u = (stateObj.attributes?.unit_of_measurement || "min").toLowerCase();
  if (u === "ms") return v / 60000;
  if (u === "s") return v / 60;
  if (u === "h") return v * 60;
  if (u === "d") return v * 1440;
  return v;
}

function fmtDuration(t, mins) {
  if (mins == null) return "";
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  return h ? `${h} ${t.h} ${m % 60} ${t.m}` : `${m} ${t.m}`;
}

function fmtEta(hass, mins) {
  if (mins == null || mins <= 0) return "";
  const d = new Date(Date.now() + mins * 60000);
  try {
    return d.toLocaleTimeString(hass?.locale?.language || undefined, { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
}

// ---------------------------------------------------------------------------
// Entity resolution
// ---------------------------------------------------------------------------
function findDevice(hass) {
  const ents = hass.entities || {};
  for (const e of Object.values(ents)) {
    if (e.platform === DOMAIN && e.device_id) return e.device_id;
  }
  return null;
}

function matchEntity(ids, def) {
  for (const c of def.c) {
    for (const id of ids) {
      const [dom, obj] = id.split(".");
      if (def.d.includes(dom) && (obj === c || obj.endsWith(`_${c}`))) return id;
    }
  }
  if (def.any) return ids.find((id) => def.d.includes(id.split(".")[0])) || null;
  return null;
}

function resolveEntities(hass, config) {
  const ents = hass.entities || {};
  let deviceId = config.device || null;
  let ids = [];
  if (config.prefix) {
    const p = `${config.prefix}_`;
    ids = Object.keys(hass.states).filter((id) => id.split(".")[1].startsWith(p));
  } else {
    if (!deviceId) deviceId = findDevice(hass);
    if (deviceId) ids = Object.values(ents).filter((e) => e.device_id === deviceId).map((e) => e.entity_id);
  }
  ids.sort();
  const map = {};
  for (const [key, def] of Object.entries(KEYS)) {
    map[key] = config.entities?.[key] || matchEntity(ids, def);
  }
  const dev = deviceId && hass.devices?.[deviceId];
  const name = dev?.name_by_user || dev?.name || (config.prefix ? config.prefix.replace(/_/g, " ") : "Elegoo");
  return { deviceId, map, name, model: dev?.model || "" };
}

// ---------------------------------------------------------------------------
// Spool SVG
// ---------------------------------------------------------------------------
function spoolSvg(color, { active = false, empty = false, spinning = false } = {}) {
  if (empty) {
    return `<svg viewBox="0 0 100 100" class="spool empty" aria-hidden="true">
      <circle cx="50" cy="50" r="44" class="flange"/>
      <circle cx="50" cy="50" r="34" class="void"/>
      <circle cx="50" cy="50" r="10" class="hub"/>
    </svg>`;
  }
  const dark = luminance(color) < 0.25;
  const tick = dark ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.7)";
  const ticks = [0, 90, 180, 270]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      const p = (k) => (50 + Math.cos(r) * k).toFixed(1) + "," + (50 + Math.sin(r) * k).toFixed(1);
      const [x1, y1] = p(19).split(",");
      const [x2, y2] = p(28).split(",");
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tick}" stroke-width="3" stroke-linecap="round"/>`;
    })
    .join("");
  return `<svg viewBox="0 0 100 100" class="spool${active ? " active" : ""}" aria-hidden="true">
    ${active ? '<circle cx="50" cy="50" r="48" class="ring"/>' : ""}
    <circle cx="50" cy="50" r="44" class="flange"/>
    <circle cx="50" cy="50" r="34" fill="${esc(color)}"/>
    <g class="${spinning ? "spin" : ""}">${ticks}</g>
    <circle cx="50" cy="50" r="10" class="hub"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------
const STYLES = `
  :host { --ecc-accent: var(--primary-color, #03a9f4); --ecc-tile: var(--secondary-background-color, rgba(127,127,127,.12));
          --ecc-ok: var(--success-color, #4caf50); --ecc-warn: var(--warning-color, #ff9800);
          --ecc-err: var(--error-color, #f44336); --ecc-info: var(--info-color, #039be5);
          --ecc-flange: #cfcfcf; --ecc-hub: #2f2f2f; }
  ha-card { padding: 14px 16px; box-sizing: border-box; height: 100%; overflow: hidden; }
  .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
  .title { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .title ha-icon { --mdc-icon-size: 20px; color: var(--ecc-accent); flex: none; }
  .name { font-weight: 500; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .model { color: var(--secondary-text-color); font-size: 12px; white-space: nowrap; }
  .pill { font-size: 11px; padding: 2px 9px; border-radius: 10px; white-space: nowrap; flex: none;
          background: color-mix(in srgb, var(--pc) 22%, transparent); color: var(--pc); }
  .pill.active { --pc: var(--ecc-ok); } .pill.paused { --pc: var(--ecc-warn); } .pill.error { --pc: var(--ecc-err); }
  .pill.complete { --pc: var(--ecc-info); } .pill.idle, .pill.off { --pc: var(--secondary-text-color); }
  .pill.feed { --pc: var(--ecc-accent); }
  .foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;
          margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--divider-color, rgba(127,127,127,.25)); }
  .btns { display: flex; gap: 6px; flex-wrap: wrap; margin-left: auto; }
  button.b { display: inline-flex; align-items: center; gap: 4px; border: none; cursor: pointer; font: inherit; font-size: 12px;
             background: var(--ecc-tile); color: var(--primary-text-color); border-radius: 8px; padding: 6px 10px; }
  button.b ha-icon { --mdc-icon-size: 16px; }
  button.b.on { background: color-mix(in srgb, var(--ecc-accent) 25%, transparent); color: var(--ecc-accent); }
  button.b.danger { color: var(--ecc-err); }
  button.b:hover { filter: brightness(1.15); }
  .tray { display: inline-flex; align-items: center; gap: 6px; background: var(--ecc-tile); border-radius: 8px; padding: 2px 4px 2px 10px; font-size: 12px; }
  .tray ha-icon { --mdc-icon-size: 16px; color: var(--secondary-text-color); }
  .tray select { background: transparent; border: none; color: var(--primary-text-color); font: inherit; padding: 4px; cursor: pointer; }
  .tray select option { background: var(--card-background-color, #1c1c1c); }
  .warn { color: var(--secondary-text-color); font-size: 13px; padding: 8px 0; }

  .slots { display: grid; gap: 14px 6px; padding: 4px 0; }
  .slots.grid { grid-template-columns: 1fr 1fr; }
  .slots.row { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
  .slot { display: flex; flex-direction: column; align-items: center; gap: 1px; cursor: pointer; min-width: 0; text-align: center; }
  .sw { position: relative; width: var(--sz, 92px); }
  .badge { position: absolute; top: -2px; left: -4px; font-size: 11px; line-height: 16px; padding: 0 6px; border-radius: 8px;
           background: var(--ecc-tile); color: var(--secondary-text-color); }
  .slot.active .badge { background: var(--ecc-accent); color: var(--text-primary-color, #fff); }
  .spool { width: 100%; height: auto; display: block; }
  .spool .flange { fill: var(--ecc-flange); }
  .spool .hub { fill: var(--ecc-hub); }
  .spool .ring { fill: none; stroke: var(--ecc-accent); stroke-width: 3; }
  .spool.empty .flange { fill: none; stroke: var(--secondary-text-color); stroke-width: 2; stroke-dasharray: 5 4; opacity: .6; }
  .spool.empty .void { fill: var(--ecc-tile); }
  .spool.empty .hub { fill: var(--secondary-text-color); opacity: .4; }
  .spin { transform-origin: 50px 50px; animation: spin 6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .arrow { height: 10px; font-size: 10px; line-height: 10px; color: var(--ecc-accent); visibility: hidden; }
  .slot.active .arrow { visibility: visible; }
  .type { font-weight: 500; font-size: 14px; color: var(--secondary-text-color); }
  .slot.active .type { color: var(--primary-text-color); }
  .sub { font-size: 11px; color: var(--secondary-text-color); opacity: .8; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .slots.row .type { font-size: 13px; }

  .media { border-radius: 10px; background: var(--ecc-tile); overflow: hidden; position: relative; cursor: pointer;
           display: flex; align-items: center; justify-content: center; aspect-ratio: 4 / 3; }
  .media img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .media.thumb img { object-fit: contain; }
  .media > ha-icon { --mdc-icon-size: 32px; color: var(--secondary-text-color); opacity: .5; }
  .media { cursor: default; }
  .media.clickable { cursor: pointer; }
  .mtools { position: absolute; right: 6px; bottom: 6px; display: flex; gap: 6px; }
  .mb { width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer; padding: 0;
        display: inline-flex; align-items: center; justify-content: center; background: rgba(0,0,0,.55); color: #fff; }
  .mb ha-icon { --mdc-icon-size: 18px; }
  .mb:hover { background: rgba(0,0,0,.75); }
  .live { position: absolute; left: 6px; top: 6px; font-size: 10px; font-weight: 500; letter-spacing: .5px; color: #fff;
          background: var(--ecc-err); border-radius: 4px; padding: 1px 5px; }
  .media:fullscreen { background: #000; border-radius: 0; aspect-ratio: auto; }
  .media:fullscreen img { object-fit: contain; }
  .media:fullscreen .mb { width: 44px; height: 44px; }
  .media:fullscreen .mtools { right: 16px; bottom: 16px; }
  .main { display: grid; grid-template-columns: minmax(110px, 38%) 1fr; gap: 12px; align-items: center; }
  .main.nomedia { grid-template-columns: 1fr; }
  .pct { font-size: 26px; font-weight: 500; line-height: 1.1; }
  .prow { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
  .muted { color: var(--secondary-text-color); font-size: 12px; }
  .ell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar { height: 6px; border-radius: 3px; background: var(--ecc-tile); overflow: hidden; margin: 6px 0; }
  .bar > div { height: 100%; background: var(--bc, var(--ecc-ok)); border-radius: 3px; transition: width .6s; }
  .temps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
  .tile { background: var(--ecc-tile); border-radius: 8px; padding: 6px 10px; cursor: pointer; min-width: 0; }
  .tile .l { font-size: 11px; color: var(--secondary-text-color); display: flex; align-items: center; gap: 4px; }
  .tile .l ha-icon { --mdc-icon-size: 14px; }
  .tile .v { font-size: 14px; white-space: nowrap; }
  .mini-temps { display: flex; gap: 12px; color: var(--secondary-text-color); font-size: 12px; }
  .mini-temps span { display: inline-flex; align-items: center; gap: 2px; cursor: pointer; }
  .mini-temps ha-icon { --mdc-icon-size: 14px; }
`;

// ---------------------------------------------------------------------------
// Base card
// ---------------------------------------------------------------------------
class ElegooBaseCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this._res = null;
    this._sig = null;
    if (this._hass) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  _update() {
    const hass = this._hass;
    if (!hass || !this._config) return;
    if (!this._res || this._resEntities !== hass.entities || this._resDevices !== hass.devices) {
      this._res = resolveEntities(hass, this._config);
      this._resEntities = hass.entities;
      this._resDevices = hass.devices;
      this._sig = null;
    }
    // Re-render only when one of our entities changed (state objects are replaced on change).
    const sig = Object.values(this._res.map).map((id) => (id ? hass.states[id] : undefined));
    sig.push(lang(hass));
    if (this._sig && sig.length === this._sig.length && sig.every((s, i) => s === this._sig[i])) return;
    // Re-rendering would detach the fullscreen camera; catch up once fullscreen ends.
    if ((document.fullscreenElement || document.webkitFullscreenElement) === this) {
      this._pending = true;
      return;
    }
    this._sig = sig;
    this._render();
  }

  connectedCallback() {
    this._onFs = () => {
      if (this._pending && !(document.fullscreenElement || document.webkitFullscreenElement)) {
        this._pending = false;
        this._sig = null;
        this._update();
      }
    };
    document.addEventListener("fullscreenchange", this._onFs);
    document.addEventListener("webkitfullscreenchange", this._onFs);
  }

  disconnectedCallback() {
    document.removeEventListener("fullscreenchange", this._onFs);
    document.removeEventListener("webkitfullscreenchange", this._onFs);
    this._dropCamera();
  }

  // --- data access ---
  _st(key) {
    const id = this._res?.map[key];
    return id ? this._hass.states[id] : undefined;
  }
  _val(key) {
    const s = this._st(key);
    return s && !isBad(s.state) ? s.state : null;
  }
  _num(key) {
    return num(this._val(key));
  }

  _status() {
    const ps = this._val("print_status")?.toLowerCase() || null;
    const cs = this._val("current_status")?.toLowerCase() || null;
    let s = ps;
    if ((!s || s === "idle") && cs && cs !== "idle") s = cs;
    if (!s) {
      const raw = this._st("print_status")?.state;
      s = raw === "unavailable" ? "unavailable" : cs || null;
    }
    return { s, cat: statusCategory(s) };
  }

  _activeSlot() {
    const v = this._val("active_tray");
    if (v == null) return null;
    const str = String(v).trim();
    const m = /^[Aa]?(\d+)$/.exec(str);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    const idx = /^[Aa]/.test(str) ? n - 1 : n; // tray ids are 0-based (A1 = 0)
    return idx >= 0 && idx < 4 ? idx : null;
  }

  _slots() {
    const out = [];
    for (let i = 0; i < 4; i++) {
      const n = i + 1;
      const typeSt = this._st(`a${n}_type`);
      const attrs = typeSt?.attributes || {};
      const color = normColor(this._val(`a${n}_color`)) || normColor(attrs.color) || normColor(attrs.filament_color);
      const type = this._val(`a${n}_type`);
      let name = this._val(`a${n}_name`);
      if (name && normColor(name)) name = null;
      const grams = this._num(`a${n}_grams`);
      const exists = !!(this._res.map[`a${n}_color`] || this._res.map[`a${n}_type`]);
      const empty = !color && !type;
      out.push({
        i, id: `A${n}`, color: color || "#9E9E9E", type, name, brand: attrs.brand || null, grams, empty, exists,
        entity: this._res.map[`a${n}_type`] || this._res.map[`a${n}_color`],
      });
    }
    return out;
  }

  _hasCanvas() {
    return [1, 2, 3, 4].some((n) => this._res.map[`a${n}_color`] || this._res.map[`a${n}_type`]);
  }

  // --- actions ---
  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
  }
  _call(domain, service, data) {
    this._hass.callService(domain, service, data);
  }

  _bind(root) {
    root.querySelectorAll("[data-more]").forEach((el) =>
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._moreInfo(el.dataset.more);
      })
    );
    root.querySelectorAll("[data-act]").forEach((el) =>
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._action(el.dataset.act);
      })
    );
    const sel = root.querySelector("select[data-tray]");
    if (sel) {
      sel.addEventListener("click", (ev) => ev.stopPropagation());
      sel.addEventListener("change", () =>
        this._call("select", "select_option", { entity_id: this._res.map.print_tray, option: sel.value })
      );
    }
  }

  _action(act) {
    const t = I18N[lang(this._hass)];
    const m = this._res.map;
    if (act === "pause" && m.pause) this._call("button", "press", { entity_id: m.pause });
    if (act === "resume" && m.resume) this._call("button", "press", { entity_id: m.resume });
    if (act === "stop" && m.stop && window.confirm(t.stop_confirm)) this._call("button", "press", { entity_id: m.stop });
    if (act === "light" && m.light) this._call("light", "toggle", { entity_id: m.light });
    if (act === "fan" && m.fan) this._call("fan", "toggle", { entity_id: m.fan });
  }

  // --- render fragments ---
  _slotsHtml(layout, size, compact) {
    const t = I18N[lang(this._hass)];
    const slots = this._slots();
    const active = this._activeSlot();
    const spinning = this._status().cat === "active";
    const order = layout === "row" ? [0, 1, 2, 3] : GRID_ORDER;
    const showDetails = this._config.show_details !== false;
    const cells = order
      .map((i) => {
        const s = slots[i];
        const isActive = active === i && !s.empty;
        const sub = [];
        if (showDetails && !s.empty) {
          if (compact) {
            if (s.grams) sub.push(`${s.grams < 10 ? s.grams.toFixed(1) : Math.round(s.grams)} ${t.g}`);
          } else {
            const label = [s.brand, s.name].filter(Boolean).join(" · ") || s.color;
            sub.push(label);
            if (s.grams) sub.push(`${s.grams < 10 ? s.grams.toFixed(1) : Math.round(s.grams)} ${t.g}`);
          }
        }
        return `<div class="slot${isActive ? " active" : ""}" ${s.entity ? `data-more="${esc(s.entity)}"` : ""} title="${esc(
          [s.id, s.type, s.name, s.color].filter(Boolean).join(" · ")
        )}">
          <div class="sw" style="--sz:${size}px">
            <span class="badge">${s.id}</span>
            ${spoolSvg(s.color, { active: isActive, empty: s.empty, spinning: isActive && spinning })}
          </div>
          <div class="arrow">▼</div>
          <div class="type">${esc(s.empty ? t.empty : s.type || "—")}</div>
          ${sub.map((x) => `<div class="sub">${esc(x)}</div>`).join("")}
        </div>`;
      })
      .join("");
    return `<div class="slots ${layout === "row" ? "row" : "grid"}">${cells}</div>`;
  }

  _trayHtml() {
    const t = I18N[lang(this._hass)];
    const st = this._st("print_tray");
    if (!st || this._config.show_tray_select === false) return "";
    const opts = st.attributes?.options || ["Automatic", "A1", "A2", "A3", "A4"];
    return `<label class="tray"><ha-icon icon="mdi:swap-horizontal"></ha-icon>${t.tray}:
      <select data-tray ${st.state === "unavailable" ? "disabled" : ""}>
        ${opts
          .map(
            (o) => `<option value="${esc(o)}" ${o === st.state ? "selected" : ""}>${esc(
              o.toLowerCase() === "automatic" ? t.auto : o
            )}</option>`
          )
          .join("")}
      </select></label>`;
  }

  _controlsHtml({ labels = true } = {}) {
    const t = I18N[lang(this._hass)];
    const { cat } = this._status();
    const m = this._res.map;
    const out = [];
    const light = this._st("light");
    if (light && this._config.show_light !== false) {
      out.push(`<button class="b${light.state === "on" ? " on" : ""}" data-act="light" title="${t.light}">
        <ha-icon icon="${light.state === "on" ? "mdi:lightbulb-on" : "mdi:lightbulb-outline"}"></ha-icon></button>`);
    }
    const fan = this._st("fan");
    if (fan && this._config.show_fan !== false) {
      const pct = num(fan.attributes?.percentage);
      out.push(`<button class="b${fan.state === "on" ? " on" : ""}" data-act="fan" title="${t.fan}">
        <ha-icon icon="mdi:fan"></ha-icon>${fan.state === "on" && pct != null ? `${Math.round(pct)}%` : ""}</button>`);
    }
    if (this._config.show_controls !== false) {
      if (cat === "active" && m.pause)
        out.push(`<button class="b" data-act="pause"><ha-icon icon="mdi:pause"></ha-icon>${labels ? t.pause : ""}</button>`);
      if (cat === "paused" && m.resume)
        out.push(`<button class="b" data-act="resume"><ha-icon icon="mdi:play"></ha-icon>${labels ? t.resume : ""}</button>`);
      if ((cat === "active" || cat === "paused") && m.stop)
        out.push(`<button class="b danger" data-act="stop"><ha-icon icon="mdi:stop"></ha-icon>${labels ? t.stop : ""}</button>`);
    }
    return out.length ? `<div class="btns">${out.join("")}</div>` : "";
  }

  _tempVal(cur, tgt) {
    const c = this._num(cur);
    const g = this._num(tgt);
    if (c == null) return "—";
    return g != null && g > 0 ? `${Math.round(c)} / ${Math.round(g)}°` : `${Math.round(c)}°`;
  }

  _tempsHtml(mini) {
    const t = I18N[lang(this._hass)];
    const m = this._res.map;
    const items = [
      ["mdi:printer-3d-nozzle-heat", t.nozzle, this._tempVal("nozzle_temp", "nozzle_target"), m.nozzle_target || m.nozzle_temp, m.nozzle_temp],
      ["mdi:radiator", t.bed, this._tempVal("bed_temp", "bed_target"), m.bed_target || m.bed_temp, m.bed_temp],
      ["mdi:thermometer", t.box, this._tempVal("box_temp"), m.box_temp, m.box_temp],
    ].filter((x) => x[4]);
    if (!items.length) return "";
    if (mini)
      return `<div class="mini-temps">${items
        .map(([ic, l, v, e]) => `<span data-more="${esc(e)}" title="${esc(l)}"><ha-icon icon="${ic}"></ha-icon>${esc(v)}</span>`)
        .join("")}</div>`;
    return `<div class="temps">${items
      .map(
        ([ic, l, v, e]) =>
          `<div class="tile" data-more="${esc(e)}"><div class="l"><ha-icon icon="${ic}"></ha-icon>${esc(l)}</div><div class="v">${esc(v)}</div></div>`
      )
      .join("")}</div>`;
  }

  _progressHtml() {
    const t = I18N[lang(this._hass)];
    const { cat } = this._status();
    const pct = this._num("progress");
    const working = cat === "active" || cat === "paused" || cat === "error";
    const file = this._val("filename");
    if (!working && cat !== "complete") {
      return `<div class="muted">${t.idle_text}</div>${file ? `<div class="muted ell" title="${esc(file)}">${esc(file)}</div>` : ""}`;
    }
    const p = cat === "complete" ? 100 : pct ?? 0;
    const mins = working ? toMinutes(this._st("remaining")) : null;
    const left = mins != null ? t.left.replace("{t}", fmtDuration(t, mins)) : "";
    const eta = mins != null && cat === "active" ? ` · ${t.eta} ${fmtEta(this._hass, mins)}` : "";
    const cl = this._num("current_layer");
    const tl = this._num("total_layers");
    const z = this._num("current_z");
    const info = [];
    if (cl != null && tl) info.push(`${t.layer} ${Math.round(cl)} / ${Math.round(tl)}`);
    if (z != null && working) info.push(`Z ${z.toFixed(2)}`);
    const color = cat === "paused" ? "var(--ecc-warn)" : cat === "error" ? "var(--ecc-err)" : cat === "complete" ? "var(--ecc-info)" : "var(--ecc-ok)";
    return `<div class="prow"><span class="pct">${Math.round(p)}%</span><span class="muted">${esc(left + eta)}</span></div>
      <div class="bar" style="--bc:${color}"><div style="width:${Math.max(0, Math.min(100, p))}%"></div></div>
      ${file ? `<div class="muted ell" title="${esc(file)}">${esc(file)}</div>` : ""}
      ${info.length ? `<div class="muted">${esc(info.join(" · "))}</div>` : ""}`;
  }

  _mediaHtml() {
    const mode = this._config.camera || "auto";
    if (mode === "none") return "";
    return `<div class="media" data-media></div>`;
  }

  _mediaSources() {
    const cam = this._st("camera");
    const img = this._st("thumbnail");
    const camSrc =
      cam && cam.state !== "unavailable" && cam.attributes?.access_token
        ? `/api/camera_proxy_stream/${cam.entity_id}?token=${cam.attributes.access_token}`
        : null;
    const imgSrc = img && img.state !== "unavailable" && img.attributes?.entity_picture ? img.attributes.entity_picture : null;
    return { camSrc, imgSrc, camId: cam?.entity_id };
  }

  // Which view the media box shows: the print thumbnail (default) or the live camera.
  _mediaView(camSrc, imgSrc) {
    const mode = this._config.camera || "auto";
    let view = this._view || (mode === "camera" ? "camera" : "thumb");
    if (view === "camera" && !camSrc) view = "thumb";
    if (view === "thumb" && !imgSrc && camSrc) view = "camera";
    return view;
  }

  _img(key, src) {
    this._imgs = this._imgs || {};
    const cur = this._imgs[key];
    if (cur && cur.dataset.src === src) return cur;
    if (cur) cur.src = ""; // abort the old stream
    const el = document.createElement("img");
    el.alt = "";
    el.dataset.src = src;
    el.src = src;
    this._imgs[key] = el;
    return el;
  }

  _dropCamera() {
    const cam = this._imgs?.camera;
    if (cam) {
      cam.src = "";
      delete this._imgs.camera;
    }
  }

  // Image elements are kept between renders so the MJPEG stream isn't restarted.
  _attachMedia(root) {
    const box = root.querySelector("[data-media]");
    if (!box) return;
    const t = I18N[lang(this._hass)];
    const { camSrc, imgSrc } = this._mediaSources();
    const view = this._mediaView(camSrc, imgSrc);
    const src = view === "camera" ? camSrc : imgSrc;
    if (!src) {
      box.innerHTML = `<ha-icon icon="mdi:printer-3d"></ha-icon>`;
      return;
    }
    box.classList.toggle("thumb", view === "thumb");
    box.appendChild(this._img(view, src));
    const tools = document.createElement("div");
    tools.className = "mtools";
    if (view === "thumb" && camSrc) {
      box.classList.add("clickable");
      box.title = t.open_camera;
      tools.innerHTML = `<button class="mb" data-m="camera" title="${t.open_camera}"><ha-icon icon="mdi:cctv"></ha-icon></button>`;
    } else if (view === "camera") {
      tools.innerHTML =
        (imgSrc ? `<button class="mb" data-m="thumb" title="${t.back_to_model}"><ha-icon icon="mdi:arrow-left"></ha-icon></button>` : "") +
        `<button class="mb" data-m="full" title="${t.fullscreen}"><ha-icon icon="mdi:fullscreen"></ha-icon></button>`;
      box.insertAdjacentHTML("beforeend", `<span class="live">LIVE</span>`);
    }
    box.appendChild(tools);
    box.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-m]");
      ev.stopPropagation();
      const act = b ? b.dataset.m : view === "thumb" && camSrc ? "camera" : null;
      if (act === "camera" || act === "thumb") {
        this._view = act;
        if (act === "thumb") this._dropCamera();
        this._render();
      } else if (act === "full") {
        this._fullscreen(box);
      }
    });
  }

  _fullscreen(el) {
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else if (req) {
      // Some webviews (e.g. companion apps) ignore or reject the request — fall back to HA's camera dialog.
      let done = false;
      const fallback = () => {
        if (done) return;
        done = true;
        if (!(document.fullscreenElement || document.webkitFullscreenElement)) this._moreInfo(this._res.map.camera);
      };
      const p = req.call(el);
      if (p && p.then) p.then(() => (done = true), fallback);
      setTimeout(fallback, 1000);
    } else {
      this._moreInfo(this._res.map.camera); // iOS: no element fullscreen, use HA dialog
    }
  }

  _commit(html) {
    const root = this.shadowRoot;
    root.innerHTML = `<style>${STYLES}</style><ha-card>${html}</ha-card>`;
    this._attachMedia(root);
    this._bind(root);
  }

  _noDevice() {
    const t = I18N[lang(this._hass)];
    return !this._res.deviceId && !this._config.prefix && !this._config.entities ? `<div class="warn">${t.no_device}</div>` : null;
  }

  _statusPill() {
    const t = I18N[lang(this._hass)];
    const { s, cat } = this._status();
    return `<span class="pill ${cat}" ${this._res.map.print_status ? `data-more="${esc(this._res.map.print_status)}"` : ""}>${esc(
      statusLabel(t, s)
    )}</span>`;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 3 };
  }
}

// ---------------------------------------------------------------------------
// Shared editor schema
// ---------------------------------------------------------------------------
const LABELS = {
  en: {
    device: "Printer", title: "Title", layout: "Spool layout", show_details: "Show filament details",
    show_tray_select: "Show tray selector", camera: "Image", show_controls: "Show print controls",
    show_light: "Show light button", show_fan: "Show fan button", show_temps: "Show temperatures",
  },
  ru: {
    device: "Принтер", title: "Заголовок", layout: "Расположение катушек", show_details: "Показывать детали филамента",
    show_tray_select: "Показывать выбор лотка", camera: "Изображение", show_controls: "Кнопки управления печатью",
    show_light: "Кнопка света", show_fan: "Кнопка вентилятора", show_temps: "Температуры",
  },
};
const editorLabel = (s) => {
  const l = (document.documentElement.lang || "en").slice(0, 2);
  return (LABELS[l] || LABELS.en)[s.name] || s.name;
};
const DEVICE_FIELD = { name: "device", selector: { device: { filter: { integration: DOMAIN } } } };
const TITLE_FIELD = { name: "title", selector: { text: {} } };
const LAYOUT_FIELD = {
  name: "layout",
  selector: { select: { mode: "dropdown", options: [{ value: "grid", label: "2 × 2 (Canvas)" }, { value: "row", label: "1 × 4" }] } },
};
const CAMERA_FIELD = {
  name: "camera",
  selector: {
    select: {
      mode: "dropdown",
      options: [
        { value: "auto", label: "Auto" },
        { value: "camera", label: "Camera" },
        { value: "thumbnail", label: "Thumbnail" },
        { value: "none", label: "None" },
      ],
    },
  },
};
const bool = (name) => ({ name, selector: { boolean: {} } });

function stubDevice(hass) {
  const d = hass && findDevice(hass);
  return d ? { device: d } : {};
}

// ---------------------------------------------------------------------------
// Canvas card
// ---------------------------------------------------------------------------
class ElegooCanvasCard extends ElegooBaseCard {
  static getStubConfig(hass) {
    return stubDevice(hass);
  }
  static getConfigForm() {
    return {
      schema: [
        DEVICE_FIELD,
        TITLE_FIELD,
        LAYOUT_FIELD,
        { type: "grid", name: "", schema: [bool("show_details"), bool("show_tray_select")] },
      ],
      computeLabel: editorLabel,
    };
  }
  getCardSize() {
    return this._config?.layout === "row" ? 3 : 5;
  }
  getGridOptions() {
    return this._config?.layout === "row" ? { columns: 12, min_columns: 6 } : { columns: 6, min_columns: 4 };
  }

  _render() {
    const t = I18N[lang(this._hass)];
    const nd = this._noDevice();
    if (nd) return this._commit(nd);
    const active = this._activeSlot();
    const conn = this._st("canvas_connected");
    let pill;
    if (active != null) pill = `<span class="pill feed">A${active + 1} ${t.feeding}</span>`;
    else if (conn && conn.state === "off") pill = `<span class="pill off">${t.disconnected}</span>`;
    else pill = `<span class="pill idle">${t.ready}</span>`;
    const title = this._config.title ?? t.canvas;
    const body = this._hasCanvas()
      ? this._slotsHtml(this._config.layout || "grid", this._config.layout === "row" ? 72 : 92, false)
      : `<div class="warn">${t.no_canvas}</div>`;
    const tray = this._trayHtml();
    this._commit(`
      <div class="head">
        <div class="title"><ha-icon icon="mdi:printer-3d-nozzle"></ha-icon><span class="name">${esc(title)}</span>
          <span class="model">${esc(this._res.name)}</span></div>
        ${pill}
      </div>
      ${body}
      ${tray ? `<div class="foot">${tray}</div>` : ""}
    `);
  }
}

// ---------------------------------------------------------------------------
// Printer card
// ---------------------------------------------------------------------------
class ElegooPrinterCard extends ElegooBaseCard {
  static getStubConfig(hass) {
    return stubDevice(hass);
  }
  static getConfigForm() {
    return {
      schema: [
        DEVICE_FIELD,
        TITLE_FIELD,
        CAMERA_FIELD,
        {
          type: "grid",
          name: "",
          schema: [bool("show_temps"), bool("show_controls"), bool("show_light"), bool("show_fan")],
        },
      ],
      computeLabel: editorLabel,
    };
  }
  getCardSize() {
    return 5;
  }

  _render() {
    const nd = this._noDevice();
    if (nd) return this._commit(nd);
    const title = this._config.title || this._res.name;
    const media = this._mediaHtml();
    const controls = this._controlsHtml();
    this._commit(`
      <div class="head">
        <div class="title"><ha-icon icon="mdi:printer-3d"></ha-icon><span class="name">${esc(title)}</span></div>
        ${this._statusPill()}
      </div>
      <div class="main${media ? "" : " nomedia"}">${media}<div>${this._progressHtml()}</div></div>
      ${this._config.show_temps !== false ? this._tempsHtml(false) : ""}
      ${controls ? `<div class="foot">${controls}</div>` : ""}
    `);
  }
}

// ---------------------------------------------------------------------------
// Combo card (printer + Canvas)
// ---------------------------------------------------------------------------
class ElegooComboCard extends ElegooBaseCard {
  static getStubConfig(hass) {
    return stubDevice(hass);
  }
  static getConfigForm() {
    return {
      schema: [
        DEVICE_FIELD,
        TITLE_FIELD,
        CAMERA_FIELD,
        LAYOUT_FIELD,
        {
          type: "grid",
          name: "",
          schema: [
            bool("show_temps"), bool("show_controls"), bool("show_light"),
            bool("show_fan"), bool("show_details"), bool("show_tray_select"),
          ],
        },
      ],
      computeLabel: editorLabel,
    };
  }
  getCardSize() {
    return 6;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _render() {
    const nd = this._noDevice();
    if (nd) return this._commit(nd);
    const title = this._config.title || this._res.name;
    const media = this._mediaHtml();
    const layout = this._config.layout || "row";
    const slots = this._hasCanvas() ? this._slotsHtml(layout, layout === "row" ? 58 : 76, layout === "row") : "";
    const tray = this._trayHtml();
    const controls = this._controlsHtml({ labels: false });
    this._commit(`
      <div class="head">
        <div class="title"><ha-icon icon="mdi:printer-3d"></ha-icon><span class="name">${esc(title)}</span>${this._statusPill()}</div>
        ${this._config.show_temps !== false ? this._tempsHtml(true) : ""}
      </div>
      <div class="main${media ? "" : " nomedia"}">
        ${media}
        <div>${this._progressHtml()}${slots ? `<div style="margin-top:10px">${slots}</div>` : ""}</div>
      </div>
      ${tray || controls ? `<div class="foot">${tray}${controls}</div>` : ""}
    `);
  }
}

customElements.define("elegoo-canvas-card", ElegooCanvasCard);
customElements.define("elegoo-printer-card", ElegooPrinterCard);
customElements.define("elegoo-combo-card", ElegooComboCard);

window.customCards = window.customCards || [];
window.customCards.push(
  { type: "elegoo-canvas-card", name: "Elegoo Canvas", description: "Filament slots A1–A4 of the Elegoo Canvas", preview: true },
  { type: "elegoo-printer-card", name: "Elegoo Printer", description: "Elegoo printer status, camera and controls", preview: true },
  { type: "elegoo-combo-card", name: "Elegoo Printer + Canvas", description: "Printer and Canvas in a single card", preview: true }
);

console.info(`%c ELEGOO-CANVAS-CARD %c v${VERSION} `, "background:#03a9f4;color:#fff;font-weight:600", "background:#333;color:#fff");
