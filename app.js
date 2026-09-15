'use strict';
const bundles = {
  base: { title: '小背包', description: '适合已有末端设备、希望自行拓展的开发团队。', items: ['背包主机', '基础软件与说明', '本体连接线束'] },
  hand: { title: '小背包 + 灵巧手（送连接件）', description: '面向灵巧操作、科研与数据采集；灵巧手品牌和型号待选定，套装赠送连接件。', items: ['背包主机', '指定灵巧手（待选型）', '设备专用线束', '连接件（赠送）', '对应驱动与安装说明'] },
  gripper: { title: '小背包 + 夹爪（送连接件）', description: '基于团队已有接入成果，规划形成完整抓取套装；夹爪型号待确认，套装赠送连接件。', items: ['背包主机', '夹爪（型号待确认）', '设备专用线束', '连接件（赠送）', '对应驱动与安装说明'] },
  'gripper-camera': { title: '小背包 + 夹爪 + 双腕相机（送连接件）', description: '面向抓取实验与腕部视觉采集，包含夹爪和两台腕部相机；具体型号待确认，套装赠送连接件。', items: ['背包主机', '夹爪（型号待确认）', '双腕相机（2台，型号待确认）', '设备专用线束', '连接件（赠送）', '对应驱动与安装说明'] }
};
const views = {
  concept: { src: './assets/robotdock-concept.png', alt: 'RobotDock 小背包工业设计概念效果图', label: '工业设计 · 概念效果图', caption: '源自背部一体化安装构想', count: '01 / 03' },
  sketch: { src: './assets/design-sketch.png', alt: '团队提供的机器人背部安装设计草图，非最终成品', label: '原始草图 · 安装构想', caption: '团队设计参考 · 非最终本体适配图', count: '02 / 03' },
  interfaces: { label: '连接架构 · 接口规划', caption: '接口与协议需逐设备适配', count: '03 / 03' }
};
function renderList(target, items) {
  target.replaceChildren(...items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
}
function currentBundle() { return bundles[document.querySelector('input[name="bundle"]:checked').value]; }
document.querySelectorAll('input[name="bundle"]').forEach(input => input.addEventListener('change', () => {
  const bundle = currentBundle();
  document.getElementById('selected-title').textContent = bundle.title;
  document.getElementById('selected-description').textContent = bundle.description;
  renderList(document.getElementById('selected-items'), bundle.items);
}));
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.view;
  const view = views[key];
  const image = document.getElementById('product-image');
  document.querySelectorAll('[data-view]').forEach(other => { other.classList.toggle('selected', other === button); other.setAttribute('aria-pressed', String(other === button)); });
  image.hidden = key === 'interfaces';
  document.getElementById('interface-view').hidden = key !== 'interfaces';
  if (view.src) { image.src = view.src; image.alt = view.alt; }
  image.classList.toggle('sketch', key === 'sketch');
  document.getElementById('image-label').textContent = view.label;
  document.getElementById('gallery-caption').textContent = view.caption;
  document.getElementById('image-count').textContent = view.count;
}));
const dialog = document.getElementById('configuration-dialog');
document.getElementById('configuration-form').addEventListener('submit', event => {
  event.preventDefault();
  const bundle = currentBundle();
  document.getElementById('dialog-title').textContent = bundle.title;
  document.getElementById('dialog-description').textContent = bundle.description;
  renderList(document.getElementById('dialog-items'), bundle.items);
  dialog.showModal();
});
document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); });
