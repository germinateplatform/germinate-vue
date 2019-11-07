<template>
  <b-row>
    <b-col cols=12 md=6 v-if="items && items.length > 0">
      <h2>{{ $t(texts.title) }}</h2>
      <p>{{ $t(texts.text) }}</p>
      <b-form-select multiple v-model="selectedItems" :options="itemOptions" :select-size=7 />
      <p class="text-danger" v-if="max !== null && selectedItems.length > max">{{ $tc('pageExportSelectItemMaximum', max) }}</p>
      <p class="text-info" v-if="min !== null && selectedItems.length < min">{{ $tc('pageExportSelectItemMinimum', min) }}</p>
    </b-col>
    <b-col cols=12 md=6>
      <ExportGroupSelection :title="texts.groupTitle" :text="texts.groupText" :tooltip="texts.groupTooltip" :itemType="itemType" :groups="groups" ref="groupSelection"/>
    </b-col>
    <b-col cols=12>
      <b-btn variant="primary" @click="buttonPressed" :disabled="buttonDisabled()"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment" /> {{ $t(texts.button) }}</b-btn>
    </b-col>
  </b-row>
</template>

<script>
import ExportGroupSelection from '@/components/export/ExportGroupSelection'

export default {
  props: {
    texts: {
      type: Object,
      default: () => null
    },
    itemType: {
      type: String,
      default: 'germplasm'
    },
    groupType: {
      type: String,
      default: 'germinatebase'
    },
    experimentType: {
      type: String,
      default: null
    },
    datasetIds: {
      type: Array,
      default: () => null
    },
    idKey: {
      type: String,
      default: null
    },
    nameKey: {
      type: String,
      default: null
    },
    onlyNumeric: {
      type: Boolean,
      default: false
    },
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: null
    },
    getItems: {
      type: Function,
      default: () => []
    }
  },
  data: function () {
    return {
      items: [],
      selectedItems: [],
      itemOptions: [],
      groups: null
    }
  },
  watch: {
    datasetIds: function (newValue, oldValue) {
      this.updateItems()
      this.updateGroups()
    }
  },
  components: {
    ExportGroupSelection
  },
  methods: {
    buttonDisabled: function () {
      if (this.$refs.groupSelection) {
        var settings = this.$refs.groupSelection.getSettings()

        var disabled = this.min !== null && this.selectedItems.length < this.min

        if (settings.specialGroupSelection === 'selection') {
          disabled = disabled || settings.selectedGroups.length < 1
        }
        disabled = disabled || (this.max !== null && this.selectedItems.length > this.max)
        return disabled
      } else {
        return true
      }
    },
    buttonPressed: function () {
      var query = {
        xGroupIds: null,
        xIds: null,
        yGroupIds: null,
        yIds: null,
        currentItemCount: null,
        datasetIds: this.datasetIds
      }

      var settings = this.$refs.groupSelection.getSettings()

      var markedSelected = settings.selectedGroups.filter(g => g.isMarkedItem === true)
      if (settings.specialGroupSelection !== 'all' && markedSelected.length > 0) {
        query.yIds = this.markedIds.germplasm
      }

      var groups = settings.selectedGroups.filter(g => g.groupId > 0).map(g => g.groupId)
      if (settings.specialGroupSelection !== 'all' && groups.length > 0) {
        query.yGroupIds = groups
      }

      if (this.selectedItems.length > 0) {
        query.xIds = this.selectedItems.map(t => t[this.idKey])
      }

      this.$emit('button-clicked', query, this.selectedItems)
    },
    updateItems: function () {
      this.getItems(result => {
        this.items = result
        this.itemOptions = []
        this.items.forEach(t => {
          // If we're only supposed to show numerics, exclude chars
          if (!this.onlyNumeric || (t.dataType !== 'char_')) {
            var itemName = t[this.nameKey]

            if (t.unitAbbreviation) {
              itemName += ` [${t.unitAbbreviation}]`
            }

            this.itemOptions.push({
              value: t,
              text: itemName
            })

            t.displayName = itemName
          }
        })
      })
    },
    updateGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: this.groupType,
        experimentType: this.experimentType
      }
      this.apiPostDatasetGroups(request, result => {
        this.groups = result
      })
    }
  },
  mounted: function () {
    if (this.datasetIds) {
      this.updateItems()
      this.updateGroups()
    }
  }
}
</script>

<style>
.group-select > option:first-child {
  border-bottom: 1px solid;
}
</style>