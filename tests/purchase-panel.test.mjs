import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const properties = new Map();
const listeners = new Map();
const media = { matches: true };
let top = 201;
const panel = {
  style: {
    setProperty: (key, value) => properties.set(key, value),
    removeProperty: key => properties.delete(key),
  },
  getBoundingClientRect: () => ({ top }),
};
const context = vm.createContext({
  document: {
    querySelectorAll: () => [],
    querySelector: selector => {
      assert.equal(selector, '.purchase-panel');
      return panel;
    },
    getElementById: () => ({ addEventListener() {} }),
  },
  window: {
    innerHeight: 720,
    matchMedia: query => {
      assert.equal(query, '(min-width: 801px)');
      return media;
    },
    addEventListener: (event, listener, options) => listeners.set(event, { listener, options }),
  },
});
vm.runInContext(app, context);
assert.equal(properties.get('--purchase-panel-height'), '494px', 'Fit below the initial page header');
top = 25;
listeners.get('scroll').listener();
assert.equal(properties.get('--purchase-panel-height'), '670px', 'Expand as the panel becomes sticky');
assert.equal(listeners.get('scroll').options.passive, true);
context.window.innerHeight = 600;
listeners.get('resize').listener();
assert.equal(properties.get('--purchase-panel-height'), '550px', 'Keep the bottom control reachable in short windows');
media.matches = false;
listeners.get('resize').listener();
assert.equal(properties.has('--purchase-panel-height'), false, 'Mobile must use the normal page flow');
media.matches = true;
top = 201;
context.window.innerHeight = 900;
listeners.get('resize').listener();
assert.equal(properties.get('--purchase-panel-height'), '674px', 'Restore desktop scrolling after resizing');
assert.match(css, /@media\(min-width:801px\)\{\.purchase-panel\{position:sticky;top:25px;max-height:var\(--purchase-panel-height,/);
assert.match(css, /overflow-y:auto;overscroll-behavior-y:contain/);
assert.doesNotMatch(css, /max-height:1200px/);
assert.equal((html.match(/name="bundle"/g) || []).length, 4);
assert.equal((html.match(/class="bundle-gift"/g) || []).length, 3);
assert.match(html, /<aside class="purchase-panel" aria-label="商品选购" tabindex="0">/);
assert.match(html, /styles\.css\?v=independent-scroll-1/);
assert.match(html, /app\.js\?v=independent-scroll-1/);
console.log('PASS: initial/sticky/short-window/mobile heights, scroll containment, keyboard access, and four bundles.');
