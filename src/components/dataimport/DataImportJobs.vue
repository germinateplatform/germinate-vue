<template>
  <div>
    <div v-if="jobs && jobs.length > 0">
      <b-list-group>
        <b-list-group-item :button="job.stats.fileResourceId !== undefined && job.stats.fileResourceId !== null" class="d-flex flex-row align-items-center" v-for="job in jobs" :key="`data-import-job-${job.id}`" @click="navigateToFileResource(job)">
          <div class="pr-3">
            <MdiIcon :size="36" :path="mdiDatabaseRefreshOutline" v-if="job.isUpdate" />
            <MdiIcon :size="36" :path="mdiDatabaseImportOutline" v-else />
          </div>
          <div class="border-left pl-3 flex-column align-items-start flex-grow-1">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">{{ formatDataType(job.datatype) }}</h5>
              <small v-b-tooltip="new Date(job.createdOn).toLocaleDateString()"><MdiIcon :path="mdiCalendarClock" /> {{ formatTimeAgo(job.createdOn) }}</small>
            </div>
            <p class="mb-1">
              <template v-for="cat in jobStatsCategories">
                <b-badge class="mr-2" :key="`data-import-job-${job.id}-cat-${cat}`" v-if="job.stats[cat]"><MdiIcon :path="getStatsPath(cat)" /> {{ getStatsText(cat) }}: {{ job.stats[cat].toLocaleString() }}</b-badge>
              </template>
            </p>
            <b-badge class="mr-2" variant="info" v-if="job.isUpdate">{{ $t('pageDataUploadUpdateOptionUpdate') }}</b-badge>
            <b-badge class="mr-2" variant="success" v-else>{{ $t('pageDataUploadUpdateOptionInsert') }}</b-badge>
          </div>
        </b-list-group-item>
      </b-list-group>

      <b-pagination v-model="page"
                    :total-rows="totalJobs"
                    :per-page="perPage"
                    v-if="paginationVisible"
                    class="data-import-pagination" />
    </div>
    <h4 class="text-muted" v-else>{{ $t('toastNoDataFound') }}</h4>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'

import { apiPostDataImportStats } from '@/mixins/api/misc'
import { mapGetters } from 'vuex'
import { templateImportTypes, statCategories } from '@/mixins/types'

import { mdiCalendarClock, mdiDatabaseRefreshOutline, mdiDatabaseImportOutline } from '@mdi/js'
import { Pages } from '@/mixins/pages'

const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' }
]

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      jobStatsCategories: ['germplasm', 'markers', 'locations', 'images', 'traits', 'climates', 'groups'],
      page: 1,
      perPage: 4,
      totalJobs: 0,
      jobs: [],
      mdiCalendarClock,
      mdiDatabaseRefreshOutline,
      mdiDatabaseImportOutline
    }
  },
  computed: {
    ...mapGetters([
      'storeLocale'
    ]),
    formatter: function () {
      return new Intl.RelativeTimeFormat((this.storeLocale || 'en_GB').split('_')[0], {

        numeric: 'always'
      })
    },
    paginationVisible: function () {
      return this.totalJobs > this.perPage
    }
  },
  watch: {
    page: function () {
      this.update()
    }
  },
  methods: {
    navigateToFileResource: function (job) {
      if (!job.stats || !job.stats.fileResourceId) {
        return
      }
      // Set up the filter
      const filter = [{
        column: 'fileresourceId',
        comparator: 'equals',
        operator: 'and',
        values: [job.stats.fileResourceId]
      }]
      // Then redirect to the export page
      this.$router.push({
        name: Pages.dataResources,
        query: {
          'fileresources-filter': JSON.stringify(filter)
        }
      })
    },
    getStatsPath: function (stat) {
      return statCategories.find(s => s.value === stat).path
    },
    getStatsText: function (stat) {
      return statCategories.find(s => s.value === stat).textI18n()
    },
    formatDataType: function (datatype) {
      return templateImportTypes[datatype].text()
    },
    formatTimeAgo: function (date) {
      let duration = (new Date(date) - new Date()) / 1000

      for (let i = 0; i <= DIVISIONS.length; i++) {
        const division = DIVISIONS[i]
        if (Math.abs(duration) < division.amount) {
          return this.formatter.format(Math.round(duration), division.name)
        }
        duration /= division.amount
      }
    },
    update: function () {
      apiPostDataImportStats({
        page: this.page,
        limit: this.perPage,
        orderBy: 'createdOn',
        ascending: 0
      }, result => {
        this.totalJobs = result.count
        this.jobs = result.data
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>
.data-import-pagination .page-item .page-link {
  border-top: 0;
}
</style>
