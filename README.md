# RobotDock 产品概念展示

面向内部方案讨论的静态商品展示网站。支持小背包、小背包 + 灵巧手（送连接件）、小背包 + 夹爪（送连接件）、小背包 + 夹爪 + 双腕相机（送连接件）四种方案切换，展示产品概念、兼容规划和配置清单。无支付、无订单、无数据收集。

网站内容位于 `dist/`，已配置 GitHub Pages。无需安装依赖或构建。

桌面端右侧选购区保持固定，并在当前可见高度内独立滚动；左侧商品详情使用页面滚动。手机端保留上下浏览。运行 `node tests/purchase-panel.test.mjs` 检查滚动区域高度、移动端恢复及四种套装是否保留。

访问地址：https://xuanqisun.github.io/robotdock-demo/

源码仓库：https://github.com/xuanqisun/robotdock-demo

## 更新发布

`main` 分支保留源码和说明，`gh-pages` 分支根目录只包含 `dist/` 的网站内容。修改页面后：

```sh
git add dist
git commit -m "Update product demo"
git subtree split --prefix=dist -b gh-pages
git push origin main gh-pages
```

GitHub Pages 从 `gh-pages` 的根目录自动发布。`node github-pages.mjs status` 可通过既有 Git 凭据查询发布状态；该脚本不保存或显示凭据。

发布前检查：窄屏与桌面布局、图片加载、四种套装切换、赠送连接件标注、双腕相机数量、配置清单弹窗以及浏览器错误日志。

## 内容边界

- RobotDock 为展示用暂定名称。
- 背包产品图为依据团队草图生成的 AI 概念效果图，不是实物照片。
- 团队已接通过智元夹爪；具体型号、G1 版本和量产适配仍待确认。
- 灵巧手与相机品牌型号、接口数量、供电参数、售价和交付日期尚未确认。
- 页面中的即插即用是已适配组合的设计目标，不意味着任意设备兼容或带电热插拔。
- 网页设置 noindex；这不是访问控制，GitHub Pages 页面仍可公开访问。

## 图片

`one-g-logo.svg` / `one-g-symbol.svg`：用户公司 ONE-G Robotics 的原版矢量标识，取自所提供 AI 文件同目录的 SVG 导出版本。仅裁切画板空白，未改动标识路径或比例。

`design-sketch.png`：用户提供的设计参考草图。

`robotdock-concept.png`：内置 image_gen 工具生成。提示词：以用户草图中间的背包为设计参考，生成单个石墨灰机器人电子背包的产品概念图，渐窄圆角外壳、中央青色灯条、侧面散热槽、底部接口与顶部安装耳，浅灰棚拍背景，三分之四视角，无机器人、背带、文字或商标。
