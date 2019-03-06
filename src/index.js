import Vue from 'vue'
import VueRouter from 'vue-router'
import VueAxios from 'vue-axios';
import axios from 'axios';
Vue.use(VueAxios,axios);

//import template vuejs
import App from './App.vue';
import CoinItem from './components/CoinItem.vue';
import coinDetail from './components/coinDetail.vue';
import coinSetting from './components/coinsetting.vue';

Vue.prototype.pathServerApi   = "http://localhost:3001";

import VueSocketio from 'vue-socket.io'
Vue.use(VueSocketio, 'http://localhost:3001')

Vue.use(VueRouter)
const routes = [
    {
        name: 'coin',
        path: '/',
        component: CoinItem
    },
    {
        name: 'setting',
        path: '/setting',
        component: coinSetting
    },
    {
        name: 'coinDetail',
        path: '/:id',
        component: coinDetail
    },
];
const router = new VueRouter({routes: routes});
new Vue(Vue.util.extend({ router }, App)).$mount('#app');
