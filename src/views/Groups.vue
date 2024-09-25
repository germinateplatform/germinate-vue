<template>
  <div>
    <h1>{{ $t('pageGroupsTitle') }}</h1>
    <hr />

    <p>{{ $t('pageGroupsText') }}</p>

    <!-- These buttons are for switching between different group types. They make switching very convenient. -->
    <b-button-group>
      <b-button v-for="groupType in groupTypeOptions"
               :key="groupType.id"
               :pressed="selectedGroupTypeId === groupType.id"
               variant="outline-primary"
               @click="setGroupType(groupType)">
        <MdiIcon :path="groupType.path" /><span> {{ groupType.text() }}</span>
      </b-button>
    </b-button-group>

    <!-- Table showing all groups -->
    <GroupTable ref="groupsTable"
                :getData="getGroupData"
                :filterOn="filterOn"
                :isEditable="true"
                :tableActions="storeToken ? tableActions : null"
                v-on:group-selected="onGroupSelected"
                v-on:on-group-edit-clicked="onGroupEditClicked"
                v-on:on-group-delete-clicked="onGroupDeleteClicked" />

    <!-- Group details -->
    <div v-if="group" ref="groupDetails">
      <hr />
      <!-- Name -->
      <h2 class="d-flex justify-content-between">
        <span>{{ group.groupName }} <small>{{ groupTypes[group.groupType].text() }}</small></span>
        <b-button variant="danger" @click="onGroupDeleteClicked(group)" v-if="userCanEdit === true">{{ $t('buttonDelete') }}</b-button>
      </h2>
      <!-- Description -->
      <template v-if="group.groupDescription">
        <h3>{{ $t('pageGroupsDescriptionTitle') }}</h3>
        <p>{{ group.groupDescription }}</p>
      </template>

      <!-- Visibility -->
      <h3 class="mt-3">{{ $t('pageGroupsVisibilityTitle') }}</h3>
      <span>{{ $t('pageGroupsVisibilityText') }}</span>
      <b-form-checkbox switch
                       v-model="group.groupVisibility"
                       :value="true"
                       :disabled="userCanEdit === false"
                       :unchecked-value="false"
                       @change="onUpdateGroupVisibility">
        {{ group.groupVisibility === true ? $t('genericYes') : $t('genericNo') }}
      </b-form-checkbox>

      <h3 class="mt-3">{{ $t('pageGroupsPublicationsTitle') }}</h3>
      <p v-html="$t('pageGroupsPublicationsText')" />
      <PublicationsWidget :referencingId="group.groupId" referenceType="group" />

      <h3 class="mt-3">{{ $t('pageGroupsMembersTitle') }}</h3>
      <!-- One of these three tables will be shown, depending on the type of the selected group -->
      <GermplasmTable v-if="group.groupType === 'germinatebase'"
                      ref="groupmembersTable"
                      :getData="getGermplasmData"
                      :getIds="getGermplasmIds"
                      :downloadTable="downloadGermplasmData"
                      :selectable="userCanEdit && storeServerSettings.authMode !== 'NONE'"
                      :tableActions="userCanEdit ? groupTableActions : null"/>
      <MarkerTable v-else-if="group.groupType === 'markers'"
                   ref="groupmembersTable"
                   :getData="getMarkerData"
                   :getIds="getMarkerIds"
                   :downloadTable="downloadMarkerData"
                   :selectable="userCanEdit && storeServerSettings.authMode !== 'NONE'"
                   :tableActions="userCanEdit ? groupTableActions : null"/>
      <LocationTable v-else-if="group.groupType === 'locations'"
                     ref="groupmembersTable"
                     :getData="getLocationData"
                     :getIds="getLocationIds"
                     :downloadTable="downloadLocationData"
                     :selectable="userCanEdit && storeServerSettings.authMode !== 'NONE'"
                     :tableActions="userCanEdit ? groupTableActions : null"/>
    </div>

    <!-- Group add/edit modal -->
    <GroupEditAddModal ref="groupDetailsModal"
                       :canChangeType="groupToEdit && (groupToEdit.groupId === null)"
                       :groupToEdit="groupToEdit"
                       :groupTypeSelect="groupTypeSelect"
                       v-on:ok="onEditGroup" />
    <!-- Group upload modal -->
    <GroupUploadModal ref="groupUploadModal"
                      v-on:ok="uploadContent" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import GermplasmTable from '@/components/tables/GermplasmTable'
