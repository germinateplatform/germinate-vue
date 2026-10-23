<template>
  <div>
    <!-- The common filters show the filters the table currently uses -->
    <GermplasmTableFilter :activeFilters="activeFilters" @filtering-changed="onFilteringChanged" @filtering-removed="onFilteringRemoved" ref="germplasmTableFilter" class="my-3" />
    <RecentItems itemType="germinatebase" />
    <!-- Table showing all germplasm -->
    <!-- Filters set by the common filters may have their own text above the table (e.g. 'Conservation' equals 'In-situ') -->
    <GermplasmTable :filterOn="filterOn" :getData="getData" :getIds="getIds" :downloadTable="downloadFunction" :filterLabel="getFilterLabel" :tableActions="userIsDataCurator ? tableActions : null" conservationColumn @filter-changed="resetFilter" ref="germplasmTable" />

    <!-- Add Germplasm: the passport page from its tabs, empty (data curators) -->
    <b-modal v-if="userIsDataCurator" ref="addGermplasmModal" title="Add Germplasm" header-class="custom-page" title-class="add-germplasm-title" size="xl" dialog-class="add-germplasm-modal" scrollable @hide="onAddGermplasmHide" @hidden="addingGermplasm = false">
      <PassportView v-if="addingGermplasm" :isNew="true" :isPopup="true" ref="addGermplasmPassport" @save-state="addGermplasmSave = $event" @germplasm-created="onGermplasmCreated" />
      <!-- In the style of the passport page (custom-page): at the far left whether to open the new germplasm, at the right
           Save Germplasm (like "Save changes" of the passport: checks the mandatory fields and creates the germplasm), then Close -->
      <template #modal-footer>
        <div class="custom-page add-germplasm-footer">
          <b-form-checkbox v-model="goToDetailsAfterSaving" switch :disabled="addGermplasmSave.saving" class="add-germplasm-go">Go to details after saving</b-form-checkbox>
          <div class="add-germplasm-actions">
            <button type="button" class="add-germplasm-button add-germplasm-save" :disabled="addGermplasmSave.saving" @click="$refs.addGermplasmPassport && $refs.addGermplasmPassport.saveNewGermplasm()">
              <MdiIcon :path="addGermplasmSave.saving ? icons.reload : icons.save" :size="16" :className="addGermplasmSave.saving ? 'add-germplasm-spin' : ''" />
              {{ addGermplasmSave.saving ? (addGermplasmSave.phase === 'validating' ? 'Validating ...' : 'Saving ...') : 'Save Germplasm' }}
            </button>
            <button type="button" class="add-germplasm-button" :disabled="addGermplasmSave.saving" @click="$refs.addGermplasmModal.hide()">
              <MdiIcon :path="icons.close" :size="16" /> {{ $t('buttonClose') }}
            </button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'
import GermplasmTableFilter from '@/components/tables/GermplasmTableFilter'
import RecentItems from '@/components/util/RecentItems'
import MdiIcon from '@/components/icons/MdiIcon'

import { apiPostGermplasmTable, apiPostGermplasmTableIds } from '@/mixins/api/germplasm.js'
import { apiPostTableExport } from '@/mixins/api/misc.js'
import { translateConservationRequest } from '@/mixins/conservation'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR } from '@/mixins/api/auth'
import { mapGetters } from 'vuex'
import { mdiPlusBox, mdiContentSave, mdiReload, mdiClose } from '@mdi/js'
import { Pages } from '@/mixins/pages'

