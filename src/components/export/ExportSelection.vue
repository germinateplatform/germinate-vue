<template>
  <b-row>
    <b-col cols=12 md=6 v-if="items && items.length > 0">
      <h2>{{ $t(texts.exportTitle) }}</h2>
      <p>{{ $t(texts.exportText) }}</p>
      <!-- Selected trait/compound/climate -->
      <SearchableSelect v-model="selectedItems" :options="itemOptions" :selectSize=7 />
      <!-- <b-form-select multiple v-model="selectedItems" :options="itemOptions" :select-size=7 /> -->
      <p class="text-danger" v-if="max !== null && selectedItemCount() > max">{{ $tc('pageExportSelectItemMaximum', max) }}</p>
      <p class="text-info" v-if="min !== null && selectedItemCount() < min">{{ $tc('pageExportSelectItemMinimum', min) }}</p>
    </b-col>
    <b-col cols=12 md=6>
      <!-- Selected germplasm/location groups -->
      <ExportGroupSelection :info="groupSelectionInfo" :multiple="multiple" :title="texts.groupTitle" :text="texts.groupText" :tooltip="texts.groupTooltip" :itemType="itemType" :groups="groups" ref="groupSelection"/>
    </b-col>
    <b-col cols=12>
      <b-btn variant="primary" @click="buttonPressed" :disabled="getButtonDisabled()"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment" /> {{ $t(texts.exportButton) }}</b-btn>
    </b-col>
  </b-row>
</template>

<script>
import ExportGroupSelection from '@/components/export/ExportGroupSelection'
import SearchableSelect from '@/components/util/SearchableSelect'

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
    },
    multiple: {
      type: Boolean,
      default: true
    },
    groupSelectionInfo: {
      type: Function,
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
    datasetIds: function () {
      this.updateItems()
    }
  },
  components: {
    ExportGroupSelection,
    SearchableSelect
  },
  methods: {
    getButtonDisabled: function () {
      if (this.$refs.groupSelection) {
        const settings = this.$refs.groupSelection.getSettings()

        let disabled = this.min !== null && this.selectedItemCount() < this.min

        if (settings.specialGroupSelection === 'selection') {
          disabled = disabled || settings.selectedGroups.length < 1
        }
        disabled = disabled || (this.max !== null && this.selectedItemCount() > this.max)
        return disabled
      } else {
        return true
      }
    },
    buttonPressed: function () {
      let query = {
        xGroupIds: null,
        xIds: null,
        yGroupIds: null,
        yIds: null,
        currentItemCount: null,
        datasetIds: this.datasetIds
      }

      const settings = this.$refs.groupSelection.getSettings()

      // If the "Marked items" item is selected, set the individual ids
      const markedSelected = settings.selectedGroups.filter(g => g === null)
      if (settings.specialGroupSelection !== 'all' && markedSelected.length > 0) {
        query.yIds = this.markedGermplasm
      }

      // Set the selected group ids
      const groups = settings.selectedGroups.filter(g => g !== null && g.groupId > 0).map(g => g.groupId)
      if (settings.specialGroupSelection !== 'all' && groups.length > 0) {
        query.yGroupIds = groups
      }

      // Set selected trait/compound/climate ids
      if (this.selectedItemCount() > 0) {
        query.xIds = this.selectedItems.map(t => t[this.idKey])
      }

      this.$emit('button-clicked', query, this.selectedItems)
    },
    selectedItemCount: function () {
      if (!this.selectedItems) {
        return 0
      } else if (Array.isArray(this.selectedItems)) {
        return this.selectedItems.length
      } else {
        return this.selectedItems !== null ? 1 : 0
      }
    },
    updateItems: function () {
      this.getItems(result => {
        this.items = result
        this.itemOptions = []
        this.items.forEach(t => {
          // If we're only supposed to show numerics, exclude chars
          if (!this.onlyNumeric || (t.dataType === 'numeric')) {
            let itemName = t[this.nameKey]

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
