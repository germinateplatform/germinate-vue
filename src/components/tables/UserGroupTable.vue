<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="table"
               v-bind="$props"
               v-on="$listeners">
      <!-- User group id -->
      <template v-slot:cell(userGroupId)="data">
        <a v-if="hideDefaultActions !== true" href="#" @click.prevent="$emit('group-selected', data.item)">{{ data.item.userGroupId }}</a>
        <span v-else>{{ data.item.userGroupId }}</span>
      </template>
      <!-- User group name -->
      <template v-slot:cell(userGroupName)="data">
        <a v-if="hideDefaultActions !== true" href="#" @click.prevent="$emit('group-selected', data.item)">{{ data.item.userGroupName }}</a>
        <span v-else>{{ data.item.userGroupName }}</span>
      </template>
      <!-- User group description -->
      <template v-slot:cell(userGroupDescription)="data">
        <a v-if="hideDefaultActions !== true" href="#" @click.prevent="$emit('group-selected', data.item)">{{ data.item.userGroupDescription }}</a>
        <span v-else>{{ data.item.userGroupDescription }}</span>
      </template>

      <!-- Additional action buttons -->
      <template v-slot:cell(actions)="data">
        <b-button-group v-if="hideDefaultActions !== true && token && token.userType === 'Administrator'">
          <!-- Edit group -->
          <b-button variant="outline-info" size="sm" v-b-tooltip.hover :title="$t('buttonEdit')" @click="$emit('edit-group-clicked', data.item)"><i class="mdi mdi-18px mdi-rename-box" /></b-button>
          <!-- Delete group -->
          <b-button variant="outline-danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="$emit('delete-group-clicked', data.item)"><i class="mdi mdi-18px mdi-delete" /></b-button>
        </b-button-group>
      </template>
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
        tableName: 'groups'
      }
    }
  },
  computed: {
    columns: function () {
      var result = [
        {
          key: 'userGroupId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'userGroupId')}`,
          label: this.$t('tableColumnUserGroupId')
        }, {
          key: 'userGroupName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'userGroupName')}`,
          label: this.$t('tableColumnUserGroupName'),
          preferedSortingColumn: true
        }, {
          key: 'userGroupDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'userGroupDescription')}`,
          label: this.$t('tableColumnUserGroupDescription')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'createdOn')}`,
          label: this.$t('tableColumnUserGroupCreatedOn'),
          formatter: this.$options.filters.toDate
        }, {
          key: 'count',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'count')}`,
          label: this.$t('tableColumnUserGroupCount'),
          formatter: this.$options.filters.toThousandSeparators
        }, {
          key: 'actions',
          type: undefined,
          sortable: false,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'actions')}`,
          label: ''
        }
      ]

      if (this.selectable === true) {
        result.unshift({
          key: 'selected',
          type: undefined,
          sortable: false,
          class: 'bg-primary',
          label: ''
        })
      }

      return result
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
