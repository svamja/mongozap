import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue';
import VueRouter from 'vue-router';
import App from './App.vue';

import './scss/theme.scss';

Vue.config.productionTip = false

import ConnectionsComponent from './components/ConnectionsComponent';
import DatabasesComponent from './components/DatabasesComponent';
import SettingsComponent from './components/SettingsComponent';

Vue.use(BootstrapVue);
Vue.use(VueRouter);

const routes = [
  { path: '/', component: ConnectionsComponent },
  { path: '/databases', component: DatabasesComponent },
  { path: '/settings', component: SettingsComponent }
];

const router = new VueRouter({ routes });

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
