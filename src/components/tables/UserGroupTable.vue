<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="table"
               v-bind="$props"
               v-on="$listeners">

      <a slot="userGroupId" slot-scope="props" href="#" @click.prevent="$emit('group-selected', props.row)">{{ props.row.userGroupId }}</a>
      <a slot="userGroupName" slot-scope="props" href="#" @click.prevent="$emit('group-selected', props.row)">{{ props.row.userGroupName }}</a>
      <a slot="userGroupDescription" slot-scope="props" href="#" @click.prevent="$emit('group-selected', props.row)">{{ props.row.userGroupDescription }}</a>
      <span slot="createdOn" slot-scope="props" v-if="props.row.createdOn">{{props.row.createdOn | toDateTime}}</span>

      <b-button-group slot="actions" slot-scope="props" v-if="hideDefaultActions !== true && token && token.userType === 'Administrator'">
        <b-button variant="outline-info" size="sm" v-b-tooltip.hover :title="$t('buttonEdit')" @click="$emit('edit-group-clicked', props.row)"><i class="mdi mdi-18px mdi-rename-box" /></b-button>
        <b-button variant="outline-danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="$emit('delete-group-clicked', props.row)"><i class="mdi mdi-18px mdi-delete" /></b-button>
      </b-button-group>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'UserGroupTable',
  props: {
    ...defaultProps.FULL,
    hideDefaultActions: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    }
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

    if (this.selectable === true) {
      columns.unshift({
        name: 'selected',
        type: undefined
      })
    }

    return {
      options: {
        idColumn: 'userGroupId',
        tableName: 'groups',
        sortable: ['userGroupId', 'userGroupName', 'userGroupDescription', 'createdOn', 'count'],
        filterable: [],
        headings: {
          selected: '',
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
    },
    setSelectedItems: function (ids) {
      this.$refs.table.setSelectedItems(ids)
    }
  }
}
</script>
