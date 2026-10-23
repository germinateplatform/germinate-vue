<template>
  <!-- Recently viewed germplasm, the same list as "Recently viewed items" on the germplasm page. Hidden when empty. -->
  <section class="rvp" v-if="items.length > 0">
    <div class="rvp-header" @click="open = !open">
      <h2 class="rvp-title">{{ $t('widgetRecentItemsTitle') }}</h2>
      <!-- Clear sits left of the collapse chevron -->
      <div class="rvp-tools">
        <button type="button" class="rvp-clear" @click.stop="clear">
          <MdiIcon :path="icons.delete" :size="15" /> {{ $t('genericClear') }}
        </button>
        <button type="button" class="rvp-toggle" :aria-expanded="open" @click.stop="open = !open" aria-label="Show or hide recently viewed items">
          <span :class="['rvp-chevron', { closed: !open }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
        </button>
      </div>
    </div>

    <div v-show="open">
      <!-- Accession numbers side by side, wrapping onto new lines, most recent first -->
      <div class="rvp-items">
        <template v-for="item in itemsOnPage">
          <span v-if="item.germplasmId === currentId" :key="'rvp-' + item.germplasmId" class="rvp-item current" :title="item.germplasmName">{{ item.germplasmName }}</span>
          <router-link v-else :key="'rvp-' + item.germplasmId" :to="{ name: Pages.passport, params: { germplasmId: item.germplasmId } }" class="rvp-item" :title="item.germplasmName">{{ item.germplasmName }}</router-link>
        </template>
      </div>

      <!-- More than 30 items -->
      <div class="rvp-pager" v-if="pageCount > 1">
        <button type="button" class="rvp-pager-button" :disabled="page <= 1" @click="page--" aria-label="Previous recently viewed items">
          <MdiIcon :path="icons.chevronLeft" :size="20" />
        </button>
        <span class="rvp-pager-text">{{ page }} / {{ pageCount }}</span>
        <button type="button" class="rvp-pager-button" :disabled="page >= pageCount" @click="page++" aria-label="Next recently viewed items">
          <MdiIcon :path="icons.chevronRight" :size="20" />
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'

import { apiPostGermplasmTable } from '@/mixins/api/germplasm'
import { Pages } from '@/mixins/pages'

import { mdiDelete, mdiChevronUp, mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const ITEMS_PER_PAGE = 30

// Uses the colour tokens of src/assets/custom-page.css, so it has to sit inside an element with the "custom-page" class
export default {
  components: {
    MdiIcon
  },
  props: {
    // Germplasm open on the page, highlighted and not linked
    currentId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      Pages,
      // Recently viewed germplasm rows, most recent first
      items: [],
      page: 1,
      open: true,
      icons: {
        delete: mdiDelete,
        chevronUp: mdiChevronUp,
        chevronLeft: mdiChevronLeft,
        chevronRight: mdiChevronRight
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeRecentIds'
    ]),
    ids: function () {
      return (this.storeRecentIds && this.storeRecentIds.germplasm) ? this.storeRecentIds.germplasm : []
    },
    pageCount: function () {
      return Math.ceil(this.items.length / ITEMS_PER_PAGE)
    },
    itemsOnPage: function () {
      const start = (this.page - 1) * ITEMS_PER_PAGE
      return this.items.slice(start, start + ITEMS_PER_PAGE)
    }
  },
  watch: {
    // Viewing or clearing items anywhere updates the list
    ids: function () {
      this.load()
    }
  },
  methods: {
    // Same as RecentItems on the germplasm page: the names of the recently viewed ids
    load: function () {
      const ids = [...this.ids]

      if (ids.length === 0) {
        this.items = []
        return
      }

      const query = {
        page: 1,
        limit: ids.length,
        filter: [{
          column: 'germplasmId',
          comparator: 'inSet',
          operator: 'and',
          values: ids
        }]
      }

      apiPostGermplasmTable(query, result => {
        const rows = (result && result.data) ? result.data : []
        this.items = ids.reverse()
          .map(id => rows.find(r => r.germplasmId === id))
          .filter(r => r)
        this.page = Math.min(this.page, Math.max(1, this.pageCount))
      })
    },
    clear: function () {
      this.$store.dispatch('clearRecentIds', 'germplasm')
    }
  },
  mounted: function () {
    this.load()
  }
}
</script>

<style scoped>
.rvp {
  background: var(--cp-surface);
  border: 1px solid var(--cp-border);
  border-radius: 12px;
  overflow: hidden;
}
.rvp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--cp-border);
  cursor: pointer;
}
.rvp-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--cp-text);
}
.rvp-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.rvp-clear {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--cp-border);
  border-radius: 6px;
  background: transparent;
  color: var(--cp-muted);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}
.rvp-clear:hover {
  border-color: #dc3545;
  color: #dc3545;
}
.rvp-toggle {
  display: inline-flex;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.rvp-chevron {
  display: inline-flex;
  color: var(--cp-muted);
  transition: transform 0.2s;
}
.rvp-chevron.closed {
  transform: rotate(180deg);
}
.rvp-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 1rem 1.5rem 1.2rem;
}
.rvp-item {
  max-width: 100%;
  padding: 0.2rem 0.7rem;
  border: 1px solid var(--cp-border);
  border-radius: 999px;
  background: var(--cp-surface);
  color: var(--cp-text-subtle);
  font-size: 0.85rem;
  text-decoration: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
a.rvp-item:hover {
  border-color: var(--cp-green);
  color: var(--cp-green);
  text-decoration: none;
}
.rvp-item.current {
  background: var(--cp-green-soft);
  border-color: var(--cp-green);
  color: var(--cp-green);
}
.rvp-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--cp-border);
}
.rvp-pager-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--cp-text);
  cursor: pointer;
}
.rvp-pager-button:hover:not(:disabled) {
  background: var(--cp-surface-hover);
}
.rvp-pager-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.rvp-pager-text {
  min-width: 3.5rem;
  font-size: 0.85rem;
  color: var(--cp-muted);
  text-align: center;
}
</style>
