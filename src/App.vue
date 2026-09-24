<template>
  <div id="app" :class="['app-layout', `theme_${theme}`]">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo() {
    // Фон html совпадает с темой — без белых полос при прокрутке за край.
    return { htmlAttrs: { lang: 'ru', class: `html_${this.theme}` } };
  },
  computed: {
    theme() { return this.$store.state.theme.current; },
  },
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
.app-layout { min-height: 100vh; }

/* ===== theme_foxexeDark — фон и базовые цвета из index.min.css drova.io ===== */
html.html_foxexeDark, html.html_foxexeDark body { background-color: #0e0e0e; }
.theme_foxexeDark {
  color: #fff;
  background:
    radial-gradient(circle farthest-side at 0% 50%, #0e0e0e 23.5%, transparent 0) 21px 30px,
    radial-gradient(circle farthest-side at 0% 50%, #250000 24%, transparent 0) 19px 30px,
    linear-gradient(#0e0e0e 14%, transparent 0, transparent 85%, #0e0e0e 0) 0 0,
    linear-gradient(150deg, #0e0e0e 24%, #400 0, #200 26%, transparent 0, transparent 74%, #200 0, #2f0202 76%, #0e0e0e 0) 0 0,
    linear-gradient(30deg, #0e0e0e 24%, #000 0, #1f0000 26%, transparent 0, transparent 74%, #790000 0, #1f0000 76%, #0e0e0e 0) 0 0,
    linear-gradient(90deg, #1f0000 2%, #0e0e0e 0, #0e0e0e 98%, #1f0000 0%) 0 0 #0e0e0e;
  background-size: 40px 60px;
  background-color: #000;
}
</style>
