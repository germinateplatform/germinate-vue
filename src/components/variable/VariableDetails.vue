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

            <v-menu>
              <template #activator="{ props }">
                <v-chip
                  v-bind="store.storeUserIsDataCurator ? props : undefined"
                  label
                  :color="traitClasses[changedTraitClass || variable.traitClass].color()"
                  :prepend-icon="traitClasses[changedTraitClass || variable.traitClass].path"
                  :append-icon="store.storeUserIsAuthenticated ? mdiMenuDown : undefined"
                  :text="traitClasses[changedTraitClass || variable.traitClass].text()"
                />
              </template>

              <v-list :selected="changedTraitClass" mandatory density="compact" v-if="store.storeUserIsDataCurator" @update:selected="setSelectedTraitClass">
                <v-list-item
                  v-for="(value, key) in traitClasses"
                  :key="`trait-class-${key}`"
                  :title="value.text()"
                  :value="key"
                >
                  <template #prepend>
                    <v-icon :icon="value.path" :color="value.color()" />
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
        <template #text>
          <div v-if="variable.traitDescription">{{ variable.traitDescription }}</div>

          <h4 class="mt-3" v-if="variable.traitSynonyms">{{ $t('genericSynonyms') }}</h4>
          <v-chip
            label
            v-for="(synonym, index) in variable.traitSynonyms"
            :key="`marker-synonym-${index}`"
            :prepend-icon="mdiLabel"
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

            <v-menu>
              <template #activator="{ props }">
                <v-chip
                  v-bind="store.storeUserIsDataCurator ? props : undefined"
                  label
                  :color="methodClasses[changedMethodClass || variable.methodClass].color()"
                  :prepend-icon="methodClasses[changedMethodClass || variable.methodClass].path"
                  :append-icon="store.storeUserIsAuthenticated ? mdiMenuDown : undefined"
                  :text="methodClasses[changedMethodClass || variable.methodClass].text()"
                />
              </template>

              <v-list :selected="changedMethodClass" mandatory density="compact" v-if="store.storeUserIsDataCurator" @update:selected="setSelectedMethodClass">
                <v-list-item
                  v-for="(value, key) in methodClasses"
                  :key="`method-class-${key}`"
                  :title="value.text()"
                  :prepend-icon="value.path"
                  :value="key"
                >
                  <template #prepend>
                    <v-icon :icon="value.path" :color="value.color()" />
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
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
          <v-chip label :prepend-icon="mdiCodeBrackets" :text="variable.scaleUnit" v-if="variable.scaleUnit" />
          <template v-if="variable.scaleRestrictions">
            <h2>{{ $t('pageTraitDetailsRestrictionsTitle') }}</h2>

            <h4>
              <v-chip class="mr-2" label v-if="variable.scaleRestrictions.min !== undefined && variable.scaleRestrictions.min !== null" :prepend-icon="mdiGreaterThanOrEqual" :text="variable.scaleRestrictions.min" />
              <v-chip class="mr-2" label v-if="variable.scaleRestrictions.max !== undefined && variable.scaleRestrictions.max !== null" :prepend-icon="mdiLessThanOrEqual" :text="variable.scaleRestrictions.max" />
              <v-chip class="mr-2" label v-if="variable.scaleRestrictions.categories" :prepend-icon="mdiCodeBrackets" :text="variable.scaleRestrictions.categories.map(c => c.join(', ')).join(', ')" />
            </h4>
          </template>
        </template>
      </v-card>
    </v-col>

    <v-col cols="12" v-if="isChanged">
      <v-btn
        :prepend-icon="mdiContentSave"
        :text="$t('buttonSave')"
        color="primary"
        @click="saveChanges"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPatchTraitDetails, apiPostTraitTable } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type ViewTableTraitsMethodClass, type ViewTableTraitsTraitClass, type ViewTableTraits } from '@/plugins/types/germinate'
  import { dataTypes, methodClasses, traitClasses } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'
  import { mdiCodeBrackets, mdiContentSave, mdiGreaterThanOrEqual, mdiLabel, mdiLessThanOrEqual, mdiMenuDown } from '@mdi/js'

  const compProps = defineProps<{
    variableId: number
  }>()

  const store = coreStore()
  const variable = ref<ViewTableTraits>()

  const changedMethodClass = ref<ViewTableTraitsMethodClass>()
  const changedTraitClass = ref<ViewTableTraitsTraitClass>()

  const isChanged = computed(() => {
    return (changedMethodClass.value !== undefined && changedMethodClass.value !== variable.value?.methodClass)
      || (changedTraitClass.value !== undefined && changedTraitClass.value !== variable.value?.traitClass)
  })

  function setSelectedMethodClass (selected: any) {
    changedMethodClass.value = selected[0]
  }

  function setSelectedTraitClass (selected: any) {
    changedTraitClass.value = selected[0]
  }

  function saveChanges () {
    if (!variable.value) {
      return
    }
    // Patch any details that have changed
    apiPatchTraitDetails({
      ...variable.value,
      methodClass: changedMethodClass.value || variable.value.methodClass,
      traitClass: changedTraitClass.value || variable.value.traitClass,
    }, updated => {
      variable.value = updated
    })
  }

  function update () {
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
  }

  onMounted(() => update())
</script>
