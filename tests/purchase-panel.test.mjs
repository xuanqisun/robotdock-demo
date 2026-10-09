import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const pageUrl = new URL('../dist/index.html', import.meta.url);
const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const html = readFileSync(pageUrl, 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const idNames = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(idNames).size, idNames.length, 'IDs remain unique');
for (const [, link] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  if (link === '#') continue;
  if (link.startsWith('#')) assert.ok(idNames.includes(link.slice(1)), `Anchor exists: ${link}`);
  else assert.ok(existsSync(new URL(link.split('?')[0], pageUrl)), `Local asset exists: ${link}`);
}
class Element {
  constructor(value = '') { this.value = value; this.checked = false; this.listeners = new Map(); this.children = []; this.dataset = {}; this.attributes = new Map(); this.classes = new Set(); }
  addEventListener(event, listener) { this.listeners.set(event, listener); }
  dispatch(event, detail = {}) { return this.listeners.get(event)?.({ target: this, ...detail }); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attributes.set(key, value); }
  showModal() { this.open = true; }
  close() { this.open = false; }
  scrollIntoView() { this.scrolled = true; }
  focus() { this.focused = true; }
  getBoundingClientRect() { return { top: 10, bottom: 700, left: 10, right: 600 }; }
  classList = { toggle: (key, enabled) => enabled ? this.classes.add(key) : this.classes.delete(key) };
}
const ids = Object.fromEntries(idNames.map(id => [id, new Element()]));
ids.peripheral.value = 'none';
const radios = ['access', 'development', 'application'].map(value => new Element(value));
radios[0].checked = true;
const apps = ['teleoperation', 'performance', 'adaptation'].map(value => new Element(value));
const shortcuts = radios.map(radio => { const el = new Element(); el.dataset.selectEdition = radio.value; return el; });
const thumbnails = ['concept', 'sketch', 'interfaces'].map(view => { const el = new Element(); el.dataset.view = view; return el; });
const closes = [new Element(), new Element()];
const properties = new Map();
const listeners = new Map();
const media = { matches: true };
let top = 201;
const panel = ids.configuration;
panel.style = { setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key) };
panel.getBoundingClientRect = () => ({ top });
let clipboardText = '';
const context = vm.createContext({
  navigator: { clipboard: { writeText: async text => { clipboardText = text; } } },
  document: {
    getElementById: id => { assert.ok(ids[id], `Known ID: ${id}`); return ids[id]; },
    createElement: tag => { assert.equal(tag, 'li'); return new Element(); },
    querySelector: selector => {
      if (selector === '.purchase-panel') return panel;
      if (selector === 'input[name="edition"]:checked') return radios.find(radio => radio.checked);
      const value = selector.match(/^input\[name="edition"\]\[value="(.+)"\]$/)?.[1];
      assert.ok(value, `Known selector: ${selector}`);
      return radios.find(radio => radio.value === value);
    },
    querySelectorAll: selector => {
      const results = { '[data-select-edition]': shortcuts, '[data-view]': thumbnails, '.close-dialog': closes, 'input[name="application"]:checked': apps.filter(app => app.checked) };
      assert.ok(results[selector], `Known selector: ${selector}`);
      return results[selector];
    },
  },
  window: {
    innerHeight: 720,
    matchMedia: query => { assert.equal(query, '(min-width: 801px)'); return media; },
    addEventListener: (event, listener, options) => listeners.set(event, { listener, options }),
  },
});
vm.runInContext(app, context);
const list = id => ids[id].children.map(child => child.textContent);
const change = () => ids['configuration-form'].dispatch('change');
const submit = () => ids['configuration-form'].dispatch('submit', { preventDefault() {} });
function selectEdition(key) { radios.forEach(radio => { radio.checked = radio.value === key; }); change(); }
assert.equal(ids['selected-title'].textContent, '基础接入版');
assert.equal(ids['compute-model'].textContent, 'Orin Nano 8GB');
assert.ok(ids['application-options'].hidden && ids['application-options'].disabled);
assert.deepEqual(list('selected-items').slice(0, 3), ['接入硬件', '基础 SDK', '驱动与文档']);

