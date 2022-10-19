<template>
  <div>
    <h1>{{ $t('pageDataUploadTitle') }}</h1>
    <span v-html="$t('pageDataUploadText')" />
    <b-row class="template-tabs">
      <!-- Data template banner buttons -->
      <b-col v-for="(type, name, index) in templateImportTypes" :key="`template-type-${index}`" cols=6 sm=4 class="col-xxl-3 mb-3">
        <a href="#" @click.prevent="onTemplateTypeSelected(type, name)">
          <b-card no-body :style="`border: 1px solid ${type.color()}; filter: ${getFilter(name)};`">
            <b-card-body :style="`background: linear-gradient(330deg, ${getBrighterColor(type.color())} 0%, ${type.color()} 50%); color: white;`">
              <b-row>
                <b-col cols=12 class="text-center">
                  <MdiIcon :size="48" :path="type.path" />
                </b-col>
              </b-row>
            </b-card-body>
            <b-card-footer :style="`color: ${type.color()}`">
              <MdiIcon :path="mdiArrowRightBoldCircle" /><span> {{ type.text() }}</span>
            </b-card-footer>
          </b-card>
        </a>
      </b-col>
    </b-row>

    <template v-if="templateType">
      <!-- File input -->
      <b-form-group :label="$t('formLabelDataUploadFile')" label-for="upload-file">
        <b-form-file
          id="trials-dataset"
          v-model="file"
          :state="Boolean(file)"
          :placeholder="$t('pageDataUploadFilePlaceholder')"
          :accept="templateImportTypes[templateType].accepts" />
      </b-form-group>
      <!-- Selected file -->
      <div class="mt-3" v-if="file">{{ $t('pageDataUploadSelectedFile', { file: file.name }) }}</div>

      <div v-if="templateType === 'genotype' || templateType === 'trial' || templateType === 'climate' || templateType === 'pedigree'">
        <hr />
        <h3>{{ $t('pageDataUploadDatasetStateTitle') }}</h3>
        <b-button-group class="flex-wrap">
          <b-button class="mb-2" v-for="datasetState in datasetStates"
                  :key="datasetState.id"
                  :pressed="datasetStateId === datasetState.id"
                  variant="outline-primary"
                  @click="datasetStateId = datasetState.id">
            <MdiIcon :path="datasetState.path" /><span> {{ datasetState.text() }}</span>
          </b-button>
        </b-button-group>
      </div>

      <div v-if="templateType === 'mcpd'">
        <hr />
        <b-form-radio-group
          v-model="isUpdate"
          button-variant="outline-primary"
          :options="updateOptions"
          buttons />
        <p class="text-muted" v-if="isUpdate">{{ $t('pageDataUploadUpdateExplanationUpdate') }}</p>
        <p class="text-muted" v-else>{{ $t('pageDataUploadUpdateExplanationInsert') }}</p>
      </div>

      <div v-if="templateType === 'shapefile'">
        <hr />
        <b-form-group :label="$t('formLabelDataUploadDataset')" label-for="trials-dataset">
          <b-form-select :options="datasetOptions" v-model="datasetId" />
        </b-form-group>
      </div>

      <!-- Submit -->
      <b-button variant="success" :disabled="submitDisabled" class="mt-3" @click="onSubmit"><MdiIcon :path="mdiUpload" /> {{ $t('pageDataUploadCheckFileButton') }}</b-button>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import { apiPostDataUpload } from '@/mixins/api/misc.js'
import { templateImportTypes, datasetStates } from '@/mixins/types.js'
import { hexToRgb, rgbColorToHex, brighten } from '@/mixins/colors.js'

import { mdiArrowRightBoldCircle, mdiUpload } from '@mdi/js'
import { Pages } from '@/mixins/pages'
import { apiPostDatasetTable } from '@/mixins/api/dataset'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      templateImportTypes,
      datasetStates,
      mdiArrowRightBoldCircle,
      mdiUpload,
      datasetId: null,
      trialsDatasets: null,
      file: null,
      uuids: null,
      isUpdate: false,
      templateType: null,
      datasetStateId: 1,
      updateOptions: [
        { text: this.$t('pageDataUploadUpdateOptionInsert'), value: false },
        { text: this.$t('pageDataUploadUpdateOptionUpdate'), value: true }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings'
    ]),
    datasetOptions: function () {
      if (this.trialsDatasets) {
        return this.trialsDatasets.map(ds => {
          return {
            value: ds.datasetId,
            text: ds.datasetName
          }
        })
      } else {
        return []
      }
    },
    submitDisabled: function () {
      let disabled = this.file === null

      if (this.templateType === 'shapefile') {
        disabled ||= this.datasetId === null
      }

      return disabled
    }
  },
  watch: {
    templateType: function (newValue) {
      // Reset the selected file
      this.file = null
      // Reset the dataset state
      this.datasetStateId = 1
      // Update the URL
      window.history.replaceState({}, null, this.$router.resolve({ name: Pages.importUploadType, params: { templateType: newValue } }).href)
    }
  },
  methods: {
    getBrighterColor: function (color) {
      return rgbColorToHex(brighten(hexToRgb(color)))
    },
    onTemplateTypeSelected: function (type, name) {
      if (!type.disabled) {
        this.templateType = name
      }
    },
    getFilter: function (type) {
      return type === this.templateType ? '' : 'brightness(75%)'
    },
    onSubmit: function () {
      const formData = new FormData()
      formData.append('fileToUpload', this.file)

      emitter.emit('show-loading', true)
      apiPostDataUpload(formData, this.templateType, this.templateType === 'mcpd' ? this.isUpdate : false, this.templateType === 'shapefile' ? this.datasetId : null, this.datasetStateId, result => {
        this.uuids = result

        if (result) {
          result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))
        }

        emitter.emit('toggle-aside', 'upload')
        emitter.emit('show-loading', false)

        this.file = null
      })
    }
  },
  created: function () {
    if (this.storeServerSettings.dataImportMode === 'NONE') {
      this.$router.push({ name: Pages.fourZeroThree })
    }

    const type = this.$route.params.templateType

    if (type) {
      const matches = Object.keys(templateImportTypes)
        .filter(t => t === type)

      if (matches && matches.length > 0 && !templateImportTypes[matches[0]].disabled) {
        this.templateType = type
      } else {
        window.history.replaceState({}, null, this.$router.resolve({ name: Pages.importUpload }).href)
      }

      apiPostDatasetTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filter: [{
          column: 'datasetType',
          comparator: 'equals',
          operator: 'and',
          values: ['trials']
        }]
      }, result => {
        if (result && result.data) {
          this.trialsDatasets = result.data

          if (result.data.length > 0) {
            this.datasetId = result.data[0].datasetId
          }
        }
      })
    }
  }
}
</script>

<style>
.template-tabs *:hover {
  text-decoration: none;
}
.template-tabs .card-footer i.mdi {
  vertical-align: sub;
}
.template-tabs .card,
.template-tabs .card * {
  transition: filter 0.15s;
}
</style>
