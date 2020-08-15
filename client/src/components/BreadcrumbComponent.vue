<template>


<div>

  <!-- Breadcrumb -->
  <b-button variant="link" :to="`/db/${connection}/${database}/index`">{{ database }}</b-button>
  <span class="text-muted">/</span>
  <b-button variant="link" :to="`/coll/${connection}/${database}/${collection}/index`">{{ displayCollection }}</b-button>
  <span class="text-muted">/</span>
  <b-dropdown id="dropdown-dropright" dropright :text="action" variant="muted" class="text-muted">
    <b-dropdown-item href="#">Home</b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/indexes`">
        Indexes
    </b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/index`">
        Browse
    </b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/filter`">Filter</b-dropdown-item>
    <b-dropdown-item href="#" :to="`/coll/${connection}/${database}/${collection}/schema`">
        Schema
    </b-dropdown-item>
    <b-dropdown-item href="#" v-b-modal.clear-confirmation-modal variant="danger">Clear</b-dropdown-item>
    <b-dropdown-item href="#" v-b-modal.drop-confirmation-modal variant="danger">Drop</b-dropdown-item>
  </b-dropdown>

</div>

</template>

<script>

export default {
  props: [ "connection", "database", "collection",  "displayCollection", "action" ]
}


</script>

