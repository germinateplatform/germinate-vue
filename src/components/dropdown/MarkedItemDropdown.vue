<template>
  <AppHeaderDropdown right>
    <template slot="header">
      <i class="mdi mdi-18px mdi-bookmark-check" />
    </template>
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center"><strong>{{ $t('dropdownMarkedItems') }}</strong></b-dropdown-header>
      <b-dropdown-item to="/marked-items/germplasm"><i class="mdi mdi-18px mdi-sprout text-primary" />
        <span>{{ $t('dropdownMarkedGermplasm') }}</span>
        <b-badge>{{ markedIds.germplasm.length }}</b-badge>
        <i class="mdi mdi-18px mdi-delete delete-icon text-danger mr-3" @click="onClear($event, 'germplasm')" :title="$t('tooltipClear')"/>
      </b-dropdown-item>
      <b-dropdown-item to="/marked-items/markers"><i class="mdi mdi-18px mdi-dna text-primary" />
        <span>{{ $t('dropdownMarkedMarkers') }}</span>
        <b-badge>{{ markedIds.markers.length }}</b-badge>
        <i class="mdi mdi-18px mdi-delete delete-icon text-danger mr-3"  @click="onClear($event, 'markers')" :title="$t('tooltipClear')"/>
      </b-dropdown-item>
      <b-dropdown-item to="/marked-items/locations"><i class="mdi mdi-18px mdi-map-marker text-primary" />
        <span>{{ $t('dropdownMarkedLocations') }}</span>
        <b-badge>{{ markedIds.locations.length }}</b-badge>
        <i class="mdi mdi-18px mdi-delete delete-icon text-danger mr-3"  @click="onClear($event, 'locations')" :title="$t('tooltipClear')"/>
      </b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'

export default {
  name: 'MarkedItemDropdown',
  components: {
    AppHeaderDropdown
  },
  data: () => {
    return { itemsCount: 42 }
  },
  methods: {
    onClear: function (event, itemType) {
      event.preventDefault()
      event.stopPropagation()
      this.$store.dispatch('ON_MARKED_IDS_CLEAR', itemType)
    }
  }
}
</script>

<style>
.dropdown-item .delete-icon {
  margin-top: 1px;
  position: absolute;
  right: 35px;
}
</style>
