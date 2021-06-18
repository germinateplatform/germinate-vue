<template>
  <div>
    <b-button-group class="mt-3">
      <b-button v-for="dataType in dataTypeOptions"
              :key="dataType.key"
              :pressed="selectedDataTypeKey === dataType.key"
              variant="outline-primary"
              @click="setDataType(dataType.key)">
        <i :class="`mdi mdi-18px fix-alignment ${dataType.icon}`" /><span> {{ dataType.text() }}</span>
      </b-button>
    </b-button-group>

    <DatasetTable :getData="getDatasetData"
                  :getIds="getDatasetIds"
                  :selectable="true"
                  selectionMode="multi"
                  ref="datasetTable"
                  class="mt-3"
                  v-on:license-accepted="update"
                  v-on:selection-changed="updateSelectedDatasetIds" v-if="selectedDataType.datasetType" />

    <template v-if="selectedDataType.key === 'GERMPLASM_COLUMN' || (selectedDatasetIds != null && selectedDatasetIds.length > 0 && itemOptions !== null && itemOptions.length > 0)">
      <template v-if="showGroups && (selectedDataType.key === 'GERMPLASM_COLUMN' || selectedDataType.groupType)">
        <hr />
        <ExportGroupSelection :info="null" :multiple="true" title="widgetCrossDataTypeSelectionSelectGroupTitle" text="widgetCrossDataTypeSelectionSelectGroupText" :tooltip="null" :itemType="selectedDataType.itemType" :groups="groups" ref="groupSelection" class="mt-3"/>
      </template>

      <hr />
      <h2 class="mt-3">{{ $t('widgetCrossDataTypeSelectionSelectDimension') }}</h2>
      <b-form-select :options="itemOptions" v-model="selectedItem" class="mt-3"/>
    </template>
  </div>  
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import ExportGroupSelection from '@/components/export/ExportGroupSelection'

import climateApi from '@/mixins/api/climate.js'
import compoundApi from '@/mixins/api/compound.js'
import datasetApi from '@/mixins/api/dataset.js'
import germplasmApi from '@/mixins/api/germplasm.js'
import groupApi from '@/mixins/api/group.js'
import traitApi from '@/mixins/api/trait.js'

