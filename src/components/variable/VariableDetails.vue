<template>
  <v-row v-if="variable">
    <v-col cols="12">
      <v-card :title="$t('widgetVariableVariable')">
        <template #subtitle>
          <span>{{ variable.variableName }}</span>
        </template>
        <template #text>
          <div v-if="variable.variableDescription">{{ variable.variableDescription }}</div>
        </template>
      </v-card>
    </v-col>
    <v-col class="d-flex">
      <v-card :title="$t('widgetVariableTrait')" class="d-flex flex-column flex-grow-1" v-if="variable.traitId">
        <template #subtitle>
          <div class="d-flex justify-space-between align-center flex-grow flex-wrap">
            <span>{{ variable.traitName }}</span>
            <v-chip label :color="traitClasses[variable.traitClass].color()" :prepend-icon="traitClasses[variable.traitClass].path" :text="traitClasses[variable.traitClass].text()" />
          </div>
        </template>
        <template #text>
          <div v-if="variable.traitDescription">{{ variable.traitDescription }}</div>

          <h4 class="mt-3" v-if="variable.traitSynonyms">{{ $t('genericSynonyms') }}</h4>
          <v-chip
            label
            v-for="(synonym, index) in variable.traitSynonyms"
            :key="`marker-synonym-${index}`"
            prepend-icon="mdi-label"
            :text="synonym"
            class="me-2"
          />
        </template>
      </v-card>
    </v-col>
    <v-col class="d-flex">
      <v-card :title="$t('widgetVariableMethod')" class="d-flex flex-column flex-grow-1" v-if="variable.methodId">
        <template #subtitle>
          <div class="d-flex justify-space-between align-center flex-grow flex-wrap">
            <span>{{ variable.methodName }}</span>
            <v-chip label :color="methodClasses[variable.methodClass].color()" :prepend-icon="methodClasses[variable.methodClass].path" :text="methodClasses[variable.methodClass].text()" />
          </div>
        </template>
        <template #text>
          <div v-if="variable.methodDescription">{{ variable.methodDescription }}</div>
        </template>
      </v-card>
    </v-col>
    <v-col class="d-flex">
      <v-card :title="$t('widgetVariableScale')" class="d-flex flex-column flex-grow-1" v-if="variable.scaleId">
        <template #subtitle>
          <div class="d-flex justify-space-between align-center flex-grow flex-wrap">
            <span>{{ variable.scaleName }}</span>
            <v-chip label :color="dataTypes[variable.scaleDatatype].color()" :prepend-icon="dataTypes[variable.scaleDatatype].path" :text="dataTypes[variable.scaleDatatype].text()" />
          </div>
        </template>
        <template #text>
          <div v-if="variable.scaleDescription">{{ variable.scaleDescription }}</div>
          <v-chip label prepend-icon="mdi-code-brackets" :text="variable.scaleUnit" v-if="variable.scaleUnit" />
          <template v-if="variable.scaleRestrictions">
            <h2>{{ $t('pageTraitDetailsRestrictionsTitle') }}</h2>

            <h4>
              <v-chip class="mr-2" label v-if="variable.scaleRestrictions.min !== undefined && variable.scaleRestrictions.min !== null" prepend-icon="mdi-greater-than-or-equal" :text="variable.scaleRestrictions.min" />
              <v-chip class="mr-2" label v-if="variable.scaleRestrictions.max !== undefined && variable.scaleRestrictions.max !== null" prepend-icon="mdi-less-than-or-equal" :text="variable.scaleRestrictions.max" />
              <v-chip class="mr-2" label v-if="variable.scaleRestrictions.categories" prepend-icon="mdi-code-brackets" :text="variable.scaleRestrictions.categories.map(c => c.join(', ')).join(', ')" />
            </h4>
          </template>
        </template>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostTraitTable } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type ViewTableTraits } from '@/plugins/types/germinate'
  import { dataTypes, methodClasses, traitClasses } from '@/plugins/util/types'

  const compProps = defineProps<{
    variableId: number
  }>()

  const variable = ref<ViewTableTraits>()

  onMounted(() => {
    apiPostTraitTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        filters: [{
          column: 'variableId',
          comparator: FilterComparator.equals,
          values: [`${compProps.variableId}`],
        }],
        operator: FilterOperator.and,
      }],
    }, result => {
      if (result && result.data && result.data.length === 1) {
        variable.value = result.data[0]
      } else {
        variable.value = undefined
      }
    })
  })
</script>
