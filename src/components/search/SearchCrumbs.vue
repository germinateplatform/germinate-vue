<template>
  <!-- Breadcrumb of a search (filter icon, then the scope, the field and the values). On one line; when it doesn't fit,
       a chevron at the end shows all of it (on several lines) or folds it again. -->
  <nav :class="['search-crumbs', { expanded: expanded, overflowing: overflowing }]" aria-label="Search filters">
    <div class="search-crumbs-line" ref="line">
      <MdiIcon :path="icons.filter" :size="16" />
      <template v-for="(crumb, index) in crumbs">
        <MdiIcon :path="icons.separator" :size="16" class="search-crumbs-separator" :key="'crumb-separator-' + index" />
        <span class="search-crumbs-item" :key="'crumb-' + index">{{ crumb }}</span>
      </template>
    </div>
    <button type="button" class="search-crumbs-toggle" v-if="overflowing || expanded" :aria-expanded="expanded ? 'true' : 'false'"
            :title="expanded ? 'Show less' : 'Show all the filters'" :aria-label="expanded ? 'Show less' : 'Show all the filters'" @click="expanded = !expanded">
      <MdiIcon :path="expanded ? icons.collapse : icons.expand" :size="20" />
    </button>
  </nav>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import { mdiFilter, mdiChevronRight, mdiChevronDown, mdiChevronUp } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  props: {
    crumbs: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    return {
      expanded: false,
      // Folded, the line is cut (wider than the space)
      overflowing: false,
      icons: {
        filter: mdiFilter,
        separator: mdiChevronRight,
        expand: mdiChevronDown,
        collapse: mdiChevronUp
      }
    }
  },
  watch: {
    crumbs: function () {
      this.expanded = false
      this.$nextTick(() => this.measure())
    },
    expanded: function () {
      this.$nextTick(() => this.measure())
    }
  },
  methods: {
    // Only measured folded (expanded, everything shows anyway)
    measure: function () {
      const line = this.$refs.line
      if (line && !this.expanded) {
        this.overflowing = line.scrollWidth > line.clientWidth + 1
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => this.measure())
    // The space changes with the window (and when the tab is shown)
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.measure())
      this.resizeObserver.observe(this.$el)
    }
  },
  beforeDestroy: function () {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  }
}
</script>

<style scoped>
.search-crumbs {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 1.25rem 0 1rem;
  font-size: 0.95rem;
  color: var(--cp-text, inherit);
}
/* Folded: one line, cut at the end */
.search-crumbs-line {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.search-crumbs.overflowing:not(.expanded) .search-crumbs-line {
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 2.5rem), transparent);
  mask-image: linear-gradient(to right, #000 calc(100% - 2.5rem), transparent);
}
/* Expanded: all of it, on several lines */
.search-crumbs.expanded .search-crumbs-line {
  flex-wrap: wrap;
  white-space: normal;
}
.search-crumbs-item {
  flex-shrink: 0;
}
.search-crumbs.expanded .search-crumbs-item {
  flex-shrink: 1;
  overflow-wrap: anywhere;
}
.search-crumbs-separator {
  flex-shrink: 0;
  color: var(--cp-muted, #6b6f6c);
}
.search-crumbs-toggle {
  display: inline-flex;
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--cp-muted, #6b6f6c);
  cursor: pointer;
}
.search-crumbs-toggle:hover {
  color: var(--cp-text, #1f2120);
}
</style>
