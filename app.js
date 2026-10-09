'use strict';
const editions = {
  access: {
    title: '基础接入版', description: '适合已有工作站或计算设备的团队。',
    usage: '外部计算设备运行客户程序，背包提供数据与控制接口。',
    compute: 'Orin Nano 8GB', items: ['接入硬件', '基础 SDK', '驱动与文档']
  },
  development: {
    title: '板载开发版', description: '适合需要板载开发环境的研发团队。',
    usage: '在背包内开发与部署程序，通过 SSH 或本机接口接入。',
    compute: 'Orin NX 16GB', items: ['算力平台', '基础 SDK', '开发环境', '驱动与文档']
  },
  application: {
    title: '板载应用版', description: '适合直接数采、表演，或进行二次开发的团队。',
    usage: '通过 Web 使用预设程序，通过开放接口二次开发；应用范围待适配确认。',
    compute: 'Orin NX 16GB', items: ['算力平台', '基础 SDK', '开发环境', '驱动与文档', '选配应用包（范围待确认）']
  }
};
const peripherals = {
  none: [],
  hand: ['灵巧手（型号待确认）', '配套线束与安装件（按适配组合确认）'],
  gripper: ['夹爪（型号待确认）', '配套线束与安装件（按适配组合确认）'],
  'gripper-camera': ['夹爪（型号待确认）', '双腕相机（2 台，型号待确认）', '配套线束与安装件（按适配组合确认）']
};
const applications = {
  teleoperation: '五点遥操与数采',
  performance: '演示表演',
  adaptation: 'VLA / SONIC 等指定程序适配'
};
const views = {
  concept: { src: './assets/robotdock-concept.png', alt: 'RobotDock 小背包工业设计概念效果图', label: '工业设计 · 概念效果图', caption: '源自背部一体化安装构想', count: '01 / 03' },
  sketch: { src: './assets/design-sketch.png', alt: '团队提供的机器人背部安装设计草图，非最终成品', label: '原始草图 · 安装构想', caption: '团队设计参考 · 非最终本体适配图', count: '02 / 03' },
  interfaces: { label: '连接架构 · 接口规划', caption: '接口与协议需逐设备适配', count: '03 / 03' }
};
function renderList(target, items) {
  target.replaceChildren(...items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
}
function currentConfiguration() {
  const key = document.querySelector('input[name="edition"]:checked').value;
  const edition = editions[key];
  const options = [`主控暂定：${edition.compute}`, '存储容量与规格待确认'];
  const peripheral = document.getElementById('peripheral').value;
  options.push(...peripherals[peripheral]);
  if (peripheral === 'none') options.push('暂不加配外设');
  if (key === 'application') {
    const selected = [...document.querySelectorAll('input[name="application"]:checked')];
    options.push(...(selected.length ? selected.map(input => `应用包需求：${applications[input.value]}（待适配确认）`) : ['应用包需求：待沟通确认']));
  }
  if (document.getElementById('custom-compute').checked) options.push('需求：评估其他算力配置');
  if (document.getElementById('custom-storage').checked) options.push('需求：评估存储容量');
  return { key, edition, options };
}
function updateConfiguration() {
  const { key, edition, options } = currentConfiguration();
  const applicationOptions = document.getElementById('application-options');
  applicationOptions.hidden = key !== 'application';
  applicationOptions.disabled = key !== 'application';
  document.getElementById('selected-title').textContent = edition.title;
  document.getElementById('selected-description').textContent = edition.description;
  document.getElementById('edition-use').textContent = edition.usage;
  document.getElementById('compute-model').textContent = edition.compute;
  renderList(document.getElementById('selected-items'), [...edition.items, ...options]);
}
document.getElementById('configuration-form').addEventListener('change', updateConfiguration);
document.querySelectorAll('[data-select-edition]').forEach(button => button.addEventListener('click', () => {
  const input = document.querySelector(`input[name="edition"][value="${button.dataset.selectEdition}"]`);
  input.checked = true;
  updateConfiguration();
  document.querySelector('.purchase-panel').scrollTop = 0;
  document.getElementById('configuration').scrollIntoView({ block: 'start' });
  input.focus({ preventScroll: true });
}));
updateConfiguration();
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
  const { edition, options } = currentConfiguration();
  document.getElementById('dialog-title').textContent = `RobotDock · ${edition.title}`;
  document.getElementById('dialog-description').textContent = edition.usage;
  renderList(document.getElementById('dialog-items'), edition.items);
  renderList(document.getElementById('dialog-options'), options);
  document.getElementById('copy-status').textContent = '';
  dialog.showModal();
});
document.getElementById('copy-configuration').addEventListener('click', async () => {
  const { edition, options } = currentConfiguration();
  const text = [
    `RobotDock · ${edition.title}`, edition.description, edition.usage,
    '', '版本交付内容', ...edition.items.map(item => `• ${item}`),
    '', '选配与确认事项', ...options.map(item => `• ${item}`),
    '', '方案价格：按配置确认',
    '主控配置为暂定规划，选配需逐项确认。机器人本体不包含在方案内。',
    '应用包限已验证的 G1、外设与软件组合，需安装与标定；二次开发范围按应用包约定。',
    '应用性能、基础 Web 与记录范围待验证 / 确认。'
  ].join('\n');
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById('copy-status').textContent = '已复制，可粘贴用于方案沟通。';
  } catch {
    document.getElementById('copy-status').textContent = '浏览器未允许复制，请选中清单文字手动复制。';
  }
});
document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); });

// Fit the independent scroll area below its actual viewport position, including
// the initial header offset. Scrolling the right panel never scrolls the page.
const purchasePanel = document.querySelector('.purchase-panel');
const desktopLayout = window.matchMedia('(min-width: 801px)');
function syncPurchasePanelHeight() {
  if (!desktopLayout.matches) {
    purchasePanel.style.removeProperty('--purchase-panel-height');
    return;
  }
  const panelTop = Math.max(25, purchasePanel.getBoundingClientRect().top);
  const availableHeight = Math.max(1, window.innerHeight - panelTop - 25);
  purchasePanel.style.setProperty('--purchase-panel-height', `${availableHeight}px`);
}
window.addEventListener('scroll', syncPurchasePanelHeight, { passive: true });
window.addEventListener('resize', syncPurchasePanelHeight);
syncPurchasePanelHeight();
