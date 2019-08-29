<template>
  <div>
    <h1>{{ $t('pageGroupsTitle') }}</h1>
    <GroupsTable />
  </div>
</template>

<script>
import GroupsTable from '@/components/tables/GroupsTable'

export default {
  components: {
    GroupsTable
  }
}
</script>

<style>

</style>
