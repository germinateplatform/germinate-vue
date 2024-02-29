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
        <b-button-group v-if="hideDefaultActions !== true && storeToken && storeToken.userType === USER_TYPE_ADMINISTRATOR">
          <!-- Edit group -->
          <b-button variant="outline-info" size="sm" v-b-tooltip.hover :title="$t('buttonEdit')" @click="$emit('edit-group-clicked', data.item)"><MdiIcon :path="mdiRenameBox" /></b-button>
          <!-- Delete group -->
          <b-button variant="outline-danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="$emit('delete-group-clicked', data.item)"><MdiIcon :path="mdiDelete" /></b-button>
        </b-button-group>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { USER_TYPE_ADMINISTRATOR } from '@/mixins/api/auth'

import { mdiRenameBox, mdiDelete } from '@mdi/js'

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
      mdiRenameBox,
      mdiDelete,
      options: {
        idColumn: 'userGroupId',
        tableName: 'groups'
      },
      USER_TYPE_ADMINISTRATOR
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    columns: function () {
      const result = [
        {
          key: 'userGroupId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnUserGroupId')
        }, {
          key: 'userGroupName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnUserGroupName'),
          preferredSortingColumn: true
        }, {
          key: 'userGroupDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnUserGroupDescription')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnUserGroupCreatedOn'),
          formatter: value => value ? new Date(value).toLocaleDateString() : null
        }, {
          key: 'count',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnUserGroupCount'),
          formatter: value => getNumberWithSuffix(value, 2)
        }, {
          key: 'actions',
          type: undefined,
          sortable: false,
          class: 'text-right',
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
    BaseTable,
    MdiIcon
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
