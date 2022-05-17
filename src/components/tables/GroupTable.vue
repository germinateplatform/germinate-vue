<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               primary-key="groupId"
               ref="table"
               v-bind="$props"
               v-on="$listeners">
      <!-- Group id link -->
      <template v-slot:cell(groupId)="data">
        <router-link v-if="isEditable === true" :to="{ name: 'group-details', params: { groupId: data.item.groupId } }" event="" @click.native.prevent="$emit('group-selected', data.item.groupId)">{{ data.item.groupId }}</router-link>
        <router-link v-else :to="{ name: 'group-details', params: { groupId: data.item.groupId } }">{{ data.item.groupId }}</router-link>
      </template>
      <!-- Group name link -->
      <template v-slot:cell(groupName)="data">
        <router-link v-if="isEditable === true" :to="{ name: 'group-details', params: { groupId: data.item.groupId } }" event="" @click.native.prevent="$emit('group-selected', data.item.groupId)">{{ data.item.groupName }}</router-link>
        <router-link v-else :to="{ name: 'group-details', params: { groupId: data.item.groupId } }">{{ data.item.groupName }}</router-link>
      </template>
      <!-- Group description link -->
      <template v-slot:cell(groupDescription)="data">
        <router-link v-if="isEditable === true" :to="{ name: 'group-details', params: { groupId: data.item.groupId } }" event="" @click.native.prevent="$emit('group-selected', data.item.groupId)">{{ data.item.groupDescription }}</router-link>
        <router-link v-else :to="{ name: 'group-details', params: { groupId: data.item.groupId } }">{{ data.item.groupDescription }}</router-link>
      </template>
      <!-- Group type icon -->
      <template v-slot:cell(groupType)="data">
        <span v-if="groupTypes[data.item.groupType]"><span :style="`color: ${groupTypes[data.item.groupType].color()};`"><MdiIcon :path="groupTypes[data.item.groupType].path" /></span> {{ groupTypes[data.item.groupType].text() }}</span>
        <span v-else>{{ data.item.groupType }}</span>
      </template>

      <!-- Only show if authentication enabled -->
      <template v-slot:cell(actions)="data">
        <b-button-group v-if="isEditable && storeToken && (storeToken.id === data.item.userId)">
          <b-button variant="outline-info" size="sm" v-b-tooltip.hover :title="$t('buttonEdit')" @click="$emit('on-group-edit-clicked', data.item)"><MdiIcon :path="mdiRenameBox" /></b-button>
          <b-button variant="outline-danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="$emit('on-group-delete-clicked', data.item)"><MdiIcon :path="mdiDelete" /></b-button>
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
import typesMixin from '@/mixins/types.js'
import utilMixin from '@/mixins/util'

import { mdiRenameBox, mdiDelete } from '@mdi/js'

export default {
  name: 'GroupTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.ACTIONS,
    isEditable: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      mdiRenameBox,
      mdiDelete,
      options: {
        idColumn: 'groupId',
        tableName: 'groups'
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    columns: function () {
      const columns = [
        {
          key: 'groupId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'groupId')}`,
          label: this.$t('tableColumnGroupId')
        }, {
          key: 'groupName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'groupName')}`,
          label: this.$t('tableColumnGroupName'),
          preferedSortingColumn: true
        }, {
          key: 'groupDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'groupDescription')}`,
          label: this.$t('tableColumnGroupDescription')
        }, {
          key: 'groupType',
          type: 'groupType',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'groupType')}`,
          label: this.$t('tableColumnGroupType')
        }, {
          key: 'userId',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'userId')}`,
          label: this.$t('tableColumnGroupUserId')
        }, {
          key: 'userName',
          type: undefined,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'userName')}`,
          label: this.$t('tableColumnGroupUserName')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'createdOn')}`,
          label: this.$t('tableColumnGroupCreatedOn'),
          formatter: value => value ? new Date(value).toLocaleString() : null
        }, {
          key: 'updatedOn',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'updatedOn')}`,
          label: this.$t('tableColumnGroupUpdatedOn'),
          formatter: value => value ? new Date(value).toLocaleString() : null
        }, {
          key: 'count',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'count')}`,
          label: this.$t('tableColumnGroupCount'),
          formatter: value => value ? value.toLocaleString() : null
        }
      ]

      if (this.isEditable === true) {
        columns.push({
          key: 'actions',
          type: undefined,
          sortable: false,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'actions')}`,
          label: ''
        })
      }

      return columns
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  mixins: [typesMixin, utilMixin],
  methods: {
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>
