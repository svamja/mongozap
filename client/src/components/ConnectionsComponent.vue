<template>

<div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        Connections
        <span class="fa fa-plus ml-3 text-primary" v-b-modal.add-connection-modal></span>
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
          <a class="btn btn-primary" v-b-modal.add-connection-modal>
            Add Connection
          </a>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="container table-container">
    <div class="row py-2 h4" v-for="(connection, index) in connections" :key="connection.url">
      <div class="col">
        <div>
          {{ index + 1 }}.  
          <router-link :to="'/db/' + index + '/list'">
            {{ connection.name }}
          </router-link>
        </div>
        <div class="small text-muted ml-4"> {{ connection.url }} </div>
      </div>
      <div class="col text-center">
        <span class="text-warning fa fa-trash" @click="deleteConfirmation(index)"></span>
      </div>
    </div>
  </div>

  <!-- Add Connection Modal -->
  <b-modal id="add-connection-modal" title="Add Connection" @ok="addConnection()">
    <div>
      <b-form-input v-model="name" placeholder="Name" autofocus></b-form-input>
    </div>
    <div class="my-3">
      <b-form-input v-model="url" placeholder="URL" ></b-form-input>
    </div>
  </b-modal>

  <!-- Delete Confirmation Modal -->
  <b-modal id="delete-confirmation-modal" title="Confirmation"
    ok-variant="danger" ok-title="Delete Connection"
    v-model="showDeleteModal"
    @ok="deleteConnection()">
    <p>
      This will simply delete the connection. It will not delete any underlying data. <br/>
      You can add the connection again and view the data.
    </p>
    <p>Proceed?</p>
  </b-modal>



</div>


</template>

<script>

import ConfigService from '../ConfigService';

export default {

  data() {
    return {
      connections: [],
      isEmpty: false,
      name: '',
      url: '',
      deleteIndex: -1,
      showDeleteModal: false,
    }
  },

  async created () {
    this.connections = ConfigService.get('connections') || [];
    if(!this.connections.length) {
        this.name = 'Default (localhost)';
        this.url = 'mongodb://localhost:27017/';
        this.addConnection();
    }
    if(!this.connections || !this.connections.length) {
        this.isEmpty = true;
    }
  },

  methods: {

    addConnection() {
      if(this.url) {
        this.connections.push({ name: this.name || this.url, url: this.url });
        ConfigService.set('connections', this.connections);
        this.name = '';
        this.url = '';
      }
    },

    deleteConfirmation: function(i) {
      this.deleteIndex = i;
      this.showDeleteModal = true;
    },

    deleteConnection: function() {
      if(this.deleteIndex > -1) {
        this.connections.splice(this.deleteIndex, 1)
        ConfigService.set('connections', this.connections);
        this.deleteIndex = -1;
      }
    },

  },

}
  

</script>

<style scoped>

</style>
