<template>
  <div>
    <h1>{{ $t('pageGroupsTitle') }}</h1>
    <hr />
    <GroupsTable ref="groupsTable"
                 v-on:group-selected="onGroupSelected"
                 v-on:on-group-edit-clicked="onGroupEditClicked"
                 v-on:on-group-delete-clicked="onGroupDeleteClicked"/>

    <div v-if="group">
      <h2>{{ group.groupname }} <small>{{ groupType[group.grouptype].text() }}</small></h2>
      <template v-if="group.groupdescription">
        <h3>Group description</h3>
        <p>{{ group.groupdescription }}</p>
      </template>

      <h3>Group visibility</h3>
      <b-form-checkbox switch
                       size="sm"
                       v-model="group.groupvisibility"
                       value="1"
                       :disabled="group.userid !== token.id"
                       unchecked-value="0"
                       @change="onUpdateGroupVisibility">
        Should this group be visible to all Germinate users?
      </b-form-checkbox>
    </div>

    <b-modal
      ref="groupDetailsModal"
      title="Add/edit group"
      ok-title="Update"
      @ok="onEditGroup"
      v-if="groupToEdit">
      <b-form @submit.stop.prevent>
        <b-form-group
          label="Group type"
          label-for="groupType"
          :description="groupToEdit.id === null ? 'Select the type of this group.' : 'The group type cannot be changed.'">
          <b-form-select id="groupType" :options="groupTypeSelect" v-model="groupToEdit.grouptypeid" :disabled="groupToEdit.id !== null" required/>
        </b-form-group>
        <b-form-group
          label="Group name"
          label-for="groupName"
          description="The name of the group.">
          <b-form-input id="groupName" v-model="groupToEdit.groupname" required/>
        </b-form-group>
        <b-form-group
          label="Group description"
          label-for="groupDescription"
          description="The description of the group.">
          <b-form-input id="groupDescription" v-model="groupToEdit.groupdescription" required/>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import GroupsTable from '@/components/tables/GroupsTable'

export default {
  data: function () {
    return {
      group: null,
      groupToEdit: null,
      groupId: null,
      groupTypes: [],
      groupTypeSelect: [],
      groupType: {
        germinatebase: {
          icon: 'mdi-sprout',
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          icon: 'mdi-dna',
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          icon: 'mdi-map-marker',
          text: () => this.$t('groupTypeLocation')
        }
      }
    }
  },
  computed: {
    ...mapState([
      'token'
    ])
  },
  components: {
    GroupsTable
  },
  methods: {
    onEditGroup: function () {
      var group = {
        id: this.groupToEdit.groupid,
        name: this.groupToEdit.groupname,
        description: this.groupToEdit.groupdescription
      }
      // Remove empty descriptions
      if (!group.description) {
        delete group.description
      }
      this.apiPatchGroup(group, result => {
        this.$refs.groupsTable.refresh()
      })
    },
    onGroupEditClicked: function (groupToEdit) {
      this.groupToEdit = groupToEdit

      this.$nextTick(() => this.$refs.groupDetailsModal.show())
    },
    onUpdateGroupVisibility: function () {
      this.$nextTick(() => {
        const group = {
          id: this.group.groupid,
          visibility: this.group.groupvisibility
        }
        this.apiPatchGroup(group, result => {
          this.$refs.groupsTable.refresh()
        })
      })
    },
    onGroupDeleteClicked: function (groupToDelete) {
      this.apiDeleteGroup(groupToDelete.groupid, result => {
        // If the current group was deleted, unset selection
        if (this.group && groupToDelete.groupid === this.group.groupid) {
          this.group = null
          this.groupId = null
        }
        // Refresh the table
        this.$refs.groupsTable.refresh()
      })
    },
    onGroupSelected: function (groupId) {
      this.groupId = groupId

      if (this.groupId) {
        var queryParams = {
          page: 1,
          limit: 1,
          prevCount: -1,
          filter: [{
            column: 'groupid',
            comparator: 'equals',
            operator: 'and',
            values: [this.groupId]
          }]
        }
        this.apiPostGroupTable(queryParams, result => {
          if (result && result.data && result.data.length > 0) {
            window.history.replaceState({}, null, `#/groups/${this.groupId}`)
            this.group = result.data[0]
          }
        })
      }
    }
  },
  mounted: function () {
    this.apiGetGroupTypes(result => {
      this.groupTypes = result.data

      console.log(result)
      this.groupTypeSelect = result.data.map(g => {
        return {
          value: g.id,
          text: this.groupType[g.targetTable].text()
        }
      })
    })

    this.onGroupSelected(this.$route.params.groupId)
  }
}
</script>

<style>

</style>
