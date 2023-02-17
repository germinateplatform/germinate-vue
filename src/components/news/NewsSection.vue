<template>
  <div>
    <b-row>
      <b-col cols=12 sm=6 v-if="news && news.length > 0">
        <!-- News -->
        <h2>{{ $t('pageNewsLatestNewsTitle') }}</h2>
        <b-list-group class="news-items">
          <b-list-group-item button class="d-flex flex-row align-items-center" v-for="newsItem in news" :key="'news-' + newsItem.newsId" @click="selectedNews = JSON.parse(JSON.stringify(newsItem))">
            <div class="pr-3">
              <MdiIcon :size="36" :path="newsTypes[newsItem.newstypeName].path" />
            </div>
            <div class="border-left pl-3 flex-column align-items-start flex-grow-1">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">{{ newsItem.newsTitle }}</h5>
                <small class="text-nowrap" v-b-tooltip="new Date(newsItem.createdOn).toLocaleDateString()" v-if="newsItem.createdOn"><MdiIcon :path="mdiCalendarClock" /> {{ formatTimeAgo(newsItem.createdOn) }}</small>
              </div>
              <p class="mb-1" v-if="newsItem.newsContent">{{ getContent(newsItem) }}</p>
              <b-badge>{{ newsTypes[newsItem.newstypeName].text() }}</b-badge>
            </div>
          </b-list-group-item>
        </b-list-group>
        <b-pagination
          class="news-pagination"
          v-model="newsCurrentPage"
          :total-rows="newsTotalCount"
          :per-page="newsCount"
          v-show="newsTotalCount > newsCount"
          @change="updateNews" />

        <!-- Modal containing news details -->
        <b-modal ref="newsModal" :title="selectedNews.newsTitle" scrollable size="xl" v-if="selectedNews" ok-only :ok-title="$t('buttonClose')">
          <div v-html="selectedNews.newsContent" />
          <b-button-group class="mt-3">
            <b-button v-if="selectedNews.newsHyperlink && selectedNews.newsHyperlink.lastIndexOf('#', 0) !== 0" :href="selectedNews.newsHyperlink" target="_blank" rel="noopener noreferrer">{{ $t('pageNewsReadMore') }} <MdiIcon :path="mdiOpenInNew" /></b-button>
            <b-button v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')" @click="deleteNewsItem(selectedNews.newsId)" variant="danger"><MdiIcon :path="mdiDelete" /> {{ $t('buttonDelete') }}</b-button>
          </b-button-group>
        </b-modal>
      </b-col>
      <b-col cols=12 md=6>
        <!-- Data uploads -->
        <h2>{{ $t('pageNewsLatestDataUploadsTitle') }}</h2>
        <DataImportJobs />
      </b-col>
      <b-col cols=12 v-if="projects && projects.length > 0">
        <!-- Projects -->
        <h2>{{ $t('pageNewsRelatedProjectsTitle') }}</h2>
        <b-row>
          <b-col cols=12 md=6 xl=3 v-for="project in projects" :key="'project-' + project.newsId" class="mb-3">
            <b-card no-body class="news-card h-100">
              <b-img-lazy :src="getImageSrc(project)" :class="`project-image card-img ${project.newsImageFit === 'contain' ? 'contain p-2' : 'cover'}`" style="height: 200px" v-if="project.newsImage" :alt="project.newsTitle" />

              <b-card-body>
                <b-card-title>{{ project.newsTitle }}</b-card-title>
                <b-card-sub-title>{{ newsTypes[project.newstypeName].text() }}</b-card-sub-title>
                <b-card-text v-html="project.newsContent" />
              </b-card-body>

              <b-button-group>
                <b-button variant="primary" :href="project.newsHyperlink" rel="noopener noreferrer" v-if="project.newsHyperlink">
                  <MdiIcon :path="mdiOpenInNew" /> {{ $t('pageNewsReadMore') }}
                </b-button>
                <b-button v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')" @click="deleteNewsItem(project.newsId)" variant="danger">
                  <MdiIcon :path="mdiDelete" /> {{ $t('buttonDelete') }}
                </b-button>
              </b-button-group>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <div v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')">
      <b-button @click="$refs.addNewsModal.show()">{{ $t('buttonAddNews') }}</b-button>
      <AddNewsModal ref="addNewsModal" v-on:news-added="update()" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import DataImportJobs from '@/components/dataimport/DataImportJobs'
