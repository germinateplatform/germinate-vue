<template>
  <b-modal
    ref="groupAddEditModal"
    :title="$t('modalTitleEditGroup')"
    :ok-title="$t('buttonSubmit')"
    :cancel-title="$t('buttonCancel')"
    @ok="$emit('ok')"
    v-if="groupToEdit">
    <b-form @submit.stop.prevent>
      <b-form-group
        :label="$t('formLabelGroupType')"
        label-for="groupType"
        :description="groupToEdit.id === null ? $t('formDescriptionGroupType') : $t('formDescriptionGroupTypeDisabled')">
        <b-form-select id="groupType" :options="groupTypeSelect" v-model="groupToEdit.groupTypeId" :disabled="groupToEdit.id !== null" required/>
      </b-form-group>
      <b-form-group
        :label="$t('formLabelGroupName')"
        label-for="groupName"
        :description="$t('formDescriptionGroupName')">
        <b-form-input id="groupName" v-model="groupToEdit.groupName" required/>
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
