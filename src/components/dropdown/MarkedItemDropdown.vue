<template>
  <AppHeaderDropdown right>
    <template slot="header">
      <i class="mdi mdi-18px mdi-bookmark-check" />
    </template>
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center"><strong>{{ $t('dropdownMarkedItems') }}</strong></b-dropdown-header>
      <!-- Germplasm -->
      <b-dropdown-item :to="{ name: 'marked-items-type', params: { itemType: 'germplasm' } }"><i class="mdi mdi-18px mdi-sprout" />
        <span>{{ $t('dropdownMarkedGermplasm') }}</span>
        <b-badge :variant="markedIds.germplasm.length > 0 ? 'primary' : 'secondary'">{{ markedIds.germplasm.length }}</b-badge>
        <i class="mdi mdi-18px mdi-delete delete-icon text-danger mr-3" @click="onClear($event, 'germplasm')" v-b-tooltip.hover.left :title="$t('tooltipClear')" :disabled="markedIds['germplasm'].length < 1"/>
      </b-dropdown-item>
      <!-- Markers -->
      <b-dropdown-item :to="{ name: 'marked-items-type', params: { itemType: 'markers' } }"><i class="mdi mdi-18px mdi-dna" />
        <span>{{ $t('dropdownMarkedMarkers') }}</span>
        <b-badge :variant="markedIds.markers.length > 0 ? 'primary' : 'secondary'">{{ markedIds.markers.length }}</b-badge>
        <i class="mdi mdi-18px mdi-delete delete-icon text-danger mr-3"  @click="onClear($event, 'markers')" v-b-tooltip.hover.left :title="$t('tooltipClear')" :disabled="markedIds['markers'].length < 1"/>
      </b-dropdown-item>
      <!-- Locations -->
      <b-dropdown-item :to="{ name: 'marked-items-type', params: { itemType: 'locations' } }"><i class="mdi mdi-18px mdi-map-marker" />
        <span>{{ $t('dropdownMarkedLocations') }}</span>
        <b-badge :variant="markedIds.locations.length > 0 ? 'primary' : 'secondary'">{{ markedIds.locations.length }}</b-badge>
        <i class="mdi mdi-18px mdi-delete delete-icon text-danger mr-3"  @click="onClear($event, 'locations')" v-b-tooltip.hover.left :title="$t('tooltipClear')" :disabled="markedIds['locations'].length < 1"/>
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
