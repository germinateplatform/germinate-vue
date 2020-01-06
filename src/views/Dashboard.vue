<template>
  <div class="animated fadeIn">
    <b-row class="dashboard-stats" v-if="stats">
      <b-col cols=12 sm=6 xl=3 v-for="(category, index) in dashboardCategories" :key="'dashboard-stats-' + category.key">
        <router-link :to="{ name: category.link }" :title="`${category.text()}: ${stats[category.key]}`">
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
    <ImageCarousel class="mb-4" />

    <h1>{{ $t('pageDashboardTitle') }}</h1>
    <p v-html="$t('pageDashboardText')" />

    <b-button variant="primary" @click="startIntroduction"><i class="mdi mdi-18px fix-alignment mdi-presentation-play" /> {{ $t('widgetIntroTourButtonText') }}</b-button>

    <hr />
    <NewsSection :projectCount="3" :newsCount="6" />
  </div>
</template>

<script>
import ImageCarousel from '@/components/images/ImageCarousel'
import NewsSection from '@/components/news/NewsSection'
import statsApi from '@/mixins/api/stats.js'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  name: 'dashboard',
  components: {
    ImageCarousel,
    NewsSection
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
          link: 'germplasm'
        },
        {
          key: 'markers',
          text: () => this.$t('dashboardBannerMarkers'),
          icon: 'mdi-dna',
          link: 'markers'
        },
        {
          key: 'traits',
          text: () => this.$t('dashboardBannerTraits'),
          icon: 'mdi-tag-text-outline',
          link: 'traits'
        },
        {
          key: 'locations',
          text: () => this.$t('dashboardBannerLocations'),
          icon: 'mdi-map-marker',
          link: 'locations'
        },
        {
          key: 'groups',
          text: () => this.$t('dashboardBannerGroups'),
          icon: 'mdi-group',
          link: 'groups'
        },
        {
          key: 'compounds',
          text: () => this.$t('dashboardBannerCompounds'),
          icon: 'mdi-atom',
          link: 'compounds'
        }
      ]
    }
  },
  computed: {
    dashboardCategories: function () {
      if (this.serverSettings && this.serverSettings.dashboardCategories) {
        return this.serverSettings.dashboardCategories.map(c => this.statCategories.find(s => s.key === c))
      } else {
        return this.statCategories
      }
    }
  },
  mixins: [ statsApi ],
  methods: {
    startIntroduction: function () {
      EventBus.$emit('show-introduction')
    },
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
