<template>
  <template v-if="availableMethodClasses && Object.keys(availableMethodClasses).length > 0">
    <div class="text-subtitle-2 mt-3">{{ $t('widgetMethodClassSelectorTitle') }}</div>
    <v-chip-group
      v-model="model"
      multiple
      filter
      column
    >
      <v-chip
        v-for="(count, methodClass) in availableMethodClasses"
        :key="`method-class-${methodClass}`"
        :value="methodClass"
        label
        :prepend-icon="methodClasses[methodClass].path"
        :color="methodClasses[methodClass].color()"
        :text="methodClasses[methodClass].text()"
      >
        <template #append>
          <v-badge inline :content="getNumberWithSuffix(count, 1)" />
        </template>
      </v-chip>
    </v-chip-group>
  </template>
</template>

<script setup lang="ts">
  import { apiGetVariableMethodClassCounts, type CountResult } from '@/plugins/api/variable'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { methodClasses } from '@/plugins/util/types'

  const model = defineModel<string[]>()
  const availableMethodClasses = ref<CountResult>()

  onMounted(() => {
    apiGetVariableMethodClassCounts(result => {
      availableMethodClasses.value = result
    })
  })
</script>
