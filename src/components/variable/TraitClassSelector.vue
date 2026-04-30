<template>
  <template v-if="availableTraitClasses && Object.keys(availableTraitClasses).length > 0">
    <div class="text-title-small mt-3">{{ $t('widgetTraitClassSelectorTitle') }}</div>
    <v-chip-group
      v-model="model"
      multiple
      filter
      column
      v-if="traitClasses && Object.keys(traitClasses).length > 0"
    >
      <v-chip
        v-for="(count, traitClass) in availableTraitClasses"
        :key="`method-class-${traitClass}`"
        :value="traitClass"
        label
        :prepend-icon="traitClasses[traitClass].path"
        :color="traitClasses[traitClass].color()"
        :text="traitClasses[traitClass].text()"
      >
        <template #append>
          <v-badge inline :content="getNumberWithSuffix(count, 1)" />
        </template>
      </v-chip>
    </v-chip-group>
  </template>
</template>

<script setup lang="ts">
  import { apiGetVariableTraitClassCounts, type CountResult } from '@/plugins/api/variable'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { traitClasses } from '@/plugins/util/types'

  const model = defineModel<string[]>()
  const availableTraitClasses = ref<CountResult>()

  onMounted(() => {
    apiGetVariableTraitClassCounts(result => {
      availableTraitClasses.value = result
    })
  })
</script>
