import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue';
import VueShortKey from 'vue-shortkey';
import VueHighlightJS from 'vue-highlightjs'

import App from './App.vue';

import router from './router';

import './scss/theme.scss';
// import '../node_modules/highlight.js/scss/a11y-light.scss';
// import '../node_modules/highlight.js/scss/vs.scss';
// import '../node_modules/highlight.js/scss/github.scss';
import '../node_modules/highlight.js/scss/github-gist.scss';
import './scss/mongozap.scss';

Vue.config.productionTip = false

Vue.use(BootstrapVue);
Vue.use(VueShortKey, { prevent: ['input', 'textarea'] })
Vue.use(VueHighlightJS);


new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
