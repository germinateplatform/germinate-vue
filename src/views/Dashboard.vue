<template>
  <div class="animated fadeIn">
    <b-row class="dashboard-stats" v-if="stats">
      <!-- Banner buttons -->
      <b-col cols=12 sm=6 xl=3 v-for="(category, index) in dashboardCategories" :key="'dashboard-stats-' + category.value">
        <router-link :disabled="isDisabled(category.link)" :event="isDisabled(category.link) ? '' : 'click'" :to="{ name: category.link, params: category.params }" :title="`${category.textI18n()}: ${$options.filters.toThousandSeparators(stats[category.value])}`">
          <b-card no-body :style="`border: 1px solid ${getColor(index)}`">
            <b-card-body :style="`background-color: ${getColor(index)}; color: white;`">
              <b-row>
                <b-col cols=6 class="align-self-center">
                  <h2 class="mb-0">{{ getNumberWithSuffix(stats[category.value], 1) }}</h2>
                  <p>{{ category.textI18n() }}</p>
                </b-col>
                <b-col cols=6 class="text-right">
                  <i :class="`mdi mdi-48px fix-alignment ${category.icon}`" />
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

    <!-- Images -->
    <ImageCarousel class="mb-4" />

    <!-- Heading and welcome text -->
    <h1>{{ $t('pageDashboardTitle') }}</h1>
    <p v-html="$t('pageDashboardText')" />

    <!-- Publications -->
    <div v-if="showPublications || (token && userIsAtLeast(token.userType, 'Data Curator'))" class="mb-4">
      <h2>{{ $t('pageDashboardPublicationsTitle') }}</h2>
      <p>{{ $t('pageDashboardPublicationsText') }}</p>

      <PublicationsWidget referenceType="database" @publication-count-changed="count => showPublications = count > 0"/>
    </div>

    <!-- Introduction tour -->
    <b-button variant="primary" @click="startIntroduction"><i class="mdi mdi-18px fix-alignment mdi-presentation-play" /> {{ $t('widgetIntroTourButtonText') }}</b-button>

    <hr />
    <!-- News -->
    <NewsSection :projectCount="4" :newsCount="6" />
  </div>
</template>

<script>
import ImageCarousel from '@/components/images/ImageCarousel'
import NewsSection from '@/components/news/NewsSection'
import PublicationsWidget from '@/components/util/PublicationsWidget'
import statsApi from '@/mixins/api/stats.js'
import typesMixin from '@/mixins/types.js'
import colorMixin from '@/mixins/colors.js'
import { mapFilters } from '@/plugins/map-filters.js'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  name: 'dashboard',
  components: {
    ImageCarousel,
    NewsSection,
    PublicationsWidget
  },
  data: function () {
    return {
      showPublications: true,
      stats: null,
      images: null,
    }
  },
  computed: {
    dashboardCategories: function () {
      if (this.serverSettings && this.serverSettings.dashboardCategories) {
        return this.statCategories.filter(d => this.serverSettings.dashboardCategories.indexOf(d.value) !== -1)
      } else {
        return this.statCategories
      }
    }
  },
  mixins: [ statsApi, colorMixin, typesMixin ],
  methods: {
    ...mapFilters(['toThousandSeparators']),
    startIntroduction: function () {
      EventBus.$emit('show-introduction')
    },
    isDisabled: function (routerPage) {
      return this.serverSettings && this.serverSettings.hiddenPages.indexOf(routerPage) !== -1
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
</style>
