# 体素广州 · 新中轴夜景

原生 Three.js ES6 模块源码。运行 `npm install`、`npm run build` 后，会在上级目录的 `交互作品_离线HTML/` 生成可直接双击的 `体素广州_新中轴夜景_离线版.html`。交付的 HTML 已内嵌 Three.js、lil-gui、样式及全部场景代码，不需联网。

## 坐标与尺度

世界单位为米。`src/geo.js` 将 WGS84 坐标投影到广州塔附近的局部切平面，北为负 Z，东为正 X。地标中心采用 OpenStreetMap Nominatim 返回的点位，收录在 `tools/geocoded.json`。体素主体以 4 m 格为视觉单位，塔体和树冠细节使用 1–2 m 模块。建筑与岸线是依据真实相对位置及尺度构建的艺术化重现，不是实测建筑物轮廓或 GIS 地籍数据。

广州塔按总高 600 m（塔身约 450 m、桅杆约 150 m）制作。东塔采用 530 m；西塔按本委托指定的 432 m 制作，公开的 CTBUH 数据为 438.6 m，因此两者有 6.6 m 差异。街区 1500 栋以上为程序化生成，不对应每一栋实际建筑。

## 操作

- 1–5：五组镜头；鼠标拖动：环绕；滚轮：缩放。
- 右上面板：昼夜、曝光、广州塔霓虹、车流、波纹、镜面倒影、Bloom、SMAA、自动环绕。
- 底部 HUD：当前 FPS、draw calls、三角面、建筑数、二沙岛树木数。

## 架构

`CityScene` 组装场景；`VoxelCity` 和 `VoxelBatch` 生成实例化体素及窗光图集；`CantonTowerMesh` 和 `CentralAxisBuildings` 生成地标；`RiverSystem` 负责分流岸线、波面、镜面虚拟相机；`Bridges`、`TrafficSystem`、`SkyEnvironment`、`PostEffects`、`CameraRig` 各自负责桥、车流、天空、后期与镜头。

## 资料

- 广州政府：[广州塔 600 m、450 m 塔身](https://www.eguangzhou.gov.cn/globalgzpastandpresence/content/post_31123.html)、[花城广场和周边文化地标](https://www.eguangzhou.gov.cn/globalgzpastandpresence/content/post_31116.html)、[海心沙位置](https://www.eguangzhou.gov.cn/globalgzpastandpresence/content/post_31131.html)。
- CTBUH：[广州 IFC 438.6 m](https://www.skyscrapercenter.com/building/id/174)、[广州 CTF 530 m](https://www.skyscrapercenter.com/building/guangzhou-ctf-finance-centre/176)。
- [Nominatim 查询结果](tools/geocoded.json)；地标中心位置仅供场景布局参考。

## 验证

`npm run check` 执行离线构建及静态检查。`npm run browser-test -- --hardware` 使用本地 Chrome 的 `file://` 路径检查运行期 console、键盘镜头、鼠标环绕及缩放，并保存截图。2026-09-25 在 RTX 5080、1440×900、Chrome Headless Direct3D11 条件下，夜景 HUD 读数约 160 FPS；其他显卡和分辨率需以实际机器为准。默认 `npm run browser-test` 使用 SwiftShader 软件渲染，仅用于功能验证，不作为 GPU 性能数据。
