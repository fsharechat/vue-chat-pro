// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import '../static/css/reset.css'
import '../static/css/layout.css'
import wcPop from './assets/js/wcPop/wcPop'
import './assets/js/wcPop/skin/wcPop.css'
import './permission' // permission control
Vue.config.productionTip = false

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
// import Xgplayer from 'xgplayer-vue';
// import VueXgplayer from 'vue-xgplayer'
// Vue.use(VueXgplayer, {
//   // globalOptions
//   playsinline: true
// })

// 引入高德地图
import vueAMap from 'vue-amap'
Vue.use(vueAMap)
vueAMap.initAMapApiLoader({
    key: "e1dedc6bdd765d46693986ff7ff969f4",
    plugin: [
        "AMap.Autocomplete", //输入提示插件
        "AMap.PlaceSearch", //POI搜索插件
        "AMap.Scale", //右下角缩略图插件 比例尺
        "AMap.OverView", //地图鹰眼插件
        "AMap.ToolBar", //地图工具条
        "AMap.MapType", //类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
        "AMap.PolyEditor", //编辑 折线多，边形
        "AMap.CircleEditor", //圆形编辑器插件
        "AMap.Geolocation" //定位控件，用来获取和展示用户主机所在的经纬度位置
    ], 
    uiVersion: "1.0.11",
    v: '1.4.15'
});

// if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
/* eslint-disable no-new */
new Vue({
  router,
  store,
  template: '<App/>',
  components: { App }
}).$mount('#app')
