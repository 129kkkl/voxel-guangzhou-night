import { CityScene } from './CityScene.js';
try {
  new CityScene(document.getElementById('app'),document.getElementById('hud'));
  document.getElementById('loading').remove();
} catch(error) {
  document.getElementById('loading').textContent='场景启动失败：'+error.message;
  console.error(error);
}
