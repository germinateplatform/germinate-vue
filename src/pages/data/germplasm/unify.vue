<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageGermplasmUnifierTitle') }}</h1>
    <v-divider class="mb-3" />

    <p v-html="$t('pageGermplasmUnifierText')" />

    <v-btn-toggle
      v-model="selectedMode"
      color="primary"
      mandatory
      variant="tonal"
      class="mb-5"
    >
      <v-btn stacked value="manual" :prepend-icon="mdiTableCheck" :text="$t('pageGermplasmUnifierModeManual')" />
      <v-btn stacked value="sgone" prepend-icon="$sgone" :text="$t('pageGermplasmUnifierModeSgone')" />
    </v-btn-toggle>

    <v-card
      :title="$t('pageGermplasmUnifierModeManual')"
      v-if="selectedMode === 'manual'"
    >
      <template #subtitle>
        <span class="text-wrap">{{ $t('pageGermplasmUnifierManualText') }}</span>
      </template>
      <GermplasmTable
        :get-data="getGermplasmData"
        :get-ids="getGermplasmIds"
        :selection-type="TableSelectionType.all"
        @selection-changed="setGermplasmSelection"
        ref="germplasmTable"
      />

      <v-card-text>
        <v-btn @click="fetchGermplasm" :disabled="!selectedGermplasmIds || selectedGermplasmIds.length === 0" color="primary" :text="$t('buttonNext')" :prepend-icon="mdiArrowRightBoldBox" />

        <template v-if="selectedGermplasm && selectedGermplasm.length > 0">
          <h2>{{ $t('pageGermplasmUnifierSelectPreferedTitle') }}</h2>
          <p>{{ $t('pageGermplasmUnifierSelectPreferedText') }}</p>

          <v-list
            active-color="primary"
            border
          >
            <v-list-item
              v-for="germplasm in selectedGermplasm"
              :key="`germplasm-${germplasm.germplasmId}`"
              :active="germplasm.germplasmId === primaryGermplasm?.germplasmId"
              @click="primaryGermplasm = germplasm"
              :append-icon="germplasm.germplasmId === primaryGermplasm?.germplasmId ? mdiCheck : undefined"
            >
              <template #title>
                <v-chip label :color="entityTypes[germplasm.entityTypeName].color()" :prepend-icon="entityTypes[germplasm.entityTypeName].path">{{ entityTypes[germplasm.entityTypeName].text() }}</v-chip> · {{ germplasm.germplasmId }} · {{ germplasm.germplasmDisplayName || germplasm.germplasmName }}
              </template>
            </v-list-item>
          </v-list>

          <h2 class="mt-5">{{ $t('pageGermplasmUnifierExplanationTitle') }}</h2>
          <v-textarea
            v-model="mergeReason"
            :label="$t('pageGermplasmUnifierExplanationTitle')"
            :hint="$t('pageGermplasmUnifierExplanationText')"
            persistent-hint
          />
        </template>
      </v-card-text>

      <template #actions>
        <v-spacer />
        <v-btn @click="mergeList" color="primary" variant="flat" :prepend-icon="mdiSetMerge" :text="$t('buttonMerge')" :disabled="!primaryGermplasm || !mergeReason || mergeReason.trim().length === 0" />
      </template>
    </v-card>
    <v-card
      :title="$t('pageGermplasmUnifierModeSgone')"
      v-else-if="selectedMode === 'sgone'"
    >
      <template #subtitle>
        <span class="text-wrap">{{ $t('pageGermplasmUnifierSgoneText') }}</span>
      </template>

      <template #text>
        <v-btn @click="sendToSgone" class="mb-5" target="_blank" prepend-icon="$sgone" :text="$t('buttonSendToSgone')" color="primary" />

        <FileTextareaInput
          :accepted-extensions="['json']"
          :label="$t('formLabelGermplasmUnifierSgoneInput')"
          :hint="sgoneOutputStats?.successful ? $t('pageGermplasmUnifierSgoneStats', { source: getNumberWithSuffix(sgoneOutputStats.total || 0, 0), target: getNumberWithSuffix(sgoneOutputStats.final || 0, 0) }) : undefined"
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
name: germplasmUnifier
</route>

<script setup lang="ts">
  import { apiPostGermplasmTable, apiPostGermplasmTableIds, apiPostGermplasmUnification, apiPostGermplasmUnificationSgone } from '@/plugins/api/germplasm'
  import { FilterComparator, FilterOperator, type ViewTableGermplasm, type PaginatedRequest, type SgoneUnification, UserType } from '@/plugins/types/germinate'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { getNumberWithSuffix, getServerBaseUrl } from '@/plugins/util/formatting'
  import { entityTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'
  import { mdiArrowRightBoldBox, mdiCheck, mdiSetMerge, mdiTableCheck } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'

  definePage({
    meta: {
      requiredUserType: UserType.DATA_CURATOR,
    },
  })

  const store = coreStore()

  const germplasmTable = useTemplateRef('germplasmTable')

  const selectedMode = ref<'manual' | 'sgone'>('manual')
  const sgoneOutput = ref<string>()

  const selectedGermplasmIds = ref<number[]>([])
  const selectedGermplasm = ref<ViewTableGermplasm[]>([])
  const primaryGermplasm = ref<ViewTableGermplasm>()
  const mergeReason = ref<string>()

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

  function setGermplasmSelection (selectedIds: number[]) {
    selectedGermplasmIds.value = selectedIds
  }

  function sendToSgone () {
    window.open(`https://cropgeeks.github.io/sgone/#/?type=germplasm&version=v5&germinateUrl=${encodeURIComponent(getServerBaseUrl(store.storeBaseUrl || ''))}`, '_blank', 'noopener,noreferrer')
  }

  function fetchGermplasm () {
    apiPostGermplasmTable({
      page: 1,
      limit: selectedGermplasmIds.value.length,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'germplasmId',
          comparator: FilterComparator.inSet,
          values: selectedGermplasmIds.value.map(String),
        }],
      }],
    }, result => {
      selectedGermplasm.value = result?.data || []
    })
  }

  function mergeList () {
    emitter.emit('show-loading', true)
    const others = selectedGermplasmIds.value.filter(id => id !== primaryGermplasm.value?.germplasmId)

    apiPostGermplasmUnification({
      preferredId: primaryGermplasm.value?.germplasmId || -1,
      otherIds: others,
      explanation: mergeReason.value || '',
    }, () => {
      selectedGermplasmIds.value = []
      selectedGermplasm.value = []
      primaryGermplasm.value = undefined
      mergeReason.value = undefined

      germplasmTable.value?.refresh()
    }).finally(() => {
      emitter.emit('show-loading', false)
    })
  }

  function mergeSgone () {
    const unifications = JSON.parse(sgoneOutput.value || '') as SgoneUnification[]

    emitter.emit('show-loading', true)
    apiPostGermplasmUnificationSgone({
      unifications,
    }, () => {
      sgoneOutput.value = undefined
    }).finally(() => {
      emitter.emit('show-loading', false)
    })
  }

  function getGermplasmData (query: PaginatedRequest) {
    return apiPostGermplasmTable(query)
  }
  function getGermplasmIds (query: PaginatedRequest) {
    return apiPostGermplasmTableIds(query)
  }

  watch(selectedMode, () => {
    selectedGermplasmIds.value = []
    selectedGermplasm.value = []
    primaryGermplasm.value = undefined
    mergeReason.value = undefined
  })
</script>
