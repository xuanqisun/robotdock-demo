import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const pageUrl = new URL('../dist/teleoperation/index.html', import.meta.url);
const html = readFileSync(pageUrl, 'utf8');
const app = readFileSync(new URL('../dist/teleoperation/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const photoCss = readFileSync(new URL('../dist/teleoperation/teleoperation.css', import.meta.url), 'utf8');
const uniqueIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(uniqueIds).size, uniqueIds.length, 'Unique element IDs');
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const link = match[1];
  if (link.startsWith('#')) {
    assert.ok(uniqueIds.includes(link.slice(1)), `Anchor exists: ${link}`);
  } else {
    const asset = new URL(link.split('?')[0], pageUrl);
    assert.equal(asset.protocol, 'file:', 'Assets must stay local');
    assert.ok(existsSync(asset), `Asset exists: ${link}`);
  }
}
assert.equal((html.match(/type="checkbox"/g) || []).length, 1);
assert.doesNotMatch(html, /type="radio"|二选一|固定橡胶手版|2 种完整方案/);
assert.doesNotMatch(html, /id="gripper-option"[^>]*\bchecked\b/);
assert.match(html, /不额外交付橡胶手/);
assert.match(html, /不含机器人本体/);
assert.match(html, /三点遥操与 GEM 尚在待开发状态/);
assert.match(html, /noindex,nofollow/);
assert.match(html, /<aside class="purchase-panel"[^>]*tabindex="0">/);
assert.match(css, /overflow-y:auto;overscroll-behavior-y:contain/);
assert.match(photoCss, /\.demo-photo\{filter:brightness\(1\.2\) contrast\(1\.02\)\}/);
assert.match(photoCss, /\.teleop-stage \.product-image\.demo-photo\{object-fit:cover\}/);
assert.match(photoCss, /aspect-ratio:16\/9/);
assert.doesNotMatch(photoCss, /background:#101719/);
assert.match(html, /class="product-image demo-photo"/);

class Element {
  constructor() { this.listeners = new Map(); this.attributes = new Map(); this.children = []; this.checked = false; this.textContent = ''; this.open = false; this.classes = new Set(); this.dataset = {}; }
  addEventListener(event, listener) { this.listeners.set(event, listener); }
  dispatch(event, detail = {}) { this.listeners.get(event)?.({ target: this, ...detail }); }
  setAttribute(key, value) { this.attributes.set(key, value); }
  replaceChildren(...children) { this.children = children; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  getBoundingClientRect() { return { top: 25, bottom: 700, left: 20, right: 600 }; }
  classList = { toggle: (key, enabled) => enabled ? this.classes.add(key) : this.classes.delete(key) };
}
const ids = Object.fromEntries(uniqueIds.map(id => [id, new Element()]));
const thumbnails = ['grasp', 'motion', 'vr', 'software'].map(key => { const node = new Element(); node.dataset.view = key; return node; });
const softwareButton = new Element();
softwareButton.dataset.enlarge = 'software';
const closeConfiguration = [new Element(), new Element()];
const closeImage = [new Element()];
const media = { matches: true };
let panelTop = 201;
const panel = new Element();
const properties = new Map();
panel.style = { setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key) };
panel.getBoundingClientRect = () => ({ top: panelTop });
const listeners = new Map();
const context = vm.createContext({
  document: {
    getElementById: id => { assert.ok(ids[id], `Known DOM node ${id}`); return ids[id]; },
    createElement: tag => { assert.equal(tag, 'li'); return new Element(); },
    querySelector: selector => { assert.equal(selector, '.purchase-panel'); return panel; },
    querySelectorAll: selector => {
      const nodes = { '[data-view]': thumbnails, '[data-enlarge]': [softwareButton], '.close-dialog': closeConfiguration, '.close-image-dialog': closeImage };
      assert.ok(nodes[selector], `Known selector ${selector}`);
      return nodes[selector];
    },
  },
  window: {
    innerHeight: 720,
    matchMedia: query => { assert.equal(query, '(min-width: 801px)'); return media; },
    addEventListener: (event, listener, options) => listeners.set(event, { listener, options }),
  },
});
vm.runInContext(app, context);
const listText = id => ids[id].children.map(child => child.textContent);
const baseItems = ['PICO VR 头显', '配套手柄', '配套脚环', 'Sonic Link 遥操作软件', '通用小背包（机器人拓展坞）'];
assert.deepEqual(listText('selected-items'), baseItems, 'Default contains only delivered core components');
assert.equal(ids['selected-title'].textContent, '基础完整方案');
assert.match(ids['selected-description'].textContent, /沿用 G1 自带橡胶手/);

let prevented = false;
ids['configuration-form'].dispatch('submit', { preventDefault() { prevented = true; } });
assert.ok(prevented, 'Submission stays local');
assert.ok(ids['configuration-dialog'].open);
assert.deepEqual(listText('dialog-items'), baseItems);
closeConfiguration[0].dispatch('click');
assert.ok(!ids['configuration-dialog'].open);

ids['gripper-option'].checked = true;
ids['gripper-option'].dispatch('change');
assert.equal(ids['selected-title'].textContent, '完整方案 + 智元夹爪');
assert.deepEqual(listText('selected-items'), [...baseItems, '智元夹爪（型号与数量待确认）']);
ids['configuration-form'].dispatch('submit', { preventDefault() {} });
assert.equal(listText('dialog-items').length, 6);
closeConfiguration[1].dispatch('click');
assert.ok(!ids['configuration-dialog'].open);
ids['gripper-option'].checked = false;
ids['gripper-option'].dispatch('change');
assert.deepEqual(listText('selected-items'), baseItems, 'Gripper can be removed again');
ids['configuration-form'].dispatch('submit', { preventDefault() {} });
assert.deepEqual(listText('dialog-items'), baseItems, 'Dialog reflects deselection without stale items');
ids['configuration-dialog'].dispatch('click', { clientX: 10, clientY: 10 });
assert.ok(!ids['configuration-dialog'].open);

for (const [index, thumbnail] of thumbnails.entries()) {
  thumbnail.dispatch('click');
  assert.equal(ids['image-count'].textContent, `0${index + 1} / 04`);
  assert.ok(existsSync(new URL(ids['product-image'].src, pageUrl)));
  assert.ok(ids['product-image'].alt);
  assert.equal(ids['product-image'].classes.has('demo-photo'), index < 2, 'Only the two demo photos are cropped and brightened');
  assert.equal(thumbnails.filter(node => node.attributes.get('aria-pressed') === 'true').length, 1);
  ids['enlarge-image'].dispatch('click');
  assert.ok(ids['image-dialog'].open);
  assert.equal(ids['expanded-image'].src, ids['product-image'].src);
  assert.equal(ids['expanded-image'].classes.has('demo-photo'), index < 2, 'Lightbox uses the same photo correction');
  closeImage[0].dispatch('click');
  assert.ok(!ids['image-dialog'].open);
}
softwareButton.dispatch('click');
assert.match(ids['expanded-image'].src, /sonic-link-console\.png$/);
ids['image-dialog'].dispatch('click', { clientX: 10, clientY: 10 });
assert.ok(!ids['image-dialog'].open);

assert.equal(properties.get('--purchase-panel-height'), '494px');
panelTop = 25;
listeners.get('scroll').listener();
assert.equal(properties.get('--purchase-panel-height'), '670px');
assert.ok(listeners.get('scroll').options.passive);
context.window.innerHeight = 600;
listeners.get('resize').listener();
assert.equal(properties.get('--purchase-panel-height'), '550px');
media.matches = false;
listeners.get('resize').listener();
assert.equal(properties.has('--purchase-panel-height'), false, 'Mobile retains normal page scrolling');
media.matches = true;
listeners.get('resize').listener();
assert.equal(properties.get('--purchase-panel-height'), '550px');
console.log('PASS: local assets and anchors, optional gripper, delivery list, four image views, dialogs, and independent desktop/mobile scrolling.');
