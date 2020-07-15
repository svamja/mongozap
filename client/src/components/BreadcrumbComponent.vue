<template>


<div>

  <!-- Breadcrumb -->
  <b-button class="ml-0 pl-0" variant="link" to="/databases">Databases</b-button>
  <span class="text-muted">/</span>
  <b-button variant="link" :to="'/database/' + database + '/collections'">{{ database }}</b-button>
  <span class="text-muted">/</span>
  <b-button variant="link" :to="'/collection/' + collection + '/index'">{{ displayCollection }}</b-button>
  <span class="text-muted">/</span>
  <b-dropdown id="dropdown-dropright" dropright :text="action" variant="muted" class="text-muted">
    <b-dropdown-item href="#">Home</b-dropdown-item>
    <b-dropdown-item href="#" :to="'/collection/' + collection + '/index'">
        Browse
    </b-dropdown-item>
    <b-dropdown-item href="#" v-b-modal.search-modal>Search</b-dropdown-item>
    <b-dropdown-item href="#" :to="'/collection/' + collection + '/schema'">
        Schema
    </b-dropdown-item>
    <b-dropdown-item href="#" v-b-modal.clear-confirmation-modal variant="danger">Clear</b-dropdown-item>
    <b-dropdown-item href="#" v-b-modal.drop-confirmation-modal variant="danger">Drop</b-dropdown-item>
  </b-dropdown>

</div>

</template>

<script>

import ConfigService from '../ConfigService';

export default {
  props: [ "database", "collection",  "displayCollection", "action" ]
}


</script>

