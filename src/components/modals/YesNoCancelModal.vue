<template>
  <b-modal :title="title" ref="yesNoCancelDialog" @ok="$emit('yes')" @cancel="$emit('no')">
    <p>{{ message }}</p>
    <template #modal-footer="{ ok, cancel, hide }">
      <b-button :variant="yesVariant" @click="ok()">
        {{ yesTitle }}
      </b-button>
      <b-button :variant="noVariant" @click="cancel()">
        {{ noTitle }}
      </b-button>
      <b-button :variant="cancelVariant" @click="hide('forget')">
        {{ cancelTitle }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null
    },
    message: {
      type: String,
      default: null
    },
    yesTitle: {
      type: String,
      default: null
    },
    yesVariant: {
      type: String,
      default: 'primary'
    },
    noTitle: {
      type: String,
      default: null
    },
    noVariant: {
      type: String,
      default: null
    },
    cancelTitle: {
      type: String,
      default: null
    },
    cancelVariant: {
      type: String,
      default: null
    }
  },
  methods: {
    show: function () {
      this.$nextTick(() => this.$refs.yesNoCancelDialog.show())
    },
    hide: function () {
      this.$nextTick(() => this.$refs.yesNoCancelDialog.hide())
    }
  }
}
</script>

<style>
</style>
