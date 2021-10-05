<template>
  <b-modal :ref="`traitEditModal-${id}`" :title="trait.traitName" :ok-title="$t('buttonUpdate')" @ok="updateTrait" header-class="trait-edit-modal-header">
    <b-form @submit.prevent="updateTrait">
      <b-form-group label-for="trait-name" :label="$t('tableColumnTraitName')">
        <b-form-input v-model="traitName" id="trait-name" />
      </b-form-group>
      <b-form-group label-for="trait-start-date" :label="$t('tableColumnTraitNameShort')">
        <b-form-input v-model="traitNameShort" id="trait-start-date" />
      </b-form-group>
      <b-form-group label-for="trait-description" :label="$t('tableColumnTraitDescription')">
        <b-form-textarea v-model="traitDescription" id="trait-description" />
      </b-form-group>
      <b-form-group label-for="trait-state" :label="$t('tableColumnTraitDataType')">
        <b-form-select :options="options" v-model="traitDataType" id="trait-state" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import traitApi from '@/mixins/api/trait.js'
import typesMixin from '@/mixins/types.js'

export default {
  props: {
    trait: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      id: this.uuidv4(),
      traitName: null,
      traitDescription: null,
      traitNameShort: null,
      traitDataType: null
    }
  },
  computed: {
    options: function () {
      return Object.keys(this.dataTypes).map(s => {
        return {
          value: s,
          text: this.dataTypes[s].text()
        }
      })
    }
  },
  mixins: [ traitApi, typesMixin ],
  methods: {
    show: function () {
      this.traitName = this.trait.traitName
      this.traitDescription = this.trait.traitDescription
      this.traitNameShort = this.trait.traitNameShort
      this.traitDataType = this.trait.dataType
      this.$refs['traitEditModal-' + this.id].show()
    },
    hide: function () {
      this.$refs['traitEditModal-' + this.id].hide()
    },
    updateTrait: function () {
      return this.apiPatchTrait(this.trait.traitId, {
        name: this.traitName,
        description: this.traitDescription,
        shortName: this.traitNameShort,
        datatype: this.traitDataType
      }, (result) => {
        if (result) {
          this.$emit('changed')
          this.hide()
        }
      })
    }
  }
}
</script>

<style>
.trait-edit-modal-header .modal-title {
  white-space: nowrap;
  max-width: 100%;
  overflow-x: clip;
  text-overflow: ellipsis;
}
</style>
