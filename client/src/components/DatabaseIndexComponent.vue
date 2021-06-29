<template>


<div class="container">

  <div class="row">
    <div class="col">
      <b-button variant="link" to="/">
        <span class="fa fa-home"></span>
      </b-button>
      <span class="text-muted">/</span>
      <b-button variant="link" :to="`/db/${connection}/list`">{{ connection_name }} </b-button>
      <span class="text-muted">/</span>
      <b-button variant="link" :to="`/db/${connection}/${database}/index`">{{ database }}</b-button>
      <span class="text-muted">/</span>
      <b-dropdown id="dropdown-dropright" dropright text="Collections" variant="muted" class="text-muted">
        <b-dropdown-item :to="`/db/${connection}/${database}/index`">Collections</b-dropdown-item>
        <b-dropdown-item :to="`/db/${connection}/${database}/home`">Stats</b-dropdown-item>
      </b-dropdown>
    </div>
    <div class="col-auto my-auto pl-0 ml-auto">
      <a v-b-modal.new-collection-modal class="text-primary"
        v-b-tooltip.hover title="New Collection">
        <span class="fa fa-plus"></span>
      </a>
      <a class="ml-2" v-shortkey.once="['r']"
        @shortkey="reload()" href="#" @click.stop.prevent="reload()"
        v-b-tooltip.hover title="Reload (r)">
        <span class="fa fa-sync"></span>
      </a>
      <a v-b-modal.toggle-favorites-modal class="ml-2"
        v-b-tooltip.hover title="Toggle Favorites">
        <span class="far fa-star"></span>
      </a>
    </div>

  </div>

  <!-- Search Bar -->
  <div class="row my-2">
    <div class="col">
      <form @submit.prevent="endSearch">
        <b-form-input v-model="search_text" placeholder="Search (/)" v-shortkey.focus="['/']"></b-form-input>
      </form>
    </div>
  </div>

  <!-- Filtered Collections  -->
  <div class="row">
    <div class="col-md-4 col-sm-6" v-for="collection in filtered_collections"
      :key="collection.name">
      <router-link :to="`/coll/${connection}/${database}/${collection.name}/index`">
        {{ collection.displayName }}
        <span v-if="collection.displayCount">({{ collection.displayCount }})</span>
      </router-link>
      <span @click.stop.prevent="toggleFavorite(collection)">
        <span v-if="collection.is_favorite">
          <i class="text-warning fa fa-star"></i>
        </span>
        <span v-else>
          <i class="text-grey far fa-star"></i>
        </span>
      </span>

    </div>
  </div>

  <!-- New Collection Modal -->
  <b-modal id="new-collection-modal" title="New Collection"
    ok-title="Create"
    @ok="createCollection()">
    <p>
      Collection Name
        <b-input
          v-model="new_collection_name" 
          autofocus></b-input>
    </p>
  </b-modal>

  <!-- Toggle Favories -->
  <b-modal id="toggle-favorites-modal" title="Toggle Favories"
    :ok-title="all_favorites ? 'Clear All' : 'Favorite All'"
    @ok="toggleAllFavorites()">
    <p v-if="all_favorites">
      Clear all favorites from this database.
    </p>
    <p v-else>
      Mark favorite all collections!
    </p>
  </b-modal>


</div>

</template>

<script>

import _ from 'lodash';
import ConfigService from '../ConfigService';
import MongoService from '../MongoService';

export default {
  data() {
    return {
      connection: '',
      database: '',
      connection_name: '',
      search_text: '',
      new_collection_name: '',
      collections: [],
      single_filter: false,

      // Favorites
      favorites: [],
      all_favorites: false,

    }
  },
  async created () {
    this.connection = this.$route.params.connection;
    this.database = this.$route.params.database;
    document.title = this.database;
    let connections = await ConfigService.getConnections();
    if(connections) {
      this.connection_name = connections[this.connection].name;
    }
    this.favorites = ConfigService.get('favorites') || [];
    await this.reload(true);
  },
  computed: {
    filtered_collections() {
      if(!this.search_text || !this.search_text.trim()) {
        return this.collections;
      }
      let chars = this.search_text.trim().split('');
      let expression = '^' + chars.join('.*');
      return this.collections.filter(x => x.name.match(new RegExp(expression, 'i')));
    }
  },
  watch: {
    filtered_collections(val) {
      this.single_filter = val && val.length == 1;
    },
  },
  methods: {

    async reload(useCache = false) {
      this.collections = await this.getCacheCollections(useCache);
      let favorites = _(this.favorites)
        .filter(x => x.connection == this.connection && x.database == this.database)
        .map('collection')
        .value();
      const displayField = ConfigService.get('collection_display');
      this.collections.forEach(function(coll) {
        coll.displayName = coll[displayField];
        if(coll.count) {
          if(coll.count > 1000 && coll.count < 1000000) {
            coll.displayCount = Math.floor(coll.count/1000) + 'k';
          }
          else if(coll.count > 1000000) {
            coll.displayCount = Math.floor(coll.count/1000000) + 'm';
          }
          else {
            coll.displayCount = '' + coll.count;
          }
        }
        if(favorites.includes(coll.name)) {
          coll.is_favorite = true;
        }
      });
    },

    toggleFavorite(collection) {
      let self = this;
      let find_favorite = _.find(this.favorites, function(x) {
          return x.connection == self.connection && 
            x.database == self.database &&
            x.collection == collection.name
      });
      if(find_favorite) {
        this.favorites = _.reject(this.favorites, function(x) {
            return x.connection == self.connection && 
              x.database == self.database &&
              x.collection == collection.name
        });
      }
      else {
        this.favorites.push({
          connection: this.connection,
          database: this.database,
          collection: collection.name
        });
      }
      this.reload(true);
      ConfigService.set('favorites', this.favorites);
    },

    toggleAllFavorites() {
      this.all_favorites = !this.all_favorites;
      let self = this;
      let favorites = _.reject(this.favorites, function(x) {
          return x.connection == self.connection && 
            x.database == self.database
      });
      if(this.all_favorites) {
        for(let collection of this.collections) {
          favorites.push({
            connection: this.connection,
            database: this.database,
            collection: collection.name
          });
        }
      }
      this.favorites = favorites;
      this.reload(true);
      ConfigService.set('favorites', this.favorites);
    },
    
    endSearch() {
      if(this.filtered_collections.length) {
        let collection = this.filtered_collections[0];
        if(this.filtered_collections.length > 1) {
          let search_alpha = this.search_text.toLowerCase().replace(/[^a-z]/g, '');
          for(let index in this.filtered_collections) {
            let coll = this.filtered_collections[index];
            let alpha = coll.name.toLowerCase().replace(/[^a-z]/g, '');
            if(alpha == search_alpha) {
              collection = coll;
              break;
            }
          }
        }
        this.$router.push(`/coll/${this.connection}/${this.database}/${collection.name}/index`);
      }
    },

    async getCacheCollections(useCache) {
      let cache_key = 'colls:' + this.connection + ':' + this.database;
      let collections;
      if(useCache) {
        collections = ConfigService.get(cache_key);
      }
      if(!collections) {
        collections = await MongoService.get(this, 'collections');
        collections = _.sortBy(collections, [ 'name' ]);
        ConfigService.set(cache_key, collections);
      }
      return collections;
    },

    createCollection() {
      this.$router.push(`/coll/${this.connection}/${this.database}/${this.new_collection_name}/index`);
    },


  }
}


</script>

<style scoped>

.text-grey {
  color: #ccc;
}

</style>
