<template>
  <v-container fluid v-if="group">
    <h1 class="text-h4 mb-3">{{ group.groupName }} <v-chip v-if="group.groupType" label :color="groupTypes[group.groupType].color()" :prepend-icon="groupTypes[group.groupType].path">{{ groupTypes[group.groupType].text() }}</v-chip></h1>
    <v-divider class="mb-3" />
    <!-- Description -->
    {{ group }}
    <v-list>
      <v-list-item v-if="group.groupDescription" :title="$t('pageGroupsDescriptionTitle')" :subtitle="group.groupDescription" />
      <v-list-item :title="$t('pageGroupsVisibilityTitle')">
        <template #subtitle>
          <v-switch class="ms-2" v-model="group.groupVisibility" density="compact" hide-details color="primary" :label="$t('pageGroupsVisibilityText')" :disabled="!userCanEdit" @update:model-value="updateVisibility" />
        </template>
      </v-list-item>
    </v-list>

    <!-- One of these three tables will be shown, depending on the type of the selected group -->
    <GermplasmTable
      v-if="group.groupType === 'germinatebase'"
      ref="groupmembersTable"
      :get-data="getGermplasmData"
      :get-ids="getGermplasmIds"
      :download="downloadGermplasmData"
      @selection-changed="updateSelection"
      :selection-type="userCanEdit ? TableSelectionType.all : undefined"
    >
      <template #footer>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonDeleteSelected')" :disabled="selectedIds.length === 0" @click="deleteSelection">
          <v-icon icon="mdi-delete" />
          <v-chip size="small" label color="primary" v-if="selectedIds.length > 0">{{ getNumberWithSuffix(selectedIds.length, 1) }}</v-chip>
        </v-btn>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonUpload')" @click="uploadModalVisible = true"><v-icon icon="mdi-upload" /></v-btn>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonAddMarkedItems')" :disabled="store.storeMarkedGermplasm.length === 0" @click="editMarked(true)"><v-icon icon="mdi-expand-all-outline" /></v-btn>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonRemoveMarkedItems')" :disabled="store.storeMarkedGermplasm.length === 0" @click="editMarked(false)"><v-icon icon="mdi-collapse-all-outline" /></v-btn>
      </template>
    </GermplasmTable>

    <LocationTable
      v-else-if="group.groupType === 'locations'"
      ref="groupmembersTable"
      :get-data="getLocationData"
      :get-ids="getLocationIds"
      :download="downloadLocationData"
      @selection-changed="updateSelection"
      :selection-type="userCanEdit ? TableSelectionType.all : undefined"
    >
      <template #footer>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonDeleteSelected')" :disabled="selectedIds.length === 0" @click="deleteSelection">
          <v-icon icon="mdi-delete" />
          <v-chip size="small" label color="primary" v-if="selectedIds.length > 0">{{ getNumberWithSuffix(selectedIds.length, 1) }}</v-chip>
        </v-btn>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonUpload')" @click="uploadModalVisible = true"><v-icon icon="mdi-upload" /></v-btn>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonAddMarkedItems')" :disabled="store.storeMarkedLocations.length === 0" @click="editMarked(true)"><v-icon icon="mdi-expand-all-outline" /></v-btn>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonRemoveMarkedItems')" :disabled="store.storeMarkedLocations.length === 0" @click="editMarked(false)"><v-icon icon="mdi-collapse-all-outline" /></v-btn>
      </template>
    </LocationTable>

    <MarkerTable
      v-else-if="group.groupType === 'markers'"
      ref="groupmembersTable"
      :get-data="getMarkerData"
      :get-ids="getMarkerIds"
      :download="downloadMarkerData"
      @selection-changed="updateSelection"
      :selection-type="userCanEdit ? TableSelectionType.all : undefined"
    >
      <template #footer>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonDeleteSelected')" :disabled="selectedIds.length === 0" @click="deleteSelection">
          <v-icon icon="mdi-delete" />
          <v-chip size="small" label color="primary" v-if="selectedIds.length > 0">{{ getNumberWithSuffix(selectedIds.length, 1) }}</v-chip>
        </v-btn>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonUpload')" @click="uploadModalVisible = true"><v-icon icon="mdi-upload" /></v-btn>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonAddMarkedItems')" :disabled="store.storeMarkedLocations.length === 0" @click="editMarked(true)"><v-icon icon="mdi-expand-all-outline" /></v-btn>
        <v-btn size="small" variant="tonal" v-tooltip:top="$t('buttonRemoveMarkedItems')" :disabled="store.storeMarkedLocations.length === 0" @click="editMarked(false)"><v-icon icon="mdi-collapse-all-outline" /></v-btn>
      </template>
    </MarkerTable>

    <v-dialog v-model="uploadModalVisible" max-width="min(90vw, 1024px)">
      <v-card :title="$t('modalTitleGroupUpload')">
        <template #text>
          <DropFilePreview v-model="uploadContent" placeholder="widgetDropFileGroupUploadPlaceholder" />
        </template>

        <v-divider />

        <v-card-actions class="bg-surface-light">
          <v-btn :text="$t('buttonCancel')" variant="plain" @click="uploadModalVisible = false" />

          <v-spacer />

          <v-btn :text="$t('buttonUpload')" :disabled="!uploadContent || uploadContent.trim().length === 0" @click="upload" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import GermplasmTable from '@/components/tables/GermplasmTable.vue'
  import LocationTable from '@/components/tables/LocationTable.vue'
  import MarkerTable from '@/components/tables/MarkerTable.vue'
  import DropFilePreview from '@/components/widgets/DropFilePreview.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostGroupMarkerTable, apiPostGroupMarkerTableExport, apiPostGroupMarkerTableIds, apiPostMarkerTableIds } from '@/plugins/api/genotype'
  import { apiPostGermplasmTableIds, apiPostGroupGermplasmTable, apiPostGroupGermplasmTableExport, apiPostGroupGermplasmTableIds } from '@/plugins/api/germplasm'
  import { apiPatchGroup, apiPatchGroupMembers, apiPostGroupTable } from '@/plugins/api/group'
  import { apiPostGroupLocationTable, apiPostGroupLocationTableExport, apiPostGroupLocationTableIds, apiPostLocationTableIds } from '@/plugins/api/location'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type GroupModificationRequest, type PaginatedRequest, type PaginatedResult, type ViewTableGroups } from '@/plugins/types/germinate'
  import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { groupTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  export interface GroupUploadContent {
    value: string
  }

  const { t } = useI18n()
  const store = coreStore()
  const router = useRouter()
  const route = useRoute('/groups/[id]')
  const groupId = ref<number>()
  const group = ref<ViewTableGroups>()
  const selectedIds = ref<number[]>([])
  const uploadModalVisible = ref(false)
  const groupmembersTable = useTemplateRef('groupmembersTable')
  const uploadContent = ref('')

  const userCanEdit = computed(() => {
    return store.token && (store.token.id === group.value?.userId || store.storeUserIsAdmin) && store.storeServerSettings?.authMode !== 'NONE'
  })

  function updateSelection (selection: number[]) {
    selectedIds.value = selection
  }
  function getGermplasmData (data: PaginatedRequest) {
    return apiPostGroupGermplasmTable(group.value?.groupId || -1, data)
  }
  function downloadGermplasmData (data: PaginatedRequest) {
    return apiPostGroupGermplasmTableExport(group.value?.groupId || -1, data)
  }
  function getGermplasmIds (data: PaginatedRequest) {
    return apiPostGroupGermplasmTableIds(group.value?.groupId || -1, data)
  }
  function getMarkerData (data: PaginatedRequest) {
    return apiPostGroupMarkerTable(group.value?.groupId || -1, data)
  }
  function downloadMarkerData (data: PaginatedRequest) {
    return apiPostGroupMarkerTableExport(group.value?.groupId || -1, data)
  }
  function getMarkerIds (data: PaginatedRequest) {
    return apiPostGroupMarkerTableIds(group.value?.groupId || -1, data)
  }
  function getLocationData (data: PaginatedRequest) {
    return apiPostGroupLocationTable(group.value?.groupId || -1, data)
  }
  function downloadLocationData (data: PaginatedRequest) {
    return apiPostGroupLocationTableExport(group.value?.groupId || -1, data)
  }
  function getLocationIds (data: PaginatedRequest) {
    return apiPostGroupLocationTableIds(group.value?.groupId || -1, data)
  }
  function deleteSelection () {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          const type = groupTypes[group.value?.groupType || ''].apiName
          const data: GroupModificationRequest = {
            ids: selectedIds.value,
            addition: false,
          }
          emitter.emit('show-loading', true)
          apiPatchGroupMembers(group.value?.groupId || -1, type, data, () => {
            groupmembersTable.value?.refresh()
            emitter.emit('show-loading', false)
          })
        }
      },
    })
  }

  function editMarked (add: boolean) {
    const type = groupTypes[group.value?.groupType || ''].apiName
    const data: GroupModificationRequest = {
      ids: store.storeMarkedIds[groupTypes[group.value?.groupType || ''].itemType],
      addition: add,
    }
    emitter.emit('show-loading', true)
    apiPatchGroupMembers(group.value?.groupId || -1, type, data, () => {
      groupmembersTable.value?.refresh()
      emitter.emit('show-loading', false)
    })
  }

  function upload () {
    uploadModalVisible.value = false
    if (uploadContent.value && uploadContent.value.length > 0) {
      const type = groupTypes[group.value?.groupType || '']

      // Filter based on the NAME of the currently selected group item (germplasm name, location name, marker name)
      const query: PaginatedRequest = {
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filters: [{
          filters: type.nameColumns.map(nc => {
            return {
              column: nc,
              comparator: FilterComparator.inSet,
              values: uploadContent.value.split('\n'),
            }
          }),
          operator: FilterOperator.or,
        }],
      }

      emitter.emit('show-loading', true)
      // Define the callback
      const callback: GerminateResponseHandler<PaginatedResult<number[]>> = result => {
        uploadContent.value = ''
        const data = {
          ids: result.data,
          addition: true,
        }
        // Add the ids to the group
        apiPatchGroupMembers(group.value?.groupId || -1, type.apiName, data, () => {
          groupmembersTable.value?.refresh()
          emitter.emit('show-loading', false)
        })
      }

      // Get the ids for the correct group type
      switch (type.apiName) {
        case 'germplasm':
          apiPostGermplasmTableIds(query, callback)
          break
        case 'marker':
          apiPostMarkerTableIds(query, callback)
          break
        case 'location':
          apiPostLocationTableIds(query, callback)
          break
      }
    }
  }

  function updateVisibility () {
    if (!group.value) {
      return
    }

    apiPatchGroup({
      id: group.value.groupId,
      visibility: group.value.groupVisibility,
    })
  }

  onBeforeMount(() => {
    if (route.params && route.params.id) {
      groupId.value = +route.params.id

      if (groupId.value) {
        const queryParams = {
          page: 1,
          limit: 1,
          prevCount: -1,
          filters: [{
            filters: [{
              column: 'groupId',
              comparator: FilterComparator.equals,
              values: [`${groupId.value}`],
            }],
            operator: FilterOperator.and,
          }],
        }
        apiPostGroupTable<PaginatedResult<ViewTableGroups[]>>(queryParams, result => {
          if (result && result.data && result.data.length > 0) {
            group.value = result.data[0]
          }
        })
      } else {
        router.push(Pages.groups.path)
      }
    }
  })
</script>
