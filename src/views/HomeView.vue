<template>
  <div>
    <b-row class="dashboard-stats" v-if="stats">
      <!-- Banner buttons -->
      <b-col cols=12 sm=6 xl=3 v-for="(category, index) in dashboardCategories" :key="'dashboard-stats-' + category.value" class="mb-3">
        <b-card no-body :style="`border: 1px solid ${getColor(index)}`">
          <b-card-body :style="`background-color: ${getColor(index)}; color: white;`">
            <b-row>
              <b-col cols=6 class="align-self-center">
                <h2 class="mb-0">{{ getNumberWithSuffix(stats[category.value], 1) }}</h2>
                <span>{{ category.textI18n() }}</span>
              </b-col>
              <b-col cols=6 class="d-flex align-items-center justify-content-end">
                <MdiIcon :size="48" :path="category.path" />
              </b-col>
            </b-row>
            <router-link class="stretched-link" :disabled="isDisabled(category.link)" :event="isDisabled(category.link) ? '' : 'click'" :to="{ name: category.link, params: category.params }" :title="`${category.textI18n()}: ${stats[category.value].toLocaleString()}`" v-if="stats[category.value]" />
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <!-- Images -->
    <ImageCarousel class="my-4" />

    <!-- Heading and welcome text -->
    <h1>{{ $t('pageDashboardTitle') }}</h1>
    <p v-html="$t('pageDashboardText')" />

    <!-- Publications -->
    <div v-if="showPublications || (storeToken && userIsAtLeast(storeToken.userType, 'Data Curator'))" class="mb-4">
      <h2>{{ $t('pageDashboardPublicationsTitle') }}</h2>
      <p>{{ $t('pageDashboardPublicationsText') }}</p>

      <PublicationsWidget referenceType="database" @publication-count-changed="count => showPublications = count > 0"/>
    </div>

    <!-- Introduction tour -->
    <b-button variant="primary" @click="startIntroduction">
      <MdiIcon :path="mdiPresentationPlay" /> {{ $t('widgetIntroTourButtonText') }}
    </b-button>

    <hr />
    <!-- News -->
    <NewsSection :projectCount="4" :newsCount="6" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ImageCarousel from '@/components/images/ImageCarousel'
import MdiIcon from '@/components/icons/MdiIcon'
import NewsSection from '@/components/news/NewsSection'
import PublicationsWidget from '@/components/util/PublicationsWidget'

import statsApiMixin from '@/mixins/api/stats'
import formattingMixing from '@/mixins/formatting'
import typesMixin from '@/mixins/types'
import authApi from '@/mixins/api/auth'

import { mdiPresentationPlay } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    ImageCarousel,
    MdiIcon,
    NewsSection,
    PublicationsWidget
  },
  data: function () {
    return {
      mdiPresentationPlay,
      stats: null,
      showPublications: true
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeToken'
    ]),
    dashboardCategories: function () {
      if (this.storeServerSettings && this.storeServerSettings.dashboardCategories) {
        return this.statCategories.filter(d => this.storeServerSettings.dashboardCategories.indexOf(d.value) !== -1)
      } else {
        return this.statCategories
      }
    }
  },
  mixins: [formattingMixing, statsApiMixin, typesMixin, authApi],
  methods: {
    startIntroduction: function () {
      emitter.emit('show-introduction')
    },
    getColor: function (index) {
      if (!this.storeServerSettings || !this.storeServerSettings.colorsTemplate) {
        return '#00acef'
      } else {
        const colors = this.storeServerSettings.colorsTemplate
        return colors[index % colors.length]
      }
    },
    isDisabled: function (routerPage) {
      return this.storeServerSettings && this.storeServerSettings.hiddenPages.indexOf(routerPage) !== -1
    }
  },
  mounted: function () {
    this.apiGetOverviewStats(result => {
      this.stats = result
    })
  }
}
</script>
