import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue';
import { Vue2Storage } from 'vue2-storage'
import VueRouter from 'vue-router';
import VueShortKey from 'vue-shortkey';
import VueHighlightJS from 'vue-highlightjs'


import App from './App.vue';

import './scss/theme.scss';
// import '../node_modules/highlight.js/scss/a11y-light.scss';
// import '../node_modules/highlight.js/scss/vs.scss';
// import '../node_modules/highlight.js/scss/github.scss';
import '../node_modules/highlight.js/scss/github-gist.scss';
import './scss/mongozap.scss';

Vue.config.productionTip = false

import ConnectionsComponent from './components/ConnectionsComponent';
import DatabasesComponent from './components/DatabasesComponent';
import DatabaseHomeComponent from './components/DatabaseHomeComponent';
import DatabaseIndexComponent from './components/DatabaseIndexComponent';
import CollectionIndexComponent from './components/CollectionIndexComponent';
import CollectionSchemaComponent from './components/CollectionSchemaComponent';
import CollectionIndexesComponent from './components/CollectionIndexesComponent';
import SettingsComponent from './components/SettingsComponent';

Vue.use(BootstrapVue);
Vue.use(VueRouter);
Vue.use(Vue2Storage, { prefix: 'mzp_' });
Vue.use(VueShortKey, { prevent: ['input', 'textarea'] })
Vue.use(VueHighlightJS);

const routes = [
  { path: '/', component: ConnectionsComponent },
  { path: '/db/:connection/list', component: DatabasesComponent },
  { path: '/db/:connection/:database/home', component: DatabaseHomeComponent },
  { path: '/db/:connection/:database/index', component: DatabaseIndexComponent },
  { path: '/coll/:connection/:database/:collection/index', component: CollectionIndexComponent },
  { path: '/coll/:connection/:database/:collection/schema', component: CollectionSchemaComponent },
  { path: '/coll/:connection/:database/:collection/indexes', component: CollectionIndexesComponent },
  { path: '/settings', component: SettingsComponent }
];

const router = new VueRouter({ routes });

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
