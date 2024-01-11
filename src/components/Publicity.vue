<template>
  <div class="c-Publicity">
    <el-carousel
      height="50px"
      :autoplay="true"
      indicator-position="none"
      arrow="never"
      :interval="3000"
    >
      <el-carousel-item v-for="item in message" :key="item.key">
        <div class="item" :class="{ actiname: item.key === 0 }">
          <span v-if="item.title" class="title text-main-300">
            {{ item.title }}</span
          >
          <span v-if="item.value" class="value">
            {{ mapList(item.value) }}
          </span>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script>
import { conversionCategoryName } from '@/helper/index';

export default {
  name: 'Publicity',
  methods: {
    mapList(id) {
      const filterData = this.$store.state.list.filter(
        data => data.key === Number(id)
      )[0];
      return filterData ? filterData.name : id;
    }
  },
  computed: {
    list() {
      return this.$store.state.list;
    },
    config() {
      return this.$store.state.config;
    },
    result() {
      return this.$store.state.result;
    },
    message() {
      const { result, config } = this;
      const fields = Object.keys(config);

      let message = [{ key: 0, title: config.name }];
      fields.forEach((item, index) => {
        let label = conversionCategoryName(item);
        if (result[item] && config.prizes[item] > 0) {
          const listOfWinners = result[item].map(id => this.mapList(id));
          message.push({
            key: index + 1,
            title: `${label}：`,
            value: `${
              listOfWinners.length > 0 ? listOfWinners.join('、') : '暫未抽取'
            }`
          });
        }
      });

      return message;
    }
  }
};
</script>
<style lang="scss" scoped>
.c-Publicity {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  .el-carousel {
    width: 80vw;
    margin: 0 auto;
  }
  /* TODO: change color here */
  .item {
    text-align: center;
    font-weight: 700;
    font-size: 16px;
    .value {
      margin-left: 10px;
    }
    &.actiname {
      .title {
        font-size: 20px;
      }
    }
  }
}
</style>
