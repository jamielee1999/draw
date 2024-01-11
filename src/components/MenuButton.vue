<template>
  <div>
    <button type="button" class="btn" @click="$emit('toggle')">
      <div class="hamburger" :class="{ 'is-active': isOpen }">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </div>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle']
};
</script>

<style lang="scss" scoped>
.hamburger {
  cursor: pointer;
  .line {
    width: 40px;
    height: 3px;
    background-color: #ecf0f1;
    display: block;
    margin: 10px auto;
    -webkit-transition: all 0.3s ease-in-out;
    -o-transition: all 0.3s ease-in-out;
    transition: all 0.3s ease-in-out;
  }

  &.is-active .line:nth-child(2) {
    opacity: 0;
  }

  &.is-active .line:nth-child(1) {
    -webkit-transform: translateY(13px) rotate(45deg);
    -ms-transform: translateY(13px) rotate(45deg);
    -o-transform: translateY(13px) rotate(45deg);
    transform: translateY(13px) rotate(45deg);
  }

  &.is-active .line:nth-child(3) {
    -webkit-transform: translateY(-13px) rotate(-45deg);
    -ms-transform: translateY(-13px) rotate(-45deg);
    -o-transform: translateY(-13px) rotate(-45deg);
    transform: translateY(-13px) rotate(-45deg);
  }
}
</style>
