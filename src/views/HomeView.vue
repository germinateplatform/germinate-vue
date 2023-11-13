<template>
  <div>
    <b-row class="dashboard-stats" v-if="stats">
      <!-- Banner buttons -->
      <b-col cols=12 sm=6 xl=3 v-for="(category, index) in dashboardCategories" :key="'dashboard-stats-' + category.value" class="my-2">
        <b-card no-body :style="`border: 1px solid ${getTemplateColor(index)}`">
          <b-card-body :style="`background: linear-gradient(330deg, ${getBrighterColor(index)} 0%, ${getTemplateColor(index)} 50%); color: white;`">
            <b-row>
              <b-col cols=6 class="align-self-center">
                <h2 class="mb-0">{{ getNumberWithSuffix(stats[category.value], 1) }}</h2>
                <span>{{ category.textI18n() }}</span>
              </b-col>
              <b-col cols=6 class="d-flex align-items-center justify-content-end dashboard-icon">
                <MdiIcon :size="48" :path="category.path" />
              </b-col>
            </b-row>
            <router-link class="stretched-link" :disabled="isDisabled(category.link)" :event="isDisabled(category.link) ? '' : 'click'" :to="{ name: category.link, params: category.params }" :title="`${category.textI18n()}: ${stats[category.value].toLocaleString()}`" v-if="stats[category.value]" />
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <!-- Images -->
    <ImageCarousel class="my-3" />

    <!-- Heading and welcome text -->
    <h1>{{ $t('pageDashboardTitle') }}</h1>
    <p v-html="$t('pageDashboardText')" />

    <!-- Publications -->
    <div v-if="showPublicationSection && (showPublications || (storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')))" class="mb-4">
      <h2>{{ $t('pageDashboardPublicationsTitle') }}</h2>
      <p>{{ $t('pageDashboardPublicationsText') }}</p>

      <PublicationsWidget referenceType="database" @publication-count-changed="count => showPublications = count > 0"/>
    </div>

    <template v-if="showDataStorySection && (showStories || (storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')))">
      <h1>{{ $t('pageStoriesTitle') }}</h1>
      <DataStoryWidget :filterOn="storyFilterOn" @story-count-changed="updateStories" />
    </template>

    <!-- Introduction tour -->
    <b-button variant="primary" @click="startIntroduction">
      <MdiIcon :path="mdiPresentationPlay" /> {{ $t('widgetIntroTourButtonText') }}
    </b-button>

    <hr />
    <!-- News -->
    <NewsSection :projectCount="4" :newsCount="4" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import DataStoryWidget from '@/components/util/DataStoryWidget'
import ImageCarousel from '@/components/images/ImageCarousel'
import MdiIcon from '@/components/icons/MdiIcon'
import NewsSection from '@/components/news/NewsSection'
import PublicationsWidget from '@/components/util/PublicationsWidget'

import { apiGetOverviewStats } from '@/mixins/api/stats'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { statCategories } from '@/mixins/types'
import { getTemplateColor, hexToRgb, rgbColorToHex, brighten } from '@/mixins/colors'
import { userIsAtLeast } from '@/mixins/api/auth'

import { mdiPresentationPlay } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    DataStoryWidget,
    ImageCarousel,
    MdiIcon,
    NewsSection,
    PublicationsWidget
  },
  data: function () {
    return {
      mdiPresentationPlay,
      stats: null,
      showPublications: true,
      showStories: true,
      storyFilterOn: [{
        column: 'storyFeatured',
        comparator: 'equals',
        operator: 'and',
        values: [1]
      }]
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeToken'
    ]),
    dashboardCategories: function () {
      if (this.storeServerSettings && this.storeServerSettings.dashboardCategories) {
        return statCategories.filter(d => this.storeServerSettings.dashboardCategories.indexOf(d.value) !== -1)
      } else {
        return statCategories
      }
    },
    showPublicationSection: function () {
      if (this.storeServerSettings && this.storeServerSettings.dashboardSections) {
        return this.storeServerSettings.dashboardSections.includes('publications')
      } else {
        return true
      }
    },
    showDataStorySection: function () {
      if (this.storeServerSettings && this.storeServerSettings.dashboardSections) {
        return this.storeServerSettings.dashboardSections.includes('datastories')
      } else {
        return true
      }
    }
  },
  methods: {
    userIsAtLeast,
    getTemplateColor,
    getNumberWithSuffix,
    startIntroduction: function () {
      emitter.emit('show-introduction')
    },
    getBrighterColor: function (index) {
      return rgbColorToHex(brighten(hexToRgb(getTemplateColor(index))))
    },
    isDisabled: function (routerPage) {
      return this.storeServerSettings && this.storeServerSettings.hiddenPages.indexOf(routerPage) !== -1
    },
    updateStories: function (count) {
      this.showStories = count > 0
    }
  },
  mounted: function () {
    apiGetOverviewStats(result => {
      this.stats = result
    })
  }
}
</script>

<style scoped>
.dashboard-icon {
  color: #999;
  mix-blend-mode: color-burn;
}
</style>
