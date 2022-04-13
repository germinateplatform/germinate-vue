<template>
  <div>
    <h1>{{ $t('pageExportFormatsTitle') }}</h1>
    <p>{{ $t('pageExportFormatsText') }}</p>

    <!-- Badges for the types -->
    <b-badge v-for="(tag, name) in tags"
             :key="`export-format-tag-${name}`"
             class="dispay-inline mr-2"
             :to="{ name: 'about-export-formats-specific', params: { format: name } }"
             :style="`background: ${getBackgroundColor(name)}; color: ${getTextColor(name)}`"
             event=""
             @click.prevent="selectTag(name)">
      <i class="mdi mdi-tag " /> {{ tag.text() }}
    </b-badge>

    <!-- Format cards -->
    <b-row class="mt-3">
      <b-col xs=12 sm=6 md=4 xl=3 v-for="format in getExportFormats()" :key="`export-format-${format.name}`" class="export-format mb-4 col-xxl-2">
        <b-card
          :img-src="`./img/${format.logo}`"
          :img-alt="format.name"
          img-top
          no-body
          bg-variant="light"
          class="mb-2 h-100">
          <b-card-body class="d-flex flex-column bg-dark">
            <b-card-title>{{ format.name }}</b-card-title>
            <b-card-text>
              {{ format.text }}
            </b-card-text>
            <div>
              <b-badge v-for="(tag, index) in format.tags" :key="`export-format-tag-individual-${index}`" class="dispay-inline mr-2" variant="light" :style="`background: ${getBackgroundColor(tag)}; color: ${getTextColor(tag)}`">
                <i class="mdi mdi-tag " /> {{ tags[tag].text() }}
              </b-badge>
            </div>
          </b-card-body>
          <!-- Download button -->
          <b-button :href="format.link" target="_blank" rel="noopener noreferrer" variant="primary" class="mt-auto card-button"><i class="mdi mdi-18px fix-alignment mdi-download"/> {{ $t('buttonDownload') }}</b-button>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import typesMixin from '@/mixins/types.js'
import colorMixin from '@/mixins/colors.js'

export default {
  data: function () {
    return {
      selectedTag: 'all',
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
      }
    }
  },
  props: {
    tag: {
      type: String,
      default: null
    }
  },
  mixins: [typesMixin, colorMixin],
  methods: {
    getBackgroundColor: function (tag) {
      const index = Object.keys(this.tags).indexOf(tag)
      return this.serverSettings.colorsTemplate[index % this.serverSettings.colorsTemplate.length]
    },
    getTextColor: function (tag) {
      const color = this.getBackgroundColor(tag)
      return this.getHighContrastTextColor(color)
    },
    getExportFormats: function () {
      if (this.selectedTag && this.selectedTag !== 'all') {
        return Object.keys(this.exportFormats)
          .filter(f => this.exportFormats[f].tags.indexOf(this.selectedTag) !== -1)
          .map(f => this.exportFormats[f])
      } else {
        return this.exportFormats
      }
    },
    selectTag: function (newTag) {
      if (newTag) {
        // Change the URL according to the user selection only if this component hasn't been called with a specific tag
        if (this.tag === null) {
          window.history.replaceState({}, null, this.$router.resolve({ name: 'about-export-formats-specific', params: { format: newTag } }).href)
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
