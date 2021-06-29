<template>

<div>

  <!-- Connections  -->
  <div class="container">
    <div class="row mt-3">
      <div class="col h5">
        Connections
        <span class="fa fa-plus ml-3 text-primary"
          v-shortkey="[ 'shift', '+' ]"
          @shortkey="showAddModal = true"
          v-b-modal.add-connection-modal>
        </span>
      </div>
      <div class="col text-right">
        <a class="ml-2" v-shortkey.once="['r']"
          @shortkey="reload()" href="#" @click.stop.prevent="reload()"
          v-b-tooltip.hover title="Reload (r)">
          <span class="fa fa-sync"></span>
        </a>
        <a class="ml-2" v-shortkey.once="['shift', '?']"
          @shortkey="openShortcuts()" href="#" @click.stop.prevent="openShortcuts()"
          v-b-tooltip.hover title="Keyboard Shortcuts (?)">
          <span class="fa fa-question-circle"></span>
        </a>
      </div>
    </div>
  </div>

  <div class="container table-container">
    <div class="row" v-for="(connection, index) in connections" :key="connection.url">
      <div class="col-4">
        <div v-shortkey="[ index + 1 ]" @shortkey="selectConnection(index)">
          {{ index + 1 }}.
          <router-link :to="'/db/' + index + '/list'" class="ml-2">
            {{ connection.name }}
          </router-link>
        </div>
      </div>
      <div class="col-6">
        <div class="small text-muted ml-4"> {{ connection.url }} </div>
      </div>
      <div v-if="index > 0" class="col-2 text-center">
        <span class="text-warning fa fa-trash" @click="deleteConfirmation(index)"></span>
      </div>
    </div>
  </div>


  <!-- Favorites  -->
  <div class="container">
    <div class="row mt-4">
      <div class="col h5">
        Favorites
      </div>
    </div>
  </div>


  <div class="container table-container">

    <div class="row">
      <div class="col-3"> Connection# </div>
      <div class="col-3"> Database </div>
      <div class="col-6"> Collection </div>
    </div>

    <div class="row" v-for="(favorite, index) in favorites" :key="index">
      <div class="col-3"> {{ parseInt(favorite.connection) + 1 }} </div>
      <div class="col-3"> {{ favorite.database }} </div>
      <div class="col-6">
        <router-link :to="`/coll/${favorite.connection}/${favorite.database}/${favorite.collection}/index`">
          {{ favorite.collection }}
        </router-link>
        <a href="#" @click.stop.prevent="removeFavorite(favorite)" class="ml-1">
          <span class="fa fa-star text-warning"></span>
        </a>
      </div>
    </div>

  </div>


  <!-- Add Connection Modal -->
  <b-modal id="add-connection-modal" title="Add Connection" v-model="showAddModal"  @ok="addConnection()">
    <form method="post" @submit.prevent="addConnection()">
      <div>
        <b-form-input v-model="name" name="name" placeholder="Name" autofocus></b-form-input>
      </div>
      <div class="my-3">
        <b-form-input v-model="url" name="url" placeholder="URL" ></b-form-input>
      </div>
      <input type="submit" style="position: absolute; left: -9999px; visibility: hidden;" />
   </form>
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

  <!-- Keyboard Shortcuts Modal -->
  <b-modal id="shortcuts-modal" title="Keyboard Shortcuts" v-model="showShortcutsModal" ok-only>
    <table class="table table-bordered">
      <tbody>
        <tr>
          <td>+</td>
          <td>Add Connection</td>
        </tr>
        <tr>
          <td>1</td>
          <td>Go to Connection 1</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Go to Connection 2</td>
        </tr>
        <tr>
          <td>.</td>
          <td>..</td>
        </tr>
      </tbody>
    </table>
  </b-modal>

</div>


</template>

<script>

import _ from 'lodash';
import ConfigService from '../ConfigService';

export default {

  data() {
    return {
      serverSettings: {},
      connections: [],
      name: '',
      url: '',
      deleteIndex: -1,
      showDeleteModal: false,
      showAddModal: false,
      showShortcutsModal: false,
      favorites: [],
    }
  },

  async created () {
    document.title = 'MongoZap';
    let favorites = ConfigService.get('favorites') || [];
    this.favorites = _.sortBy(favorites, [ 'connection', 'database', 'collection' ]);
    await this.reload(true);
  },

  methods: {

    async addConnection() {
      if(this.url) {
        this.connections.push({ name: this.name || this.url, url: this.url });
        await ConfigService.setConnections(this.connections);
        this.name = '';
        this.url = '';
        this.showAddModal = false;
      }
    },

    async reload(useCache = false) {
      this.serverSettings = await ConfigService.getServerSettings(useCache);
      this.connections = await ConfigService.getConnections() || [];
    },

    deleteConfirmation(i) {
      this.deleteIndex = i;
      this.showDeleteModal = true;
    },

    async deleteConnection() {
      if(this.deleteIndex > 0) {
        this.connections.splice(this.deleteIndex, 1)
        await ConfigService.setConnections(this.connections);
        this.deleteIndex = -1;
      }
    },

    selectConnection(index) {
        this.$router.push('/db/' + index + '/list');
    },

    openShortcuts() {
      this.showShortcutsModal = true;
    },

    removeFavorite(favorite) {
      this.favorites = _.reject(this.favorites, function(x) {
          return x.connection == favorite.connection && 
            x.database == favorite.database &&
            x.collection == favorite.collection
      });
      ConfigService.set('favorites', this.favorites);
    },
    
  },

}
  

</script>

<style scoped>

</style>
