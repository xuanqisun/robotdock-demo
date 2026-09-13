# RobotDock 产品概念展示

面向内部方案讨论的静态商品展示网站。支持背包单品、灵巧手套装和智元夹爪套装切换，展示产品概念、兼容规划和配置清单。无支付、无订单、无数据收集。

网站内容位于 `dist/`，已配置 GitHub Pages。无需安装依赖或构建。

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

已检查：320px / 390px 窄屏与 1440px 桌面布局、图片加载、三种套装切换、配置清单弹窗、接口视图以及浏览器错误日志。

## 内容边界

- RobotDock 为展示用暂定名称。
- 背包产品图为依据团队草图生成的 AI 概念效果图，不是实物照片。
- 团队已接通过智元夹爪；具体型号、G1 版本和量产适配仍待确认。
- 灵巧手品牌、接口数量、供电参数、售价和交付日期尚未确认。
- 页面中的即插即用是已适配组合的设计目标，不意味着任意设备兼容或带电热插拔。
- 网页设置 noindex；这不是访问控制，GitHub Pages 页面仍可公开访问。

## 图片

`design-sketch.png`：用户提供的设计参考草图。

`robotdock-concept.png`：内置 image_gen 工具生成。提示词：以用户草图中间的背包为设计参考，生成单个石墨灰机器人电子背包的产品概念图，渐窄圆角外壳、中央青色灯条、侧面散热槽、底部接口与顶部安装耳，浅灰棚拍背景，三分之四视角，无机器人、背带、文字或商标。
