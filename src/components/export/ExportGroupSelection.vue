<template>
  <div>
    <h2 v-if="title">{{ $t(title) }}</h2>
    <p v-if="text">{{ $t(text) }}</p>
    <div class="select-with-options">
      <div :id="`group-selection-${uuid}`" :class="groups === null ? 'loading-select' : ''">
        <!-- Loading indicator -->
        <b-progress :value="100" height="5px" variant="primary" striped animated v-if="groups === null" />
        <!-- Group select -->
        <SearchableSelect v-model="selectedGroups" :multiple="multiple" :options="groupOptions" :selectSize="selectSize" className="group-select" :disabled="specialGroupSelection !== 'selection'" @change="$emit('change')"/>
      </div>
      <!-- Tooltip shown when group selection is disabled -->
      <b-tooltip :target="`group-selection-${uuid}`" triggers="hover" v-if="tooltip !== null && isAll">
        {{ specialGroupSelection !== 'selection' ? $t(tooltip) : null }}
      </b-tooltip>
      <!-- Group selection options -->
      <b-button-group v-if="multiple">
        <b-form-radio-group
          v-model="specialGroupSelection"
          :options="specialGroupOptions"
          button-variant="outline-primary"
          @change="$emit('change')"
          buttons />
      </b-button-group>
      <p :class="`mt-1 ${groupInfo.variant}`" v-if="groupInfo">{{ groupInfo.text }}</p>
    </div>
  </div>
</template>

<script>
import SearchableSelect from '@/components/util/SearchableSelect'

export default {
  components: {
    SearchableSelect
  },
  props: {
    title: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: null
    },
    tooltip: {
      type: String,
      default: null
    },
    itemType: {
      type: String,
      default: 'germplasm'
    },
    groups: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: true
    },
    info: {
      type: Function,
      default: null
    },
    selectSize: {
      type: Number,
      default: 7
    }
  },
  data: function () {
    const uuid = this.uuidv4()

    return {
      uuid: uuid,
      groupInfo: null,
      allGroups: [],
      selectedGroups: [],
      groupOptions: [],
      specialGroupSelection: this.multiple ? 'all' : 'selection',
      specialGroupOptions: [{
        html: '<i class="mdi mdi-18px mdi-arrow-up-box fix-alignment"></i> ' + this.$t('pageExportGroupSelectModeSelect'),
        value: 'selection'
      }, {
        html: '<i class="mdi mdi-18px mdi-select-all fix-alignment"></i> ' + this.$t('pageExportGroupSelectModeAll'),
        value: 'all'
      }]
    }
  },
  computed: {
    isAll: function () {
      return this.specialGroupSelection === 'all'
    }
  },
  watch: {
    groups: function () {
      this.update()
    },
    selectedGroups: function (newValue) {
      if (newValue && this.info) {
        this.groupInfo = this.info(newValue)
      } else {
        this.groupInfo = null
      }
    }
  },
  methods: {
    getSettings: function () {
      let arr

      if (!this.selectedGroups) {
        arr = [null]
      } else if (Array.isArray(this.selectedGroups)) {
        arr = this.selectedGroups
      } else {
        arr = [this.selectedGroups]
      }

      return {
        selectedGroups: arr,
        specialGroupSelection: this.specialGroupSelection
      }
    },
    update: function () {
      this.allGroups = []
      if (this.groups) {
        this.groups.forEach(g => this.allGroups.push(g))
        // this.allGroups.unshift({
        //   groupId: -1,
        //   groupName: this.$t('pageExportSelectMarkedItems'),
        //   isMarkedItem: true,
        //   count: this.markedIds[this.itemType].length
        // })
      }
      this.groupOptions = [{
        text: `${this.$t('pageExportSelectMarkedItems')} (${this.markedIds[this.itemType].length})`,
        value: null,
        disabled: this.markedIds[this.itemType].length < 1
      }]
      this.allGroups.forEach(g => {
        let groupName = g.groupName

        if (g.count !== undefined) {
          groupName += ` (${g.count})`
        }

        this.groupOptions.push({
          value: g,
          disabled: g.count === undefined || g.count < 1,
          text: groupName
        })
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>
.loading-select > *:first-child {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.loading-select > *:last-child > input {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.select-with-options .group-select {
  border-bottom-left-radius: 0;
}
</style>
