<template>
  <!-- transfer=false: окно остаётся внутри .theme_* и получает стили темы -->
  <Modal
    :value="!!station"
    :title="station ? station.title : ''"
    :transfer="false"
    class-name="station-details"
    width="720"
    footer-hide
    @on-visible-change="onVisible"
  >
    <template v-if="station">
      <dl v-if="hardware" class="details__hw">
        <template v-if="hardware.gpu"><dt>{{ $t('merchantStations.hw.gpu') }}</dt><dd>{{ hardware.gpu }} {{ hardware.gpuRam }}</dd></template>
        <template v-if="hardware.cpu"><dt>{{ $t('merchantStations.hw.cpu') }}</dt><dd>{{ hardware.cpu }}</dd></template>
        <template v-if="hardware.ram"><dt>{{ $t('merchantStations.hw.ram') }}</dt><dd>{{ hardware.ram }}</dd></template>
      </dl>

      <template v-if="descriptionHtml">
        <h4 class="details__heading">{{ $t('merchantStations.description') }}</h4>
        <!-- HTML мерчанта прошёл sanitizeDescription: только p/br/b/i/a[http(s)] -->
        <div class="details__description" v-html="descriptionHtml" />
      </template>

      <h4 class="details__heading">
        {{ $t('merchantStations.library') }} ({{ station.productList.length }})
      </h4>
      <Input v-model="query" :placeholder="$t('merchantStations.searchInLibrary')" clearable prefix="ios-search" />
      <Spin v-if="catalogLoading" class="details__spin">{{ $t('merchantStations.loadingCatalog') }}</Spin>
      <ul v-else-if="catalog" class="details__games">
        <li v-for="game in games" :key="game.id">
          <img :src="game.cardPicture" alt="" loading="lazy">
          <span>{{ game.title }}</span>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script>
import { mapState } from 'vuex';
import { sanitizeDescription } from '@/utils/station';

export default {
  name: 'StationDetailsModal',
  props: {
    station: { type: Object, default: null },
    hardware: { type: Object, default: null },
  },
  data: () => ({ query: '' }),
  computed: {
    ...mapState('merchantStations', ['catalog', 'catalogLoading']),
    descriptionHtml() { return this.station ? sanitizeDescription(this.station.description) : ''; },
    games() {
      const q = this.query.trim().toLowerCase();
      return this.station.productList
        .map((id) => ({ id, ...this.catalog[id] }))
        .filter((g) => g.title && (!q || g.title.toLowerCase().includes(q)))
        .sort((a, b) => a.title.localeCompare(b.title));
    },
  },
  watch: {
    station(s) {
      if (s) this.$store.dispatch('merchantStations/loadCatalog');
    },
  },
  methods: {
    onVisible(visible) {
      if (!visible) {
        this.query = '';
        this.$emit('close');
      }
    },
  },
};
</script>

<style scoped>
.details__hw { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; margin: 0 0 12px; }
.details__hw dt { font-weight: 600; color: #464c5b; }
.details__hw dd { margin: 0; }
.details__heading { margin: 16px 0 8px; color: #464c5b; }
.details__description { font-size: 14px; overflow-wrap: anywhere; }
.details__description >>> p { margin: 0 0 6px; }
.details__spin { margin: 16px 0; }
.details__games {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  max-height: 50vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}
.details__games li { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.details__games img { width: 64px; height: 30px; object-fit: cover; border-radius: 3px; background: #e3e8ee; flex: none; }

.theme_foxexeDark .details__hw dt,
.theme_foxexeDark .details__heading { color: #fff; }
.theme_foxexeDark .details__hw dd,
.theme_foxexeDark .details__description,
.theme_foxexeDark .details__games li { color: #ddd; }
.theme_foxexeDark .details__description >>> a { color: #007bff; }
.theme_foxexeDark .details__games img { background: #1e1e1e; }
</style>

<style>
/* Корень окна iView рендерит сам — стили без scoped. theme_foxexeDark: .modal на drova.io */
.theme_foxexeDark .station-details .ivu-modal-content {
  color: #fff;
  background: #1e1e1e;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.8);
}
.theme_foxexeDark .station-details .ivu-modal-header { border-bottom-color: #333; }
.theme_foxexeDark .station-details .ivu-modal-header-inner { color: #fff; }
.theme_foxexeDark .station-details .ivu-modal-close .ivu-icon-ios-close { color: #ccc; }
</style>