import GroupTable from '@/components/tables/GroupTable'
import LocationTable from '@/components/tables/LocationTable'
import MarkerTable from '@/components/tables/MarkerTable'
import GroupEditAddModal from '@/components/modals/GroupEditAddModal'
import GroupUploadModal from '@/components/modals/GroupUploadModal'
import PublicationsWidget from '@/components/util/PublicationsWidget'
import { apiPatchGroup, apiPutGroup, apiDeleteGroup, apiPatchGroupMembers, apiGetGroupTypes, apiPostGroupTable } from '@/mixins/api/group.js'
import { apiPostGermplasmTableIds, apiPostGroupGermplasmTable, apiPostGroupGermplasmTableExport, apiPostGroupGermplasmTableIds } from '@/mixins/api/germplasm.js'
import { apiPostMarkerTableIds, apiPostGroupMarkerTable, apiPostGroupMarkerTableIds, apiPostGroupMarkerTableExport } from '@/mixins/api/genotype.js'
import { apiPostLocationTableIds, apiPostGroupLocationTableExport, apiPostGroupLocationTable, apiPostGroupLocationTableIds } from '@/mixins/api/location.js'
import { groupTypes } from '@/mixins/types'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

import { mdiPlusBox, mdiCollapseAll, mdiDelete, mdiExpandAll, mdiUpload } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      groupTypes,
      group: null,
      groupToEdit: null,
      groupId: null,
      groupTypeSelect: [],
      selectedGroupType: null,
      tableActions: [
        {
          id: 0,
          text: this.$t('tooltipCreateNewGroup'),
          variant: null,
          disabled: () => false,
          path: mdiPlusBox,
          callback: () => {
            this.groupToEdit = {
              groupId: null,
              groupName: null,
              groupDescription: null,
              groupTypeId: null,
              userId: this.storeToken ? this.storeToken.id : null
            }

            this.$nextTick(() => this.$refs.groupDetailsModal.show())
          }
        }
      ],
      groupTableActions: [
        {
          id: 0,
          text: this.$t('buttonDeleteSelected'),
          variant: null,
          disabled: (selectedItems) => !selectedItems || selectedItems.length < 1,
          path: mdiDelete,
          callback: (selectedIds) => {
            if (!selectedIds || selectedIds.length < 1) {
              return
            }

            const type = groupTypes[this.group.groupType].apiName
            const data = {
              ids: selectedIds,
              addition: false
            }
            emitter.emit('show-loading', true)
            apiPatchGroupMembers(this.group.groupId, type, data, () => {
              this.$refs.groupmembersTable.refresh()
              this.$refs.groupsTable.refresh()
              emitter.emit('show-loading', false)
            })
          }
        },
        {
          id: 1,
          text: this.$t('buttonUpload'),
          variant: null,
          disabled: () => false,
          path: mdiUpload,
          callback: () => this.$refs.groupUploadModal.show()
        },
        {
          id: 2,
          text: this.$t('buttonAddMarkedItems'),
          variant: null,
          disabled: () => this.storeMarkedIds[groupTypes[this.group.groupType].itemType].length < 1,
          path: mdiExpandAll,
          callback: () => {
            const type = groupTypes[this.group.groupType].apiName
            const data = {
              ids: this.storeMarkedIds[groupTypes[this.group.groupType].itemType],
              addition: true
            }
            emitter.emit('show-loading', true)
            apiPatchGroupMembers(this.group.groupId, type, data, () => {
              this.$refs.groupmembersTable.refresh()
              this.$refs.groupsTable.refresh()
              emitter.emit('show-loading', false)
            })
          }
        },
        {
          id: 3,
          text: this.$t('buttonRemoveMarkedItems'),
          variant: null,
          disabled: () => this.storeMarkedIds[groupTypes[this.group.groupType].itemType].length < 1,
          path: mdiCollapseAll,
          callback: () => {
            const type = groupTypes[this.group.groupType].apiName
            const data = {
              ids: this.storeMarkedIds[groupTypes[this.group.groupType].itemType],
              addition: false
            }
            emitter.emit('show-loading', true)
            apiPatchGroupMembers(this.group.groupId, type, data, () => {
              this.$refs.groupmembersTable.refresh()
              this.$refs.groupsTable.refresh()
              emitter.emit('show-loading', false)
            })
          }
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeServerSettings',
      'storeMarkedIds',
      'storeSelectedProjects'
    ]),
    userCanEdit: function () {
      return this.storeToken !== null && this.group !== null && (this.group.userId === this.storeToken.id)
    },
    groupTypeOptions: function () {
      return Object.keys(groupTypes).map(e => {
        return {
          id: e,
          icon: groupTypes[e].icon,
          path: groupTypes[e].path,
          text: () => groupTypes[e].text()
        }
      })
    },
    selectedGroupTypeId: function () {
      return this.selectedGroupType ? this.selectedGroupType.id : null
    },
    filterOn: function () {
      const filter = []
      if (this.storeSelectedProjects && this.storeSelectedProjects.length > 0) {
        filter.push({
          column: {
            name: 'projectIds',
            type: Number
          },
          comparator: 'arrayContains',
          operator: 'and',
          values: this.storeSelectedProjects,
          canBeChanged: false
        })
      }
      if (this.selectedGroupType) {
        filter.push({
          column: {
            name: 'groupType',
            type: 'groupType'
          },
          comparator: 'equals',
          operator: 'and',
          values: [this.selectedGroupType.id]
        })
      }
      return filter
    }
  },
  watch: {
    storeToken: function () {
      // On login/logout, deselect the current group
      this.group = null
      this.groupId = null
    }
  },
  components: {
    GermplasmTable,
    GroupTable,
    GroupEditAddModal,
    GroupUploadModal,
    LocationTable,
    MarkerTable,
    PublicationsWidget,
    MdiIcon
  },
  methods: {
    uploadContent: function (content) {
      if (content && content.length > 0) {
        const type = groupTypes[this.group.groupType]

        // Filter based on the NAME of the currently selected group item (germplasm name, location name, marker name)
        const query = {
          page: 1,
          limit: MAX_JAVA_INTEGER,
          filter: [{
            column: type.nameColumn,
            comparator: 'inSet',
            operator: 'and',
            values: content
          }]
        }

        emitter.emit('show-loading', true)
        // Define the callback
        const callback = result => {
          const data = {
            ids: result.data,
            addition: true
          }
          // Add the ids to the group
          apiPatchGroupMembers(this.group.groupId, type.apiName, data, () => {
            this.$refs.groupmembersTable.refresh()
            this.$refs.groupsTable.refresh()
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
    },
    setGroupType: function (groupType) {
      if (this.selectedGroupType && groupType && this.selectedGroupType.id === groupType.id) {
        this.selectedGroupType = null
      } else {
        this.selectedGroupType = groupType
      }
      this.$nextTick(() => this.$refs.groupsTable.refresh())
    },
    getGroupData: function (data, callback) {
      return apiPostGroupTable(data, callback)
    },
    getGermplasmData: function (data, callback) {
      return apiPostGroupGermplasmTable(this.group.groupId, data, callback)
    },
    downloadGermplasmData: function (data, callback) {
      return apiPostGroupGermplasmTableExport(this.group.groupId, data, callback)
    },
    getGermplasmIds: function (data, callback) {
      return apiPostGroupGermplasmTableIds(this.group.groupId, data, callback)
    },
    getMarkerData: function (data, callback) {
      return apiPostGroupMarkerTable(this.group.groupId, data, callback)
    },
    downloadMarkerData: function (data, callback) {
      return apiPostGroupMarkerTableExport(this.group.groupId, data, callback)
    },
    getMarkerIds: function (data, callback) {
      return apiPostGroupMarkerTableIds(this.group.groupId, data, callback)
    },
    getLocationData: function (data, callback) {
      return apiPostGroupLocationTable(this.group.groupId, data, callback)
    },
    downloadLocationData: function (data, callback) {
      return apiPostGroupLocationTableExport(this.group.groupId, data, callback)
    },
    getLocationIds: function (data, callback) {
      return apiPostGroupLocationTableIds(this.group.groupId, data, callback)
    },
    onEditGroup: function () {
      const group = {
        id: this.groupToEdit.groupId,
        name: this.groupToEdit.groupName,
        description: this.groupToEdit.groupDescription,
        grouptypeId: this.groupToEdit.groupTypeId,
        createdBy: this.storeToken.id
      }
      // Remove empty descriptions
      if (!group.description) {
        delete group.description
      }
      if (group.id !== null) {
        apiPatchGroup(group, () => {
          this.$refs.groupsTable.refresh()
        })
      } else {
        apiPutGroup(group, result => {
          this.$refs.groupsTable.refresh()

          // Select the newly created group
          this.onGroupSelected(result)

          emitter.emit('update-sidebar-menu')
        })
      }
    },
    onGroupEditClicked: function (groupToEdit) {
      this.groupToEdit = groupToEdit

      this.$nextTick(() => this.$refs.groupDetailsModal.show())
    },
    onUpdateGroupVisibility: function () {
      this.$nextTick(() => {
        const group = {
          id: this.group.groupId,
          visibility: this.group.groupVisibility
        }
        apiPatchGroup(group, () => {
          this.$refs.groupsTable.refresh()
        })
      })
    },
    onGroupDeleteClicked: function (groupToDelete) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            apiDeleteGroup(groupToDelete.groupId, () => {
              // If the current group was deleted, unset selection
              if (this.group && groupToDelete.groupId === this.group.groupId) {
                this.group = null
                this.groupId = null
              }
              // Refresh the table
              this.$refs.groupsTable.refresh()
            })
          }
        })
    },
    onGroupSelected: function (groupId) {
      this.groupId = groupId

      if (this.groupId) {
        const queryParams = {
          page: 1,
          limit: 1,
          prevCount: -1,
          filter: [{
            column: 'groupId',
            comparator: 'equals',
            operator: 'and',
            values: [this.groupId]
          }]
        }
        const prevGroupType = this.group ? this.group.groupType : null
        apiPostGroupTable(queryParams, result => {
          if (result && result.data && result.data.length > 0) {
            // Update the URL to reflect the newly selected group
            this.$router.push({ name: 'group-details', params: { groupId: this.groupId }, query: this.$router.currentRoute.query })
            this.group = result.data[0]

            // This refresh is necessary, since we're not switching group type. The table showing the resulting group
            // is therefore already visible and needs to be told that the group it's showing data for changed.
            if (prevGroupType === this.group.groupType) {
              this.$nextTick(() => this.$refs.groupmembersTable.refresh())
            }

            // Scroll down to the group details section
            this.$nextTick(() => {
              const rect = this.$refs.groupDetails.getBoundingClientRect()

              window.scrollTo({
                left: 0,
                top: rect.top,
                behavior: 'smooth'
              })
            })
          }
        })
      }
    }
  },
  mounted: function () {
    apiGetGroupTypes(result => {
      this.groupTypeSelect = result.data.map(g => {
        return {
          value: g.id,
          text: groupTypes[g.targetTable].text()
        }
      })
    })

    this.onGroupSelected(this.$route.params.groupId)
  }
}
</script>

<style>

</style>
