<template>
  <div>
    <slot name="title"><h3>{{ $t('pageClimateExportSelectClimateTitle') }}</h3></slot>
    <slot name="text" />
    <v-autocomplete
      v-model="selectedClimate"
      autocomplete="off"
      return-object
      :hide-details="hint === undefined"
      :hint="hint"
      :persistent-hint="hint !== undefined"
      :multiple="canSelectMultiple"
      :label="label || $t('pageClimateExportSelectClimateTitle')"
      clearable
      v-model:search="searchTerm"
      :items="compProps.climates"
      item-value="variableId"
      :item-title="(item: ViewTableClimates) => item.unitAbbreviation ? `${item.climateName} [${item.unitAbbreviation}]` : item.climateName"
    >
      <template #selection="{ internalItem: item, index }">
        <v-chip size="small" v-if="index < 4" :text="item.title" />

        <span v-if="index === 4" class="text-grey text-body-small align-self-center">(+{{ (modelValue || []).length - 4 }} others)</span>
      </template>

      <template #item="{ props, internalItem: item }">
        <v-list-item v-bind="props">
          <template #prepend="{ isSelected }">
            <v-checkbox-btn :model-value="isSelected" />
          </template>
          <template #append>
            <v-chip label :color="dataTypes[item.raw.dataType].color()" :prepend-icon="dataTypes[item.raw.dataType].path" v-if="item.raw.dataType">{{ $t(dataTypes[item.raw.dataType].text) }}</v-chip>
          </template>
        </v-list-item>
      </template>

      <template #prepend-item v-if="canSelectAll">
        <v-list-item
          :title="$t('buttonSelectAll')"
          @click="toggle"
        >
          <template #prepend>
            <v-checkbox-btn
              :indeterminate="someSelected && !allSelected"
              :model-value="allSelected"
            />
          </template>
        </v-list-item>

        <v-divider class="mt-2" />
      </template>
    </v-autocomplete>
  </div>
</template>

<script setup lang="ts">
  import type { ViewTableClimates } from '@/plugins/types/germinate'
  import { handleRouterQuery } from '@/plugins/util'
  import { dataTypes } from '@/plugins/util/types'

  interface TrialSelectionProps {
    climates: ViewTableClimates[]
    canSelectAll?: boolean
    canSelectMultiple?: boolean
    hint?: string
    label?: string
    urlQueryKey: string
  }

  const compProps = withDefaults(defineProps<TrialSelectionProps>(), {
    canSelectAll: false,
    canSelectMultiple: true,
  })

  const router = useRouter()
  const route = useRoute()

  const searchTerm = ref<string>()

  const selectedClimate = ref<ViewTableClimates[] | ViewTableClimates>([])
  const modelValue = defineModel<ViewTableClimates[]>()

  const emit = defineEmits(['update:model-value'])

  const allSelected = computed(() => (modelValue.value || []).length === compProps.climates.length)
  const someSelected = computed(() => (modelValue.value || []).length > 0)
  const urlQueryKey = computed(() => `${compProps.urlQueryKey}Climates`)

  watch(modelValue, async newValue => handleRouterQuery(router, route, urlQueryKey.value, (newValue || []).map(t => t.climateId).map(String).join(',')))

  function toggle () {
    if (allSelected.value) {
      selectedClimate.value = []
    } else {
      // Search for the currently filtered items (if any)
      const st = (searchTerm.value || '').trim().toLowerCase()
      selectedClimate.value = compProps.climates.filter(c => c.climateName.toLowerCase().includes(st))
    }
  }

  watch(selectedClimate, async newValue => {
    if (!newValue) {
      newValue = []
    }
    const asArray = Array.isArray(newValue) ? newValue : [newValue]
    const toNotify = asArray || []
    if (JSON.stringify(toNotify) !== JSON.stringify(modelValue.value)) {
      emit('update:model-value', toNotify)
    }
  })

  watch(modelValue, newValue => {
    const current = JSON.stringify(selectedClimate.value)
    const incoming = JSON.stringify(newValue || [])
    if (current !== incoming) {
      selectedClimate.value = JSON.parse(JSON.stringify(newValue || []))
    }
  }, { immediate: true })

  onMounted(() => {
    if (compProps.climates && route.query && route.query[urlQueryKey.value]) {
      const ids = new Set((route.query[urlQueryKey.value] as string).split(',').map(Number))
      selectedClimate.value = compProps.climates.filter(t => ids.has(t.climateId))
    }
  })
</script>
