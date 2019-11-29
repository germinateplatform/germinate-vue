<template>
  <div>
    <template v-if="(projects && projects.length > 0) || (news && news.length > 0)">
      <b-row>
        <b-col xs=12 sm=6 v-if="news && news.length > 0">
          <h2>{{ $t('pageNewsLatestNewsTitle') }}</h2>
          <b-list-group class="news-items">
            <b-list-group-item button class="d-flex flex-row align-items-center" v-for="newsItem in news" :key="'news-' + newsItem.newsId" @click="selectedNews = newsItem">
              <div><i :class="`mdi mdi-36px ${newsTypes[newsItem.newstypeName].icon} pr-3`" /></div>
              <div class="flex-column align-items-start flex-grow-1">
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">{{ newsItem.newsTitle }}</h5>
                  <small><i class="mdi mdi-calendar-clock" /> {{ newsItem.updatedOn | toDate }}</small>
                </div>
                <p class="mb-1" v-if="newsItem.newsContent">{{ getContent(newsItem) }}</p>
                <small>{{ newsTypes[newsItem.newstypeName].text() }}</small>
              </div>
            </b-list-group-item>
          </b-list-group>
          <b-pagination
            class="news-pagination"
            v-model="newsCurrentPage"
            :total-rows="newsTotalCount"
            :per-page="newsCount"
            @change="updateNews" />

          <b-modal ref="newsModal" :title="selectedNews.newsTitle" scrollable size="xl" v-if="selectedNews" ok-only :ok-title="$t('buttonClose')">
            <span v-html="selectedNews.newsContent" />
          </b-modal>
        </b-col>
        <b-col xs=12 sm=6 v-if="projects && projects.length > 0">
          <h2>{{ $t('pageNewsRelatedProjectsTitle') }}</h2>
          <b-row>
            <b-col xs=12 xl=6 v-for="project in projects" :key="'project-' + project.newsId" class="mb-3">
              <b-card no-body class="news-card h-100">
                <img :src="getImageSrc(project)" class="card-img" style="height: 200px" v-if="project.newsImage" />

                <b-card-body>
                  <b-card-title>{{ project.newsTitle }}</b-card-title>
                  <b-card-sub-title>{{ newsTypes[project.newstypeName].text() }}</b-card-sub-title>
                  <b-card-text v-html="project.newsContent" />
                </b-card-body>

                <b-button variant="primary" :href="project.newsHyperlink" v-if="project.newsHyperlink">Read more</b-button>
              </b-card>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script>
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
          text: () => 'Related project',
          icon: 'mdi-newspaper-variant-outline'
        },
        'Data': {
          text: () => 'Data changes',
          icon: 'mdi-database'
        },
        'Updates': {
          text: () => 'General updates',
          icon: 'mdi-refresh'
        }
      }
    }
  },
  watch: {
    selectedNews: function (newValue, oldValue) {
      this.$nextTick(() => this.$refs.newsModal.show())
    }
  },
  methods: {
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
      var params = {
        name: item.newsImage,
        token: this.token ? this.token.imageToken : null,
        type: 'news',
        size: 'small'
      }
      var paramString = this.toUrlString(params)

      return this.baseUrl + 'image/src?' + paramString
    },
    updateNews: function (page) {
      var newsQuery = {
        page: page,
        limit: this.newsCount ? this.newsCount : this.MAX_JAVA_INTEGER,
        filter: [{
          column: 'newstypeName',
          comparator: 'inSet',
          operator: 'and',
          values: ['Data', 'Updates']
        }]
      }
      this.apiPostNewsTable(newsQuery, result => {
        this.news = result.data
        this.newsTotalCount = result.count
      })
    }
  },
  mounted: function () {
    var projectQuery = {
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
}
</script>

<style>
.news-card .card-img {
  width: 100%;
  object-fit: cover;
  transition: transform .2s ease-in-out;
}
.news-card .btn {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.news-pagination .page-link {
  border-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.news-items .list-group-item-action:last-child {
border-bottom-left-radius: 0;
}
</style>