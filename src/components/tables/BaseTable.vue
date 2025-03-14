<template>
  <div class="base-table mb-3" :id="id">
    <div>
      <!-- Filter display -->
      <div v-if="filter" class="mb-2">
        <span v-for="(f, index) in filter" :key="f.column.name">
          <!-- Comparison -->
          <b-badge :variant="isValidFilter(f) ? 'info' : 'danger'" class="mr-2" v-b-tooltip="isValidFilter(f) ? null : $t('tooltipTableFilterInvalid')" >
            {{ "'" + columns.filter(fs => fs.key === f.column)[0].label + "' " + comparators[f.comparator].text() + " '" + f.values.filter(f => f !== null).join(", ") + "'" }}
          </b-badge>
          <!-- Operator -->
          <b-badge v-if="index < filter.length - 1" class="mr-2">
            {{ Object.keys(operators).filter(o => operators[o].value === f.operator).map(o => operators[o])[0].text() }}
          </b-badge>
        </span>
      </div>
    </div>
    <!-- Table container -->
    <div class="d-flex flex-row flex-wrap justify-content-between align-items-end">
      <!-- Table filter mechanism including column selector -->
      <TableFilter :columns="columns"
                   :texts="options.headings"
                   :tableName="options.tableName"
                   :filterOn="filterOn"
                   :storeUrlParameters="storeUrlParameters"
                   divClass="order-1 order-sm-0"
                   ref="tableFilter"
                   v-if="filterEnabled"
                   v-on:filter-changed="onFilterChanged"
                   v-on:help-clicked="$refs.tableTour.start()"/>

      <!-- Content in the middle -->
      <div class="flex-grow-1 order-0 order-sm-1">
        <div class="d-flex flex-row justify-content-between">
          <!-- Table filtering info -->
          <div class="d-none d-sm-flex mx-1 text-info" v-if="filterEnabled && (filter === null || filter.length < 1)">
            <MdiIcon :path="mdiArrowLeftBold" className="mr-1" /> <span class="mb-1"> {{ $t('widgetTableFilterInfo') }}</span>
          </div>
          <div v-else />
          <!-- Row count -->
          <template v-if="currentRequestData !== null && pagination.totalCount >= 0">
            <div v-if="showAllItems" class="d-flex mx-2 mb-1" id="table-row-count">{{ $tc('paginationCountCustom', pagination.totalCount, { from: 1, to: pagination.totalCount.toLocaleString(), count: pagination.totalCount.toLocaleString() }) }}</div>
            <div v-else class="d-flex mx-2 mb-1" id="table-row-count">{{ $tc('paginationCountCustom', pagination.totalCount, { from: (currentRequestData.page * currentRequestData.limit + 1).toLocaleString(), to: (Math.min((currentRequestData.page + 1) * currentRequestData.limit, pagination.totalCount)).toLocaleString(), count: pagination.totalCount.toLocaleString() }) }}</div>
          </template>
        </div>
        <!-- Progress bar below it all that indicates the loading state -->
        <b-progress :value="100" height="6px" variant="primary" v-b-tooltip.hover :title="$t('tooltipTableLoadingIndicator')" striped animated v-if="isLoading" class="table-loading-indicator" />
        <div v-else style="height: 6px;" />
      </div>

      <!-- Item per page dropdown -->
      <b-button-group class="per-page-dropdown order-2 order-sm-2" v-if="!showAllItems">
        <b-dropdown v-b-tooltip.hover :title="$t('tooltipTableItemsPerPage')" id="table-page-size-dropdown" right>
          <template slot="button-content">
            <MdiIcon :path="mdiBookOpenPageVariant" /><span> {{ storeTablePerPage }}</span>
          </template>
          <b-dropdown-item v-for="value in perPageValues" @click="onPerPageChanged(value)" :key="'table-per-page-' + value" :active="value === storeTablePerPage">{{ value }}</b-dropdown-item>
        </b-dropdown>
        <!-- Item marking mechanism -->
        <MarkedItems :itemType="itemType" />
      </b-button-group>
    </div>

    <!-- Actual table -->
    <b-table :items="getDataLocal"
            :fields="reformattedColumns"
            striped
            responsive
            hover
            outlined
            show-empty
            :busy="isLoading"
            head-variant="dark"
            table-class="position-relative"
            :empty-text="$t('paginationNoResult')"
            :sort-by="options.orderBy"
            :sort-desc="options.orderByDesc"
            :tbody-tr-class="options ? options.rowClassCallback : defaultRowClassCallback"
            @refreshed="notifyLoaded"
            @sort-changed="updateSort"
            ref="table">
      <!-- Pass on all named slots -->
      <slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot"/>
      <!-- Pass on all scoped slots -->
      <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope"><slot :name="slot" v-bind="scope"/></template>

      <!-- Selected column (first checkbox) -->
      <template v-slot:head(selected)>
        <div v-if="(reformattedColumns.map(c => c.key).indexOf('selected') !== -1) && (getIds !== null) && selectionMode == 'multi'">
          <b-form-checkbox :checked="allSelected" @change="onSelectionHeaderClicked"/>
        </div>
      </template>
      <template v-slot:cell(selected)="data">
        <b-form-checkbox :value="data.item[options.idColumn]" v-model="selectedItems" @change="updateRowVariant(data.item)" v-if="reformattedColumns.map(c => c.key).indexOf('selected') !== -1"/>
      </template>
      <template #table-colgroup v-if="hasSelectionColumn">
        <col key="selected" :style="{ width: '40px' }" />
      </template>

      <!-- Marked item column -->
      <template v-slot:head(marked)>
        <b-dropdown size="sm" dropleft variant="outline-light" boundary="window">
          <template slot="button-content">
            <MdiIcon :path="mdiCheckboxMultipleOutline" />
          </template>
          <b-dropdown-item @click="markAllItems(true)"><MdiIcon :path="mdiCheckboxMultipleMarked" /> {{ $t('tableItemMarkingMarkAll') }}</b-dropdown-item>
          <b-dropdown-item @click="markAllItems(false)"><MdiIcon :path="mdiCheckboxMultipleBlankOutline" /> {{ $t('tableItemMarkingUnmarkAll') }}</b-dropdown-item>
          <b-dropdown-item @click="createGroup" v-if="storeToken" :disabled="!storeMarkedIds[itemType] || storeMarkedIds[itemType].length < 1"><MdiIcon :path="mdiGroup" /> {{ $t('tableItemMarkingCreateGroup') }}</b-dropdown-item>
          <template v-if="options.additionalMarkingOptions">
            <b-dropdown-divider />
            <b-dropdown-item v-for="item in options.additionalMarkingOptions" :key="item.key" @click="item.callback(null)">
              <MdiIcon :path="item.path" /> {{ item.text() }}
            </b-dropdown-item>
          </template>
        </b-dropdown>
      </template>
      <template v-slot:cell(marked)="data">
        <template v-if="itemType">
          <template v-if="options.additionalMarkingOptions">
            <b-dropdown size="sm" split text="Split Dropdown" class="m-2" @click="markItem(data.item[options.idColumn], !isMarked(data.item))">
              <template #button-content>
                <b-form-checkbox :checked="isMarked(data.item)" :style="{ pointerEvents: 'none' }" />
              </template>
              <b-dropdown-item href="#" v-for="item in options.additionalMarkingOptions" :key="item.key" @click.prevent="item.callback(data.item)">
                <MdiIcon :path="item.path" /> {{ item.text() }}
              </b-dropdown-item>
            </b-dropdown>
          </template>
          <b-form-checkbox :checked="isMarked(data.item)" @change="markItem(data.item[options.idColumn], $event)" v-else/>
        </template>
      </template>
    </b-table>

    <!-- Container below the table -->
    <div class="d-flex flex-wrap-reverse justify-content-between align-items-end">
      <div class="table-bottom-left">
        <!-- Information about selecting multiple items in the table -->
        <template v-if="reformattedColumns.map(c => c.key).indexOf('selected') !== -1 && selectionMode === 'multi'">
          <div>
            <span class="ml-2"><MdiIcon :path="mdiArrowUpBold" /></span><span>{{ $t('widgetTableMultiSelectInfo') }}</span>
          </div>
        </template>

        <!-- Any additional actions and the download button -->
        <b-button-group v-if="tableActions || downloadTable">
          <!-- Download button -->
          <b-button class="table-download" v-if="downloadTable !== null" @click="onDownloadTableClicked" id="table-download" v-b-tooltip.hover.bottom :title="$t('buttonDownload')"><MdiIcon :path="mdiDownload" /></b-button>
          <template v-if="tableActions">
            <!-- Table actions -->
            <b-button v-for="action in tableActions"
                      :key="`base-table-action-${action.id}`"
                      :variant="action.variant"
                      :disabled="action.disabled(selectedItems)"
                      @click="action.callback(selectedItems)"
                      v-b-tooltip.hover.bottom
                      :title="action.text">
              <MdiIcon :path="action.path" v-if="action.path" />
              <span v-else>{{ action.text }}</span>
            </b-button>
          </template>
        </b-button-group>
      </div>

      <!-- Page indicator and pagination -->
      <div class="d-flex" v-if="!showAllItems">
        <b-button-group class="table-pagination" v-show="pagination.totalCount > storeTablePerPage">
          <b-button class="text-primary page-link" @click="showJumpToPage" id="table-jump-to-page"><MdiIcon :path="mdiBookOpenPageVariant" /> {{ $t('paginationPageCustom', { from: pagination.currentPage, to: maxPage }) }}</b-button>
          <b-pagination v-model="pagination.currentPage"
                        :total-rows="pagination.totalCount"
                        :per-page="storeTablePerPage"
                        id="table-pagination"
                        v-if="pagination.totalCount > 0" />
        </b-button-group>
      </div>
    </div>

    <!-- Group edit/add modal -->
    <GroupEditAddModal v-if="storeToken && storeMarkedIds[itemType] && storeMarkedIds[itemType].length > 0" :groupToEdit="newGroup" :groupTypeSelect="groupTypeSelect" ref="groupAddModal" v-on:ok="putGroup"/>

    <!-- Jump to page modal -->
    <b-modal :title="$t('modalTitleJumpToPage')"
             @shown="$refs.pageNumberInput.select()"
             @ok="jumpToPage"
             :ok-title="$t('buttonOk')"
             ok-only
             ref="jumpToPageModal">
      <b-form @submit.prevent="jumpToPage" ref="jumpToPageForm">
        <b-form-group
          :label="$t('modalMessageJumpToPage', { maxPage: maxPage })"
          label-for="pageNumber"
          :description="$t('modalTextJumpToPage')">
          <b-form-input
            v-model.number="jumpToPageValue"
            type="number"
            required
            :min="1"
            :max="maxPage"
            ref="pageNumberInput" />
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Tour showing how to use the table -->
    <Tour ref="tableTour" :steps="tableTourSteps" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import GroupEditAddModal from '@/components/modals/GroupEditAddModal'
