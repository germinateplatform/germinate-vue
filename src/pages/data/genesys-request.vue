<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageGenesysTitle') }}</h1>
    <v-divider class="mb-3" />

    <template v-if="genesysUrl">
      <p>{{ $t('pageGenesysTextSuccessful') }}</p>

      <v-btn color="primary" :href="genesysUrl" target="_blank" prepend-icon="$genesys" :text="$t('buttonContinueGenesysOrdering')" />
    </template>
    <template v-else>
      <p>{{ $t('pageGenesysText') }}</p>

      <b-alert variant="warning" v-if="!store.serverSettings?.genesysAvailable">{{ $t('pageGenesysUnavailable') }}</b-alert>
      <template v-else>
        <GermplasmTable :get-data="getGermplasmData" :get-ids="getGermplasmIds" :download="downloadGermplasm" :filter-on="germplasmFilters" ref="germplasmTable" />
      </template>

      <v-row class="my-5">
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-card :title="$t('pageGenesysFormDetailsTitle')">
            <template #text>
              <v-form @submit.prevent="submit">
                <template v-if="!store.storeToken">
                  <v-text-field :label="$t('formLabelFullName')" v-model="name" required />
                  <v-text-field :label="$t('formLabelEmail')" v-model="email" type="email" required />
                </template>
                <div class="mb-3" v-else>
                  <v-chip :text="store.storeToken.username" prepend-icon="mdi-account" />
                </div>
              </v-form>
            </template>

            <template #actions>
              <v-spacer />
              <v-btn :disabled="!canContinue" color="primary" variant="flat" prepend-icon="$genesys" :text="$t('buttonGoToGenesysOrdering')" @click="submit" />
            </template>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostGermplasmTable, apiPostGermplasmTableIds } from '@/plugins/api/germplasm'
  import { apiPostGenesysRequest, apiPostTableExport } from '@/plugins/api/misc'
  import { Pages } from '@/plugins/pages'
  import type { MaterialRequestResponse } from '@/plugins/types/genesys'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const store = coreStore()
  const router = useRouter()
  const genesysUuid = ref<string>()
  const name = ref<string>()
  const email = ref<string>()

  const germplasmFilters: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'germplasmId',
        comparator: FilterComparator.inSet,
        values: store.storeMarkedGermplasm.map(String),
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })

  const genesysUrl = computed(() => {
    if (genesysUuid.value && store.storeServerSettings) {
      return `${store.storeServerSettings.genesysUrl}/api/v2/request/external?key=${genesysUuid.value}`
    } else {
      return null
    }
  })

  const canContinue = computed(() => {
    return store.storeMarkedGermplasm && store.storeMarkedGermplasm.length > 0 && (store.storeToken || (name.value && name.value.trim().length > 0 && email.value && email.value.trim().length > 0))
  })

  function submit () {
    if (!canContinue.value) {
      return
    }

    emitter.emit('show-loading', true)

    apiPostGenesysRequest({
      name: name.value || '',
      email: email.value || '',
      germplasmIds: store.storeMarkedGermplasm,
    }, (result: string) => {
      genesysUuid.value = result
      emitter.emit('show-loading', false)
    }, {
      codes: [400, 404, 503],
      callback: (e: MaterialRequestResponse) => {
        // Do nothing here, it just means there is no data.
        emitter.emit('show-loading', false)

        switch (e.status) {
          case 404:
            // TODO
            break
          case 400:
            if (e.data && e.data.length > 0) {
              emitter.emit('show-confirm', {
                title: t('modalTitleGenesysMissingItems'),
                message: t('modalTextGenesysMissingItems', { missing: e.data.length, total: store.storeMarkedGermplasm.length }),
                okTitle: t('genericYes'),
                cancelTitle: t('genericNo'),
                okVariant: 'error',
                callback: (result: boolean) => {
                  if (result === true) {
                    store.removeMarkedIds('germplasm', e.data)
                  }
                },
              })
            }
            break
          case 503:
            // TODO
            router.push(Pages.getPath(Pages.markedItemType, 'germplasm'))
            break
        }
      },
    })
  }
  function getGermplasmData (data: PaginatedRequest) {
    return apiPostGermplasmTable(data)
  }
  function getGermplasmIds (data: PaginatedRequest) {
    return apiPostGermplasmTableIds(data)
  }
  function downloadGermplasm (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters }, 'germplasm')
  }
</script>