export default {
  components: {
    DatasetTable,
    ExportGroupSelection
  },
  props: {
    showGroups: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      groups: [],
      items: [],
      selectedItem: null,
      selectedDatasetIds: null,
      selectedDataTypeKey: 'TRAIT',
      dataTypeOptions: [{
        key: 'TRAIT',
        icon: 'mdi-shovel',
        itemType: 'germplasm',
        color: () => this.serverSettings.colorsTemplate[4 % this.serverSettings.colorsTemplate.length],
        text: () => this.$t('datasetTypeTrials'),
        groupType: 'germinatebase',
        datasetType: 'trials',
        idKey: 'traitId',
        nameKey: 'traitName'
      }, {
        key: 'COMPOUND',
        icon: 'mdi-flask',
        itemType: 'germplasm',
        color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
        text: () => this.$t('datasetTypeCompound'),
        groupType: 'germinatebase',
        datasetType: 'compound',
        idKey: 'compoundId',
        nameKey: 'compoundName'
      }, {
        key: 'CLIMATE',
        icon: 'mdi-weather-snowy-rainy',
        itemType: 'locations',
        color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
        text: () => this.$t('datasetTypeClimate'),
        groupType: 'locations',
        datasetType: 'climate',
        idKey: 'climateId',
        nameKey: 'climateName'
      }, {
        key: 'GERMPLASM_COLUMN',
        icon: 'mdi-sprout',
        itemType: 'germplasm',
        color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
        text: () => this.$t('widgetCrossDataTypeSelectionTypeGermplasmColumn'),
        groupType: null,
        datasetType: null,
        idKey: 'id',
        nameKey: 'name'
      }]
    }
  },
  computed: {
    selectedDataType: function () {
      return this.dataTypeOptions.find(o => o.key === this.selectedDataTypeKey)
    },
    itemOptions: function () {
      const result = [{
        value: null,
        text: this.$t('widgetCrossDataTypeSelectionSelectDimension'),
        disabled: true
      }]

      this.items.forEach(i => {
        let itemName = i[this.selectedDataType.nameKey]

        if (i.unitAbbreviation) {
          itemName += ` [${i.unitAbbreviation}]`
        }

        i.displayName = itemName

        result.push({
          value: i,
          text: itemName
        })
      })

      return result
    }
  },
  watch: {
    selectedDataType: function () {
      this.selectedDatasetIds = null
      this.groups = []
      this.items = []
      this.update()

      if (this.$refs.datasetTable) {
        this.$refs.datasetTable.refresh()
      }
    }
  },
  mixins: [ climateApi, compoundApi, datasetApi, germplasmApi, groupApi, traitApi ],
  methods: {
    setDataType: function (type) {
      this.selectedDataTypeKey = type
      this.$emit('data-type-changed', type)
    },
    updateSelectedDatasetIds: function (ids) {
      this.selectedDatasetIds = ids
      this.update()
    },
    getDatasetData: function (data, callback) {
      this.adjustData(data)
      return this.apiPostDatasetTable(data, callback)
    },
    getDatasetIds: function (data, callback) {
      this.adjustData(data)
      return this.apiPostDatasetTableIds(data, callback)
    },
    adjustData: function (data) {
      // Always filter for just the current dataset type
      const additional = [{
        column: 'datasetType',
        comparator: 'equals',
        operator: 'and',
        values: [this.selectedDataType.datasetType]
      }, {
        column: 'isExternal',
        comparator: 'equals',
        operator: 'and',
        values: [0]
      }]

      if (!data.filter) {
        data.filter = additional
      } else {
        data.filter = additional.concat(data.filter)
      }
    },
    getSelection: function () {
      const result = {
        dataType: this.selectedDataTypeKey,
        itemId: this.selectedItem[this.selectedDataType.idKey],
        itemName: this.selectedItem.displayName,
        datasetIds: this.selectedDatasetIds
      }

      if (this.$refs.groupSelection) {
        const settings = this.$refs.groupSelection.getSettings()

        // If the "Marked items" item is selected, set the individual ids
        const markedSelected = settings.selectedGroups.filter(g => g === null)
        if (settings.specialGroupSelection !== 'all' && markedSelected.length > 0) {
          if (this.selectedDataType.itemType === 'germplasm') {
            result.markedIds = this.markedGermplasm
          } else if (this.selectedDataType.itemType === 'locations') {
            result.markedIds = this.markedLocations
          }
        }

        // Set the selected group ids
        const groups = settings.selectedGroups.filter(g => g !== null && g.groupId > 0).map(g => g.groupId)
        if (settings.specialGroupSelection !== 'all' && groups.length > 0) {
          if (this.selectedDataType.itemType === 'germplasm') {
            result.groupIds = groups
          } else if (this.selectedDataType.itemType === 'locations') {
            result.groupIds = groups
          }
        }
      }

      return result
    },
    update: function () {
      this.selectedItem = null

      if (this.selectedDataType.groupType) {
        const request = {
          groupType: this.selectedDataType.groupType,
          datasetType: this.selectedDataType.datasetType,
          datasetIds: this.selectedDatasetIds
        }
        // Get groups
        this.apiPostDatasetGroups(request, result => {
          this.groups = result
        })
      } else {
        this.apiPostGroupTable({
          page: 1,
          limit: this.MAX_JAVA_INTEGER,
          filter: [{
            column: 'groupType',
            operator: 'and',
            comparator: 'equals',
            values: [ 'germinatebase' ]
          }]
        }, result => {
          this.groups = result.data
        })
      }

      switch (this.selectedDataTypeKey) {
        case 'TRAIT':
          this.apiPostDatasetTraits(this.selectedDatasetIds, result => {
            this.items = result
          })
          break
        case 'COMPOUND':
          this.apiPostDatasetCompounds(this.selectedDatasetIds, result => {
            this.items = result
          })
          break
        case 'CLIMATE':
          this.apiPostDatasetClimates(this.selectedDatasetIds, result => {
            this.items = result
          })
          break
        case 'GERMPLASM_COLUMN':
          this.apiGetGermplasmTableColumns(result => {
            this.items = result.map(c => {
              let name = c.replaceAll('_', ' ')
              name = name.charAt(0).toUpperCase() + name.slice(1)
              return {
                id: c,
                name: name
              }
            })
          })
      }
    }
  },
  created: function () {
    this.update()
  }
}
</script>

<style>

</style>
