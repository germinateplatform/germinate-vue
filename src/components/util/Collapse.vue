<template>
  <b-card no-body>
    <b-card-header header-tag="header" class="p-2 collapse-header" role="tab" @click="toggle">
      <div class="d-flex flex-row">
        <i :class="`collapse-expand-status mdi mdi-18px mdi-chevron-right ${getStyle()}`" />&nbsp;
        <strong><i :class="`mdi mdi-18px ${icon} text-primary`" v-if="icon"/> {{ title }}</strong>
        <span class="ml-auto">
          <b-badge :variant="count > 0 ? 'primary' : null" v-if="!loading && count !== undefined">{{ count }}</b-badge>
          <b-progress :value="100" height="20px" class="collapse-loading" variant="primary" striped animated v-if="loading" />
        </span>
      </div>
    </b-card-header>
    <b-collapse :id="id" :visible="contentVisible" :accordion="`accordion-${id}`" role="tabpanel">
      <template v-if="noBody">
        <slot v-bind:update="update"/>
      </template>
      <b-card-body v-else>
        <slot v-bind:update="update"/>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script>
export default {
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
    }
  },
  data: function () {
    return {
      id: 'accordion-' + this.uuidv4(),
      count: null,
      loading: true,
      contentVisible: false
    }
  },
  methods: {
    getStyle: function () {
      return this.contentVisible ? 'mdi-rotate-90' : ''
    },
    toggle: function () {
      this.contentVisible = !this.contentVisible
      this.check()
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
    },
    check: function () {
      this.$nextTick(() => {
        console.log(this.$slots.content)
      })
    }
  },
  mounted: function () {
    this.contentVisible = this.visible
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
