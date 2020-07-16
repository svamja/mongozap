<template>

<div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        Connections
        <span class="fa fa-plus ml-3 text-primary"></span>
      </div>
    </div>
  </div>


  <!-- No Connections  -->
  <div v-if="isEmpty" class="container">
    <div class="row">
      <div class="col border p-5 text-center">
        <div class="h4">
          No Connections
        </div>
        <div>
          <a class="btn btn-primary" @click="addConnection">
            Add Connection
          </a>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="container table-container">
    <div class="row py-2 h4" v-for="(connection, index) in connections" :key="connection.url">
      <div class="col">
        <router-link :to="'/db/' + index + '/list'">
          {{ index + 1 }}. {{ connection.url }}
        </router-link>
      </div>
      <div class="col text-center">
        <span class="text-warning fa fa-trash"></span>
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
      connections: [],
      isEmpty: false,
    }
  },

  async created () {
    this.connections = ConfigService.get('connections') || [];
    if(!this.connections.length) {
        let url = 'http://localhost:27017/';
        this.addConnection(url);
    }
    if(!this.connections || !this.connections.length) {
        this.isEmpty = true;
    }
  },

  methods: {

    addConnection(url) {
        this.connections.push({ url });
        ConfigService.set('connections', this.connections);
    },

  },

}
  

</script>

<style scoped>

</style>
