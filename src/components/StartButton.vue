<template>
  <div>
    <el-button @click="startHandler" class="btn btn-start border-0">{{
      running ? '點擊開獎' : '開始抽獎'
    }}</el-button>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  props: {
    running: Boolean
  },
  emits: ['toggle'],
  computed: {
    ...mapState({ list: 'list', lottery: 'newLottery' })
  },
  data() {
    return {
      showSetwat: false
    };
  },
  methods: {
    ...mapMutations(['setLotteryModalShow']),
    startHandler() {
      if (this.list.length === 0 || this.lottery.length === 0) {
        const messageText =
          this.list.length === 0 ? '請先匯入名單!' : '請先匯入獎項!';
        this.$message({
          message: messageText,
          type: 'warning'
        });
        return;
      }
      this.$emit('toggle');
      if (!this.running) {
        this.setLotteryModalShow(true);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/style/theme';
.btn-start {
  width: 150px;
  height: 150px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 50%;
  position: relative;
  -webkit-transition: all 0.3s;
  -moz-transition: all 0.3s;
  transition: all 0.3s;

  background: $main-color;
  color: white;
  box-shadow: inset 0 -3px 6px $main-color-dark, 0 4px $main-color-dark;
  &:hover {
    background-color: $main-color !important;
    color: white !important;
    box-shadow: inset 0 -3px 6px $main-color-dark, 0 0 8px $main-color-dark;
    top: -4px;
  }
  &:active,
  &:focus {
    color: white !important;
    background: darken($main-color, 5%) !important;
    box-shadow: inset 0 3px 15px 1px $main-color-dark, 0 0 5px $main-color-dark;
    top: -6px;
  }

  &::after {
    content: '';
    position: absolute;
    z-index: -1;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    transition: all 0.3s ease-in-out;
  }
}
</style>
