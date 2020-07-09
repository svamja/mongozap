<template>


<div class="container">
  <div class="row">
    <div class="col h4">
      Settings
    </div>
  </div>
  <div class="row">
    <div class="col">
        Collection Display
    </div>
    <div class="col">
        <input type="radio" value="name" v-model="collection_display" />
        <label for="one">By Name</label>
        <br>
        <input type="radio" value="model_name" v-model="collection_display" />
        <label for="two">By Model Name</label>
    </div>
  </div>
</div>


</template>

<script>

import ConfigService from '../ConfigService';

export default {
  data() {
    return {
      collection_display: '',
    }
  },
  async created () {
    this.collection_display = ConfigService.get('collection_display');
  },
  watch: {
    collection_display(val) {
      ConfigService.set('collection_display', val);
    }
  }

}


</script>

<style scoped>

</style>
