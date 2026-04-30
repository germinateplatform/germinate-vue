<template>
  <template v-if="availableScaleDataTypes && Object.keys(availableScaleDataTypes).length > 0">
    <div class="text-title-small mt-3">{{ $t('widgetScaleDataTypeSelectorTitle') }}</div>
    <v-chip-group
      v-model="model"
      multiple
      filter
      column
    >
      <v-chip
        v-for="(count, dataType) in availableScaleDataTypes"
        :key="`method-class-${dataType}`"
        :value="dataType"
        label
        :prepend-icon="dataTypes[dataType].path"
        :color="dataTypes[dataType].color()"
        :text="dataTypes[dataType].text()"
      >
        <template #append>
          <v-badge inline :content="getNumberWithSuffix(count, 1)" />
        </template>
      </v-chip>
    </v-chip-group>
  </template>
</template>

<script setup lang="ts">
  import { apiGetVariableScaleDataTypeCounts, type CountResult } from '@/plugins/api/variable'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { dataTypes } from '@/plugins/util/types'

  const model = defineModel<string[]>()
  const availableScaleDataTypes = ref<CountResult>()

  onMounted(() => {
    apiGetVariableScaleDataTypeCounts(result => {
      availableScaleDataTypes.value = result
    })
  })
</script>
