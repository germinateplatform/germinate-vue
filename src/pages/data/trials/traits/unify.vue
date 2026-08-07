<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageTraitUnifierTitle') }}</h1>
    <v-divider class="mb-3" />

    <p v-html="$t('pageTraitUnifierText')" />

    <v-btn-toggle
      v-model="selectedMode"
      color="primary"
      mandatory
      variant="tonal"
      class="mb-5"
    >
      <v-btn stacked value="manual" :prepend-icon="mdiTableCheck" :text="$t('pageTraitUnifierModeManual')" />
      <v-btn stacked value="sgone" prepend-icon="$sgone" :text="$t('pageTraitUnifierModeSgone')" />
    </v-btn-toggle>

    <v-card
      :title="$t('pageTraitUnifierModeManual')"
      v-if="selectedMode === 'manual'"
    >
      <template #subtitle>
        <span class="text-wrap">{{ $t('pageTraitUnifierManualText') }}</span>
      </template>
      <TraitTable
        :get-data="getTraitData"
        :get-ids="getTraitIds"
        :selection-type="TableSelectionType.all"
        @selection-changed="setTraitSelection"
        ref="traitTable"
      />

      <v-card-text>
        <v-btn @click="fetchTraits" :disabled="!selectedTraitIds || selectedTraitIds.length === 0" color="primary" :text="$t('buttonNext')" :prepend-icon="mdiArrowRightBoldBox" />

        <template v-if="selectedTraits && selectedTraits.length > 0">
          <h2>{{ $t('pageTraitUnifierSelectPreferedTitle') }}</h2>
          <p>{{ $t('pageTraitUnifierSelectPreferedText') }}</p>

          <v-list
            active-color="primary"
            border
          >
            <v-list-item
              v-for="variable in selectedTraits"
              :key="`variable-${variable.variableId}`"
              :active="variable.variableId === primaryVariable?.variableId"
              @click="primaryVariable = variable"
              :append-icon="variable.variableId === primaryVariable?.variableId ? mdiCheck : undefined"
            >
              <template #title>
                <v-chip label :color="dataTypes[variable.scaleDatatype].color()" :prepend-icon="dataTypes[variable.scaleDatatype].path">{{ dataTypes[variable.scaleDatatype].text() }}</v-chip> · {{ variable.variableId }} · {{ variable.variableName }}
              </template>
            </v-list-item>
          </v-list>
        </template>
      </v-card-text>

      <template #actions>
        <v-spacer />
        <v-btn @click="mergeList" color="primary" variant="flat" :prepend-icon="mdiSetMerge" :text="$t('buttonMerge')" :disabled="!primaryVariable" />
      </template>
    </v-card>
    <v-card
      :title="$t('pageTraitUnifierModeSgone')"
      v-else-if="selectedMode === 'sgone'"
    >
      <template #subtitle>
        <span class="text-wrap">{{ $t('pageTraitUnifierSgoneText') }}</span>
      </template>

      <template #text>
        <v-btn @click="sendToSgone" class="mb-5" target="_blank" prepend-icon="$sgone" :text="$t('buttonSendToSgone')" color="primary" />

        <FileTextareaInput
          :accepted-extensions="['json']"
          :label="$t('formLabelTraitUnifierSgoneInput')"
          :hint="sgoneOutputStats?.successful ? $t('pageTraitUnifierSgoneStats', { source: getNumberWithSuffix(sgoneOutputStats.total || 0, 0), target: getNumberWithSuffix(sgoneOutputStats.final || 0, 0) }) : undefined"
          :persistent-hint="sgoneOutputStats?.successful"
          :hide-details="!sgoneOutputStats || !sgoneOutputStats.successful"
          v-model="sgoneOutput"
        />

        <p class="text-error" v-if="sgoneOutputStats?.error">{{ sgoneOutputStats.error }}</p>
      </template>

      <template #actions>
        <v-spacer />
        <v-btn @click="mergeSgone" color="primary" variant="flat" :prepend-icon="mdiSetMerge" :text="$t('buttonMerge')" :disabled="!sgoneOutputStats || !sgoneOutputStats.successful" />
      </template>
    </v-card>
  </v-container>
