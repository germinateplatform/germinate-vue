<template>
  <div>
    <div v-if="experimentType">
      <h1>{{ experimentTypes[experimentType].text() }}</h1>
      <DatasetsTable :getData="getData" :getIds="getIds" :filterOn="filterOn" :selectable="true" class="mb-3"/>
      <b-button variant="success"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment"/> Continue</b-button>
    </div>
    <div v-else>
      <h1>Invalid experiment type</h1>
      <p>Are you looking for any of these?</p>
      <ul>
        <li v-for="(experimentType, name) in getExperimentTypes()" :key="`experiment-type-${name}`">
          <router-link :to="`/export/${name}`">{{ experimentType.text() }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import DatasetsTable from '@/components/tables/DatasetsTable'
export default {
  data: function () {
    return {
      filterOn: null,
      experimentType: null
    }
  },
  components: {
    DatasetsTable
  },
  methods: {
    getExperimentTypes: function () {
      var result = Object.assign({}, this.experimentTypes)
      delete result.unknown
      return result
    },
    getData: function (data, callback) {
      return this.apiPostDatasetTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostDatasetTableIds(data, callback)
    }
  },
  created: function () {
    var experimentType = this.$route.params.experimentType

    if (this.experimentTypes[experimentType]) {
      this.experimentType = experimentType

      this.filterOn = [{
        column: {
          name: 'experimentType',
          type: String
        },
        canBeChanged: false,
        comparator: 'equals',
        operator: 'and',
        values: [this.experimentType]
      }, {
        column: {
          name: 'isExternal',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [0]
      }]
    }
  }
}
</script>

<style>

</style>
