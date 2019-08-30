<template>
  <div>
    <h1>{{ $t('pageGroupsTitle') }}</h1>
    <hr />
    <GroupsTable v-on:group-selected="onGroupSelected"/>

    <div v-if="group">
      <h2>{{ group.groupname }} <small>{{ groupType[group.grouptype].text() }}</small></h2>
      <template v-if="group.groupdescription">
        <h3>Group description</h3>
        <p>{{ group.groupdescription }}</p>
      </template>

      <h3>Group visibility</h3>
      <b-form-checkbox switch size="sm" v-model="group.groupvisibility" value="1" unchecked-value="0">
        Should this group be visible to all Germinate users?
      </b-form-checkbox>
    </div>
  </div>
</template>

<script>
import GroupsTable from '@/components/tables/GroupsTable'

export default {
  data: function () {
    return {
      group: null,
      groupId: null,
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
  components: {
    GroupsTable
  },
  methods: {
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
    this.onGroupSelected(this.$route.params.groupId)
  }
}
</script>

<style>

</style>
