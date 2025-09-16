<template>
  <v-container fluid v-if="trait">
    <h1 class="text-h4 my-3 d-flex justify-space-between align-center">
      <span>{{ trait.traitName }} <small v-if="trait.unitName">{{ trait.unitName }}</small></span>
      <v-chip label :prepend-icon="dataTypes[trait.dataType].path" :text="dataTypes[trait.dataType].text()" :color="dataTypes[trait.dataType].color()" />
    </h1>
    <v-divider class="mb-3" />
    <p v-if="trait.traitDescription">{{ trait.traitDescription }}</p>

    <template v-if="trait.traitRestrictions">
      <h2>{{ $t('pageTraitDetailsRestrictionsTitle') }}</h2>

      <h4>
        <v-chip class="mr-2" label v-if="trait.traitRestrictions.min !== undefined && trait.traitRestrictions.min !== null" prepend-icon="mdi-greater-than-or-equal" :text="trait.traitRestrictions.min" />
        <v-chip class="mr-2" label v-if="trait.traitRestrictions.max !== undefined && trait.traitRestrictions.max !== null" prepend-icon="mdi-less-than-or-equal" :text="trait.traitRestrictions.max" />
        <v-chip class="mr-2" label v-if="trait.traitRestrictions.categories" prepend-icon="mdi-code-brackets" :text="trait.traitRestrictions.categories.map(c => c.join(', ')).join(', ')" />
      </h4>
    </template>

    <template v-if="trait.synonyms && trait.synonyms.length > 0">
      <h3 class="mt-3">{{ $t('genericSynonyms') }}</h3>
      <v-chip
        label
        v-for="(synonym, index) in trait.synonyms"
        :key="`marker-synonym-${index}`"
        prepend-icon="mdi-label"
        :text="synonym"
        class="me-2"
      />
    </template>

    <Images class="mt-3" :filter-on="imageFilter" @data-changed="setImageVisibility" v-if="imagesVisible" />
  </v-container>
</template>

<script setup lang="ts">
  import Images from '@/components/widgets/Images.vue'
  import { apiPostTraitTable } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableImages, type ViewTableTraits } from '@/plugins/types/germinate'
  import { dataTypes } from '@/plugins/util/types'

  const route = useRoute('/data/trials/traits/[id]')

  const trait = ref<ViewTableTraits>()
  const traitId = ref<number>()
  const imagesVisible = ref(true)

  const imageFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'imageForeignId',
        comparator: FilterComparator.equals,
        values: [`${traitId.value}`],
        canBeChanged: false,
      }, {
        column: 'imageRefTable',
        comparator: FilterComparator.equals,
        values: ['phenotypes'],
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })

  function setImageVisibility (request: PaginatedRequest, result: PaginatedResult<ViewTableImages[]>) {
    console.log(request, result)
    imagesVisible.value = result !== undefined && result.count !== undefined && result.count > 0
  }

  onMounted(() => {
    if (route && route.params && route.params.id) {
      traitId.value = +route.params.id

      apiPostTraitTable<PaginatedResult<ViewTableTraits[]>>({
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'traitId',
            comparator: FilterComparator.equals,
            values: [`${traitId.value}`],
          }],
          operator: FilterOperator.and,
        }],
      }, result => {
        if (result && result.data && result.data.length > 0) {
          trait.value = result.data[0]
        }
      })
    }
  })
</script>
