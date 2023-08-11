<template>
  <div>
    <div v-if="loading">
      <b-spinner variant="primary" type="grow" />
    </div>
    <div v-else>
      <template v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')">
        <b-row>
          <b-col cols=12 sm=6 lg=4 class="col-xxl-3">
            <StoryCard :story="newStory" :isPlaceholder="true" @create-clicked="createNewStory" />
          </b-col>
        </b-row>
        <hr />
      </template>

      <div v-if="storiesOnPage && storiesOnPage.length > 0">
        <b-row>
          <b-col cols=12 sm=6 lg=4 class="mb-3 col-xxl-3" v-for="s in storiesOnPage" :key="`story-${s.storyId}`">
            <StoryCard :story="s" @story-deleted="update" @edit-clicked="edit(s)" @license-accepted="update" />
          </b-col>
        </b-row>
        <b-pagination v-model="page" :total-rows="stories.length" :per-page="itemsPerPage" v-if="stories.length > itemsPerPage" />
      </div>

      <h5 v-else>{{ $t('headingNoData') }}</h5>
    </div>

    <AddStoryModal ref="storyModal" :storyToEdit="selectedStory" @story-added="update" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import AddStoryModal from '@/components/modals/AddStoryModal'
import StoryCard from '@/components/util/StoryCard'

import { apiPostStoryTable } from '@/mixins/api/misc'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

import { userIsAtLeast } from '@/mixins/api/auth'

export default {
  components: {
    AddStoryModal,
    StoryCard
  },
  props: {
    filterOn: {
      type: Array,
      default: () => null
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    storiesOnPage: function () {
      const startIndex = Math.min(this.stories.length, (this.page - 1) * this.itemsPerPage)
      const endIndex = Math.min(this.stories.length, startIndex + this.itemsPerPage)

      return this.stories.slice(startIndex, endIndex)
    },
    newStory: function () {
      return {
        storyId: -1,
        storyName: this.$t('widgetCreateStoryStoryName'),
        storyDescription: this.$t('widgetCreateStoryStoryDescription'),
        storySteps: [{
          id: -1,
          storyIndex: 0,
          name: this.$t('widgetCreateStoryStoryStepOneName'),
          description: this.$t('widgetCreateStoryStoryStepOneDescription')
        }, {
          id: -2,
          storyIndex: 1,
          name: this.$t('widgetCreateStoryStoryStepTwoName'),
          description: this.$t('widgetCreateStoryStoryStepTwoDescription')
        }, {
          id: -3,
          storyIndex: 2,
          name: this.$t('widgetCreateStoryStoryStepThreeName'),
          description: this.$t('widgetCreateStoryStoryStepThreeDescription')
        }]
      }
    }
  },
  data: function () {
    return {
      loading: true,
      stories: [],
      page: 1,
      itemsPerPage: 12,
      selectedStory: null
    }
  },
  methods: {
    userIsAtLeast,
    edit: function (story) {
      this.selectedStory = story

      this.$nextTick(() => this.$refs.storyModal.show())
    },
    createNewStory: function () {
      this.selectedStory = null

      this.$nextTick(() => this.$refs.storyModal.show())
    },
    update: function () {
      this.loading = true

      const query = {
        page: 1,
        limit: MAX_JAVA_INTEGER
      }

      if (this.filterOn) {
        query.filter = this.filterOn
      }

      apiPostStoryTable(query, result => {
        if (result && result.data && result.data.length > 0) {
          this.stories = result.data
        } else {
          this.stories = []
          this.$emit('no-stories-found')
        }

        this.loading = false
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>
</style>
