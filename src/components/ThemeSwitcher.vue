<template>
  <RadioGroup :value="current" type="button" size="small" class="theme-switcher" @on-change="setTheme">
    <Radio v-for="theme in themes" :key="theme" :label="theme">{{ $t(`merchantStations.theme.${theme}`) }}</Radio>
  </RadioGroup>
</template>

<script>
import { THEMES } from '@/store/theme';

// Для автономной версии; в drova.io есть собственный ThemeSwitcher.
export default {
  name: 'ThemeSwitcher',
  data: () => ({ themes: THEMES }),
  computed: {
    current() { return this.$store.state.theme.current; },
  },
  methods: {
    setTheme(theme) { this.$store.commit('theme/setTheme', theme); },
  },
};
</script>
