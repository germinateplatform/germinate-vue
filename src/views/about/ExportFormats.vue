<template>
  <div>
    <h1>{{ $t('pageExportFormatsTitle') }}</h1>
    <p>{{ $t('pageExportFormatsText') }}</p>

    <b-badge v-for="(tag, name) in tags"
             :key="`export-format-tag-${name}`"
             class="dispay-inline mr-2"
             :variant="name === selectedTag ? 'primary' : 'light'"
             :to="{ name: 'about-export-formats-specific', params: { format: name } }"
             event=""
             @click.prevent="selectTag(name)">
      <i class="mdi mdi-tag " /> {{ tag.text() }}
    </b-badge>

    <b-row class="mt-3">
      <b-col xs=12 sm=6 md=4 xl=3 v-for="format in getExportFormats()" :key="`export-format-${format.name}`" class="export-format mb-4">
        <b-card
          :img-src="`/img/${format.logo}`"
          :img-alt="format.name"
          img-top
          no-body
          bg-variant="light"
          class="mb-2 h-100">
          <b-card-body class="d-flex flex-column bg-dark">
            <b-card-title>{{ format.name }}</b-card-title>
            <b-card-text>
              {{ format.text() }}
            </b-card-text>
            <div>
              <b-badge v-for="tag in format.tags" :key="`export-format-tag-individual-${tag}`" class="dispay-inline mr-2" variant="light"><i class="mdi mdi-tag " /> {{ tags[tag].text() }}</b-badge>
            </div>

            <b-button :href="format.link" target="_blank" variant="primary" class="mt-auto"><i class="mdi mdi-18px fix-alignment mdi-download"/> {{ $t('buttonDownload') }}</b-button>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      selectedTag: 'all',
      exportFormats: {
        flapjack: {
          name: 'Flapjack',
          logo: 'tools/flapjack.png',
          text: () => this.$t('pageExportFormatsFlapjackText'),
          tags: ['genotype', 'phenotype'],
          link: 'https://ics.hutton.ac.uk/flapjack'
        },
        helium: {
          name: 'Helium',
          logo: 'tools/helium.png',
          text: () => this.$t('pageExportFormatsHeliumText'),
          tags: ['pedigree', 'phenotype'],
          link: 'https://ics.hutton.ac.uk/helium'
        },
        curlywhirly: {
          name: 'CurlyWhirly',
          logo: 'tools/curlywhirly.png',
          text: () => this.$t('pageExportFormatsCurlyWhirlyText'),
          tags: ['pca'],
          link: 'https://ics.hutton.ac.uk/curlywhirly'
        },
        excel: {
          name: 'Excel',
          logo: 'tools/excel.svg',
          text: () => this.$t('pageExportFormatsExcelText'),
          tags: ['genotype', 'phenotype'],
          link: 'https://products.office.com/excel'
        },
        strudel: {
          name: 'Strudel',
          logo: 'tools/strudel.png',
          text: () => this.$t('pageExportFormatsStrudelText'),
          tags: ['genotype'],
          link: 'https://ics.hutton.ac.uk/strudel'
        }
      },
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
  methods: {
    getExportFormats: function () {
      if (this.selectedTag && this.selectedTag !== 'all') {
        return Object.keys(this.exportFormats)
          .filter(f => this.exportFormats[f].tags.indexOf(this.selectedTag) !== -1)
          .map(f => this.exportFormats[f])
      } else {
        return this.exportFormats
      }
    },
    selectTag: function (tag) {
      if (tag) {
        // Change the URL according to the user selection
        window.history.replaceState({}, null, this.$router.resolve({ name: 'about-export-formats-specific', params: { format: tag } }).href)
        this.selectedTag = tag
      }
    }
  },
  mounted: function () {
    this.selectTag(this.$route.params.format)
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
</style>
