<template>
  <div class="w-full h-full">
    <div class="w-full h-full overflow-y-auto py-6 md:p-8">
      <div class="w-full flex justify-center">
        <covers-playlist-cover :items="playlistItems" :width="180" :height="180" />
      </div>
      <div class="flex-grow px-1 py-6">
        <div class="flex items-center px-3">
          <h1 class="text-xl font-sans">
            {{ playlistName }}
          </h1>
          <div class="flex-grow" />
          <ui-btn v-if="isPlayable && showPlayButton" :disabled="streaming" color="success" :padding-x="4" :loading="playerIsStartingForThisMedia" small class="flex items-center justify-center text-center h-9 mr-2 w-24" @click="clickPlay">
            <span v-show="!streaming" class="material-icons -ml-2 pr-1 text-white">play_arrow</span>
            {{ streaming ? $strings.ButtonPlaying : $strings.ButtonPlay }}
          </ui-btn>
          <ui-btn v-if="!isPlayable" color="success" :padding-x="4" small class="flex items-center justify-center h-9 mr-2 w-50" @click="addToMyPlaylist">
            <span class="material-icons">playlist_add_check</span>
            <span class="px-1 text-sm">{{ $strings.ButtonAddToMyLibrary }}</span>
          </ui-btn>
        </div>

        <div class="my-8 max-w-2xl px-3">
          <p class="text-base text-fg">{{ description }}</p>
        </div>

        <tables-playlist-items-table :items="playlistItems" :playlist-id="playlist.id" @showMore="showMore" :isPlayable="isPlayable" />
      </div>
    </div>

    <modals-item-more-menu-modal v-model="showMoreMenu" :library-item="selectedLibraryItem" :episode="selectedEpisode" :playlist="playlist" hide-rss-feed-option :processing.sync="processing" />
    <div v-show="processing" class="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-50">
      <ui-loading-indicator />
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ store, params, app, redirect, route }) {
    if (!store.state.user.user) {
      return redirect(`/connect?redirect=${route.path}`)
    }

    const playlist = await app.$nativeHttp.get(`/api/playlists/${params.id}`).catch((error) => {
      console.error('Failed', error)
      return false
    })

    if (!playlist) {
      return redirect('/bookshelf/playlists')
    }

    // Lookup matching local items & episodes and attach to playlist items
    if (playlist.items.length) {
      const localLibraryItems = (await app.$db.getLocalLibraryItems(playlist.items[0].libraryItem.mediaType)) || []
      if (localLibraryItems.length) {
        playlist.items.forEach((playlistItem) => {
          const matchingLocalLibraryItem = localLibraryItems.find((lli) => lli.libraryItemId === playlistItem.libraryItemId)
          if (!matchingLocalLibraryItem) return
          if (playlistItem.episode) {
            const matchingLocalEpisode = matchingLocalLibraryItem.media.episodes?.find((lep) => lep.serverEpisodeId === playlistItem.episodeId)
            if (matchingLocalEpisode) {
              playlistItem.localLibraryItem = matchingLocalLibraryItem
              playlistItem.localEpisode = matchingLocalEpisode
            }
          } else {
            playlistItem.localLibraryItem = matchingLocalLibraryItem
          }
        })
      }
    }

    const selectedPlaylist = store.getters['user/selectedPlaylist']
    const playlistId = params.id
    const isPlayable = Boolean(selectedPlaylist.includes(params.id))

    return {
      playlist,
      playlistId,
      isPlayable
    }
  },
  data() {
    return {
      showMoreMenu: false,
      processing: false,
      selectedLibraryItem: null,
      selectedEpisode: null,
      mediaIdStartingPlayback: null,
      isPlayable: true,
      playlistId: null
    }
  },
  computed: {
    bookCoverAspectRatio() {
      return this.$store.getters['libraries/getBookCoverAspectRatio']
    },
    playlistItems() {
      return this.playlist.items || []
    },
    playlistName() {
      return this.playlist.name || ''
    },
    description() {
      return this.playlist.description || ''
    },
    playableItems() {
      return this.playlistItems.filter((item) => {
        const libraryItem = item.libraryItem
        if (libraryItem.isMissing || libraryItem.isInvalid) return false
        if (item.episode) return item.episode.audioFile
        return libraryItem.media.tracks.length
      })
    },
    streaming() {
      return !!this.playableItems.find((i) => {
        if (i.localLibraryItem && this.$store.getters['getIsMediaStreaming'](i.localLibraryItem.id, i.localEpisode?.id)) return true
        return this.$store.getters['getIsMediaStreaming'](i.libraryItemId, i.episodeId)
      })
    },
    showPlayButton() {
      return this.playableItems.length
    },
    playerIsStartingPlayback() {
      // Play has been pressed and waiting for native play response
      return this.$store.state.playerIsStartingPlayback
    },
    playerIsStartingForThisMedia() {
      if (!this.mediaIdStartingPlayback) return false
      const mediaId = this.$store.state.playerStartingPlaybackMediaId
      return mediaId === this.mediaIdStartingPlayback
    }
  },
  methods: {
    showMore(playlistItem) {
      this.selectedLibraryItem = playlistItem.libraryItem
      this.selectedEpisode = playlistItem.episode
      this.showMoreMenu = true
    },
    addToMyPlaylist() {
      const playlistId = this.playlistId
      this.$nativeHttp
        .post(`/api/custom/assign-playlist`, { playlistId }, { connectTimeout: 5000 })
        .then((data) => {
          this.$toast.success(data?.message || `Playlist added to playlist`)
          let selectedPlaylists = this.$store.getters['user/selectedPlaylist']
          selectedPlaylists = [...selectedPlaylists, playlistId]
          console.log({ selectedPlaylists })
          this.$store.commit('user/selectedPlaylist', selectedPlaylists)
          this.$router.push('/bookshelf')
        })
        .catch((error) => {
          console.error('Failed', error)
          this.$toast.error(error?.message || `Something went wrong`)
          return null
        })
    },
    clickPlay() {
      const nextItem = this.playableItems.find((i) => {
        const prog = this.$store.getters['user/getUserMediaProgress'](i.libraryItemId, i.episodeId)
        return !prog?.isFinished
      })
      if (nextItem) {
        this.mediaIdStartingPlayback = nextItem.episodeId || nextItem.libraryItemId
        this.$store.commit('setPlayerIsStartingPlayback', this.mediaIdStartingPlayback)
        if (nextItem.localLibraryItem) {
          this.$eventBus.$emit('play-item', { libraryItemId: nextItem.localLibraryItem.id, episodeId: nextItem.localEpisode?.id, serverLibraryItemId: nextItem.libraryItemId, serverEpisodeId: nextItem.episodeId })
        } else {
          this.$eventBus.$emit('play-item', { libraryItemId: nextItem.libraryItemId, episodeId: nextItem.episodeId })
        }
      }
    },
    playlistUpdated(playlist) {
      if (this.playlist.id !== playlist.id) return
      this.playlist = playlist
    },
    playlistRemoved(playlist) {
      if (this.playlist.id === playlist.id) {
        this.$router.replace('/bookshelf/playlists')
      }
    }
  },
  mounted() {
    this.$socket.$on('playlist_updated', this.playlistUpdated)
    this.$socket.$on('playlist_removed', this.playlistRemoved)
  },
  beforeDestroy() {
    this.$socket.$off('playlist_updated', this.playlistUpdated)
    this.$socket.$off('playlist_removed', this.playlistRemoved)
  }
}
</script>
