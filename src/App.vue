<template>
  <div id="app" class="drova-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo: { htmlAttrs: { lang: 'ru' } },
};
</script>

<style>
body {
  margin: 0;
  font-family: Montserrat, Halvetic, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #657180;
  background-color: #fff;
  -webkit-font-smoothing: antialiased;
}
</style>
