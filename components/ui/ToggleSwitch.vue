<template>
  <div>
    <div class="border rounded-full border-gray-400 flex items-center cursor-pointer w-10 justify-start" :class="className" @click.stop="clickToggle">
      <span class="rounded-full border w-5 h-5 border-gray-100 shadow transform transition-transform duration-100" :class="switchClassName"></span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Boolean,
    onColor: {
      type: String,
      default: 'success'
    },
    offColor: {
      type: String,
      default: 'primary'
    },
    disabled: Boolean
  },
  computed: {
    toggleValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    className() {
      if (this.disabled) return this.toggleValue ? `bg-${this.onColor} cursor-not-allowed` : `bg-${this.offColor} cursor-not-allowed`
      return this.toggleValue ? `bg-${this.onColor}` : `bg-${this.offColor}`
    },
    switchClassName() {
      var bgColor = this.disabled ? 'bg-gray-300' : 'bg-white'
      return this.toggleValue ? 'translate-x-5 ' + bgColor : bgColor
    }
  },
  methods: {
    clickToggle() {
      if (this.disabled) return
      this.toggleValue = !this.toggleValue
    }
  }
}
</script>