for (const edition of ['access', 'development', 'application']) {
  selectEdition(edition);
  for (const peripheral of ['none', 'hand', 'gripper', 'gripper-camera']) {
    ids.peripheral.value = peripheral;
    change(); submit();
    assert.ok(ids['configuration-dialog'].open);
    const detail = list('dialog-options').join('\n');
    assert.equal(detail.includes('双腕相机（2 台'), peripheral === 'gripper-camera');
    assert.equal(detail.includes('灵巧手'), peripheral === 'hand');
    assert.equal(detail.includes('夹爪'), ['gripper', 'gripper-camera'].includes(peripheral));
    assert.equal(detail.includes('应用包需求：待沟通确认'), edition === 'application');
    assert.equal(list('dialog-items').some(item => item.includes('选配应用包')), edition === 'application');
    closes[0].dispatch('click');
    assert.equal(ids['configuration-dialog'].open, false);
  }
}
apps.forEach(app => { app.checked = true; });
ids['custom-compute'].checked = true;
ids['custom-storage'].checked = true;
change(); submit();
assert.equal(list('dialog-options').filter(item => item.startsWith('应用包需求')).length, 3);
await ids['copy-configuration'].dispatch('click');
assert.match(clipboardText, /五点遥操与数采/);
assert.match(clipboardText, /双腕相机（2 台/);
assert.match(clipboardText, /评估其他算力配置/);
assert.match(clipboardText, /评估存储容量/);
assert.match(clipboardText, /二次开发范围按应用包约定/);
assert.match(ids['copy-status'].textContent, /已复制/);
closes[1].dispatch('click');
selectEdition('development'); submit();
assert.ok(ids['application-options'].hidden && ids['application-options'].disabled);
assert.ok(!list('dialog-options').some(item => item.startsWith('应用包需求')), 'Hidden application choices must not leak into another edition');
await ids['copy-configuration'].dispatch('click');
assert.doesNotMatch(clipboardText, /五点遥操与数采|VLA \/ SONIC/);
assert.equal(ids['compute-model'].textContent, 'Orin NX 16GB');
selectEdition('access');
assert.equal(ids['compute-model'].textContent, 'Orin Nano 8GB');
ids.peripheral.value = 'none';
ids['custom-compute'].checked = false;
ids['custom-storage'].checked = false;
change(); submit();
assert.doesNotMatch(list('dialog-options').join('\n'), /夹爪|双腕相机|需求：评估/);
context.navigator.clipboard.writeText = async () => { throw new Error('denied'); };
await ids['copy-configuration'].dispatch('click');
assert.match(ids['copy-status'].textContent, /手动复制/);
ids['configuration-dialog'].dispatch('click', { clientX: 0, clientY: 0 });
assert.equal(ids['configuration-dialog'].open, false);
for (const shortcut of shortcuts) {
  radios.forEach(radio => { radio.checked = false; }); // native radio exclusivity
  shortcut.dispatch('click');
  assert.ok(radios.find(radio => radio.value === shortcut.dataset.selectEdition).focused);
  assert.ok(panel.scrolled);
}
for (const [index, thumbnail] of thumbnails.entries()) {
  thumbnail.dispatch('click');
  assert.equal(ids['image-count'].textContent, `0${index + 1} / 03`);
  assert.equal(ids['product-image'].hidden, index === 2);
  assert.equal(ids['interface-view'].hidden, index !== 2);
  assert.equal(thumbnails.filter(el => el.attributes.get('aria-pressed') === 'true').length, 1);
}
assert.equal(properties.get('--purchase-panel-height'), '494px');
top = 25; listeners.get('scroll').listener();
assert.equal(properties.get('--purchase-panel-height'), '670px');
assert.ok(listeners.get('scroll').options.passive);
context.window.innerHeight = 600; listeners.get('resize').listener();
assert.equal(properties.get('--purchase-panel-height'), '550px');
media.matches = false; listeners.get('resize').listener();
assert.ok(!properties.has('--purchase-panel-height'));
media.matches = true; listeners.get('resize').listener();
assert.equal(properties.get('--purchase-panel-height'), '550px');
assert.match(css, /overflow-y:auto;overscroll-behavior-y:contain/);
console.log('PASS: assets and anchors; 12 version/peripheral combinations; application isolation; copy success/failure; shortcuts; gallery; dialogs; desktop/mobile panel heights.');
