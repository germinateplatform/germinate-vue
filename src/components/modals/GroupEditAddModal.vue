<template>
  <b-modal
    ref="groupAddEditModal"
    :title="$t('modalTitleEditGroup')"
    :ok-title="$t('buttonSubmit')"
    :cancel-title="$t('buttonCancel')"
    :ok-disabled="!canContinue()"
    @ok="okPressed"
    v-if="groupToEdit">
    <!-- Modal showing group edit/add form -->
    <b-form @submit.stop.prevent>
      <b-form-group
        :label="$t('formLabelGroupType')"
        label-for="groupType"
        :description="canChangeType === true ? $t('formDescriptionGroupType') : $t('formDescriptionGroupTypeDisabled')">
        <b-form-select id="groupType" :options="groupTypeSelect" v-model="groupToEdit.groupTypeId" :disabled="canChangeType === false" required autofocus/>
      </b-form-group>
      <b-form-group
        :label="$t('formLabelGroupName')"
        label-for="groupName"
        :description="$t('formDescriptionGroupName')">
        <b-form-input id="groupName" v-model="groupToEdit.groupName" required autofocus/>
      </b-form-group>
      <b-form-group
        :label="$t('formLabelGroupDescription')"
        label-for="groupDescription"
        :description="$t('formDescriptionGroupDescription')">
        <b-form-input id="groupDescription" v-model="groupToEdit.groupDescription"/>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  props: {
    canChangeType: {
      type: Boolean,
      default: false
    },
    groupToEdit: {
      type: Object,
      default: null
    },
    groupTypeSelect: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    canContinue: function () {
      return this.groupToEdit.groupName && this.groupToEdit.groupTypeId
    },
    okPressed: function () {
      this.$emit('ok')
    },
    show: function () {
      this.$refs.groupAddEditModal.show()
    },
    hide: function () {
      this.$refs.groupAddEditModal.hide()
    }
  }
}
</script>

<style>

</style>
