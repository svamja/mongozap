import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue';
import { Vue2Storage } from 'vue2-storage'
import VueRouter from 'vue-router';

import App from './App.vue';

import './scss/theme.scss';

Vue.config.productionTip = false

import ConnectionsComponent from './components/ConnectionsComponent';
import DatabasesComponent from './components/DatabasesComponent';
import CollectionsComponent from './components/CollectionsComponent';
import CollectionIndexComponent from './components/CollectionIndexComponent';
import SettingsComponent from './components/SettingsComponent';

Vue.use(BootstrapVue);
Vue.use(VueRouter);
Vue.use(Vue2Storage, { prefix: 'mzp_' });

const routes = [
  { path: '/', component: ConnectionsComponent },
  { path: '/databases', component: DatabasesComponent },
  { path: '/database/:database/collections', component: CollectionsComponent },
  { path: '/collections', component: CollectionsComponent },
  { path: '/collection/:collection/index', component: CollectionIndexComponent },
  { path: '/settings', component: SettingsComponent }
];

const router = new VueRouter({ routes });

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
