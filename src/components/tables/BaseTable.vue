<template>
  <div class="base-table table-overflow-fix">
    <div>
      <div v-if="filter" class="mb-2">
        <span v-for="(f, index) in filter" :key="f.column.name">
          <b-badge :variant="isValidFilter(f) ? 'info' : 'danger'" class="mr-2" v-b-tooltip="isValidFilter(f) ? null : $t('tooltipTableFilterInvalid')" >
            {{ "'" + columns.filter(fs => fs.key === f.column)[0].label + "' " + comparators[f.comparator].text() + " '" + f.values.filter(f => f !== null).join(", ") + "'" }}
          </b-badge>
          <b-badge v-if="index < filter.length - 1" class="mr-2">
            {{ operators.filter(o => o.value === f.operator)[0].text() }}
          </b-badge>
        </span>
      </div>
    </div>
    <div class="d-flex flex-row justify-content-between align-items-end">
      <TableFilter :columns="columns"
                   :texts="options.headings"
                   :tableName="options.tableName"
                   :filterOn="filterOn"
                   ref="tableFilter"
                   v-if="filterEnabled"
                   v-on:filter-changed="onFilterChanged" />

      <div class="flex-grow-1">
        <div class="d-flex flex-row justify-content-between">
          <div class="d-flex align-items-end mx-1 text-info" v-if="filterEnabled && (filter === null || filter.length < 1)">
            <i class="mr-1 mdi mdi-18px fix-alignment mdi-arrow-left-bold"/> <span class="mb-1"> {{ $t('widgetTableFilterInfo') }}</span>
          </div>
          <div v-else />
          <template v-if="currentRequestData !== null && pagination.totalCount >= 0">
            <div v-if="showAllItems !== true" class="d-flex mx-2 mb-1">{{ $tc('paginationCountCustom', pagination.totalCount, { from: $options.filters.toThousandSeparators(currentRequestData.page * currentRequestData.limit + 1), to: $options.filters.toThousandSeparators(Math.min((currentRequestData.page + 1) * currentRequestData.limit, pagination.totalCount)), count: $options.filters.toThousandSeparators(pagination.totalCount) }) }}</div>
            <div v-else class="d-flex mx-2 mb-1">{{ $tc('paginationCountCustom', pagination.totalCount, { from: 1, to: $options.filters.toThousandSeparators(Math.min((currentRequestData.page + 1) * currentRequestData.limit, pagination.totalCount)), count: $options.filters.toThousandSeparators(pagination.totalCount) }) }}</div>
          </template>
        </div>
        <b-progress :value="100" height="6px" variant="primary" v-b-tooltip.hover :title="$t('tooltipTableLoadingIndicator')" striped animated v-if="isLoading" class="table-loading-indicator" />
        <div v-else style="height: 6px;" />
      </div>

      <b-button-group class="per-page-dropdown" v-if="!showAllItems">
        <b-dropdown v-b-tooltip.hover :title="$t('tooltipTableItemsPerPage')">
          <template slot="button-content"><i class="mdi mdi-18px mdi-book-open-page-variant"/><span> {{ tablePerPage }}</span></template>
          <b-dropdown-item v-for="value in perPageValues" @click="onPerPageChanged(value)" :key="'table-per-page-' + value">{{ value }}</b-dropdown-item>
        </b-dropdown>
        <MarkedItems :itemType="itemType" />
      </b-button-group>
    </div>
    <b-table :items="getDataLocal"
            :fields="columns"
            striped
            responsive
            hover
            outlined
            show-empty
            :empty-text="$t('paginationNoResult')"
            :sort-by="options.orderBy"
            :tbody-tr-class="options ? options.rowClassCallback : null"
            @refreshed="notifyLoaded"
            ref="table">
      <!-- Pass on all named slots -->
      <slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot"/>
      <!-- Pass on all scoped slots -->
      <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope"><slot :name="slot" v-bind="scope"/></template>

      <template v-slot:head(selected)="data">
        <div v-if="(columns.map(c => c.key).indexOf('selected') !== -1) && (getIds !== null)">
          <b-form-checkbox :checked="allSelected" @change="onSelectionHeaderClicked"/>
        </div>
      </template>
      <template v-slot:cell(selected)="data">
        <b-form-checkbox :value="data.item[options.idColumn]" v-model="selectedItems" v-if="columns.map(c => c.key).indexOf('selected') !== -1"/>
      </template>

      <template v-slot:head(marked)="data">
        <b-dropdown size="sm" dropleft variant="outline-primary" boundary="window">
          <template slot="button-content">
            <i class="mdi mdi-18px mdi-check-box-multiple-outline" />
          </template>
          <b-dropdown-item @click="markAllItems(true)"><i class="mdi mdi-18px mdi-checkbox-multiple-marked" />{{ $t('tableItemMarkingMarkAll') }}</b-dropdown-item>
          <b-dropdown-item @click="markAllItems(false)"><i class="mdi mdi-18px mdi-checkbox-multiple-blank-outline" />{{ $t('tableItemMarkingUnmarkAll') }}</b-dropdown-item>
          <b-dropdown-item @click="createGroup" v-if="token" :disabled="!markedIds[itemType] || markedIds[itemType].length < 1"><i class="mdi mdi-18px mdi-group" />{{ $t('tableItemMarkingCreateGroup') }}</b-dropdown-item>
          <template v-if="options.additionalMarkingOptions">
            <b-dropdown-divider />
            <b-dropdown-item v-for="item in options.additionalMarkingOptions" :key="item.key" @click="item.callback(null)">
              <i :class="`mdi mdi-18px ${item.icon}`" />{{ item.text() }}
            </b-dropdown-item>
          </template>
        </b-dropdown>
      </template>
      <template v-slot:cell(marked)="data">
        <div @contextmenu.prevent="contextMenu($event, data.item)">
          <b-form-checkbox :checked="isMarked(data.item)" @change="markItem(data.item[options.idColumn], $event)" v-if="itemType"/>
        </div>
      </template>
    </b-table>

    <div class="d-flex justify-content-between align-items-start">
      <div>
        <template v-if="columns.map(c => c.key).indexOf('selected') !== -1">
          <div>
            <i class="mdi mdi-18px mdi-arrow-up-bold ml-1"/><span>{{ $t('widgetTableMultiSelectInfo') }}</span>
          </div>
        </template>

        <b-button-group v-if="tableActions || downloadTable">
          <b-button class="table-download" v-if="downloadTable !== null" @click="onDownloadTableClicked"><i class="mdi mdi-18px fix-alignment mdi-download" /></b-button>
          <template v-if="tableActions">
            <b-button v-for="action in tableActions"
                      :key="`base-table-action-${action.id}`"
                      :variant="action.variant"
                      :disabled="action.disabled()"
                      @click="action.callback(selectedItems)"
                      v-b-tooltip.hover
                      :title="action.text">
              <i :class="action.icon" v-if="action.icon" />
              <span v-else>{{ action.text }}</span>
            </b-button>
          </template>
        </b-button-group>
      </div>

      <div class="d-flex">
        <b-button-group class="table-pagination" v-show="pagination.totalCount > tablePerPage">
          <b-button variant="outline-secondary" class="text-primary" @click="showJumpToPage"><i class="mdi mdi-book-open-page-variant" /> {{ pagination.currentPage }} of {{ maxPage  }}</b-button>
          <b-pagination v-model="pagination.currentPage"
                        :total-rows="pagination.totalCount"
                        :per-page="tablePerPage" />
        </b-button-group>
      </div>
    </div>

    <vue-context ref="menu" v-if="options.additionalMarkingOptions">
      <template slot-scope="child">
        <li v-for="item in options.additionalMarkingOptions" :key="item.key">
          <a href="#" @click="item.callback(child.data)"><i :class="`mdi mdi-18px ${item.icon}`" /> {{ item.text() }}</a>
        </li>
      </template>
    </vue-context>

    <GroupEditAddModal v-if="token && markedIds[itemType] && markedIds[itemType].length > 0" :groupToEdit="newGroup" :groupTypeSelect="groupTypeSelect" ref="groupAddModal" v-on:ok="putGroup"/>

    <b-modal :title="$t('modalTitleJumpToPage')"
             @shown="$refs.pageNumberInput.select()"
             @ok="$refs.jumpToPageForm.submit()"
             :ok-title="$t('buttonOk')"
             ok-only
             ref="jumpToPageModal">
      <b-form v-on:submit.prevent="jumpToPage" ref="jumpToPageForm">
        <b-form-group
          :label="$t('modalMessageJumpToPage', { maxPage: maxPage })"
          label-for="pageNumber"
          :description="$t('modalTextJumpToPage')">
          <b-form-input
            v-model="jumpToPageValue"
            type="number"
            required
            :min="1"
            :max="maxPage"
            ref="pageNumberInput" />
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import GroupEditAddModal from '@/components/modals/GroupEditAddModal'
import MarkedItems from '@/components/tables/MarkedItems'
import TableFilter from '@/components/tables/TableFilter'
import { VueContext } from 'vue-context'
import { EventBus } from '@/plugins/event-bus.js'
import { mapFilters } from '@/plugins/map-filters.js'
import groupApi from '@/mixins/api/group.js'

