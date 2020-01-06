<template>
  <div>
    <h2 v-if="title">{{ $t(title) }}</h2>
    <p v-if="text">{{ $t(text) }}</p>
    <div class="select-with-options">
      <div :id="`group-selection-${uuid}`" :class="groups === null ? 'loading-select' : ''">
        <b-progress :value="100" height="5px" variant="primary" striped animated v-if="groups === null" />
        <b-form-select multiple v-model="selectedGroups" :options="groupOptions" :select-size=7 class="group-select" :disabled="specialGroupSelection !== 'selection'" @change="$emit('change')"/>
      </div>
      <b-tooltip :target="`group-selection-${uuid}`" triggers="hover" v-if="tooltip !== null && isAll()">
        {{ specialGroupSelection !== 'selection' ? $t(tooltip) : null }}
      </b-tooltip>
      <b-button-group>
        <b-form-radio-group
          v-model="specialGroupSelection"
          :options="specialGroupOptions"
          button-variant="outline-primary"
          @change="$emit('change')"
          buttons />
      </b-button-group>
    </div>
  </div>
</template>

<script>
export default {
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
    }
  },
  data: function () {
    const uuid = this.uuidv4()

    return {
      uuid: uuid,
      allGroups: [],
      selectedGroups: [],
      groupOptions: [],
      specialGroupSelection: 'all',
      specialGroupOptions: [{
        html: '<i class="mdi mdi-18px mdi-arrow-up-box fix-alignment"></i> ' + this.$t('pageExportGroupSelectModeSelect'),
        value: 'selection'
      }, {
        html: '<i class="mdi mdi-18px mdi-select-all fix-alignment"></i> ' + this.$t('pageExportGroupSelectModeAll'),
        value: 'all'
      }]
    }
  },
  watch: {
    groups: function (newValue, oldValue) {
      this.update()
    }
  },
  methods: {
    isAll: function () {
      return this.specialGroupSelection === 'all'
    },
    getSettings: function () {
      return {
        selectedGroups: this.selectedGroups,
        specialGroupSelection: this.specialGroupSelection
      }
    },
    update: function () {
      this.allGroups = []
      if (this.groups) {
        this.groups.forEach(g => this.allGroups.push(g))
        this.allGroups.unshift({
          groupId: -1,
          groupName: 'Marked items',
          isMarkedItem: true,
          count: this.markedIds[this.itemType].length
        })
      }
      this.groupOptions = []
      this.allGroups.forEach(g => {
        var groupName = g.groupName

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
.loading-select > *:last-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.select-with-options .group-select {
  border-bottom-left-radius: 0;
}
</style>
