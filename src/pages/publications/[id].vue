<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pagePublicationDetailsTitle') }}</h1>
    <v-divider class="mb-3" />

    <template v-if="publication">
      <PublicationCard :publication="publication" @delete="router.push(Pages.publications.name)" />

      <GermplasmTable
        v-if="(publication.germplasmIds || []).length > 0"
        class="mt-5"
        :get-data="getGermplasmData"
        :get-ids="getGermplasmIds"
      />

      <DatasetTable
        v-if="(publication.datasetIds || []).length > 0"
        class="mt-5"
        :get-data="getDatasetData"
        :can-create-new="false"
      />

      <GroupTable
        v-if="(publication.groupIds || []).length > 0"
        class="mt-5"
        :get-data="getGroupData"
        :can-create-new="false"
      />
    </template>
  </v-container>
</template>

<route lang="yaml">
name: publicationDetails
</route>

<script setup lang="ts">
  import { apiPostPublicationDatasetTable } from '@/plugins/api/dataset'
  import { apiPostPublicationGermplasmTable, apiPostPublicationGermplasmTableIds } from '@/plugins/api/germplasm'
  import { apiPostPublicationGroupTable } from '@/plugins/api/group'
  import { apiPostPublicationsTable } from '@/plugins/api/publication'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type PaginatedRequest, type ViewTablePublications } from '@/plugins/types/germinate'

  const route = useRoute('publicationDetails')
  const router = useRouter()

  const publicationId = ref<number>()
  const publication = ref<ViewTablePublications>()

  function getGermplasmData (data: PaginatedRequest) {
    return apiPostPublicationGermplasmTable(publicationId.value || -1, data)
  }

  function getGermplasmIds (data: PaginatedRequest) {
    return apiPostPublicationGermplasmTableIds(publicationId.value || -1, data)
  }

  function getDatasetData (data: PaginatedRequest) {
    return apiPostPublicationDatasetTable(publicationId.value || -1, data)
  }

  function getGroupData (data: PaginatedRequest) {
    return apiPostPublicationGroupTable(publicationId.value || -1, data)
  }

  onBeforeMount(() => {
    if (route.params && route.params.id) {
      publicationId.value = +route.params.id

      if (publicationId.value) {
        const queryParams = {
          page: 1,
          limit: 1,
          prevCount: -1,
          filters: [{
            filters: [{
              column: 'publicationId',
              comparator: FilterComparator.equals,
              values: [`${publicationId.value}`],
            }],
            operator: FilterOperator.and,
          }],
        }
        apiPostPublicationsTable(queryParams, result => {
          if (result && result.data && result.data.length > 0) {
            publication.value = result.data[0]
            try {
              publication.value.publicationFallbackCache = JSON.parse(publication.value.publicationFallbackCache)
            } catch {
              //
            }
          }
        })
      } else {
        router.push(Pages.publications.path)
      }
    }
  })
</script>
