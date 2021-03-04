<template>

<div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
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
    <div class="row py-2 h4" v-for="(connection, index) in connections" :key="connection.url">
      <div class="col">
        <div v-shortkey="[ index + 1 ]" @shortkey="selectConnection(index + 1)">
          {{ index + 1 }}.  
          <router-link :to="'/db/' + index + '/list'">
            {{ connection.name }}
          </router-link>
        </div>
        <div class="small text-muted ml-4"> {{ connection.url }} </div>
      </div>
      <div v-if="index > 0" class="col text-center">
        <span class="text-warning fa fa-trash" @click="deleteConfirmation(index)"></span>
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
          <td>Connection 1</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Connection 2</td>
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
    }
  },

  async created () {
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
    
  },

}
  

</script>

<style scoped>

</style>
