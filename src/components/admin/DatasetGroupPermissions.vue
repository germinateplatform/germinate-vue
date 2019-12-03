<template>
  <div v-if="dataset">
    <h2>Group permissions</h2>
    <p>Group permissions are permissions set for groups of users. All users within this group will have the same permissions for the selected dataset. Add and remove groups by using the tables below.</p>
    <b-row>
      <b-col sm=6>
        <h3>Current group permissions</h3>
        <p>These groups currently have access to the selected dataset. Remove them by selecting their checkbox and then clicking on the delete button below the table.</p>
        <UserGroupTable :hideDefaultActions="true" :getData="getUserGroups" :getIds="getUserGroupIds" :selectable="true" :tableActions="deleteActions" ref="currentGroupTable" />
      </b-col>
      <b-col sm=6>
        <h3>Search for items<small> - Use the table filter or just browse the table</small></h3>
        <p>These are all the currently defined groups</p>
        <UserGroupTable :hideDefaultActions="true" :getData="getAllGroups" :getIds="getAllGroupIds" :selectable="true" :tableActions="addActions" ref="allGroupTable" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import UserGroupTable from '@/components/tables/UserGroupTable'

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
          icon: 'mdi mdi-18px mdi-delete',
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
          icon: 'mdi mdi-18px mdi-plus-box',
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
    dataset: function (newValue, oldValue) {
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
        isAddOperation: isAdd,
        groupIds: ids
      }
      this.apiPatchDatasetUserGroups(request, result => {
        this.$emit('permissions-changed')
        this.refresh()
      })
    },
    getUserGroups: function (request, callback) {
      return this.apiPostDatasetUserGroupTable(request, this.dataset.datasetId, callback)
    },
    getUserGroupIds: function (request, callback) {
      return this.apiPostDatasetUserGroupIds(request, this.dataset.datasetId, callback)
    },
    getAllGroups: function (request, callback) {
      return this.apiPostUserGroupTable(request, callback)
    },
    getAllGroupIds: function (request, callback) {
      return this.apiPostUserGroupIds(request, callback)
    }
  }
}
</script>

<style>

</style>
