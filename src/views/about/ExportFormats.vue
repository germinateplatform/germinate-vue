<template>
  <div>
    <h1>{{ $t('pageExportFormatsTitle') }}</h1>
    <hr />
    <p>{{ $t('pageExportFormatsText') }}</p>

    <div>
      <!-- Badges for the types -->
      <b-badge v-for="(tag, name) in tags"
              :key="`export-format-tag-${name}`"
              class="display-inline mr-2 mb-2"
              :to="{ name: Pages.aboutExportFormatsType, params: { format: name } }"
              :style="`background: ${getBackgroundColor(tags, name)}; color: ${getTextColor(tags, name)}`"
              event=""
              @click.prevent="selectTag(name)">
        <MdiIcon :path="mdiTag" /> {{ tag.text() }}
      </b-badge>
    </div>

    <div>
      <!-- Badges for the types -->
      <b-badge v-for="(type, name) in types"
              :key="`export-format-type-${name}`"
              class="display-inline mr-2 mb-2"
              :style="`background: ${getBackgroundColor(types, name)}; color: ${getTextColor(types, name)}`"
              href="#"
              event=""
              @click.prevent="selectType(name)">
        <MdiIcon :path="type.icon" /> {{ type.text() }}
      </b-badge>
    </div>

    <!-- Format cards -->
    <b-row class="mt-3">
      <b-col cols=12 sm=6 xl=4 v-for="format in filteredExportFormats" :key="`export-format-${format.name}`" class="export-format mb-4 col-xxl-4 col-xxxl-3">
        <b-card
          :img-src="`./img/${format.logo}`"
          :img-alt="format.name"
          img-top
          no-body
          bg-variant="light"
          class="mb-2 h-100">
          <b-card-body class="d-flex flex-column justify-content-between bg-dark">
            <div>
              <b-card-title class="text-light">{{ format.name }}</b-card-title>
              <b-card-text class="text-light">
                {{ format.text() }}
              </b-card-text>
            </div>
            <div>
              <div>
                <b-badge v-for="(tag, index) in format.tags" :key="`export-format-tag-individual-${index}`" class="dispay-inline mr-2" variant="light" :style="`background: ${getBackgroundColor(tags, tag)}; color: ${getTextColor(tags, tag)}`">
                  <MdiIcon :path="mdiTag" /> {{ tags[tag].text() }}
                </b-badge>
              </div>
              <div>
                <b-badge v-for="(type, index) in format.types" :key="`export-format-type-individual-${index}`" class="dispay-inline mr-2" variant="light" :style="`background: ${getBackgroundColor(types, type)}; color: ${getTextColor(types, type)}`">
                  <MdiIcon :path="types[type].icon" /> {{ types[type].text() }}
                </b-badge>
              </div>
            </div>
          </b-card-body>
          <!-- Download button -->
          <b-button :href="format.link" target="_blank" rel="noopener noreferrer" variant="primary" class="mt-auto card-button">
            <span v-if="format.linkType === 'download'"><MdiIcon :path="mdiDownload" /> {{ $t('buttonDownload') }}</span>
            <span v-else-if="format.linkType === 'link'"><MdiIcon :path="mdiOpenInNew" /> {{ $t('buttonShow') }}</span>
          </b-button>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'

import { exportFormats } from '@/mixins/types'
import { getHighContrastTextColor } from '@/mixins/colors'

import { mdiTag, mdiDownload, mdiOpenInNew, mdiCloudUpload, mdiCloudDownload, mdiCloud } from '@mdi/js'
import { Pages } from '@/mixins/pages'

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      Pages,
      mdiTag,
      mdiDownload,
      mdiOpenInNew,
      mdiCloudUpload,
      mdiCloudDownload,
      selectedTag: 'all',
      selectedType: 'all',
      tags: {
        all: {
          text: () => this.$t('exportFormatDataTypeAll')
        },
        genotype: {
          text: () => this.$t('exportFormatDataTypeGenotype')
        },
        phenotype: {
          text: () => this.$t('exportFormatDataTypePhenotype')
        },
        pedigree: {
          text: () => this.$t('exportFormatDataTypePedigree')
        },
        pca: {
          text: () => this.$t('exportFormatDataTypePca')
        }
      },
      types: {
        all: {
          icon: mdiCloud,
          text: () => this.$t('exportFormatDataTypeAll')
        },
        provider: {
          icon: mdiCloudDownload,
          text: () => this.$t('exportFormatTypeProvider')
        },
        receiver: {
          icon: mdiCloudUpload,
          text: () => this.$t('exportFormatTypeConsumer')
        }
      }
    }
  },
  props: {
    tag: {
      type: String,
      default: null
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings'
    ]),
    filteredExportFormats: function () {
      if ((this.selectedTag && this.selectedTag !== 'all') || (this.selectedType && this.selectedType !== 'all')) {
        return Object.keys(exportFormats)
          .filter(f => exportFormats[f].tags.indexOf(this.selectedTag) !== -1 || exportFormats[f].types.indexOf(this.selectedType) !== -1)
          .map(f => exportFormats[f])
      } else {
        return exportFormats
      }
    }
  },
  methods: {
    getBackgroundColor: function (tags, tag) {
      const index = Object.keys(tags).indexOf(tag)
      return this.storeServerSettings.colorsTemplate[index % this.storeServerSettings.colorsTemplate.length]
    },
    getTextColor: function (tags, tag) {
      const color = this.getBackgroundColor(tags, tag)
      return getHighContrastTextColor(color)
    },
    selectType: function (newType) {
      this.selectedType = newType
    },
    selectTag: function (newTag) {
      if (newTag) {
        // Change the URL according to the user selection only if this component hasn't been called with a specific tag
        if (this.tag === null) {
          window.history.replaceState({}, null, this.$router.resolve({ name: Pages.aboutExportFormatsType, params: { format: newTag } }).href)
        }
        this.selectedTag = newTag
      }
    }
  },
  mounted: function () {
    let toSelect = this.tag

    // Prefer URL parameters
    if (this.$route.params.format) {
      toSelect = this.$route.params.format
    }

    this.selectTag(toSelect)
  }
}
</script>

<style>
.export-format .card-img-top {
  width: 100%;
  height: 300px;
  object-fit: contain;
  padding: 2em;
}
.export-format .card-button {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
