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
        <router-link v-if="isEditable === true" :to="{ name: Pages.groupDetails, params: { groupId: data.item.groupId } }" event="" @click.native.prevent="$emit('group-selected', data.item.groupId)">{{ data.item.groupId }}</router-link>
        <router-link v-else :to="{ name: Pages.groupDetails, params: { groupId: data.item.groupId } }">{{ data.item.groupId }}</router-link>
      </template>
      <!-- Group name link -->
      <template v-slot:cell(groupName)="data">
        <router-link v-if="isEditable === true" :to="{ name: Pages.groupDetails, params: { groupId: data.item.groupId } }" event="" @click.native.prevent="$emit('group-selected', data.item.groupId)">{{ data.item.groupName }}</router-link>
        <router-link v-else :to="{ name: Pages.groupDetails, params: { groupId: data.item.groupId } }">{{ data.item.groupName }}</router-link>
      </template>
      <!-- Group description link -->
      <template v-slot:cell(groupDescription)="data">
        <router-link v-if="isEditable === true" :to="{ name: Pages.groupDetails, params: { groupId: data.item.groupId } }" event="" @click.native.prevent="$emit('group-selected', data.item.groupId)">{{ data.item.groupDescription }}</router-link>
        <router-link v-else :to="{ name: Pages.groupDetails, params: { groupId: data.item.groupId } }">{{ data.item.groupDescription }}</router-link>
      </template>
      <!-- Group type icon -->
      <template v-slot:cell(groupType)="data">
        <b-badge class="w-100" :style="`color: ${getHighContrastTextColor(groupTypes[data.item.groupType].color())}; background-color: ${groupTypes[data.item.groupType].color()};`"><MdiIcon :path="groupTypes[data.item.groupType].path" /> {{ groupTypes[data.item.groupType].text() }}</b-badge>
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
import { groupTypes } from '@/mixins/types.js'
import { getHighContrastTextColor } from '@/mixins/colors'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { Pages } from '@/mixins/pages'

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
      Pages,
      groupTypes,
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
          class: 'text-right',
          label: this.$t('tableColumnGroupId')
        }, {
          key: 'groupName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnGroupName'),
          preferredSortingColumn: true
        }, {
          key: 'groupDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnGroupDescription')
        }, {
          key: 'groupType',
          type: 'groupType',
          sortable: true,
          label: this.$t('tableColumnGroupType')
        }, {
          key: 'userId',
          type: String,
          sortable: true,
          label: this.$t('tableColumnGroupUserId')
        }, {
          key: 'userName',
          type: undefined,
          sortable: false,
          label: this.$t('tableColumnGroupUserName')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnGroupCreatedOn'),
          formatter: value => value ? new Date(value).toLocaleString() : null
        }, {
          key: 'updatedOn',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnGroupUpdatedOn'),
          formatter: value => value ? new Date(value).toLocaleString() : null
        }, {
          key: 'count',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnGroupCount'),
          formatter: value => getNumberWithSuffix(value, 2)
        }
      ]

      if (this.isEditable === true) {
        columns.push({
          key: 'actions',
          type: undefined,
          sortable: false,
          class: 'text-right',
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
  methods: {
    getHighContrastTextColor,
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>
