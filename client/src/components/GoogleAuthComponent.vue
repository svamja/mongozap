<template>


<div>

  <div class="container my-3">
    <div class="row border border-round">
      <div class="col p-3 text-center">
        <div class="h3">
          Completing Google Connect..
        </div>
      </div>
    </div>
  </div>

</div>

</template>

<script>

import ConfigService from '../ConfigService';
import MongoService from '../MongoService';

export default {

  data() {
    return {
    }
  },


  async created () {
    const authUser = ConfigService.get('authUser');
    const username = authUser.username;
    await MongoService.get(this, 'save_token', { username });
    this.$router.push(`/settings`);
  },
  
  methods: {
  },

}


</script>

