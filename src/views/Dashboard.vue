<template>
  <div class="animated fadeIn">
    <b-row class="dashboard-stats" v-if="stats">
      <b-col cols=12 sm=6 xl=3 v-for="(category, index) in statCategories" :key="'dashboard-stats-' + category.key">
        <router-link :to="category.link" :title="`${category.text()}: ${stats[category.key]}`">
          <b-card no-body :style="`border: 1px solid ${getColor(index)}`">
            <b-card-body :style="`background-color: ${getColor(index)}; color: white;`">
              <b-row>
                <b-col cols=6 class="align-self-center">
                  <h2 class="mb-0">{{ getNumberWithSuffix(stats[category.key], 1) }}</h2>
                  <p>{{ category.text() }}</p>
                </b-col>
                <b-col cols=6 class="text-right">
                  <i :class="`mdi mdi-48px ${category.icon}`" />
                </b-col>
              </b-row>
            </b-card-body>
            <b-card-footer :style="`color: ${getColor(index)}`">
              <i class="mdi mdi-18px mdi-arrow-right-bold-circle" /><span> {{ $t('actionView') }}</span>
            </b-card-footer>
          </b-card>
        </router-link>
      </b-col>
    </b-row>
    <ImageCarousel />
  </div>
</template>

<script>
import ImageCarousel from '@/components/images/ImageCarousel'

export default {
  name: 'dashboard',
  components: {
    ImageCarousel
  },
  data: function () {
    return {
      stats: null,
      images: null,
      statCategories: [
        {
          key: 'germplasm',
          text: () => this.$t('dashboardBannerGermplasm'),
          icon: 'mdi-sprout',
          link: '/data/germplasm'
        },
        {
          key: 'markers',
          text: () => this.$t('dashboardBannerMarkers'),
          icon: 'mdi-dna',
          link: '/data/genotypes/maps'
        },
        {
          key: 'traits',
          text: () => this.$t('dashboardBannerTraits'),
          icon: 'mdi-tag-text-outline',
          link: '/data/traits'
        },
        {
          key: 'locations',
          text: () => this.$t('dashboardBannerLocations'),
          icon: 'mdi-map-marker',
          link: '/geo/locations'
        }
      ]
    }
  },
  methods: {
    getColor: function (index) {
      if (!this.serverSettings || !this.serverSettings.colorsTemplate) {
        return '#00acef'
      } else {
        const colors = this.serverSettings.colorsTemplate
        return colors[index % colors.length]
      }
    }
  },
  mounted: function () {
    this.apiGetOverviewStats(result => {
      this.stats = result
    })
  }
}
</script>

<style scoped>
.dashboard-stats p {
  margin-bottom: 0;
}
.dashboard-stats *:hover {
  text-decoration: none;
}
.dashboard-stats .card-footer i.mdi {
  vertical-align: sub;
}
</style>
