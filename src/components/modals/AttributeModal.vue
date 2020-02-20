<template>
  <b-modal :ref="`attributeModal-${id}`" ok-only :ok-title="$t('buttonClose')" size="xl" :title="$t('modalTitleAttributes')">
    <div>
      <template v-if="dataset">
        <h2>{{ $t('modalTitleDatasetAttributes') }}</h2>
        <p>{{ $t('modalTextDatasetAttributes') }}</p>
        <DatasetAttributeTable :getData="getAttributeData" :downloadTable="downloadAttributes" />
      </template>
      <div v-if="dataset && dataset.dublinCore" class="mt-3">
        <h2>{{ $t('modalTitleDatasetDublinCore') }}</h2>
        <p>{{ $t('modalTextDatasetDublinCore') }}</p>
        <dl class="row">
          <template v-if="dataset.dublinCore.title">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreTitle') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.title.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.creator">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreCreator') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.creator.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.subject">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreSubject') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.subject.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.description">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreDescription') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.description.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.publisher">
            <dt class="col-sm-3 text-right">{{ $t('dublinCorePublisher') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.publisher.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.contributor">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreContributor') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.contributor.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.date">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreDate') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.date.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.type">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreType') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.type.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.format">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreFormat') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.format.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.identifier">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreIdentifier') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.identifier.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.source">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreSource') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.source.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.language">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreLanguage') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.language.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.relation">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreRelation') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.relation.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.coverage">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreCoverage') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.coverage.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.rights">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreRights') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.rights.join(', ')" />
          </template>
        </dl>
        <a  class="btn btn-secondary" :href="getHref()" :download="`dataset-${dataset.datasetId}-dublin-core.json`" ><i class="mdi mdi-18px mdi-download" /></a>
      </div>
    </div>
  </b-modal>
</template>

<script>
import DatasetAttributeTable from '@/components/tables/DatasetAttributeTable'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  props: {
    dataset: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      id: this.uuidv4()
    }
  },
  components: {
    DatasetAttributeTable
  },
  mixins: [ datasetApi ],
  methods: {
    getHref: function () {
      return 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.dataset.dublinCore))
    },
    getAttributeData: function (data, callback) {
      return this.apiPostDatasetAttributeTable(this.dataset.datasetId, data, callback)
    },
    downloadAttributes: function (data, callback) {
      return this.apiPostDatasetAttributeTableExport(this.dataset.datasetId, data, callback)
    },
    show: function () {
      this.$refs['attributeModal-' + this.id].show()
    }
  }
}
</script>

<style>

</style>
