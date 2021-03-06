<template>
  <div>
    <template v-if="(projects && projects.length > 0) || (news && news.length > 0)">
      <b-row>
        <b-col xs=12 sm=6 v-if="news && news.length > 0">
          <!-- News -->
          <h2>{{ $t('pageNewsLatestNewsTitle') }}</h2>
          <b-list-group class="news-items">
            <b-list-group-item button class="d-flex flex-row align-items-center" v-for="newsItem in news" :key="'news-' + newsItem.newsId" @click="selectedNews = JSON.parse(JSON.stringify(newsItem))">
              <div class="pr-3"><i :class="`mdi mdi-36px ${newsTypes[newsItem.newstypeName].icon}`" /></div>
              <div class="flex-column align-items-start flex-grow-1">
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">{{ newsItem.newsTitle }}</h5>
                  <small class="text-nowrap" v-if="newsItem.createdOn"><i class="mdi mdi-calendar-clock" /> {{ newsItem.createdOn | toDate }}</small>
                </div>
                <p class="mb-1" v-if="newsItem.newsContent">{{ getContent(newsItem) }}</p>
                <small class="text-muted">{{ newsTypes[newsItem.newstypeName].text() }}</small>
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
              <b-button v-if="selectedNews.newsHyperlink && selectedNews.newsHyperlink.lastIndexOf('#', 0) !== 0" :href="selectedNews.newsHyperlink" target="_blank">{{ $t('pageNewsReadMore') }} <i class="mdi mdi-18px fix-alignment mdi-open-in-new"/></b-button>
              <b-button v-if="token && userIsAtLeast(token.userType, 'Data Curator')" @click="deleteNewsItem(selectedNews.newsId)" variant="danger"><i class="mdi mdi-delete"/> {{ $t('buttonDelete') }}</b-button>
            </b-button-group>
          </b-modal>
        </b-col>
        <b-col xs=12 sm=6 v-if="projects && projects.length > 0">
          <!-- Projects -->
          <h2>{{ $t('pageNewsRelatedProjectsTitle') }}</h2>
          <b-row>
            <b-col xs=12 xl=6 v-for="project in projects" :key="'project-' + project.newsId" class="mb-3">
              <b-card no-body class="news-card h-100">
                <b-img-lazy :src="getImageSrc(project)" class="card-img" style="height: 200px" v-if="project.newsImage" :alt="project.newsTitle" />

                <b-card-body>
                  <b-card-title>{{ project.newsTitle }}</b-card-title>
                  <b-card-sub-title>{{ newsTypes[project.newstypeName].text() }}</b-card-sub-title>
                  <b-card-text v-html="project.newsContent" />
                </b-card-body>

                <b-button-group>
                  <b-button variant="primary" :href="project.newsHyperlink" v-if="project.newsHyperlink">{{ $t('pageNewsReadMore') }}</b-button>
                  <b-button v-if="token && userIsAtLeast(token.userType, 'Data Curator')" @click="deleteNewsItem(project.newsId)" variant="danger"><i class="mdi mdi-delete"/> {{ $t('buttonDelete') }}</b-button>
                </b-button-group>
              </b-card>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </template>
    <div v-if="token && userIsAtLeast(token.userType, 'Data Curator')">
      <b-button @click="$refs.addNewsModal.show()">{{ $t('buttonAddNews') }}</b-button>
      <AddNewsModal ref="addNewsModal" v-on:news-added="update()" />
    </div>
  </div>
</template>

<script>
import AddNewsModal from '@/components/modals/AddNewsModal'
import miscApi from '@/mixins/api/misc.js'

export default {
  props: {
    newsCount: {
      type: Number,
      default: 6
    },
    projectCount: {
      type: Number,
      default: 4
    }
  },
  data: function () {
    return {
      projects: null,
      news: null,
      newsTotalCount: 0,
      newsCurrentPage: 1,
      selectedNews: null,
      newsTypes: {
        'Projects': {
          id: 4,
          text: () => this.$t('widgetNewsTypeRelatedProject'),
          icon: 'mdi-newspaper-variant-outline'
        },
        'Data': {
          id: 3,
          text: () => this.$t('widgetNewsTypeDataChanges'),
          icon: 'mdi-database'
        },
        'Updates': {
          id: 2,
          text: () => this.$t('widgetNewsTypeGeneralUpdates'),
          icon: 'mdi-refresh'
        },
        'General': {
          id: 1,
          text: () => this.$t('widgetNewsTypeGeneralNews'),
          icon: 'mdi-newspaper'
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
    AddNewsModal
  },
  mixins: [ miscApi ],
  methods: {
    deleteNewsItem: function (id) {
      if (id) {
        this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
          okVariant: 'danger',
          okTitle: this.$t('genericYes'),
          cancelTitle: this.$t('genericNo')
        })
          .then(value => {
            if (value) {
              this.apiDeleteNews(id, result => {
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
      const params = {
        name: item.newsImage,
        token: this.token ? this.token.imageToken : null,
        type: 'news',
        size: 'small'
      }
      const paramString = this.toUrlString(params)

      return this.baseUrl + 'image/src?' + paramString
    },
    updateNews: function (page) {
      const newsQuery = {
        page: page,
        limit: this.newsCount ? this.newsCount : this.MAX_JAVA_INTEGER,
        orderBy: 'createdOn',
        ascending: 0,
        filter: [{
          column: 'newstypeName',
          comparator: 'inSet',
          operator: 'and',
          values: ['Data', 'Updates', 'General']
        }]
      }
      this.apiPostNewsTable(newsQuery, result => {
        this.news = result.data
        this.newsTotalCount = result.count
      })
    },
    update: function () {
      const projectQuery = {
        page: 1,
        limit: this.projectCount ? this.projectCount : this.MAX_JAVA_INTEGER,
        filter: [{
          column: 'newstypeName',
          comparator: 'equals',
          operator: 'and',
          values: ['Projects']
        }]
      }
      this.apiPostNewsTable(projectQuery, result => {
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
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.news-card .btn {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.news-pagination .page-item .page-link {
  border-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.news-items .list-group-item-action:last-child {
  border-bottom-left-radius: 0;
}
</style>
