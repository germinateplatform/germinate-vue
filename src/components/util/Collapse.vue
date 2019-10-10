<template>
  <b-card no-body>
    <b-card-header header-tag="header" class="p-2 collapse-header" role="tab" @click="toggle">
      <div class="d-flex flex-row">
        <strong>{{ title }}</strong>
        <span class="ml-auto">
          <b-badge pill variant="info" v-if="!loading && count">{{ count }}</b-badge>
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
    toggle: function () {
      this.contentVisible = !this.contentVisible
      this.check()
    },
    update: function (request, data) {
      console.log(data)
      if (data) {
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
</style>
