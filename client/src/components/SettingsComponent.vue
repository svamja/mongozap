<template>


<div>
  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        Settings
      </div>
    </div>
  </div>
  <div class="container table-container">
    <div class="row">
      <div class="col">
        Collection Display
      </div>
      <div class="col">
        <input type="radio" value="name" v-model="collection_display" />&nbsp;
        <label for="one">By Name</label>
        <br />
        <input type="radio" value="model_name" v-model="collection_display" />&nbsp;
        <label for="two">By Model Name</label>
      </div>
    </div>
    <div class="row">
      <div class="col">
        Records Display Default (TBD)
      </div>
      <div class="col">
        <input type="radio" value="table" v-model="records_display_default" />&nbsp;
        <label for="one">Tabular</label>
        <br />
        <input type="radio" value="json" v-model="records_display_default" />&nbsp;
        <label for="two">JSON</label>
      </div>
    </div>
  </div>
</div>

</template>

<script>

import ConfigService from '../ConfigService';

export default {
  data() {
    return {
      collection_display: 'name',
      records_display_default: 'table'
    }
  },
  async created () {
    this.collection_display = ConfigService.get('collection_display');
    this.records_display_default = ConfigService.get('records_display_default') || 'table';
  },
  watch: {
    collection_display(val) {
      ConfigService.set('collection_display', val);
    },
    records_display_default(val) {
      ConfigService.set('records_display_default', val);
    }
  }

}


</script>

<style scoped>

.table-container .row {
  border-top: solid 1px #ccc;
}
.table-container .row:last-child {
  border-bottom: solid 1px #ccc;
}

</style>
