<template>
  <div class="w-full bg-primary/50 rounded-lg">
    <div class="w-full h-14 flex items-center px-3">
      <p class="pr-2">{{ $strings.HeaderPlaylistItems }}</p>

      <div class="w-6 h-6 md:w-7 md:h-7 bg-fg bg-opacity-10 rounded-full flex items-center justify-center">
        <span class="text-xs md:text-sm font-mono leading-none">{{ items.length }}</span>
      </div>

      <div class="flex-grow" />
      <p v-if="totalDuration" class="text-sm text-fg">{{ totalDurationPretty }}</p>
    </div>
    <template v-for="item in items">
      <tables-playlist-item-table-row :key="item.id" :item="item" :playlist-id="playlistId" @showMore="showMore" :isPlayable="isPlayable" />
    </template>
  </div>
</template>

<script>
export default {
  props: {
    playlistId: String,
    items: {
      type: Array,
      default: () => []
    },
    isPlayable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    totalDuration() {
      var _total = 0
      this.items.forEach((item) => {
        if (item.episode) _total += item.episode.duration
        else _total += item.libraryItem.media.duration
      })
      return _total
    },
    totalDurationPretty() {
      return this.$elapsedPrettyExtended(this.totalDuration)
    }
  },
  methods: {
    showMore(playlistItem) {
      this.$emit('showMore', playlistItem)
    }
  },
  mounted() {}
}
</script>
