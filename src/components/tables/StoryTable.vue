<template>
  <div>
    <CoolLightBox
      :items="coolboxImages"
      :index="coolboxIndex"
      effect="fade"
      @close="coolboxIndex = null" />
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="table"
               v-on="$listeners">
      <template v-slot:cell(startStory)="data">
        <b-button @click="startStory(data.item)" variant="primary"><MdiIcon :path="mdiPlay" /> {{ $t('buttonStart') }}</b-button>
      </template>
      <!-- Image -->
      <template v-slot:cell(storyImageId)="data">
        <a :href="getSrc(data.item, 'large')" @click.prevent="update(data.item)">
          <b-img-lazy :src="getSrc(data.item, 'small')" class="table-image" alt="Image" />
        </a>
      </template>
      <!-- Story description -->
      <template v-slot:cell(storyDescription)="data">
        <span :title="data.item.storyDescription" v-if="data.item.storyDescription">{{ truncateAfterWords(data.item.storyDescription, 20) }}</span>
        <a href="#" class="table-icon-link" @click.prevent="showFullDescription(data.item.storyDescription)" v-b-tooltip="$t('buttonReadMore')" v-if="isTruncatedAfterWords(data.item.storyDescription, 20)" >&nbsp;
          <MdiIcon :path="mdiPageNext" />
        </a>
      </template>
      <template v-slot:cell(publicationDoi)="data">
        <b-button v-if="data.item.publicationDoi" @click.prevent="showPublication(data.item)">
          <MdiIcon :path="mdiTextBoxCheckOutline"/> {{  $t('tableTooltipDatasetPublications') }}
        </b-button>
      </template>
    </BaseTable>

    <b-modal
      v-if="selectedStory"
      :title="selectedStory.storyName"
      ref="storyStartModal"
      size="md"
      hide-footer>
      <StoryCard :story="selectedStory" @hide="$refs.storyStartModal.hide()" @license-accepted="refreshSelectedStory" />
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import StoryCard from '@/components/util/StoryCard'

import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props'
import { getImageUrl } from '@/mixins/image'

import { mdiTextBoxCheckOutline, mdiPlay, mdiPageNext } from '@mdi/js'
import { getNumberWithSuffix, isTruncatedAfterWords, truncateAfterWords } from '@/mixins/formatting'
import { Pages } from '@/mixins/pages'

export default {
  name: 'ImageTable',
  components: {
    BaseTable,
    CoolLightBox,
    MdiIcon,
    StoryCard
  },
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      mdiTextBoxCheckOutline,
      mdiPlay,
      mdiPageNext,
      options: {
        idColumn: 'storyId',
        tableName: 'stories'
      },
      selectedImage: null,
      coolboxIndex: null,
      coolboxImages: [],
      selectedStory: null
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    columns: function () {
      return [
        {
          key: 'startStory',
          label: this.$t('tableColumnStoryStart'),
          type: undefined,
          sortable: false
        },
        {
          key: 'storyId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnStoryId')
        }, {
          key: 'storyName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnStoryName')
        }, {
          key: 'storyDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnStoryDesciption')
        }, {
          key: 'storySteps',
          type: undefined,
          sortable: false,
          label: this.$t('tableColumnStoryStepCount'),
          formatter: value => value ? getNumberWithSuffix(value.length, 0) : 0
        }, {
          key: 'publicationDoi',
          type: String,
          sortable: true,
          label: this.$t('tableColumnStoryPublication')
        }, {
          key: 'storyCreatedOn',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnStoryCreatedOn'),
          formatter: value => value ? new Date(value).toLocaleString() : null,
          preferredSortingColumn: true
        }, {
          key: 'storyImageId',
          type: undefined,
          sortable: false,
          class: 'p-0',
          label: ''
        }
      ]
    }
  },
  methods: {
    isTruncatedAfterWords,
    truncateAfterWords,
    showFullDescription: function (description) {
      this.$bvModal.msgBoxOk(description, {
        title: this.$t('tableColumnStoryDescription'),
        okTitle: this.$t('genericOk')
      })
    },
    startStory: function (story) {
      this.selectedStory = story

      this.$nextTick(() => this.$refs.storyStartModal.show())
    },
    refreshSelectedStory: function () {
      this.refresh()

      this.getData({
        page: 1,
        limit: 1,
        filter: [{
          column: 'storyId',
          comparator: 'equals',
          operator: 'and',
          values: [this.selectedStory.storyId]
        }]
      }, result => {
        if (result && result.data && result.data.length > 0) {
          this.selectedStory = result.data[0]
        }
      })
    },
    showPublication: function (story) {
      this.$router.push({ name: Pages.publicationDetails, params: { publicationId: story.publicationId } })
    },
    getSrc: function (story, size) {
      return getImageUrl(story.storyImageName, {
        name: story.storyImageName,
        type: 'storysteps',
        size: size,
        token: this.storeToken ? this.storeToken.imageToken : ''
      })
    },
    update: function (i) {
      this.coolboxImages = [{
        src: this.getSrc(i, 'large')
      }]
      this.coolboxIndex = 0
    },
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>

<style scoped>
.table-image {
  min-width: 200px;
  width: 100%;
  height: 150px;
  object-fit: cover;
}
</style>
