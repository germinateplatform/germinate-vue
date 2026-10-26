<template>
  <div v-if="internal">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="internal.locationName"
          :label="$t('tableColumnLocationName')"
          :prepend-inner-icon="mdiTag"
          hide-details
          required
        />
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <v-number-input
          v-model="internal.locationLatitude"
          :label="$t('tableColumnLocationLatitude')"
          :prepend-inner-icon="mdiLatitude"
          hide-details
          required
          :precision="null"
          control-variant="stacked"
        />
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-number-input
          v-model="internal.locationLongitude"
          :label="$t('tableColumnLocationLongitude')"
          :prepend-inner-icon="mdiLongitude"
          hide-details
          required
          :precision="null"
          control-variant="stacked"
        />
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-number-input
          v-model="internal.locationElevation"
          :label="$t('tableColumnLocationElevation')"
          :prepend-inner-icon="mdiAltimeter"
          hide-details
          required
          :precision="null"
          control-variant="stacked"
        />
      </v-col>
    </v-row>

    <v-btn
      @click="emit('updated', internal)"
      :text="$t('buttonSave')"
      :prepend-icon="mdiContentSave"
      class="mt-3"
      color="primary"
      :disabled="!internal.locationName || isEmptyNullOrUndefined(internal.locationLatitude) || isEmptyNullOrUndefined(internal.locationLongitude)"
    />
  </div>
</template>

<script setup lang="ts">
  import type { ExtendedViewTableLocations } from '@/plugins/types/client'
  import { mdiAltimeter, mdiContentSave, mdiLatitude, mdiLongitude, mdiTag } from '@mdi/js'
  import { isEmptyNullOrUndefined } from '@/plugins/util/formatting'

  const model = defineModel<ExtendedViewTableLocations>()

  const internal = ref<ExtendedViewTableLocations>()

  const emit = defineEmits(['updated'])

  watch(model, async newValue => {
    internal.value = JSON.parse(JSON.stringify(newValue))
  }, { immediate: true })
</script>
