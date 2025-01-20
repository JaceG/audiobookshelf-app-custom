<template>
  <bookshelf-lazy-bookshelf :isPlaylist="true" page="books" />
</template>

<script>
export default {
  async asyncData({ store, params, query }) {
    // Set filter by
    if (query.filter) {
      await store.dispatch('user/updateUserSettings', { mobileFilterBy: query.filter })
    }
  }
}
</script>
