<template>
  <header class="merchant-header">
    <div class="merchant-header__top">
      <div>
        <h1 class="merchant-header__title">{{ $t('merchantStations.title', { name: merchant.name }) }}</h1>
        <p v-if="merchant.city" class="merchant-header__city">{{ merchant.city }}</p>
        <p v-if="merchant.links.length" class="merchant-header__links">
          <a v-for="link in merchant.links" :key="link.url" :href="link.url" target="_blank" rel="noopener">{{ link.title }}</a>
        </p>
      </div>
      <div class="merchant-header__tools">
        <span v-if="updatedAt">{{ $t('merchantStations.updated', { time: updatedTime }) }}</span>
        <Button icon="md-refresh" :loading="loading" @click="refresh">{{ $t('merchantStations.refresh') }}</Button>
        <ThemeSwitcher />
      </div>
    </div>

    <!-- Разделы витрины: как «Сервера» / «Игры» в меню drova.io -->
    <nav class="merchant-header__tabs">
      <router-link :to="{ name: 'merchant-stations', params: { merchantId } }" class="merchant-header__tab" exact-active-class="merchant-header__tab_active">
        {{ $t('merchantStations.tabs.stations') }}
      </router-link>
      <router-link :to="{ name: 'merchant-games', params: { merchantId } }" class="merchant-header__tab" exact-active-class="merchant-header__tab_active">
        {{ $t('merchantStations.tabs.games') }}<span v-if="games.length"> ({{ games.length }})</span>
      </router-link>
    </nav>
  </header>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import { merchantInfo } from '@/config';

const NS = 'merchantStations';

// Шапка витрины мерчанта: название, ссылки, обновление, тема и вкладки «Станции / Игры».
export default {
  name: 'MerchantHeader',
  components: { ThemeSwitcher },
  props: {
    merchantId: { type: String, required: true },
  },
  computed: {
    ...mapState(NS, ['loading', 'updatedAt']),
    ...mapGetters(NS, ['games']),
    merchant() { return merchantInfo(this.merchantId); },
    updatedTime() {
      return new Date(this.updatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    },
  },
  methods: {
    async refresh() {
      await this.$store.dispatch(`${NS}/refresh`);
      this.$store.dispatch(`${NS}/loadHardware`);
      this.$store.dispatch(`${NS}/loadCurrentProducts`);
    },
  },
};
</script>

<style scoped>
.merchant-header { margin-bottom: 20px; }
.merchant-header__top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.merchant-header__title { margin: 0; font-size: 28px; font-weight: 700; color: #464c5b; }
.merchant-header__city { margin: 4px 0 0; }
.merchant-header__links { margin: 4px 0 0; display: flex; gap: 12px; }
.merchant-header__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font-size: 13px; }
.merchant-header__tabs {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  border-bottom: 1px solid #e3e8ee;
}
.merchant-header__tab {
  padding: 6px 2px;
  margin-bottom: -1px;
  font-size: 18px;
  font-weight: 600;
  color: #657180;
  border-bottom: 3px solid transparent;
}
.merchant-header__tab:hover { color: #2d8cf0; }
.merchant-header__tab_active { color: #2d8cf0; border-bottom-color: #2d8cf0; }

.theme_foxexeDark .merchant-header__title { color: #fff; }
.theme_foxexeDark .merchant-header__city,
.theme_foxexeDark .merchant-header__tools { color: #ccc; }
.theme_foxexeDark .merchant-header__links a { color: #007bff; }
.theme_foxexeDark .merchant-header__tabs { border-bottom-color: #333; }
.theme_foxexeDark .merchant-header__tab { color: #ccc; }
.theme_foxexeDark .merchant-header__tab:hover { color: #fff; }
.theme_foxexeDark .merchant-header__tab_active { color: #0c6; border-bottom-color: #0c6; }
</style>
