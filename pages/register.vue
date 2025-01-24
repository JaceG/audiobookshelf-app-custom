<template>
  <div class="w-full h-full">
    <div class="relative flex items-center justify-center min-h-screen sm:pt-0">
      <nuxt-link to="/connect" class="absolute top-2 left-2 z-20">
        <span class="material-icons text-4xl">arrow_back</span>
      </nuxt-link>
      <div class="absolute top-0 left-0 w-full p-6 flex items-center flex-col justify-center z-0 short:hidden">
        <img src="/Logo.png" class="h-20 w-20 mb-2" />
        <h1 class="text-2xl">audiobookshelf</h1>
      </div>
      <p class="hidden absolute short:block top-1.5 left-12 p-2 text-xl">audiobookshelf</p>
      <div class="w-full max-w-md mx-auto px-2 sm:px-4 lg:px-8 z-10">
        <div v-show="!loggedIn" class="mt-8 bg-primary overflow-hidden shadow rounded-lg px-4 py-6 w-full">
          <!-- list of server connection configs -->
          <div class="w-full">
            <template>
              <div class="flex items-center">
                <p class="text-fg-muted">Register</p>
                <div class="flex-grow" />
              </div>
              <div class="w-full h-px bg-fg/10 my-2" />
              <form class="pt-3" @submit.prevent="register">
                <ui-text-input @input="validateEmail" v-model="email" type="text" :placeholder="$strings.LabelEmail" class="w-full mb-2 text-lg" />
                <p class="text-error my-2">{{ validationErrors.email }}</p>
                <ui-text-input @input="validateUsername" v-model="username" :placeholder="$strings.LabelUsername" class="w-full mb-2 text-lg" />
                <p class="text-error my-2">{{ validationErrors.username }}</p>
                <ui-text-input @input="validatePassword" v-model="password" type="password" :placeholder="$strings.LabelPassword" class="w-full mb-2 text-lg" />
                <p class="text-error my-2">{{ validationErrors.password }}</p>
                <ui-text-input @input="validateFriend" v-model="friend" :placeholder="$strings.LabelFriend" class="w-full mb-2 text-lg" />
                <p class="text-error my-2">{{ validationErrors.friend }}</p>
                <div class="pt-2">
                  <div class="flex justify-between w-100 items-center">
                    <div>
                      <p>Already have account?</p>
                      <nuxt-link to="/connect" class="underline"> Login </nuxt-link>
                    </div>
                    <ui-btn type="submit" class="mt-1 h-10">Register</ui-btn>
                  </div>
                </div>
              </form>
            </template>
          </div>

          <!-- auth error message -->
          <div v-show="error" class="w-full rounded-lg bg-red-600 bg-opacity-10 border border-error border-opacity-50 py-3 px-2 flex items-center mt-4">
            <span class="material-icons mr-2 text-error" style="font-size: 1.1rem">warning</span>
            <p class="text-error">{{ error }}</p>
          </div>
        </div>

        <!-- <div :class="processing ? 'opacity-100' : 'opacity-0 pointer-events-none'" class="fixed w-full h-full top-0 left-0 bg-black/75 flex items-center justify-center z-30 transition-opacity duration-500">
      <div>
        <div class="absolute top-0 left-0 w-full p-6 flex items-center flex-col justify-center z-0 short:hidden">
          <img src="/Logo.png" class="h-20 w-20 mb-2" />
        </div>
        <svg class="animate-spin w-16 h-16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
      </div>
    </div>

    <p v-if="!serverConnectionConfigs.length" class="mt-2 text-center text-error" v-html="$strings.MessageAudiobookshelfServerRequired" />

    <modals-custom-headers-modal v-model="showAddCustomHeaders" :custom-headers.sync="serverConfig.customHeaders" /> -->
      </div>
    </div>
  </div>
</template>

<script>
import { CapacitorHttp } from '@capacitor/core'
export default {
  data() {
    return {
      email: null,
      username: null,
      password: null,
      friend: null,
      validationErrors: {}
    }
  },
  methods: {
    register() {
      this.validateInputs()
      if (!Object.keys(this.validationErrors).length) {
        this.registerUser()
      } else {
        this.$toast.error(`Please fix the errors.`)
      }
    },

    setValidationError(key, message) {
      this.validationErrors[key] = message
    },

    isValidationError(key) {
      return Boolean(this.validationErrors[key])
    },

    clearValidations(key = 'all') {
      if (key == 'all') {
        this.validationErrors = {}
      }
      if (this.validationErrors[key]) {
        delete this.validationErrors[key]
      }
    },

    validateEmail() {
      this.clearValidations('email')
      this.validateInputs
      if (!this.email) {
        this.setValidationError('email', 'Email is required.')
      }

      if (!this.isValidationError('email') && !/^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(this.email)) {
        this.setValidationError('email', 'Email is not valid.')
      }
    },
    validateUsername() {
      this.clearValidations('username')
      if (!this.username) {
        this.setValidationError('username', 'Username is required.')
      }
    },
    validateFriend() {
      this.clearValidations('friend')
      if (!this.friend) {
        this.setValidationError('friend', 'Refferal is required.')
      }
    },

    validatePassword() {
      this.clearValidations('password')
      if (!this.password) {
        this.setValidationError('password', 'Password is required.')
      }
    },

    validateInputs() {
      this.clearValidations()
      this.validateEmail()
      this.validateFriend()
      this.validateUsername()
      this.validatePassword()
    },

    registerUser() {
      return this.postRequest(
        `http://localhost:3333/public/custom/register`,
        {
          username: this.username,
          friend: this.friend,
          email: this.email,
          password: this.password,
          type: 'user',
          isActive: true,
          permissions: { download: true, update: false, delete: false, upload: false, accessAllLibraries: true, accessAllTags: true, accessExplicitContent: false, selectedTagsNotAccessible: false, createEreader: true },
          librariesAccessible: [],
          itemTagsSelected: []
        },
        null,
        20000
      )
        .then((data) => {
          if (!data.user) {
            console.error(data.error)
            this.error = data.error || 'Unknown Error'
            return false
          }
          this.$toast.success(`Registered successfully.`)
          this.$router.push('/connect')
        })
        .catch((error) => {
          console.error('Server auth failed', error)
          const errorMsg = error.message || error || error.data || 'Something went wrong'
          this.$toast.error(errorMsg)
          return false
        })
    },

    async postRequest(url, data, headers, connectTimeout = 6000) {
      if (!headers) headers = {}
      if (!headers['Content-Type'] && data) {
        headers['Content-Type'] = 'application/json'
      }
      const options = {
        url,
        headers,
        data,
        connectTimeout
      }
      const response = await CapacitorHttp.post(options)
      console.log('[ServerConnectForm] POST request response', response)
      if (response.status >= 400) {
        throw new Error(response.data)
      } else {
        return response.data
      }
    }
  }
}
</script>
