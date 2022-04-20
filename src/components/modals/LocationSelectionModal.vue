<template>
  <b-modal :title="$t('modalTitleSelectLocation')"
            ref="modal"
            size="xl"
            :ok-title="$t('buttonSelect')"
            :cancel-title="$t('buttonCancel')"
            :ok-disabled="selectedLocation === null || selectedLocation.length < 1"
            @ok="handleOk">
    <!-- All locations in a table -->
    <p>{{ $t('modalTextSelectLocation') }}</p>
    <LocationTable :getData="getData"
                   :selectable="true"
                   selectionMode="single"
                   :filterOn="locationFilter"
                   @selection-changed="updateSelection" />
  </b-modal>
</template>

<script>
import LocationTable from '@/components/tables/LocationTable'
import locationApi from '@/mixins/api/location.js'

export default {
  components: {
    LocationTable
  },
  data: function () {
    return {
      selectedLocation: null,
      locationFilter: [{
        column: {
          name: 'locationType',
          type: String
        },
        comparator: 'equals',
        operator: 'and',
        values: ['collectingsites'],
        canBeChanged: false
      }]
    }
  },
  mixins: [locationApi],
  methods: {
    handleOk: function () {
      if (this.selectedLocation !== null) {
        this.$emit('location-selected', this.selectedLocation)
      }
    },
    updateSelection: function (selectedIds) {
      this.selectedLocation = (selectedIds !== null && selectedIds.length > 0) ? selectedIds[0] : null
    },
    getData: function (data, callback) {
      return this.apiPostLocationTable(data, callback)
    },
    show: function () {
      this.selectedLocation = null
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    }
  }
}
</script>

<style>

</style>
