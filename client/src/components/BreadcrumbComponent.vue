<template>


<div>

  <!-- Breadcrumb -->
  <b-button variant="link" to="/">
    <span class="fa fa-home"></span>
  </b-button>
  <span class="text-muted">/</span>
  <b-button variant="link" :to="`/db/${connection}/list`">{{ connection_name }} </b-button>
  <span class="text-muted">/</span>
  <b-button variant="link" :to="`/db/${connection}/${database}/index`">{{ database }} (d) </b-button>
  <span class="text-muted">/</span>
  <b-button variant="link" :to="`/coll/${connection}/${database}/${collection}/index`">{{ displayCollection }} (h) </b-button>
  <span class="text-muted">/</span>
  <b-dropdown id="dropdown-dropright" dropright :text="action" variant="muted" class="text-muted">
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/index`">
      Home (h)
    </b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/filter`">
      Filter (/)
    </b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/fields`">
      Fields (f)
    </b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/schema`">
      Schema (s)
    </b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/indexes`">
      Indexes (i)
    </b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/aggregate`">
      Aggregate (a)
    </b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/views`">
      Views (v)
    </b-dropdown-item>
    <!-- <b-dropdown-item href="#" :to="`/export/${connection}/${database}/${collection}/query`">
      Export
    </b-dropdown-item> -->
    <b-dropdown-item href="#" v-if="is_allowed_clear" v-b-modal.clear-confirmation-modal variant="danger">Clear</b-dropdown-item>
    <b-dropdown-item href="#" v-if="is_allowed_drop" v-b-modal.drop-confirmation-modal variant="danger">Drop</b-dropdown-item>
  </b-dropdown>

  <!-- Hidden Keyboard Shortcuts -->
  <a v-shortkey.once="['d']" 
    :to="`/db/${connection}/${database}/index`"
    @shortkey="gotoShortcut('db')" href="#"
    >
  </a>
  <a v-shortkey.once="['h']" 
    :to="`/coll/${connection}/${database}/${collection}/index`"
    @shortkey="gotoShortcut('index')" href="#"
    >
  </a>
  <a v-shortkey.once="['/']" 
    :to="`/coll/${connection}/${database}/${collection}/filter`"
    @shortkey="gotoShortcut('filter')" href="#"
    >
  </a>
  <a v-shortkey.once="['f']" 
    :to="`/coll/${connection}/${database}/${collection}/fields`"
    @shortkey="gotoShortcut('fields')" href="#"
    >
  </a>
  <a v-shortkey.once="['i']" 
    :to="`/coll/${connection}/${database}/${collection}/indexes`"
    @shortkey="gotoShortcut('indexes')" href="#"
    >
  </a>
  <a v-shortkey.once="['a']" 
    :to="`/coll/${connection}/${database}/${collection}/aggregate`"
    @shortkey="gotoShortcut('aggregate')" href="#"
    >
  </a>
  <a v-shortkey.once="['v']" 
    :to="`/coll/${connection}/${database}/${collection}/views`"
    @shortkey="gotoShortcut('views')" href="#"
    >
  </a>
  <a v-shortkey.once="['s']" 
    :to="`/coll/${connection}/${database}/${collection}/schema`"
    @shortkey="gotoShortcut('schema')" href="#"
    >
  </a>

</div>

</template>

<script>

import ConfigService from '../ConfigService';

export default {

  props: [ "connection", "database", "collection",  "displayCollection", "action" ],

  data() {
    return {
      is_allowed_drop: false,
      is_allowed_clear: false,
      connection_name: ''
    }
  },

  async created() {
    let authUser = ConfigService.get('authUser');
    if(authUser.role === 'admin') {
      this.is_allowed_clear = true;
      this.is_allowed_drop = true;
    }
    let connections = await ConfigService.getConnections();
    if(connections) {
      this.connection_name = connections[this.connection].name;
    }
  },

  methods: {
    gotoShortcut(path_code) {
      if(path_code == 'db') {
        this.$router.push(`/db/${this.connection}/${this.database}/index`);
        return;
      }
      this.$router.push(`/coll/${this.connection}/${this.database}/${this.collection}/${path_code}`);
    },
  }
    

}


</script>

