import Vue from 'vue';
import Router from 'vue-router';


import { Vue2Storage } from 'vue2-storage'
Vue.use(Vue2Storage, { prefix: 'mzp_' });

// let is_authenticated = localStorage.getItem('is_authenticated');
let authUser = Vue.$storage.get('authUser');

import ConnectionsComponent from './components/ConnectionsComponent';
import DatabasesComponent from './components/DatabasesComponent';
import DatabaseHomeComponent from './components/DatabaseHomeComponent';
import DatabaseIndexComponent from './components/DatabaseIndexComponent';
import CollectionIndexComponent from './components/CollectionIndexComponent';
import CollectionSchemaComponent from './components/CollectionSchemaComponent';
import CollectionIndexesComponent from './components/CollectionIndexesComponent';
import CollectionFilterComponent from './components/CollectionFilterComponent';
import CollectionFieldsComponent from './components/CollectionFieldsComponent';
import SettingsComponent from './components/SettingsComponent';
import LoginComponent from './components/LoginComponent';

Vue.use(Router);

const router = new Router({ 
  routes: [
    { path: '/', component: ConnectionsComponent },
    { path: '/db/:connection/list', component: DatabasesComponent },
    { path: '/db/:connection/:database/home', component: DatabaseHomeComponent },
    { path: '/db/:connection/:database/index', component: DatabaseIndexComponent },
    { path: '/coll/:connection/:database/:collection/index', component: CollectionIndexComponent },
    { path: '/coll/:connection/:database/:collection/schema', component: CollectionSchemaComponent },
    { path: '/coll/:connection/:database/:collection/filter', component: CollectionFilterComponent },
    { path: '/coll/:connection/:database/:collection/fields', component: CollectionFieldsComponent },
    { path: '/coll/:connection/:database/:collection/indexes', component: CollectionIndexesComponent },
    { path: '/settings', component: SettingsComponent },
    {
      path: '/login',
      component: LoginComponent,
      name: 'login'
    }
  ]
});

router.beforeEach((to, from, next) => {

  if (to.name === 'login') {
    next();
  }
  else if(authUser && authUser.username) {
    next();
  }
  else {
    next({ name: 'login' });
  }

});

export default router;
