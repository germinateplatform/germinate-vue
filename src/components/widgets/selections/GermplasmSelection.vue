<template>
  <div>
    <slot name="title"><h3>{{ $t('pageTrialsExportSelectGermplasmTitle') }}</h3></slot>
    <slot name="text"><p>{{ $t('pageTrialsExportSelectGermplasmText') }}</p></slot>
    <v-autocomplete
      v-model="selectedGermplasm"
      v-model:search="searchTerm"
      autocomplete="off"
      return-object
      hide-details
      multiple
      clearable
      :items="compProps.germplasm"
      item-value="germplasmId"
      :item-title="(item: ViewTableGermplasm) => [item.germplasmDisplayName, item.germplasmName, item.germplasmNumber].filter(i => i !== undefined && i !== null && i.trim().length > 0).join(' | ')"
    >
      <template #selection="{ internalItem: item, index }">
        <v-chip size="small" v-if="index < 5" :text="item.title" />

        <span v-if="index === 5" class="text-grey text-body-small align-self-center">(+{{ (selectedGermplasm || []).length - 5 }} others)</span>
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
  import type { ViewTableGermplasm } from '@/plugins/types/germinate'
  import { handleRouterQuery } from '@/plugins/util'

  interface TrialSelectionProps {
    germplasm: ViewTableGermplasm[]
    canSelectAll?: boolean
    urlQueryKey: string
  }

  const compProps = withDefaults(defineProps<TrialSelectionProps>(), {
    canSelectAll: false,
  })

  const router = useRouter()
  const route = useRoute()

  const searchTerm = ref<string>()
  const selectedGermplasm = defineModel<ViewTableGermplasm[]>()
  const urlQueryKey = computed(() => `${compProps.urlQueryKey}Germplasm`)

  watch(selectedGermplasm, async newValue => handleRouterQuery(router, route, urlQueryKey.value, (newValue || []).map(t => t.germplasmId).map(String).join(',')))

  const allSelected = computed(() => (selectedGermplasm.value || []).length === compProps.germplasm.length)
  const someSelected = computed(() => (selectedGermplasm.value || []).length > 0)

  function toggle () {
    if (allSelected.value) {
      selectedGermplasm.value = []
    } else {
      // Search for the currently filtered items (if any)
      const st = (searchTerm.value || '').trim().toLowerCase()
      selectedGermplasm.value = compProps.germplasm.filter(t => {
        const dpn = [t.germplasmDisplayName, t.germplasmName, t.germplasmNumber].filter(i => i !== undefined && i !== null && i.trim().length > 0).join(' | ')
        return dpn.toLowerCase().includes(st)
      })
      selectedGermplasm.value = compProps.germplasm
    }
  }

  onMounted(() => {
    if (compProps.germplasm && route.query && route.query[urlQueryKey.value]) {
      const ids = new Set((route.query[urlQueryKey.value] as string).split(',').map(Number))
      selectedGermplasm.value = compProps.germplasm.filter(g => ids.has(g.germplasmId))
    }
  })
</script>
