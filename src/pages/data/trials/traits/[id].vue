<template>
  <v-container fluid v-if="variable">
    <PageHeaderBreadcrumbs :items="breadcrumbs" :icon="mdiTagTextOutline" />
    <v-divider class="mb-3" />

    <TraitDetails :variable="variable" />
  </v-container>
</template>

<route lang="yaml">
name: traitDetails
</route>

<script setup lang="ts">
  import TraitDetails from '@/components/trials/TraitDetails.vue'
  import { apiPostTraitTable } from '@/plugins/api/trait'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type ViewTableTraits } from '@/plugins/types/germinate'
  import { mdiTagTextOutline } from '@mdi/js'
  import { useI18n } from 'vue-i18n'

  const route = useRoute('traitDetails')
  const { t } = useI18n()

  const variable = ref<ViewTableTraits>()
  const traitId = ref<number>()

  const breadcrumbs = computed(() => {
    if (variable.value) {
      return [{
        title: t('pageTraitsTitle'),
        to: Pages.traits.path,
      }, {
        title: variable.value.variableName || '',
        to: Pages.getPath(Pages.traitDetails, `${variable.value.variableId}`),
      }]
    } else {
      return []
    }
  })

  onMounted(() => {
    if (route && route.params && route.params.id) {
      traitId.value = +route.params.id

      apiPostTraitTable({
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'variableId',
            comparator: FilterComparator.equals,
            values: [`${traitId.value}`],
          }],
          operator: FilterOperator.and,
        }],
      }, result => {
        if (result && result.data && result.data.length > 0) {
          variable.value = result.data[0]
        }
      })
    }
  })
</script>
