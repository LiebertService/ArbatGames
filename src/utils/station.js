// Чистые функции без зависимостей от Vue — покрыты тестами в test/station.test.js.

const CARD_PICTURES = 'https://files.drova.io/io.drova.web/images/products/card_pictures';

export const STATE_FREE = 'free';
export const STATE_BUSY = 'busy';
export const STATE_OTHER = 'other';

// LISTEN — ждёт игрока, BUSY — идёт сессия; остальное (HANDSHAKE и т.п.) — переходные.
export function stationState(rawState) {
  if (rawState === 'LISTEN') return STATE_FREE;
  if (rawState === 'BUSY') return STATE_BUSY;
  return STATE_OTHER;
}

// «🟦🟥 12 ARBAT RTX 4070 super» → 12; «☁️ FragPlay x04 ☁️13» → 13 (последнее число после ☁️).
export function stationNumber(name) {
  const text = String(name || '');
  const leading = text.match(/^[^\p{L}\d]*(\d+)\s/u);
  if (leading) return Number(leading[1]);
  const trailing = text.match(/(\d+)\s*$/);
  return trailing ? Number(trailing[1]) : null;
}

// Название без декоративных эмодзи по краям и лишних пробелов.
export function stationTitle(name) {
  return String(name || '')
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}️‍]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function productPicture(productId) {
  return productId ? `${CARD_PICTURES}/${productId}.jpg` : null;
}

export function formatRam(bytes) {
  if (!bytes) return null;
  return `${Math.round(bytes / 2 ** 30)} ГБ`;
}

export function summarizeHardware(hw) {
  if (!hw) return null;
  const gpu = (hw.graphic || []).find((g) => g && g.name) || null;
  const cpu = hw.processor && hw.processor.version ? hw.processor.version.replace(/\s+/g, ' ').trim() : null;
  return {
    cpu,
    gpu: gpu ? gpu.name.replace(/^NVIDIA\s+/i, '').trim() : null,
    gpuRam: gpu ? formatRam(gpu.ram_bytes) : null,
    ram: formatRam(hw.ram_bytes),
  };
}

export function compareStations(a, b) {
  const na = a.number == null ? Infinity : a.number;
  const nb = b.number == null ? Infinity : b.number;
  return na - nb || a.title.localeCompare(b.title);
}

export function normalizeStation(raw) {
  return {
    uuid: raw.uuid,
    name: raw.name,
    title: stationTitle(raw.name),
    number: stationNumber(raw.name),
    state: stationState(raw.state),
    rawState: raw.state,
    city: raw.city_name || null,
    productId: raw.product_id || null,
    productList: raw.product_list || [],
    freeTrial: (raw.groups_list || []).includes('Free trial volunteers'),
    description: raw.description || '',
  };
}

export function merchantStations(servers, merchantId) {
  return (servers || [])
    .filter((s) => s.user_id === merchantId)
    .map(normalizeStation)
    .sort(compareStations);
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const fromCodePoint = (code, raw) => (code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : raw);
// Декодируем именованные и числовые (&#x1f9ff; → 🧿) сущности; дальше текст снова экранируется.
const decodeText = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (raw, ent) => {
  if (ent[0] === '#') return fromCodePoint(ent[1].toLowerCase() === 'x' ? parseInt(ent.slice(2), 16) : Number(ent.slice(1)), raw);
  return NAMED[ent.toLowerCase()] ?? raw;
});

// Описание станции приходит HTML-ом от мерчанта. Оставляем только p/br/b/strong/i/em/a[href=http(s)],
// весь прочий текст экранируем — безопасно для v-html и для SSR (без DOM).
export function sanitizeDescription(html) {
  const src = String(html || '');
  const tagRe = /<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi;
  let out = '';
  let last = 0;
  let openLinks = 0;
  let m;
  while ((m = tagRe.exec(src))) {
    out += escapeHtml(decodeText(src.slice(last, m.index)));
    last = tagRe.lastIndex;
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    if (tag === 'br') out += '<br>';
    else if (['p', 'b', 'strong', 'i', 'em'].includes(tag)) out += closing ? `</${tag}>` : `<${tag}>`;
    else if (tag === 'a') {
      if (closing) {
        if (openLinks > 0) { out += '</a>'; openLinks -= 1; }
      } else {
        const href = (m[3].match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i) || []).slice(1).find(Boolean);
        if (href && /^https?:\/\//i.test(href.trim())) {
          out += `<a href="${escapeHtml(href.trim())}" target="_blank" rel="nofollow noopener noreferrer">`;
          openLinks += 1;
        }
      }
    }
  }
  out += escapeHtml(decodeText(src.slice(last)));
  out += '</a>'.repeat(openLinks);
  return out.replace(/(<br>\s*){3,}/g, '<br><br>').replace(/<p>\s*(<br>\s*)*<\/p>/g, '').trim();
}
