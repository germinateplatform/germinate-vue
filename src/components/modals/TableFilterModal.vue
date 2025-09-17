<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    scrollable
  >
    <div style="max-height: 75vh; overflow-y: auto;">
      <v-card
        class="table-filters"
        :title="$t('modalTitleTableFilter')"
        elevation="8"
        rounded="lg"
        min-width="50vw"
      >
        <v-card-text>
          <v-card class="mb-3">
            <p class="mx-3 mt-3">{{ $t('widgetTableFilterOverallOperator') }}</p>

            <div class="d-flex flex-row flex-wrap">
              <v-btn-group class="mx-3 mb-3" density="compact">
                <v-btn :disabled="hasForcedFilter" :color="overallOperator === FilterOperator.and ? 'primary' : undefined" variant="tonal" @click="overallOperator = FilterOperator.and" prepend-icon="mdi-vector-intersection" :text="$t('widgetTableFilterOperatorAndAll')" />
                <v-btn :disabled="hasForcedFilter" :color="overallOperator === FilterOperator.or ? 'primary' : undefined" variant="tonal" @click="overallOperator = FilterOperator.or" prepend-icon="mdi-vector-union" :text="$t('widgetTableFilterOperatorOrSome')" />
              </v-btn-group>

              <v-btn variant="tonal" color="success" prepend-icon="mdi-view-grid-plus" @click="addConditionGroup">{{ $t('widgetTableFilterAddConditionGroup') }}</v-btn>
            </div>
          </v-card>
          <v-row>
            <v-col
              v-for="(filterGroup, groupIndex) in filterGroups"
              :key="`filter-group-${groupIndex}`"
              class="mb-3 d-flex flex-column"
              cols="12"
              md="6"
            >
              <v-card class="flex-grow-1 d-flex flex-column">
                <p class="mx-3 mt-3">{{ $t('widgetTableFilterGroupOperator') }}</p>
                <div class="d-flex flex-row flex-wrap">
                  <v-btn-group class="mx-3 mb-2" density="compact">
                    <v-btn :disabled="groupHasForcedFilter(filterGroup)" :color="filterGroup.operator === FilterOperator.and ? 'primary' : undefined" variant="tonal" @click="filterGroup.operator = FilterOperator.and" prepend-icon="mdi-vector-intersection" :text="$t('widgetTableFilterOperatorAndAll')" />
                    <v-btn :disabled="groupHasForcedFilter(filterGroup)" :color="filterGroup.operator === FilterOperator.or ? 'primary' : undefined" variant="tonal" @click="filterGroup.operator = FilterOperator.or" prepend-icon="mdi-vector-union" :text="$t('widgetTableFilterOperatorOrSome')" />
                  </v-btn-group>

                  <v-btn :disabled="groupHasForcedFilter(filterGroup)" variant="tonal" color="success" prepend-icon="mdi-playlist-plus" @click="addCondition(filterGroup)">{{ $t('widgetTableFilterAddCondition') }}</v-btn>
                </div>

                <v-list class="flex-grow-1">
                  <template v-for="(filter, index) in filterGroup.internalFilters" :key="`filter-item-${filter.column?.key}-${index}`">
                    <v-divider />
                    <v-list-item
                      :prepend-icon="getIcon(filter.column?.dataType)"
                    >
                      <template #subtitle v-if="filter.filter.canBeChanged === false">
                        <span class="text-warning">{{ $t('widgetTableFilterPredefinedFilter') }}</span>
                      </template>
                      <div class="d-flex flex-column ga-2">
                        <div class="d-flex ga-2">
                          <v-select
                            :label="$t('formLabelTableFilterColumn')"
                            :items="compProps.columns"
                            return-object
                            v-model="filter.column"
                            hide-details
                            :disabled="filter.filter.canBeChanged === false"
                            density="compact"
                            item-title="title"
                            @update:model-value="setInitialComparator(filter)"
                          />
                          <v-select
                            :label="$t('formLabelTableFilterComparison')"
                            :items="getValidComps(filter.column?.dataType)"
                            item-value="id"
                            item-title="title"
                            hide-details
                            :disabled="filter.filter.canBeChanged === false"
                            density="compact"
                            v-model="filter.filter.comparator"
                            @update:model-value="setFilterValues(filter)"
                          />
                        </div>
                        <div class="d-flex ga-2">
                          <template v-if="filter.filter.comparator === FilterComparator.inSet">
                            <v-text-field
                              :model-value="filter.filter.values.join(', ')"
                              @update:model-value="v => { filter.filter.values = v.split(',').map(t => t.trim()) }"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              density="compact"
                            />
                          </template>
                          <template
                            v-else-if="comparators[filter.filter.comparator].values > 0"
                            v-for="(value, vIndex) in filter.filter.values"
                            :key="`filter-item-${filter.column?.key}-${index}-${vIndex}`"
                          >
                            <v-number-input
                              v-if="filter.column?.dataType === 'integer'"
                              :label="$t('formLabelTableFilterValueX', { index: vIndex + 1 })"
                              :model-value="filter.filter.values[vIndex] ? +filter.filter.values[vIndex] : undefined"
                              @update:model-value="v => { filter.filter.values[vIndex] = `${v}` }"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              density="compact"
                            />
                            <v-switch
                              v-else-if="filter.column?.dataType === 'boolean'"
                              :true-value="1"
                              :false-value="0"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              :label="filter.filter.values[vIndex] === '1' ? $t('genericYes') : $t('genericNo')"
                              :value="filter.filter.values[vIndex] === '1'"
                              @update:model-value="v => { filter.filter.values[vIndex] = `${v}` }"
                            />
                            <v-date-input
                              v-else-if="filter.column?.dataType === 'date'"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              density="compact"
                              prepend-icon=""
                              prepend-inner-icon="$calendar"
                              :model-value="filter.filter.values[vIndex] ? date.toJsDate(filter.filter.values[vIndex]) : undefined"
                              @update:model-value="v => { filter.filter.values[vIndex] = date.toISO(v) }"
                            />
                            <v-select
                              v-else-if="filter.column?.dataType === 'entityType'"
                              :items="entityTypeOptions"
                              density="compact"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              v-model="filter.filter.values[vIndex]"
                            />
                            <v-select
                              v-else-if="filter.column?.dataType === 'locationType'"
                              :items="locationTypeOptions"
                              density="compact"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              v-model="filter.filter.values[vIndex]"
                            />
                            <v-select
                              v-else-if="filter.column?.dataType === 'groupType'"
                              :items="groupTypeOptions"
                              density="compact"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              v-model="filter.filter.values[vIndex]"
                            />
                            <v-select
                              v-else-if="filter.column?.dataType === 'dataType'"
                              :items="dataTypeOptions"
                              density="compact"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              v-model="filter.filter.values[vIndex]"
                            />
                            <v-select
                              v-else-if="filter.column?.dataType === 'newsType'"
                              :items="newsTypeOptions"
                              density="compact"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              v-model="filter.filter.values[vIndex]"
                            />
                            <v-text-field
                              v-else
                              :label="$t('formLabelTableFilterValueX', { index: vIndex + 1 })"
                              v-model="filter.filter.values[vIndex]"
                              hide-details
                              :disabled="filter.filter.canBeChanged === false"
                              density="compact"
                            />
                          </template>
                        </div>
                      </div>
                      <template #append>
                        <v-btn
                          :disabled="filter.filter.canBeChanged === false || filterGroup.internalFilters.length < 2"
                          class="ms-2"
                          color="error"
                          icon="mdi-delete"
                          variant="text"
                          @click="deleteFilterInGroup(groupIndex, index)"
                        />
                      </template>
                    </v-list-item>
                  </template>
                </v-list>

                <v-divider />

                <template #actions>
                  <v-btn :disabled="filterGroups.length < 2 || filterGroup.internalFilters.some(ifi => ifi.filter.canBeChanged === false)" prepend-icon="mdi-delete" variant="tonal" color="error" :text="$t('widgetTableFilterDeleteGroup')" @click="deleteGroup(groupIndex)" />
                </template>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            :text="$t('buttonCancel')"
            @click="dialog = false"
          />

          <v-btn
            :text="$t('buttonApply')"
            color="primary"
            @click="checkFilter"
          />
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import { type Filter, type FilterGroup, FilterComparator, FilterOperator } from '@/plugins/types/germinate'
  import { comparators, getComparatorConfig } from '@/plugins/util/search'
  import { validCompsForType } from '@/plugins/util/table-columns'
  import { entityTypes, locationTypes, groupTypes, dataTypes, newsTypes } from '@/plugins/util/types'
  import { useDate } from 'vuetify'

  const route = useRoute()
  const date = useDate()

  const compProps = defineProps<{
    tableKey: string
    columns: ExtendedDataTableHeader[]
    filterOn?: FilterGroup[]
  }>()

  const emit = defineEmits(['filter-changed'])

  interface InternalFilterGroup extends FilterGroup {
    internalFilters: InternalFilter[]
  }

  interface InternalFilter {
    filter: Filter
    column?: ExtendedDataTableHeader
  }

  const dialog = ref<boolean>(false)
  const filterGroups = ref<InternalFilterGroup[]>([])
  const overallOperator = ref<FilterOperator>(FilterOperator.and)

  const hasForcedFilter = computed(() => {
    return filterGroups.value.some(fg => fg.internalFilters.some(ifi => ifi.filter.canBeChanged === false))
  })

  const comps = computed(() => {
    return Object.keys(comparators).map(c => {
      return {
        id: c,
        // @ts-ignore
        title: comparators[c].text(),
      }
    })
  })

  const entityTypeOptions = computed(() => {
    return Object.keys(entityTypes).map(e => {
      return {
        value: e,
        title: entityTypes[e].text(),
      }
    })
  })

  const locationTypeOptions = computed(() => {
    return Object.keys(locationTypes).map(e => {
      return {
        value: e,
        title: locationTypes[e].text(),
      }
    })
  })

  const groupTypeOptions = computed(() => {
    return Object.keys(groupTypes).map(e => {
      return {
        value: e,
        title: groupTypes[e].text(),
      }
    })
  })

  const dataTypeOptions = computed(() => {
    return Object.keys(dataTypes).map(e => {
      return {
        value: e,
        title: dataTypes[e].text(),
      }
    })
  })

  const newsTypeOptions = computed(() => {
    return Object.keys(newsTypes).map(e => {
      return {
        value: e,
        title: newsTypes[e].text(),
      }
    })
  })

  function groupHasForcedFilter (fg: InternalFilterGroup): boolean {
    return fg.internalFilters.some(ifi => ifi.filter.canBeChanged === false)
  }

  function deleteFilterInGroup (groupIndex: number, filterIndex: number) {
    filterGroups.value[groupIndex].internalFilters.splice(filterIndex, 1)
  }

  function deleteGroup (index: number) {
    filterGroups.value.splice(index, 1)
  }

  function getValidComps (dataType: string | undefined) {
    if (dataType) {
      return validCompsForType[dataType].map((v: string) => comps.value.find(c => c.id === v))
    } else {
      return undefined
    }
  }

  function setInitialComparator (filter: InternalFilter) {
    if (filter.column && filter.column.dataType) {
      filter.filter.comparator = validCompsForType[filter.column.dataType][0]
      setFilterValues(filter)
    }
  }

  function setFilterValues (filter: InternalFilter) {
    if (filter.column) {
      // @ts-ignore
      const comp = getComparatorConfig(filter.filter.comparator)
      filter.filter.values = new Array(comp?.values).fill(filter.column.dataType === 'boolean' ? '0' : '')
    }
  }

  function addConditionGroup () {
    const column = compProps.columns.find(c => c.preferredSortingColumn === true) || compProps.columns[0]

    if (!column.dataType) {
      return
    }

    const compString = validCompsForType[column.dataType][0]
    // @ts-ignore
    const comp = getComparatorConfig(compString)

    filterGroups.value.push({
      internalFilters: [{
        column,
        filter: {
          column: column.key || '',
          comparator: compString,
          values: new Array(comp?.values).fill(''),
        },
      }],
      operator: FilterOperator.and,
    })
  }

  function addCondition (group: InternalFilterGroup) {
    const column = compProps.columns.find(c => c.preferredSortingColumn === true) || compProps.columns[0]

    if (!column.dataType) {
      return
    }

    const compString = validCompsForType[column.dataType][0]
    // @ts-ignore
    const comp = getComparatorConfig(compString)

    group.internalFilters.push({
      column,
      filter: {
        column: column.key || '',
        comparator: compString,
        values: new Array(comp?.values).fill(''),
      },
    })
  }

  function getIcon (dataType: string | undefined) {
    switch (dataType) {
      case 'string':
        return 'mdi-form-textbox'
      case 'json':
      case 'jsonObject':
        return 'mdi-code-json'
      case 'entityType':
        return 'mdi-file-tree'
      case 'groupType':
        return 'mdi-group'
      case 'boolean':
        return 'mdi-toggle-switch-off-outline'
      case 'dataType':
        return 'mdi-file-compare'
      case 'locationType':
        return 'mdi-land-plots-marker'
      case 'newsType':
        return 'mdi-newspaper'
      case 'integer':
      case 'float':
        return 'mdi-numeric'
      default:
        return 'mdi-help-box'
    }
  }

  function clear () {
    filterGroups.value = filterGroups.value.filter(fg => fg.internalFilters.some(f => f.filter.canBeChanged === false))

    checkFilter()
  }

  function checkFilter () {
    // TODO: Actually check. Also add type-safe inputs instead of just text?
    let mapped: FilterGroup[] = []
    if (filterGroups.value && filterGroups.value.length > 0) {
      mapped = [{
        filterGroups: filterGroups.value.map(fg => {
          return {
            operator: fg.operator,
            filters: fg.internalFilters.map(intf => {
              return {
                column: intf.column?.key || '',
                comparator: intf.filter.comparator,
                values: intf.filter.values,
              }
            }),
          }
        }),
        operator: hasForcedFilter.value ? FilterOperator.and : overallOperator.value,
      }]
    }

    emit('filter-changed', mapped)

    dialog.value = false
  }

  onMounted(() => {
    loadFilters()
  })

  function forceFilters (f: FilterGroup[]) {
    if (f) {
      const internal = f as InternalFilterGroup[]

      filterGroups.value = internal.map(fg => {
        if (fg.filters) {
          fg.internalFilters = fg.filters.map(f => {
            const existingColumn = compProps.columns.find(c => c.key === f.column)
            return {
              filter: f,
              column: existingColumn,
            }
          })
        }

        return fg
      })

      checkFilter()
    }
  }

  function loadFilters () {
    let presetFilters: InternalFilterGroup[] | undefined = []

    if (compProps.filterOn) {
      const internal = compProps.filterOn as InternalFilterGroup[]
      presetFilters = internal.map(fg => {
        if (fg.filters) {
          fg.internalFilters = fg.filters.map(f => {
            const existingColumn = compProps.columns.find(c => c.key === f.column)
            return {
              filter: f,
              column: existingColumn,
            }
          })
        }

        return fg
      })
    }

    // Read URL parameters
    if (route.query && route.query[`${compProps.tableKey}-filter`]) {
      try {
        // @ts-ignore
        let urlFilter: InternalFilterGroup[] = JSON.parse(route.query[`${compProps.tableKey}-filter`])

        urlFilter = urlFilter?.map(fg => {
          if (fg.filters) {
            fg.internalFilters = fg.filters.filter(f => {
              const existingColumn = compProps.columns.find(c => c.key === f.column)
              const existingFilter = compProps.filterOn ? compProps.filterOn.find(ofg => ofg.filters?.some(of => of.column === f.column)) : undefined

              if (existingColumn) {
                if (existingFilter) {
                  return false
                } else {
                  return true
                }
              } else {
                return false
              }
            }).map(f => {
              const existingColumn = compProps.columns.find(c => c.key === f.column)
              return {
                filter: f,
                column: existingColumn,
              }
            })
          }

          return fg
        })

        presetFilters = presetFilters?.concat(urlFilter)
      } catch {
        // Do nothing here
      }
    }

    if (presetFilters) {
      filterGroups.value = presetFilters

      checkFilter()
    }
  }

  function show () {
    if (filterGroups.value.length === 0) {
      const column = compProps.columns.find(c => c.preferredSortingColumn === true) || compProps.columns[0]
      if (column.dataType) {
        const compString = validCompsForType[column.dataType][0]
        // @ts-ignore
        const comp = getComparatorConfig(compString)

        filterGroups.value = [{
          internalFilters: [{
            column,
            filter: {
              column: column.key || '',
              comparator: compString,
              values: new Array(comp?.values).fill(''),
            },
          }],
          operator: FilterOperator.and,
        }]
      }
    }

    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }
  function setOverallOperator (operator: FilterOperator) {
    overallOperator.value = operator
  }
  defineExpose({
    show,
    hide,
    clear,
    loadFilters,
    setOverallOperator,
    forceFilters,
  })

  watch(() => compProps.filterOn, () => loadFilters())
</script>

<style>
.table-filters .v-card .v-list-item-subtitle {
  text-wrap: wrap;
  line-clamp: unset;
  -webkit-line-clamp: unset;
}
</style>
