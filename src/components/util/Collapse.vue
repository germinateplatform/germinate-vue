<template>
  <b-card no-body>
    <!-- Header click toggles the collapse -->
    <b-card-header header-tag="header" class="p-2 collapse-header" role="tab" @click="toggle">
      <div class="d-flex flex-row align-items-center">
        <!-- Icon and name to the left -->
        <MdiIcon :path="mdiChevronRight" />&nbsp;
        <strong class="d-flex flex-row align-items-center"><MdiIcon :path="icon" className="text-primary mr-1" v-if="icon"/> {{ title }}</strong>
        <!-- Count and progress to the right -->
        <span class="ml-auto d-flex flex-row align-items-center">
          <b-badge :variant="count > 0 ? 'primary' : null" v-if="!loading && count !== undefined">{{ count }}</b-badge>
          <b-progress :value="100" height="20px" class="collapse-loading" variant="primary" striped animated v-if="loading" />
        </span>
      </div>
    </b-card-header>
    <b-collapse :id="id" :visible="contentVisible" :accordion="`accordion-${id}`" role="tabpanel" @shown="$emit('shown')">
      <!-- This is where the content goes, it can trigger the 'update' event to let this component know something happened -->
      <template v-if="noBody">
        <slot name="content" v-bind:update="update"/>
      </template>
      <b-card-body v-else>
        <slot name="content" v-bind:update="update"/>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script>
import { uuidv4 } from '@/mixins/util'

import MdiIcon from '@/components/icons/MdiIcon'

import { mdiChevronRight } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: null
    },
    visible: {
      type: Boolean,
      default: false
    },
    noBody: {
      type: Boolean,
      default: false
    },
    showLoading: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      mdiChevronRight,
      id: 'accordion-' + uuidv4(),
      count: null,
      loading: true,
      contentVisible: false
    }
  },
  methods: {
    toggle: function () {
      this.contentVisible = !this.contentVisible
      this.$emit('toggle', this.contentVisible)
    },
    close: function () {
      this.contentVisible = false
    },
    setLoading: function (loading) {
      this.loading = loading
    },
    update: function (request, data) {
      if (data && data.isInitialLoad !== true) {
        this.count = data.count
        this.loading = false
      } else {
        this.count = null
        this.loading = true
      }
    }
  },
  mounted: function () {
    this.contentVisible = this.visible

    if (!this.showLoading) {
      this.loading = false
    }
  }
}
</script>

<style>
.collapse-loading {
  width: 100px;
}
.collapse-header:hover {
  cursor: pointer;
}
.collapse-expand-status::before {
  transition: 0.1s ease-in-out;
}
</style>
