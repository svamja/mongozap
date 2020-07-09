<template>
  <div id="app">
    <MasterLayout />
  </div>
</template>

<script>
import MasterLayout from './components/MasterLayout.vue'

export default {
  name: 'App',
  components: {
    MasterLayout
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
