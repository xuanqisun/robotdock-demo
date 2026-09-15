'use strict';

const commonItems = ['PICO VR 头显', '配套手柄', '配套脚环', 'Sonic Link 遥操作软件', '通用小背包（机器人拓展坞）'];
const bundles = {
  base: {
    title: '基础完整方案',
    description: '含 VR 设备、软件与小背包，沿用 G1 自带橡胶手，不额外购买末端。',
    items: [...commonItems],
  },
  gripper: {
    title: '完整方案 + 智元夹爪',
    description: '完整软硬件配置，搭配智元夹爪，用于遥操作与抓取任务。',
    items: [...commonItems, '智元夹爪（型号与数量待确认）'],
  },
};
const views = {
  grasp: { src: './assets/demo-grasp.jpg', alt: '操作者佩戴 VR 设备，机器人配合进行玩偶抓取的使用示例', label: '使用实拍 · 抓取示例', caption: '从人的动作，到机器人的动作。', count: '01 / 04' },
  motion: { src: './assets/demo-motion.jpg', alt: '操作者与机器人同时展开双臂、抬起一条腿的动作示例', label: '使用实拍 · 动作示例', caption: '全身动作示例 · 需在受控场地操作', count: '02 / 04' },
  vr: { src: './assets/pico-kit.jpg', alt: '团队提供的 VR 头显与两个手柄实拍，脚环未在图中展示', label: '设备实拍 · VR 头显与手柄', caption: '方案含 PICO、手柄、脚环；脚环未入镜', count: '03 / 04' },
  software: { src: './assets/sonic-link-console.png', alt: 'ONE-G Sonic Link 的 PICO × G1 控制台：五点遥操连接入口与检查记录', label: '软件实图 · Sonic Link', caption: '检查、校准、人工确认后启动遥操作', count: '04 / 04' },
};

function renderList(target, items) {
  target.replaceChildren(...items.map(text => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }));
}
function currentBundle() {
  return bundles[document.getElementById('gripper-option').checked ? 'gripper' : 'base'];
}
function renderBundle() {
  const bundle = currentBundle();
  document.getElementById('selected-title').textContent = bundle.title;
  document.getElementById('selected-description').textContent = bundle.description;
  renderList(document.getElementById('selected-items'), bundle.items);
}
document.getElementById('gripper-option').addEventListener('change', renderBundle);
renderBundle();

let currentView = 'grasp';
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  currentView = button.dataset.view;
  const view = views[currentView];
  const image = document.getElementById('product-image');
  document.querySelectorAll('[data-view]').forEach(other => {
    other.classList.toggle('selected', other === button);
    other.setAttribute('aria-pressed', String(other === button));
  });
  image.src = view.src;
  image.alt = view.alt;
  image.classList.toggle('demo-photo', currentView === 'grasp' || currentView === 'motion');
  document.getElementById('image-label').textContent = view.label;
  document.getElementById('gallery-caption').textContent = view.caption;
  document.getElementById('image-count').textContent = view.count;
}));

const configurationDialog = document.getElementById('configuration-dialog');
document.getElementById('configuration-form').addEventListener('submit', event => {
  event.preventDefault();
  const bundle = currentBundle();
  document.getElementById('dialog-title').textContent = `完整方案 · ${bundle.title}`;
  document.getElementById('dialog-description').textContent = bundle.description;
  renderList(document.getElementById('dialog-items'), bundle.items);
  configurationDialog.showModal();
});
document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => configurationDialog.close()));

const imageDialog = document.getElementById('image-dialog');
function showImage(key) {
  const view = views[key];
  const image = document.getElementById('expanded-image');
  image.src = view.src;
  image.alt = view.alt;
  image.classList.toggle('demo-photo', key === 'grasp' || key === 'motion');
  document.getElementById('image-dialog-title').textContent = view.label;
  document.getElementById('expanded-caption').textContent = view.caption;
  imageDialog.showModal();
}
document.getElementById('enlarge-image').addEventListener('click', () => showImage(currentView));
document.querySelectorAll('[data-enlarge]').forEach(button => button.addEventListener('click', () => showImage(button.dataset.enlarge)));
document.querySelectorAll('.close-image-dialog').forEach(button => button.addEventListener('click', () => imageDialog.close()));
[configurationDialog, imageDialog].forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
}));

// Match the RobotDock template: page-scroll product details, independent sticky purchase panel.
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