export default {
  components: {
    // Loaded when the modal is opened (the passport page is large)
    PassportView: () => import(/* webpackChunkName: "passport" */ '@/views/data/germplasm/PassportView.vue'),
    GermplasmTable,
    GermplasmTableFilter,
    MdiIcon,
    RecentItems
  },
  props: {
    download: {
      type: Function
    }
  },
  data: function () {
    return {
      filterOn: [],
      // Filters the table currently uses ({ column, comparator, values }), however they were set
      activeFilters: [],
      // The Add Germplasm modal is open (its content is only built then)
      addingGermplasm: false,
      // Closing was confirmed: the next hide goes through
      closingAddGermplasm: false,
      // Save of the new germplasm: { saving, phase ('validating', 'updating') }
      addGermplasmSave: { saving: false, phase: null },
      // After saving: open the passport page of the new germplasm (off: the modal only closes)
      goToDetailsAfterSaving: false,
      icons: {
        save: mdiContentSave,
        reload: mdiReload,
        close: mdiClose
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    userIsDataCurator: function () {
      return !!this.storeToken && userIsAtLeast(this.storeToken.userType, USER_TYPE_DATA_CURATOR)
    },
    // [+] next to the download button of the table
    tableActions: function () {
      return [{
        id: 'add-germplasm',
        text: 'Add Germplasm',
        variant: null,
        disabled: () => false,
        path: mdiPlusBox,
        callback: () => this.openAddGermplasm()
      }]
    },
    downloadFunction: function () {
      return this.download || this.downloadTable
    }
  },
  methods: {
    // Close (button, x, Esc, backdrop) with something filled in: asks first
    onAddGermplasmHide: function (event) {
      // Not while the germplasm is being saved
      if (this.addGermplasmSave.saving) {
        event.preventDefault()
        return
      }
      const passport = this.$refs.addGermplasmPassport
      if (this.closingAddGermplasm || !passport || !passport.hasNewGermplasmData) {
        this.closingAddGermplasm = false
        return
      }
      event.preventDefault()
      passport.confirmLeave('Do you really want to discard them and close?').then(discard => {
        if (discard) {
          this.closingAddGermplasm = true
          this.$refs.addGermplasmModal.hide()
        }
      })
    },
    // Created: the modal closes (nothing left to discard) and the table shows it
    onGermplasmCreated: function (germplasm) {
      this.closingAddGermplasm = true
      this.$refs.addGermplasmModal.hide()
      if (this.goToDetailsAfterSaving && germplasm) {
        this.$router.push({ name: Pages.passport, params: { germplasmId: germplasm.germplasmId } })
      } else {
        this.$refs.germplasmTable.refresh()
      }
    },
    openAddGermplasm: function () {
      this.addingGermplasm = true
      this.addGermplasmSave = { saving: false, phase: null }
      this.$nextTick(() => this.$refs.addGermplasmModal.show())
    },
    resetFilter: function (update) {
      this.activeFilters = update.filter || []
      if (update.filter.length === 0) {
        this.filterOn = []
      }
    },
    onFilteringChanged: function (filters) {
      let copy = this.filterOn.concat().filter(f => !filters.some(ff => ff.column.name === f.column.name))
      copy = copy.concat(filters)
      this.filterOn = copy
      this.$refs.germplasmTable.refresh()
    },
    getFilterLabel: function (filter) {
      const commonFilters = this.$refs.germplasmTableFilter
      return commonFilters ? commonFilters.getFilterLabel(filter) : null
    },
    // Common filters were emptied: the table is no longer filtered by those columns (one or a list)
    onFilteringRemoved: function (columns) {
      const removed = [].concat(columns)
      this.filterOn = this.filterOn.filter(f => !removed.includes(f.column && typeof f.column === 'object' ? f.column.name : f.column))
      // After the table filter has taken the change over
      this.$nextTick(() => this.$refs.germplasmTable.refresh())
    },
    // The conservation filter (kept short in the table and the URL) becomes germplasm ids for the server, see conservation.js
    downloadTable: function (data, callback) {
      return translateConservationRequest(data).then(request => apiPostTableExport({ filter: request.filter }, 'germplasm', callback))
    },
    getData: function (data, callback) {
      return translateConservationRequest(data).then(request => apiPostGermplasmTable(request, callback))
    },
    getIds: function (data, callback) {
      return translateConservationRequest(data).then(request => apiPostGermplasmTableIds(request, callback))
    },
    onDownloadTableClicked: function () {
      this.$refs.germplasmTable.onDownloadTableClicked()
    }
  }
}
</script>

<!-- Colour tokens and font of the custom pages, used by the footer of the Add Germplasm modal -->
<style src="@/assets/custom-page.css"></style>
<style>
/* Add Germplasm: wider than the passport preview, within the window */
.add-germplasm-modal {
  max-width: min(1600px, 98vw);
}
/* Title in the font of the custom pages (the header has the custom-page class) */
.add-germplasm-title {
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--cp-text);
}
/* Footer: the switch at the far left, the buttons at the right */
.add-germplasm-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  margin: 0;
}
.add-germplasm-go {
  font-size: 0.85rem;
  color: var(--cp-text-subtle);
}
.add-germplasm-actions {
  display: flex;
  gap: 0.5rem;
}
/* Rounded buttons of the passport page (pp-small-button) */
.add-germplasm-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--cp-border);
  border-radius: 8px;
  background: var(--cp-surface);
  color: var(--cp-text);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.add-germplasm-button:hover:not(:disabled) {
  background: var(--cp-surface-hover);
  border-color: var(--cp-green);
}
/* Save Germplasm: same colours as "Save changes" of the passport */
.add-germplasm-button.add-germplasm-save {
  border-color: var(--cp-green);
  background: var(--cp-green-soft);
  color: var(--cp-green);
}
.add-germplasm-button.add-germplasm-save:hover:not(:disabled) {
  background: var(--cp-green);
  color: var(--cp-on-button);
}
.add-germplasm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.add-germplasm-spin {
  animation: add-germplasm-spin 1s linear infinite;
}
@keyframes add-germplasm-spin {
  to {
    transform: rotate(360deg);
  }
}
/* Little space between the content and the sides of the modal */
.add-germplasm-modal .modal-body {
  padding: 0.75rem 1.25rem;
}
</style>
