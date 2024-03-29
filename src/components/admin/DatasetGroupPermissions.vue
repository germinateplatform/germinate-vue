<template>
  <div v-if="dataset">
    <h2>{{ $t('pageUserPermissionsGroupPermissionsTitle') }}</h2>
    <p>{{ $t('pageUserPermissionsGroupPermissionsText') }}</p>
    <b-row>
      <b-col sm=6>
        <h3>{{ $t('pageUserPermissionsGroupPermissionsCurrentTitle') }}</h3>
        <p>{{ $t('pageUserPermissionsGroupPermissionsCurrentText') }}</p>
        <!-- Shows the user groups that currently have access to the dataset -->
        <UserGroupTable :hideDefaultActions="true" :getData="getUserGroups" :getIds="getUserGroupIds" :selectable="true" :tableActions="deleteActions" ref="currentGroupTable" />
      </b-col>
      <b-col sm=6>
        <h3>{{ $t('pageUserPermissionsGroupPermissionsNewTitle') }}<small> - {{ $t('pageUserPermissionsTableSearchHint') }}</small></h3>
        <p>{{ $t('pageUserPermissionsGroupPermissionsNewText') }}</p>
        <!-- Shows all user groups -->
        <UserGroupTable :hideDefaultActions="true" :getData="getAllGroups" :getIds="getAllGroupIds" :selectable="true" :tableActions="addActions" ref="allGroupTable" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import UserGroupTable from '@/components/tables/UserGroupTable'
import { apiPostDatasetUserGroupTable, apiPostDatasetUserGroupIds, apiPostUserGroupTable, apiPostUserGroupIds, apiPatchDatasetUserGroups } from '@/mixins/api/usergroup'
import { mdiDelete, mdiPlusBox } from '@mdi/js'

export default {
  props: {
    dataset: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      deleteActions: [
        {
          id: 0,
          text: this.$t('genericRemove'),
          variant: null,
          disabled: () => false,
          path: mdiDelete,
          callback: (selectedIds) => {
            this.patchGroup(selectedIds, false)
          }
        }
      ],
      addActions: [
        {
          id: 0,
          text: this.$t('genericAdd'),
          variant: null,
          disabled: () => false,
          path: mdiPlusBox,
          callback: (selectedIds) => {
            this.patchGroup(selectedIds, true)
          }
        }
      ]
    }
  },
  components: {
    UserGroupTable
  },
  watch: {
    dataset: function () {
      this.refresh()
    }
  },
  methods: {
    refresh: function () {
      this.$nextTick(() => {
        if (this.$refs.currentGroupTable) {
          this.$refs.currentGroupTable.refresh()
          this.$refs.currentGroupTable.setSelectedItems([])
        }
        if (this.$refs.allGroupTable) {
          this.$refs.allGroupTable.refresh()
          this.$refs.allGroupTable.setSelectedItems([])
        }
      })
    },
    patchGroup: function (ids, isAdd) {
      const request = {
        datasetId: this.dataset.datasetId,
        addOperation: isAdd,
        groupIds: ids
      }
      apiPatchDatasetUserGroups(request, () => {
        this.$emit('permissions-changed')
        this.refresh()
      })
    },
    getUserGroups: function (request, callback) {
      return apiPostDatasetUserGroupTable(request, this.dataset.datasetId, callback)
    },
    getUserGroupIds: function (request, callback) {
      return apiPostDatasetUserGroupIds(request, this.dataset.datasetId, callback)
    },
    getAllGroups: function (request, callback) {
      return apiPostUserGroupTable(request, callback)
    },
    getAllGroupIds: function (request, callback) {
      return apiPostUserGroupIds(request, callback)
    }
  }
}
</script>

<style>

</style>
