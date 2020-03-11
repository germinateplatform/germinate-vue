<template>
  <div>
    <h1>{{ $t('pageDataUploadTitle') }}</h1>
    <span v-html="$t('pageDataUploadText')" />
    <b-row class="template-tabs">
      <b-col sm=1 />
      <b-col v-for="(type, name, index) in templateImportTypes" :key="`template-type-${index}`" xs=6 sm=2 >
        <a href="#" @click.prevent="templateType = name">
          <b-card no-body :style="`border: 1px solid ${getColor(index)}; filter: ${getFilter(name)};`">
            <b-card-body :style="`background-color: ${getColor(index)}; color: white;`">
              <b-row>
                <b-col cols=12 class="text-center">
                  <i :class="`mdi mdi-48px ${type.icon}`" />
                </b-col>
              </b-row>
            </b-card-body>
            <b-card-footer :style="`color: ${getColor(index)}`">
              <i class="mdi mdi-18px mdi-arrow-right-bold-circle" /><span> {{ type.text() }}</span>
            </b-card-footer>
          </b-card>
        </a>
      </b-col>
      <b-col sm=1 />
    </b-row>

    <template v-if="templateType">
      <b-form-file
        v-model="file"
        :state="Boolean(file)"
        :placeholder="$t('pageDataUploadFilePlaceholder')"
        accept=".xlsx" />
      <div class="mt-3" v-if="file">{{ $t('pageDataUploadSelectedFile', { file: file.name }) }}</div>

      <b-button variant="success" :disabled="!file" class="mt-3" @click="onSubmit"><i class="mdi mdi-18px fix-alignment mdi-upload" /> {{ $t('pageDataUploadCheckFileButton') }}</b-button>
    </template>
  </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'
import miscApi from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      file: null,
      uuids: null,
      templateType: null
    }
  },
  watch: {
    templateType: function (newValue, oldValue) {
      this.file = null
      window.history.replaceState({}, null, this.$router.resolve({ name: 'import-upload-type', params: { templateType: newValue } }).href)
    }
  },
  mixins: [ miscApi ],
  methods: {
    getFilter: function (type) {
      return type === this.templateType ? '' : 'brightness(75%)'
    },
    getColor: function (index) {
      if (!this.serverSettings || !this.serverSettings.colorsTemplate) {
        return '#00acef'
      } else {
        const colors = this.serverSettings.colorsTemplate
        return colors[index % colors.length]
      }
    },
    onSubmit: function () {
      let formData = new FormData()
      formData.append('fileToUpload', this.file)

      EventBus.$emit('show-loading', true)
      this.apiPostDataUpload(formData, this.templateType, result => {
        this.uuids = result

        if (result) {
          result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))
        }

        EventBus.$emit('toggle-aside')
        EventBus.$emit('show-loading', false)
      })
    }
  },
  created: function () {
    const type = this.$route.params.templateType

    if (type) {
      const matches = Object.keys(this.templateImportTypes)
        .filter(t => t === type)

      if (matches && matches.length > 0) {
        this.templateType = type
      }
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