import AddNewsModal from '@/components/modals/AddNewsModal'
import { userIsAtLeast } from '@/mixins/api/auth'
import { apiPostNewsTable, apiDeleteNews } from '@/mixins/api/misc'
import { getImageUrl } from '@/mixins/image'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

import { mdiNewspaperVariantOutline, mdiDatabase, mdiRefresh, mdiNewspaper, mdiDelete, mdiOpenInNew, mdiCalendarClock } from '@mdi/js'

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
  props: {
    newsCount: {
      type: Number,
      default: 4
    },
    projectCount: {
      type: Number,
      default: 4
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeLocale'
    ]),
    formatter: function () {
      return new Intl.RelativeTimeFormat((this.storeLocale || 'en_GB').split('_')[0], {

        numeric: 'always'
      })
    }
  },
  data: function () {
    return {
      mdiDelete,
      mdiOpenInNew,
      mdiCalendarClock,
      projects: null,
      news: null,
      newsTotalCount: 0,
      newsCurrentPage: 1,
      selectedNews: null,
      newsTypes: {
        Projects: {
          id: 4,
          text: () => this.$t('widgetNewsTypeRelatedProject'),
          path: mdiNewspaperVariantOutline
        },
        Data: {
          id: 3,
          text: () => this.$t('widgetNewsTypeDataChanges'),
          path: mdiDatabase
        },
        Updates: {
          id: 2,
          text: () => this.$t('widgetNewsTypeGeneralUpdates'),
          path: mdiRefresh
        },
        General: {
          id: 1,
          text: () => this.$t('widgetNewsTypeGeneralNews'),
          path: mdiNewspaper
        }
      }
    }
  },
  watch: {
    selectedNews: function () {
      this.$nextTick(() => this.$refs.newsModal.show())
    }
  },
  components: {
    AddNewsModal,
    DataImportJobs,
    MdiIcon
  },
  methods: {
    userIsAtLeast,
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
    deleteNewsItem: function (id) {
      if (id) {
        this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
          okVariant: 'danger',
          okTitle: this.$t('genericYes'),
          cancelTitle: this.$t('genericNo')
        })
          .then(value => {
            if (value) {
              apiDeleteNews(id, result => {
                if (result) {
                  this.updateNews()
                  this.update()

                  if (this.$refs.newsModal) {
                    this.$refs.newsModal.hide()
                  }
                }
              })
            }
          })
      }
    },
    getContent: function (item) {
      if (item.newsContent) {
        return this.getWordsUntil(item.newsContent.replace(/(<([^>]+)>)/ig, ' '), 100)
      } else {
        return ''
      }
    },
    getWordsUntil: function (input, limit) {
      if (input.length < limit) {
        return input
      } else {
        const index = input.indexOf(' ', limit - 3)

        if (index !== -1) {
          return input.substring(0, index) + '...'
        } else {
          return input
        }
      }
    },
    getImageSrc: function (item) {
      return getImageUrl(item.newsImage, {
        name: item.newsImage,
        token: this.storeToken ? this.storeToken.imageToken : null,
        type: 'news',
        size: 'small'
      })
    },
    updateNews: function (page) {
      const newsQuery = {
        page: page,
        limit: this.newsCount ? this.newsCount : MAX_JAVA_INTEGER,
        orderBy: 'createdOn',
        ascending: 0,
        filter: [{
          column: 'newstypeName',
          comparator: 'inSet',
          operator: 'and',
          values: ['Data', 'Updates', 'General']
        }]
      }
      apiPostNewsTable(newsQuery, result => {
        this.news = result.data
        this.newsTotalCount = result.count
      })
    },
    update: function () {
      const projectQuery = {
        page: 1,
        limit: this.projectCount ? this.projectCount : MAX_JAVA_INTEGER,
        filter: [{
          column: 'newstypeName',
          comparator: 'equals',
          operator: 'and',
          values: ['Projects']
        }]
      }
      apiPostNewsTable(projectQuery, result => {
        this.projects = result.data
      })

      this.updateNews(1)
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>
.news-card .card-img {
  width: 100%;
  object-fit: cover;
  transition: transform .2s ease-in-out;
}
.news-pagination .page-item .page-link {
  border-top: 0;
}
.project-image:after {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  box-shadow: inset 0px 0px 150px black;
}

.project-image.cover {
  object-fit: cover;
}
.project-image.contain {
  object-fit: contain;
}
</style>