</template>

<route lang="yaml">
name: traitUnifier
</route>

<script setup lang="ts">
  import { apiPostTraitTable, apiPostTraitTableIds, apiPostVariableUnification, apiPostVariableUnificationSgone } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, UserType, type PaginatedRequest, type SgoneUnification, type ViewTableTraits } from '@/plugins/types/germinate'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { getNumberWithSuffix, getServerBaseUrl } from '@/plugins/util/formatting'
  import { dataTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'
  import { mdiArrowRightBoldBox, mdiCheck, mdiSetMerge, mdiTableCheck } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'

  definePage({
    meta: {
      requiredUserType: UserType.DATA_CURATOR,
    },
  })

  const store = coreStore()

  const traitTable = useTemplateRef('traitTable')

  const selectedMode = ref<'manual' | 'sgone'>('manual')
  const sgoneOutput = ref<string>()

  const selectedTraitIds = ref<number[]>([])
  const selectedTraits = ref<ViewTableTraits[]>([])
  const primaryVariable = ref<ViewTableTraits>()

  const sgoneOutputStats = computed(() => {
    if (!sgoneOutput.value || sgoneOutput.value.trim().length === 0) {
      return undefined
    } else {
      try {
        const unification = JSON.parse(sgoneOutput.value) as SgoneUnification[]

        const allIds = new Set<string>()

        unification.forEach(u => {
          allIds.add(u.preferred.id)

          u.others.forEach(o => {
            allIds.add(o.id)
          })
        })

        return {
          total: allIds.size,
          final: unification.length,
          successful: true,
        }
      } catch (e) {
        return {
          error: e,
        }
      }
    }
  })

  function setTraitSelection (selectedIds: number[]) {
    selectedTraitIds.value = selectedIds
  }

  function sendToSgone () {
    window.open(`https://cropgeeks.github.io/sgone/#/?type=traits&version=v5&germinateUrl=${encodeURIComponent(getServerBaseUrl(store.storeBaseUrl || ''))}`, '_blank', 'noopener,noreferrer')
  }

  function fetchTraits () {
    apiPostTraitTable({
      page: 1,
      limit: selectedTraitIds.value.length,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'variableId',
          comparator: FilterComparator.inSet,
          values: selectedTraitIds.value.map(String),
        }],
      }],
    }, result => {
      selectedTraits.value = result?.data || []
    })
  }

  function mergeList () {
    emitter.emit('show-loading', true)
    const others = selectedTraitIds.value.filter(id => id !== primaryVariable.value?.variableId)

    apiPostVariableUnification({
      preferredId: primaryVariable.value?.variableId || -1,
      otherIds: others,
    }, () => {
      selectedTraitIds.value = []
      selectedTraits.value = []
      primaryVariable.value = undefined

      traitTable.value?.refresh()
    }).finally(() => {
      emitter.emit('show-loading', false)
    })
  }

  function mergeSgone () {
    const unifications = JSON.parse(sgoneOutput.value || '') as SgoneUnification[]

    emitter.emit('show-loading', true)
    apiPostVariableUnificationSgone({
      unifications,
    }, () => {
      sgoneOutput.value = undefined
    }).finally(() => {
      emitter.emit('show-loading', false)
    })
  }

  function getTraitData (query: PaginatedRequest) {
    return apiPostTraitTable(query)
  }
  function getTraitIds (query: PaginatedRequest) {
    return apiPostTraitTableIds(query)
  }

  watch(selectedMode, () => {
    selectedTraitIds.value = []
    selectedTraits.value = []
    primaryVariable.value = undefined
  })
</script>
