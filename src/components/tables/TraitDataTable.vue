<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableTrialsData} -->
  <BaseTable
    ref="baseTable"
    v-model:bottom-sheet-visible="bottomVisible"
    :headers="headers"
    item-key="germplasmId"
    :item-id="(item: ViewTableTrialsData) => `${item.datasetId}-${item.germplasmId}-${item.variableId}-${item.rep}-${item.treatment}-${item.locationName}`"
    table-key="trialsData"
    marked-item-type="germplasm"
    :header-icon="mdiShovel"
    :show-details="false"
    :header-title="$t('pageDataExportTabDataTable')"
    v-bind="{ ...$attrs, ...compProps }"
  >
    <template #item.germplasmId="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmId }}</router-link>
    </template>
    <template #item.germplasmName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmName }}</router-link>
    </template>
    <template #item.germplasmDisplayName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmDisplayName }}</router-link>
    </template>
    <template #item.germplasmGid="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmGid }}</router-link>
    </template>
    <template #item.germplasmNumber="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmNumber }}</router-link>
    </template>
    <template #item.germplasmSynonyms="{ item }">
      <span v-if="item.germplasmSynonyms">{{ item.germplasmSynonyms.join(', ') }}</span>
    </template>
    <template #item.entityType="{ item }">
      <v-chip label :color="entityTypes[item.entityType].color()" :prepend-icon="entityTypes[item.entityType].path">{{ $t(entityTypes[item.entityType].text) }}</v-chip>
    </template>
    <template #item.scaleDatatype="{ item }">
      <v-chip label :color="dataTypes[item.scaleDatatype].color()" :prepend-icon="dataTypes[item.scaleDatatype].path">{{ $t(dataTypes[item.scaleDatatype].text) }}</v-chip>
    </template>

    <template #item.variableName="{ item }">
      <span class="text-no-wrap">
        {{ item.variableName }}
        &nbsp;<a href="#" @click.prevent="showVariableInfo(item.variableId)"><v-icon :icon="mdiInformationOutline" /></a>
      </span>
    </template>

    <!-- Country flag -->
    <template #item.countryName="{ item }">
      <v-chip :text="item.countryCode2" label v-tooltip:top="item.countryName" v-if="item.countryCode2">
        <template #prepend>
          <v-icon start><i :class="'fi fi-' + item.countryCode2.toLowerCase()" /></v-icon>
        </template>
      </v-chip>
      <span v-else>
        {{ item.countryName }}
      </span>
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>

    <template #bottom-sheet-content>
      <VariableDetails :variable-id="selectedVariableId" v-if="selectedVariableId" />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import { Pages } from '@/plugins/pages'
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import { dataTypes, entityTypes } from '@/plugins/util/types'
  import type { ViewTableTrialsData } from '@/plugins/types/germinate'
  import { columns } from '@/plugins/util/table-columns'
  import { mdiInformationOutline, mdiShovel } from '@mdi/js'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const compProps = defineProps<Pick<BaseTableProps<ViewTableTrialsData>, 'getData' | 'getIds' | 'download' | 'filterOn'>>()

  const selectedVariableId = ref<number>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const bottomVisible = ref(false)

  function showVariableInfo (variableId: number) {
    selectedVariableId.value = variableId

    nextTick(() => {
      bottomVisible.value = true
    })
  }

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const result = columns.traitData.map(c => {
      return {
        ...c,
        title: t(c.title || ''),
      }
    })

    return result
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })

  watch(bottomVisible, async newValue => {
    if (!newValue) {
      selectedVariableId.value = undefined
    }
  })
</script>

<style scoped>
</style>
