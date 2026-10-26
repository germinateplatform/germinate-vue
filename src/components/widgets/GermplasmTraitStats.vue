<template>
  <div v-if="stats && stats.length > 0" class="position-relative">
    <v-overlay contained v-model="loading" />

    <TraitStatsHighlightSelection
      class="mb-5"
      ref="highlightSelection"
    />

    <v-btn @click="update" class="mb-5" :prepend-icon="mdiRefresh" :text="$t('buttonReload')" :disabled="userSelection !== undefined && !userSelectionValid" />

    <v-text-field class="mb-5" clearable :messages="searchTerm ? ['f'] : []" v-model="searchTerm" :label="$t('formLabelSearchTerm')">
      <template #message>
        <span class="mr-3"><v-icon :icon="mdiPlaylistCheck" /> <a href="#" @click.prevent="markAll(true)">{{ $t('buttonSelectAll') }}</a></span>
        <span><v-icon :icon="mdiPlaylistRemove" /> <a href="#" @click.prevent="markAll(false)">{{ $t('buttonDeselectAll') }}</a></span>
      </template>
    </v-text-field>

    <v-row>
      <v-col cols="4" sm="4" md="3" lg="2" v-for="trait in filteredStats" :key="`trait-stats-${trait.traitId}`">
        <Scale
          v-model="trait.isSelected"
          selectable
          :min="trait.min"
          :max="trait.max"
          :marker="trait.avg"
          :count="trait.count"
          :heading="trait.traitName"
          @click="showTraitDetails(trait)"
          :to="Pages.getPath(Pages.traitDetails, `${trait.traitId}`)"
        />
      </v-col>
    </v-row>

    <TraitRadarChart
      :traces="plotTraces"
      v-if="plotTraces"
    />

    <v-bottom-sheet
      v-model="bottomSheetVisible"
      inset
      scrollable
      v-if="selectedTrait"
    >
      <v-card
        class="pb-10"
      >
        <template #title>
          <div class="d-flex justify-space-between">
            <span>{{ selectedTrait.traitName }}</span>
            <v-btn size="small" variant="flat" :icon="mdiClose" @click="bottomSheetVisible = false" />
          </div>
        </template>
        <template #text>
          <TraitDetails :variable-id="selectedTrait.traitId" />
        </template>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
  import { apiGetGermplasmStatsTraits } from '@/plugins/api/germplasm'
  import { Pages } from '@/plugins/pages'
  import type { GermplasmExportRequest, GermplasmStats, ViewTableGermplasm } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'
  import TraitStatsHighlightSelection from '@/components/widgets/selections/TraitStatsHighlightSelection.vue'
  import TraitDetails from '@/components/trials/TraitDetails.vue'
  import type { TraitComparisonChartTrace } from '@/components/trials/TraitComparison.vue'
  import { getPrimaryColor } from '@/plugins/util/colors'
  import { mdiClose, mdiPlaylistCheck, mdiPlaylistRemove, mdiRefresh } from '@mdi/js'

  const compProps = defineProps<{
    germplasm: ViewTableGermplasm
  }>()

  const emit = defineEmits(['has-data'])

  const highlightSelection = ref<InstanceType<typeof TraitStatsHighlightSelection>>()
  const userSelection = computed(() => highlightSelection.value?.userSelection)
  const userSelectionValid = computed(() => highlightSelection.value?.valid || false)

  const bottomSheetVisible = ref(false)
  const searchTerm = ref<string>()
  const stats = ref<GermplasmStats[]>([])
  const loading = ref(false)

  const selectedTrait = ref<GermplasmStats>()

  const filteredStats = computed(() => {
    if (searchTerm.value) {
      const lower = searchTerm.value.toLowerCase()
      return stats.value.filter(s => s.traitName.toLowerCase().includes(lower))
    } else {
      return stats.value
    }
  })

  const plotTraces = computed(() => {
    if (stats.value && selectedTraits.value && selectedTraits.value.length > 0) {
      const result: TraitComparisonChartTrace = {
        values: [],
        dimensions: [],
        name: compProps.germplasm.germplasmDisplayName,
        id: compProps.germplasm.germplasmId,
        customdata: [],
        color: getPrimaryColor(),
      }

      selectedTraits.value.forEach(st => {
        const normalized = (st.avg - st.min) / (st.max - st.min) * 100

        result.dimensions.push(st.traitName)
        result.values.push(normalized)
        result.customdata.push(`${st.avg.toFixed(2)}`)
      })

      result.values.push(result.values[0])
      result.dimensions.push(result.dimensions[0])
      result.customdata.push(result.customdata[0])

      return [result]
    } else {
      return undefined
    }
  })

  const selectedTraits = computed(() => stats.value.filter(s => s.isSelected === true))

  function showTraitDetails (stats: GermplasmStats) {
    selectedTrait.value = stats

    nextTick(() => {
      bottomSheetVisible.value = true
    })
  }

  function markAll (toSelect: boolean) {
    const ids = new Set(filteredStats.value.map(fs => fs.traitId))

    stats.value.forEach(s => {
      if (ids.has(s.traitId)) {
        s.isSelected = toSelect
      }
    })
  }

  function update () {
    let req: GermplasmExportRequest | undefined = undefined
    loading.value = true

    if (userSelection.value?.type === 'germplasm') {
      req = {
        individualIds: userSelection.value.selectedItems.map(Number),
        includeAttributes: false,
      }
    } else if (userSelection.value?.type === 'group') {
      req = {
        groupIds: userSelection.value.selectedItems.map(Number),
        includeAttributes: false,
      }
    }

    // Remember current selection
    const selectedTraits = new Set<number>()
    if (stats.value) {
      stats.value.forEach(t => {
        if (t.isSelected) {
          selectedTraits.add(t.traitId)
        }
      })
    }

    apiGetGermplasmStatsTraits(compProps.germplasm.germplasmId, req, result => {
      if (result && result.length > 0) {
        result.forEach(r => {
          // Restore current selection
          r.isSelected = selectedTraits.has(r.traitId)
        })
      }

      stats.value = result

      if (result) {
        emit('has-data', result.length)
      } else {
        emit('has-data', 0)
      }
    }).finally(() => {
      loading.value = false
    })
  }

  onMounted(() => {
    emitter.on('license-accepted', update)

    if (compProps.germplasm) {
      update()
    }
  })
  onBeforeUnmount(() => emitter.off('license-accepted', update))
</script>
