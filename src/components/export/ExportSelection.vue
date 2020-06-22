<template>
  <b-row>
    <b-col cols=12 md=6 v-if="items && items.length > 0">
      <h2>{{ $t(texts.exportTitle) }}</h2>
      <p>{{ $t(texts.exportText) }}</p>
      <!-- Selected trait/compound/climate -->
      <b-form-select multiple v-model="selectedItems" :options="itemOptions" :select-size=7 />
      <p class="text-danger" v-if="max !== null && selectedItems.length > max">{{ $tc('pageExportSelectItemMaximum', max) }}</p>
      <p class="text-info" v-if="min !== null && selectedItems.length < min">{{ $tc('pageExportSelectItemMinimum', min) }}</p>
    </b-col>
    <b-col cols=12 md=6>
      <!-- Selected germplasm/location groups -->
      <ExportGroupSelection :title="texts.groupTitle" :text="texts.groupText" :tooltip="texts.groupTooltip" :itemType="itemType" :groups="groups" ref="groupSelection"/>
    </b-col>
    <b-col cols=12>
      <b-btn variant="primary" @click="buttonPressed" :disabled="buttonDisabled()"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment" /> {{ $t(texts.exportButton) }}</b-btn>
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
    },
    groups: {
      type: Array,
      default: null
    }
  },
  data: function () {
    return {
      items: [],
      selectedItems: [],
      itemOptions: []
    }
  },
  watch: {
    datasetIds: function (newValue, oldValue) {
      this.updateItems()
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

      // If the "Marked items" item is selected, set the individual ids
      var markedSelected = settings.selectedGroups.filter(g => g.isMarkedItem === true)
      if (settings.specialGroupSelection !== 'all' && markedSelected.length > 0) {
        query.yIds = this.markedIds.germplasm
      }

      // Set the selected group ids
      var groups = settings.selectedGroups.filter(g => g.groupId > 0).map(g => g.groupId)
      if (settings.specialGroupSelection !== 'all' && groups.length > 0) {
        query.yGroupIds = groups
      }

      // Set selected trait/compound/climate ids
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
    }
  },
  mounted: function () {
    if (this.datasetIds) {
      this.updateItems()
    }
  }
}
</script>

<style>
.group-select > option:first-child {
  border-bottom: 1px solid;
}
</style>
