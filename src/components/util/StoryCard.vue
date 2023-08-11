<template>
  <b-card no-body class="story-card h-100" v-if="story">
    <b-img-lazy :src="getSrc(story, 'small')" class="story-image card-img cover" style="height: 200px" v-if="story.storyImageId" :alt="story.storyName" />

    <b-card-body>
      <b-card-title>{{ story.storyName }}</b-card-title>
      <b-card-sub-title class="mb-3" v-if="story.storyCreatedOn"><MdiIcon :path="mdiCalendar" /> {{ new Date(story.storyCreatedOn).toLocaleDateString() }}</b-card-sub-title>
      <b-card-text v-if="story.storyDescription">{{ story.storyDescription }}</b-card-text>

      <hr />

      <h5>{{ $t('widgetStoryCardSteps') }}</h5>
      <div v-for="step in sortedSteps" :key="`story-${story.storyId}-step-${step.id}`">
        <b-card-text class="mb-0" v-b-toggle="`story-collapse-${step.id}`">{{ step.storyIndex + 1 }}. {{ step.name }}</b-card-text>
        <b-collapse :id="`story-collapse-${step.id}`" :accordion="`story-accordion-${story.storyId}`">
          <b-card v-if="step.imageId" no-body>
            <b-row no-gutters>
              <b-col cols=12 md=4 :order-md="2">
                <b-card-img :src="getStepSrc(step, 'small')" class="rounded-0" />
              </b-col>
              <b-col cols=12 md=8 :order-md="1">
                <b-card-body>
                  <b-card-text>{{ step.description }}</b-card-text>
                </b-card-body>
              </b-col>
            </b-row>
          </b-card>
          <b-card v-else>
            <b-card-text>{{ step.description }}</b-card-text>
          </b-card>
        </b-collapse>
      </div>
    </b-card-body>

    <b-button block variant="danger" v-if="story.canAccess === false" @click="$refs.datasetModal.show()">
      {{ $t('widgetStoryCardDatasetLicensesRequired') }}
    </b-button>

    <b-card-footer class="d-flex justify-content-between">
      <template v-if="!isPlaceholder">
        <b-button variant="primary" @click="startStory" :disabled="story.canAccess === false"><MdiIcon :path="mdiPlay" /> {{ $t('buttonStart') }}</b-button>
        <b-button v-if="story.publicationDoi" @click.prevent="showPublication">
          <MdiIcon :path="mdiTextBoxCheckOutline"/> {{  $t('tableTooltipDatasetPublications') }}
        </b-button>

        <template v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')">
          <b-dropdown>
            <template #button-content>
              <MdiIcon :path="mdiCog" />
            </template>

            <b-dropdown-item @click="editStory"><MdiIcon :path="mdiPencil" /> {{ $t('buttonEditStory') }}</b-dropdown-item>
            <b-dropdown-item @click="editStorySteps"><MdiIcon :path="mdiFormatListNumbered" /> {{ $t('buttonEditStorySteps') }}</b-dropdown-item>
            <b-dropdown-item @click="deleteStory" variant="danger"><MdiIcon :path="mdiDelete" /> {{ $t('buttonDelete') }}</b-dropdown-item>
          </b-dropdown>
        </template>
      </template>
      <b-button v-else variant="success" @click="$emit('create-clicked')"><MdiIcon :path="mdiPlusBox" /> {{ $t('buttonCreate') }}</b-button>
    </b-card-footer>

    <b-modal ref="datasetModal"
             :title="$t('modalTitleStoryDatasets')"
             size="xl"
             ok-only
             :ok-title="$t('buttonClose')"
             v-if="story.canAccess === false">
      <!-- Datasets required for this story whose license hasn't been accepted yet -->
      <p>{{ $t('modalTextStoryDatasets') }}</p>
      <DatasetTable :getData="getDatasetData" @license-accepted="$emit('license-accepted')" />
    </b-modal>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import DatasetTable from '@/components/tables/DatasetTable'

import { mdiPlay, mdiCalendar, mdiDelete, mdiTextBoxCheckOutline, mdiPlusBox, mdiPencil, mdiCog, mdiFormatListNumbered } from '@mdi/js'
import { getImageUrl, getImageUrlById } from '@/mixins/image'
import { apiPostDatasetTable } from '@/mixins/api/dataset'
import { userIsAtLeast } from '@/mixins/api/auth'
import { apiDeleteStoryById } from '@/mixins/api/misc'
import { Pages } from '@/mixins/pages'

export default {
  props: {
    story: {
      type: Object,
      default: () => null
    },
    isPlaceholder: {
      type: Boolean,
      default: false
    }
  },
  components: {
    DatasetTable,
    MdiIcon
  },
  data: function () {
    return {
      mdiCog,
      mdiPencil,
      mdiPlay,
      mdiCalendar,
      mdiDelete,
      mdiTextBoxCheckOutline,
      mdiFormatListNumbered,
      mdiPlusBox
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    sortedSteps: function () {
      if (this.story && this.story.storySteps) {
        return this.story.storySteps.concat().filter(s => s.name !== undefined && s.name !== null).sort((a, b) => a.storyIndex - b.storyIndex)
      } else {
        return []
      }
    }
  },
  methods: {
    userIsAtLeast,
    showPublication: function () {
      this.$router.push({ name: Pages.publicationDetails, params: { publicationId: this.story.publicationId } })
    },
    getDatasetData: function (data, callback) {
      // Always filter for just the story requirement datasets
      const additional = [{
        column: 'datasetId',
        comparator: 'inSet',
        operator: 'and',
        values: this.story.storyRequirements.datasetIds
      }]

      if (!data.filter) {
        data.filter = additional
      } else {
        data.filter = additional.concat(data.filter)
      }

      return apiPostDatasetTable(data, callback)
    },
    deleteStory: function () {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            apiDeleteStoryById(this.story.storyId, () => this.$emit('story-deleted'))
          }
        })
    },
    editStorySteps: function () {
      this.$bvModal.msgBoxOk(this.$t('modalTextStoryEditSteps'), {
        title: this.$t('modalTitleStoryEditSteps'),
        okVariant: 'primary',
        okTitle: this.$t('genericOk')
      })
        .then(() => {
          this.$store.dispatch('setActiveStory', {
            story: this.story,
            isEdit: true
          })
          this.$emit('hide')
        })
    },
    editStory: function () {
      this.$emit('edit-clicked')
    },
    startStory: function () {
      this.$store.dispatch('setActiveStory', {
        story: this.story,
        isEdit: false
      })
      this.$emit('hide')
    },
    getStepSrc: function (step, size) {
      return getImageUrlById(step.imageId, {
        type: 'storysteps',
        size: size,
        token: this.storeToken ? this.storeToken.imageToken : ''
      })
    },
    getSrc: function (size) {
      return getImageUrl(this.story.storyImageName, {
        name: this.story.storyImageName,
        type: 'storysteps',
        size: size,
        token: this.storeToken ? this.storeToken.imageToken : ''
      })
    }
  }
}
</script>

<style>
.story-card .card-img {
  width: 100%;
  object-fit: cover;
  transition: transform .2s ease-in-out;
}
</style>