import MarkedItems from '@/components/tables/MarkedItems'
import TableFilter from '@/components/tables/TableFilter'
import Tour from '@/components/util/Tour'
import { apiPutGroup, apiPatchGroupMembers, apiGetGroupTypes } from '@/mixins/api/group'
import { operators, comparators } from '@/mixins/search'
import { groupTypes } from '@/mixins/types'
import { getDateTimeString } from '@/mixins/formatting'
import { uuidv4, getTableColumnStyle, downloadBlob } from '@/mixins/util'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

import { mdiArrowLeftBold, mdiBookOpenPageVariant, mdiArrowUpBold, mdiCheckboxMultipleOutline, mdiCheckboxMultipleMarked, mdiCheckboxMultipleBlankOutline, mdiGroup, mdiDownload } from '@mdi/js'
import { Pages } from '@/mixins/pages'

const emitter = require('tiny-emitter/instance')

export default {
  name: 'base-table',
  props: {
    showAllItems: {
      type: Boolean,
      default: null
    },
    storeUrlParameters: {
      type: Boolean,
      default: true
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
    },
    selectionMode: {
      type: String,
      default: 'multi'
    }
  },
  data: function () {
    const id = 'table-' + uuidv4()

    return {
      operators,
      comparators,
      mdiArrowLeftBold,
      mdiDownload,
      mdiBookOpenPageVariant,
      mdiArrowUpBold,
      mdiCheckboxMultipleOutline,
      mdiCheckboxMultipleMarked,
      mdiCheckboxMultipleBlankOutline,
      mdiGroup,
      pagination: {
        currentPage: 1,
        totalCount: -1
      },
      filter: null,
      perPageValues: this.showAllItems ? [MAX_JAVA_INTEGER] : [10, 25, 50, 100],
      currentRequestData: null,
      isLoading: false,
      groupTypeSelect: null,
      newGroup: null,
      selectedItems: [],
      jumpToPageValue: 1,
      tableTourSteps: [],
      id: id
    }
  },
  watch: {
    'pagination.currentPage': function (newValue) {
      this.$refs.table.refresh()

      this.updateQuery(newValue)
    },
    'pagination.totalCount': function () {
      this.updateTableTour()
    },
    storeTablePerPage: function () {
      this.$nextTick(() => this.$refs.table.refresh())
    },
    selectedItems: function (newValue) {
      if (this.selectionMode !== 'multi' && newValue && newValue.length > 1) {
        this.$nextTick(() => {
          this.selectedItems = [newValue[newValue.length - 1]]
        })
      } else {
        this.$emit('selection-changed', newValue)
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeMarkedIds',
      'storeTablePerPage',
      'storeToken'
    ]),
    allSelected: function () {
      return this.selectedItems.length > 0 && this.selectedItems.length === this.pagination.totalCount
    },
    maxPage: function () {
      return Math.ceil(this.pagination.totalCount / this.storeTablePerPage)
    },
    hasSelectionColumn: function () {
      if (!this.columns) {
        return false
      } else {
        return this.columns.some(c => c.key === 'selected')
      }
    },
    reformattedColumns: function () {
      if (this.columns) {
        return this.columns.map(c => {
          const result = Object.assign({}, c)

          let clazz = result.class || ''
          if (this.options && this.options.tableName) {
            clazz = `${clazz} ${getTableColumnStyle(this.options.tableName, c.key)}`
          }

          if (result.isHidden) {
            clazz = 'd-none'
          }

          result.class = clazz

          return result
        })
      } else {
        return []
      }
    }
  },
  components: {
    MdiIcon,
    GroupEditAddModal,
    MarkedItems,
    TableFilter,
    Tour
  },
  methods: {
    updateRowVariant: function (item) {
      let variant = null

      if (this.options.rowVariant !== null && typeof this.options.rowVariant === 'function') {
        variant = this.options.rowVariant(item)
      }

      if (variant === null) {
        variant = this.getDefaultRowVariant(item)
      }

      item._rowVariant = variant
    },
    getDefaultRowVariant: function (item) {
      if (!item) {
        return null
      } else if (this.hasSelectionColumn && this.selectedItems && this.selectedItems.includes(item[this.options.idColumn])) {
        return 'primary'
      } else {
        return null
      }
    },
    updateQuery: async function (newValue) {
      if (this.storeUrlParameters) {
        const query = Object.assign({}, this.$route.query)
        query[`${this.options.tableName}-page`] = newValue

        await this.$router.replace({ query })
      }
    },
    updateSort: async function (ctx) {
      if (this.storeUrlParameters) {
        const query = Object.assign({}, this.$route.query)
        if (ctx.sortBy) {
          query[`${this.options.tableName}-sort`] = ctx.sortBy
        } else {
          delete query[`${this.options.tableName}-sort`]
        }

        if (ctx.sortDesc) {
          query[`${this.options.tableName}-sort-desc`] = ctx.sortDesc
        } else {
          delete query[`${this.options.tableName}-sort-desc`]
        }

        await this.$router.replace({ query })
      }
    },
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
        data: this.$refs.table.paginatedItems,
        count: this.pagination.totalCount
      })
    },
    refresh: function () {
      this.pagination.totalCount = -1
      this.selectedItems = []
      this.readUrlParams()
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
        return this.storeMarkedIds[this.itemType].indexOf(row[this.options.idColumn]) !== -1
      } else {
        return false
      }
    },
    markItem: function (id, event) {
      if (event) {
        this.$store.dispatch('addMarkedIds', { type: this.itemType, ids: [id] })
      } else {
        this.$store.dispatch('removeMarkedIds', { type: this.itemType, ids: [id] })
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
        emitter.emit('show-loading', true)
        this.getIds(this.currentRequestData, result => {
          if (mark) {
            this.$store.dispatch('addMarkedIds', { type: this.itemType, ids: result.data })
          } else {
            this.$store.dispatch('removeMarkedIds', { type: this.itemType, ids: result.data })
          }
          emitter.emit('show-loading', false)
        })
      }
    },
    onPerPageChanged: function (value) {
      this.$store.dispatch('setTablePerPage', value)
    },
    getDataLocal: function (ctx) {
      // Set the API pagination information fields
      const localCtx = JSON.parse(JSON.stringify(ctx))
      localCtx.page = this.pagination.currentPage
      localCtx.limit = this.storeTablePerPage
      localCtx.prevCount = this.pagination.totalCount
      localCtx.orderBy = localCtx.sortBy.length > 0 ? localCtx.sortBy : null
      localCtx.ascending = localCtx.sortBy.length > 0 ? (localCtx.sortDesc ? 0 : 1) : null
      localCtx.filter = this.filter

      // Delete fields that the bootstrap-vue table sets itself
      delete localCtx.sortBy
      delete localCtx.sortDesc
      delete localCtx.apiUrl
      delete localCtx.currentPage
      delete localCtx.perPage

      this.currentRequestData = localCtx

      this.isLoading = true
      return new Promise((resolve) => {
        this.getData(localCtx).then(result => {
          let localResult = null
          if (result && result.data && result.data.data) {
            this.pagination.totalCount = result.data.count
            localResult = result.data.data

            localResult.forEach(r => this.updateRowVariant(r))
          } else {
            this.pagination.totalCount = 0
          }
          // Notify that the data has changed
          this.$emit('data-changed', this.currentRequestData, {
            data: localResult,
            count: this.pagination.totalCount
          })
          this.isLoading = false
          resolve(localResult)
        })
      })
    },
    createGroup: function () {
      this.newGroup = {
        groupId: null,
        groupName: null,
        groupDescription: null,
        userId: this.storeToken.id
      }
      apiGetGroupTypes(result => {
        this.groupTypeSelect = result.data.map(g => {
          return {
            value: g.id,
            text: groupTypes[g.targetTable].text()
          }
        })
        const groupTypeLocal = Object.keys(groupTypes).filter(i => groupTypes[i].itemType === this.itemType)[0]
        const groupType = result.data.filter(g => g.targetTable === groupTypeLocal)[0]
        this.newGroup.groupTypeId = groupType.id
        this.newGroup.groupType = groupType.targetTable

        this.$nextTick(() => this.$refs.groupAddModal.show())
      })
    },
    putGroup: function () {
      // The new group to create
      const group = {
        name: this.newGroup.groupName,
        description: this.newGroup.groupDescription,
        grouptypeId: this.newGroup.groupTypeId,
        visibility: true,
        createdBy: this.newGroup.userId
      }

      emitter.emit('show-loading', true)
      apiPutGroup(group, result => {
        const data = {
          ids: this.storeMarkedIds[this.itemType],
          addition: true
        }
        const groupId = result
        const groupTypeLocal = Object.keys(groupTypes).filter(i => groupTypes[i].itemType === this.itemType)[0]
        const type = groupTypes[groupTypeLocal].apiName
        // Now add the group members
        apiPatchGroupMembers(groupId, type, data, result => {
          this.$root.$bvToast.toast(this.$t('toastGroupCreateWithMembers', { count: result }), {
            title: this.$t('genericSuccess'),
            variant: 'success',
            autoHideDelay: 5000,
            appendToast: true
          })

          emitter.emit('show-loading', false)
          this.$router.push({ name: Pages.groupDetails, params: { groupId: groupId } })
        })
      })
    },
    onFilterChanged: function (filter) {
      this.filter = filter.filter
      this.pagination.totalCount = -1

      // Trigger an update on the table
      if (filter.triggerUpdate) {
        this.$refs.table.refresh()
      }

      this.$emit('filter-changed', filter)
    },
    onDownloadTableClicked: function () {
      if (this.downloadTable !== null) {
        // Warn user that it's a lot of data and it'll take a while
        if (this.pagination.totalCount > 100000) {
          this.$bvModal.msgBoxConfirm(this.$t('modalTextWarningLargeAmountOfData', { size: this.pagination.totalCount.toLocaleString() }), {
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
        emitter.emit('show-loading', true)
        // Get all ids in the current table
        this.getIds(this.currentRequestData, result => {
          this.selectedItems = result.data
          emitter.emit('show-loading', false)
          this.$refs.table.refresh()
        })
      } else {
        this.selectedItems = []
        this.$refs.table.refresh()
      }
    },
    requestDownload: function () {
      emitter.emit('show-loading', true)
      // Download the current table data
      this.downloadTable(this.currentRequestData, result => {
        downloadBlob({
          blob: result,
          filename: `${this.options.tableName}-table-${getDateTimeString()}`,
          extension: 'zip'
        })
        emitter.emit('show-loading', false)
      })
    },
    updateTableTour: function () {
      const tableTourSteps = [
        {
          title: () => this.$t('popoverTableTourColumnSelectorTitle'),
          text: () => this.$t('popoverTableTourColumnSelectorText'),
          target: () => `#${this.id} #column-selector`,
          position: 'top'
        }, {
          title: () => this.$t('popoverTableTourTableFilteringTitle'),
          text: () => this.$t('popoverTableTourTableFilteringText'),
          target: () => `#${this.id} #filter-toggle`,
          position: 'top'
        }, {
          title: () => this.$t('popoverTableTourResultSizeTitle'),
          text: () => this.$t('popoverTableTourResultSizeText'),
          target: () => `#${this.id} #table-row-count`,
          position: 'top'
        }, {
          title: () => this.$t('popoverTableTourPageSizeTitle'),
          text: () => this.$t('popoverTableTourPageSizeText'),
          target: () => `#${this.id} #table-page-size-dropdown`,
          position: 'top'
        }
      ]

      if (this.itemType !== null) {
        tableTourSteps.push({
          title: () => this.$t('popoverTableTourMarkedItemsTitle'),
          text: () => this.$t('popoverTableTourMarkedItemsText'),
          target: () => `#${this.id} #marked-items-count`,
          position: 'top'
        })
        tableTourSteps.push({
          title: () => this.$t('popoverTableTourMarkedItemsClearTitle'),
          text: () => this.$t('popoverTableTourMarkedItemsClearText'),
          target: () => `#${this.id} #marked-items-clear`,
          position: 'top'
        })
      }

      if (this.downloadTable !== null) {
        tableTourSteps.push({
          title: () => this.$t('popoverTableTourDownloadTitle'),
          text: () => this.$t('popoverTableTourDownloadText'),
          target: () => `#${this.id} #table-download`,
          position: 'bottom'
        })
      }

      if (this.pagination.totalCount > this.storeTablePerPage) {
        tableTourSteps.push({
          title: () => this.$t('popoverTableTourPaginationTitle'),
          text: () => this.$t('popoverTableTourPaginationText'),
          target: () => `#${this.id} #table-pagination`,
          position: 'bottom'
        })

        tableTourSteps.push({
          title: () => this.$t('popoverTableTourPaginationJumpToPageTitle'),
          text: () => this.$t('popoverTableTourPaginationJumpToPageText'),
          target: () => `#${this.id} #table-jump-to-page`,
          position: 'bottom'
        })
      }

      this.tableTourSteps = tableTourSteps
    },
    readUrlParams: function () {
      // Check the URL query parameters and adjust the pagination and sorting
      if (this.$route.query) {
        if (this.$route.query[`${this.options.tableName}-page`]) {
          this.pagination.currentPage = +this.$route.query[`${this.options.tableName}-page`]
        }
        if (this.$route.query[`${this.options.tableName}-sort`]) {
          this.options.orderBy = this.$route.query[`${this.options.tableName}-sort`]
        }
        if (this.$route.query[`${this.options.tableName}-sort-desc`]) {
          this.options.orderByDesc = (this.$route.query[`${this.options.tableName}-sort-desc`] === 'true')
        }
      }
    }
  },
  mounted: function () {
    this.updateTableTour()

    this.readUrlParams()
  }
}
</script>

<style>
.base-table table th[aria-sort="none"] {
  padding-right: 0.75em !important;
  background-image: none !important;
}
.base-table table thead tr {
  background-color: #2f353a;
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
  margin-top: -1px;
}
/* .base-table table.b-table[aria-busy='true'] {
  opacity: 1;
} */
.base-table .table-bottom-left .btn-group:first-child .btn {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top: 0;
}
</style>
