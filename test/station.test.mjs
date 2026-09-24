import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  stationNumber, stationTitle, stationState, summarizeHardware, merchantStations, sanitizeDescription,
} from '../src/utils/station.js';

test('stationNumber: ведущий номер ARBAT и хвостовой номер FragPlay', () => {
  assert.equal(stationNumber('🟦🟥 12 ARBAT RTX 4070 super'), 12);
  assert.equal(stationNumber('🟦🟥  16 ARBAT RTX 4070'), 16);
  assert.equal(stationNumber('☁️ FragPlay x04 ☁️13'), 13);
  assert.equal(stationNumber('FragPlay 1x1  ☁️26'), 26);
  assert.equal(stationNumber('Без номера'), null);
});

test('stationTitle убирает эмодзи и лишние пробелы', () => {
  assert.equal(stationTitle('🟦🟥 14 ARBAT RTX 4070 ⚡️'), '14 ARBAT RTX 4070');
  assert.equal(stationTitle('☁️ FragPlay x04 ☁️13'), 'FragPlay x04 13');
});

test('stationState', () => {
  assert.equal(stationState('LISTEN'), 'free');
  assert.equal(stationState('BUSY'), 'busy');
  assert.equal(stationState('HANDSHAKE'), 'other');
});

test('summarizeHardware', () => {
  const hw = {
    ram_bytes: 34278469632,
    processor: { version: 'AMD Ryzen 5 5600X 6-Core Processor             ' },
    graphic: [{ manufacturer: 'NVIDIA', ram_bytes: 12878610432, name: 'NVIDIA GeForce RTX 4070' }],
  };
  assert.deepEqual(summarizeHardware(hw), {
    cpu: 'AMD Ryzen 5 5600X 6-Core Processor', gpu: 'GeForce RTX 4070', gpuRam: '12 ГБ', ram: '32 ГБ',
  });
  assert.equal(summarizeHardware(null), null);
});

test('merchantStations фильтрует по мерчанту и сортирует по номеру', () => {
  const list = merchantStations([
    { uuid: 'a', user_id: 'm', name: '🟦🟥 21 ARBAT', state: 'BUSY' },
    { uuid: 'b', user_id: 'other', name: '1 Чужая', state: 'LISTEN' },
    { uuid: 'c', user_id: 'm', name: '🟦🟥 12 ARBAT', state: 'LISTEN', groups_list: ['Free trial volunteers'] },
  ], 'm');
  assert.deepEqual(list.map((s) => s.uuid), ['c', 'a']);
  assert.equal(list[0].freeTrial, true);
});

test('sanitizeDescription оставляет ссылки и абзацы, режет опасное', () => {
  const html = '<p>Акция <a href="https://t.me/ArbatGames" rel="nofollow">тг</a></p>'
    + '<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">x</a> 1 &lt; 2';
  const out = sanitizeDescription(html);
  assert.match(out, /<p>Акция <a href="https:\/\/t\.me\/ArbatGames" target="_blank" rel="nofollow noopener noreferrer">тг<\/a><\/p>/);
  assert.doesNotMatch(out, /<script|<img|javascript:|onerror/);
  assert.match(out, /alert\(1\)/); // текст остаётся текстом
  assert.match(out, /1 &lt; 2/);
});

test('sanitizeDescription экранирует незакрытый тег и закрывает висящие ссылки', () => {
  assert.equal(sanitizeDescription('a <img src=x onerror=alert(1)'), 'a &lt;img src=x onerror=alert(1)');
  assert.equal(sanitizeDescription('<a href="https://x.y">x'), '<a href="https://x.y" target="_blank" rel="nofollow noopener noreferrer">x</a>');
});

test('sanitizeDescription декодирует числовые сущности, но не пропускает теги через них', () => {
  assert.equal(sanitizeDescription('&#x1f9ff; Акция &#128293;'), '🧿 Акция 🔥');
  assert.equal(sanitizeDescription('&#60;script&#62;x'), '&lt;script&gt;x');
  assert.equal(sanitizeDescription('&unknown; &#0;'), '&amp;unknown; &amp;#0;');
});