export default {
  props: {
    showAllItems: {
      type: Boolean,
      default: null
    },
    filterOn: {
      type: Array,
      default: null
    },
    filterEnabled: {
      type: Boolean,
      default: true
    },
    columns: {
      type: Array,
      default: () => []
    },
    itemType: {
      type: String,
      default: null
    },
    options: {
      type: Object,
      default: () => {}
    },
    tableActions: {
      type: Array,
      default: () => null
    },
    downloadTable: {
      type: Function,
      default: null
    },
    getData: {
      type: Function,
      default: () => {
        return {
          data: [],
          count: 0
        }
      }
    },
    getIds: {
      type: Function,
      default: null
    }
  },
  data: function () {
    return {
      pagination: {
        currentPage: 1,
        totalCount: -1
      },
      filter: null,
      perPageValues: this.showAllItems ? [this.MAX_JAVA_INTEGER] : [10, 25, 50, 100],
      currentRequestData: null,
      isLoading: false,
      groupTypeSelect: null,
      newGroup: null,
      selectedItems: [],
      jumpToPageValue: 1
    }
  },
  watch: {
    'pagination.currentPage': function (newValue, oldValue) {
      this.$refs.table.refresh()
    },
    tablePerPage: function (newValue, oldValue) {
      this.$nextTick(() => this.$refs.table.refresh())
    },
    selectedItems: function (newValue, oldValue) {
      this.$emit('selection-changed', newValue)
    }
  },
  computed: {
    allSelected: function () {
      return this.selectedItems.length > 0 && this.selectedItems.length === this.pagination.totalCount
    },
    maxPage: function () {
      return Math.ceil(this.pagination.totalCount / this.tablePerPage)
    }
  },
  components: {
    GroupEditAddModal,
    MarkedItems,
    TableFilter,
    VueContext
  },
  mixins: [ groupApi ],
  methods: {
    ...mapFilters(['toThousandSeparators']),
    jumpToPage: function () {
      if (this.jumpToPageValue > 0 && this.jumpToPageValue <= this.maxPage) {
        this.pagination.currentPage = this.jumpToPageValue
      }
      this.$refs.jumpToPageModal.hide()
    },
    showJumpToPage: function () {
      this.jumpToPageValue = this.pagination.currentPage
      this.$refs.jumpToPageModal.show()
    },
    getSelected: function () {
      return this.selectedItems
    },
    notifyLoaded: function () {
      this.$emit('loaded', {
        data: this.$refs.table.value,
        count: this.pagination.totalCount
      })
    },
    refresh: function () {
      this.pagination.totalCount = -1
      this.$refs.table.refresh()
    },
    setSelectedItems: function (toSelect) {
      this.selectedItems = toSelect
    },
    getCurrentRequestData: function () {
      return this.currentRequestData
    },
    isMarked: function (row) {
      if (this.itemType) {
        return this.markedIds[this.itemType].indexOf(row[this.options.idColumn]) !== -1
      } else {
        return false
      }
    },
    markItem: function (id, event) {
      if (event) {
        this.$store.dispatch('ON_MARKED_IDS_ADD', { type: this.itemType, ids: [id] })
      } else {
        this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: this.itemType, ids: [id] })
      }
    },
    isValidFilter: function (filter) {
      if (filter.column.type === Number) {
        return filter.values.filter(v => isNaN(v)).length === 0
      } else if (filter.column.type === Date) {
        return filter.values.filter(v => isNaN(new Date(v).getTime())).length === 0
      } else {
        return true
      }
    },
    markAllItems: function (mark) {
      if (this.getIds) {
        EventBus.$emit('show-loading', true)
        this.getIds(this.currentRequestData, result => {
          if (mark) {
            this.$store.dispatch('ON_MARKED_IDS_ADD', { type: this.itemType, ids: result.data })
          } else {
            this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: this.itemType, ids: result.data })
          }
          EventBus.$emit('show-loading', false)
        })
      }
    },
    onPerPageChanged: function (value) {
      this.$store.dispatch('ON_TABLE_PER_PAGE_CHANGED', value)
    },
    getDataLocal: function (ctx) {
      var localCtx = JSON.parse(JSON.stringify(ctx))
      localCtx.page = this.pagination.currentPage
      localCtx.limit = this.tablePerPage
      localCtx.prevCount = this.pagination.totalCount
      localCtx.orderBy = localCtx.sortBy.length > 0 ? localCtx.sortBy : null
      localCtx.ascending = localCtx.sortBy.length > 0 ? (localCtx.sortDesc ? 0 : 1) : null
      localCtx.filter = this.filter

      delete localCtx.sortBy
      delete localCtx.sortDesc
      delete localCtx.apiUrl
      delete localCtx.currentPage
      delete localCtx.perPage

      this.currentRequestData = localCtx

      this.isLoading = true
      return new Promise((resolve, reject) => {
        this.getData(localCtx).then(result => {
          var localResult = null
          if (result && result.data && result.data.data) {
            this.pagination.totalCount = result.data.count
            localResult = result.data.data

            if (this.options.rowVariant !== null && typeof this.options.rowVariant === 'function') {
              localResult.forEach(r => {
                r._rowVariant = this.options.rowVariant(r)
              })
            }
          } else {
            this.pagination.totalCount = 0
          }
          this.$emit('data-changed', this.currentRequestData, {
            data: localResult,
            count: this.pagination.totalCount
          })
          this.isLoading = false
          resolve(localResult)
        })
      })
    },
    contextMenu: function (event, row) {
      if (this.options.additionalMarkingOptions) {
        this.$refs.menu.open(event, row)
      }
    },
    createGroup: function () {
      this.newGroup = {
        groupId: null,
        groupName: null,
        groupDescription: null,
        userId: this.token.id
      }
      this.apiGetGroupTypes(result => {
        this.groupTypeSelect = result.data.map(g => {
          return {
            value: g.id,
            text: this.groupTypes[g.targetTable].text()
          }
        })
        const groupTypeLocal = Object.keys(this.groupTypes).filter(i => this.groupTypes[i].itemType === this.itemType)[0]
        const groupType = result.data.filter(g => g.targetTable === groupTypeLocal)[0]
        this.newGroup.groupTypeId = groupType.id
        this.newGroup.groupType = groupType.targetTable

        this.$nextTick(() => {
          this.$refs.groupAddModal.show()
        })
      })
    },
    putGroup: function () {
      var group = {
        name: this.newGroup.groupName,
        description: this.newGroup.groupDescription,
        grouptypeId: this.newGroup.groupTypeId,
        visibility: true,
        createdBy: this.newGroup.userId
      }

      this.apiPutGroup(group, result => {
        const data = {
          ids: this.markedIds[this.itemType],
          isAddition: true
        }
        this.apiPatchGroupMembers(result, this.itemType.apiName, data, result => {
          this.$bvToast.toast(this.$t('toastGroupCreateWithMembers', { count: result }), {
            title: this.$t('genericSuccess'),
            variant: 'success',
            autoHideDelay: 5000,
            appendToast: true
          })
        })
      })
    },
    onFilterChanged: function (filter) {
      this.filter = filter.filter
      this.pagination.totalCount = -1

      if (filter.triggerUpdate) {
        this.$refs.table.refresh()
      }
    },
    onDownloadTableClicked: function () {
      if (this.downloadTable !== null) {
        if (this.pagination.totalCount > 100000) {
          this.$bvModal.msgBoxConfirm(this.$t('modalTextWarningLargeAmountOfData', { size: this.toThousandSeparators(this.pagination.totalCount) }), {
            title: this.$t('modalTitleWarning'),
            okTitle: this.$t('genericYes'),
            cancelTitle: this.$t('genericNo'),
            okVariant: 'primary'
          })
            .then(value => {
              if (value === true) {
                this.requestDownload()
              }
            })
        } else {
          this.requestDownload()
        }
      }
    },
    onSelectionHeaderClicked: function (value) {
      if (value && this.getIds) {
        EventBus.$emit('show-loading', true)
        this.getIds(this.currentRequestData, result => {
          this.selectedItems = result.data
          EventBus.$emit('show-loading', false)
        })
      } else {
        this.selectedItems = []
      }
    },
    requestDownload: function () {
      EventBus.$emit('show-loading', true)
      this.downloadTable(this.currentRequestData, result => {
        this.downloadBlob({
          blob: result,
          filename: this.options.tableName + '-table',
          extension: 'zip'
        })
        EventBus.$emit('show-loading', false)
      })
    }
  }
}
</script>

<style>
.base-table table th[aria-sort="none"] {
  padding-right: 0.75em !important;
  background-image: none !important;
}
.table-loading-indicator {
  border-radius: 0;
}
.per-page-dropdown .btn {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom: 0;
}
.table-overflow-fix table {
  /* margin: 0 -1px; */
}
.base-table .table-responsive {
  margin-bottom: 0;
}

.base-table .pagination .page-link {
  border-top: 0;
}
.base-table .pagination .page-item:first-child .page-link {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.base-table .pagination .page-item:last-child .page-link {
  border-top-right-radius: 0;
}
.base-table .table-download {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top: 0;
}
.base-table .table-pagination .pagination {
  margin-bottom: 0;
}
.base-table .table-pagination .btn {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-right: 0;
  border-top: 0;
  margin-top: -1px;
}
</style>
