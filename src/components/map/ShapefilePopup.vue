<template>
  <v-list slim v-if="info">
    <slot name="prepend" />
    <v-list-item :title="$t('tableColumnGermplasmName')" :subtitle="info.germplasm" :prepend-icon="mdiSprout" />
    <v-list-item :title="$t('tableColumnTraitRep')" :subtitle="info.rep" :prepend-icon="mdiRepeat" v-if="info.rep" />
    <v-list-item :title="$t('tableColumnTraitRow')" :subtitle="info.row" :prepend-icon="mdiLandRowsHorizontal" />
    <v-list-item :title="$t('tableColumnTraitColumn')" :subtitle="info.column" :prepend-icon="mdiLandRowsVertical" />

    <slot name="append" />
  </v-list>
</template>

<script setup lang="ts">
  import type { ShapefilePopupInfo } from '@/plugins/util/geo'
  import { mdiLandRowsHorizontal, mdiLandRowsVertical, mdiRepeat, mdiSprout } from '@mdi/js'

  const compProps = defineProps<{
    info: ShapefilePopupInfo
  }>()
</script>
