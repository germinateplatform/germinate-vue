<template>
  <div>
    <v-toolbar color="primary" :extended="germplasm?.entityParentId !== undefined">
      <v-toolbar-title :text="$t('pageGermplasmTitle')" />
      <template #extension>
        <v-tabs
          v-model="tab"
          bg-color="primary"
          fixed-tabs
          grow
          v-if="germplasm && germplasm.entityParentId"
        >
          <v-tab :value="1" prepend-icon="mdi-arrow-down-box">{{ germplasm.germplasmDisplayName }}</v-tab>
          <v-tab :value="2" prepend-icon="mdi-arrow-up-box">{{ germplasm.entityParentName }}</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <v-container fluid class="mt-0 pt-0">
      <h3 v-if="noGermplasmFound">{{ $t('headingNoData') }}</h3>
      <template v-else-if="germplasm">
        <v-tabs-window v-model="tab">
          <v-tabs-window-item :transition="false" :reverse-transition="false" :value="1">
            <Passport top-gap :germplasm-id="germplasm.germplasmId" />
          </v-tabs-window-item>
          <v-tabs-window-item :transition="false" :reverse-transition="false" :value="2" v-if="germplasm.entityParentId">
            <Passport top-gap :germplasm-id="germplasm.entityParentId" />
          </v-tabs-window-item>
        </v-tabs-window>
      </template>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import Passport from '@/components/widgets/Passport.vue'
  import { apiPostGermplasmTable } from '@/plugins/api/germplasm'
  import { FilterComparator, FilterOperator, type ViewTableGermplasm, type PaginatedRequest, type PaginatedResult } from '@/plugins/types/germinate'

  const route = useRoute('/data/germplasm/[id]')

  const tab = ref<number>(1)
  const noGermplasmFound = ref(false)
  const requestedIdentifier = ref<string>()
  const germplasm = ref<ViewTableGermplasm>()

  onBeforeMount(() => {
    if (route.params && route.params.id) {
      requestedIdentifier.value = route.params.id

      const query: PaginatedRequest = {
        filters: [],
        page: 1,
        limit: 1,
      }

      if (Number.isNaN(requestedIdentifier.value)) {
        query.filters = [{
          filters: [{
            column: 'germplasmName',
            comparator: FilterComparator.equals,
            values: [requestedIdentifier.value],
          }, {
            column: 'germplasmDisplayName',
            comparator: FilterComparator.equals,
            values: [requestedIdentifier.value],
          }, {
            column: 'germplasmPuid',
            comparator: FilterComparator.equals,
            values: [requestedIdentifier.value],
          }],
          operator: FilterOperator.or,
        }]
      } else {
        query.filters = [{
          filters: [{
            column: 'germplasmId',
            comparator: FilterComparator.equals,
            values: [requestedIdentifier.value],
          }],
          operator: FilterOperator.and,
        }]
      }

      apiPostGermplasmTable<PaginatedResult<ViewTableGermplasm[]>>(query, result => {
        if (result && result.data && result.data.length > 0) {
          germplasm.value = result.data[0]
        } else {
          noGermplasmFound.value = true
        }
      })
    }
  })
</script>
