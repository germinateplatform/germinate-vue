<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="table"
               v-bind="$props"
               v-on="$listeners">
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'UserGroupTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.ACTIONS
  },
  data: function () {
    const columns = [
      {
        name: 'userGroupId',
        type: Number
      }, {
        name: 'userGroupName',
        type: String
      }, {
        name: 'userGroupDescription',
        type: String
      }, {
        name: 'createdOn',
        type: Date
      }, {
        name: 'count',
        type: Number
      }, {
        name: 'actions',
        type: undefined
      }
    ]
    return {
      options: {
        idColumn: 'userGroupId',
        tableName: 'groups',
        sortable: ['userGroupId', 'userGroupName', 'userGroupDescription', 'createdOn', 'count'],
        filterable: [],
        headings: {
          userGroupId: () => this.$t('tableColumnUserGroupId'),
          userGroupName: () => this.$t('tableColumnUserGroupName'),
          userGroupDescription: () => this.$t('tableColumnUserGroupDescription'),
          createdOn: () => this.$t('tableColumnUserGroupCreatedOn'),
          count: () => this.$t('tableColumnUserGroupCount'),
          actions: ''
        },
        columnsClasses: {
          userGroupId: 'text-right',
          count: 'text-right',
          actions: 'text-right'
        }
      },
      columns: columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>
