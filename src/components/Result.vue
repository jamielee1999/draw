<template>
  <el-dialog
    :visible="visible"
    @close="$emit('update:visible', false)"
    width="600px"
    class="lottery-result"
    :append-to-body="true"
    :show-close="false"
  >
    <div class="dialog-title" slot="title">
      <div>
        <span :style="{ fontSize: '18px' }">
          抽獎結果
        </span>
        <span :style="{ fontSize: '14px', color: '#999', marginLeft: '10px' }">
          (點擊號碼可以刪除)
        </span>
      </div>
      <div>
        <el-button
          type="primary"
          class="blue-background-button"
          :disabled="!result || Object.keys(result).length === 0"
          @click="exportResultsData"
          >匯出</el-button
        >
      </div>
    </div>
    <el-divider></el-divider>
    <span v-if="notYetDraw" class="no-result-data-text">尚未抽獎</span>
    <div
      v-for="(item, index) in resultList"
      :key="index"
      class="listrow"
      @click="
        event => {
          deleteRes(event, item);
        }
      "
    >
      <span class="name">
        {{ item.name }}
      </span>
      <div class="value">
        <div
          class="card"
          v-for="(data, j) in item.value"
          :key="j"
          :data-res="data"
        >
          {{ `${data} ${mapList(data)}` }}
        </div>
        <el-divider></el-divider>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { conversionCategoryName, getDomData } from '@/helper/index';
import { useExcelJS } from '@/utils/ExportExcel';
export default {
  name: 'Lottery-Result',
  props: {
    visible: Boolean
  },
  data() {
    const { exportXlsx } = useExcelJS('得獎名單');
    return {
      exportXlsx
    };
  },
  computed: {
    result: {
      get() {
        return this.$store.state.result;
      },
      set(val) {
        this.$store.commit('setResult', val);
      }
    },
    lottery() {
      return this.$store.state.newLottery;
    },
    personsList() {
      return this.$store.state.list;
    },
    resultList() {
      const list = [];
      for (const key in this.result) {
        if (this.result.hasOwnProperty(key)) {
          const element = this.result[key];
          let name = conversionCategoryName(key);
          list.push({
            label: key,
            name,
            value: element
          });
        }
      }
      return list;
    },
    notYetDraw() {
      return this.resultList.length === 0;
    }
  },
  methods: {
    mapList(id) {
      const filterData = this.$store.state.list.filter(
        data => data.key === id
      )[0];
      return filterData ? filterData.name : id;
    },
    deleteRes(event, row) {
      const Index = getDomData(event.target, 'res');
      if (!Index) {
        return;
      }
      this.$confirm('此操作將移除該中獎人員，確認刪除？', '警告', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (Index) {
            // 移除中獎人員.
            this.result[row.label] = this.result[row.label].filter(
              item => item !== Number(Index)
            );
            // 移除後若該獎項已無任何中獎人員，則將屬性移除，避免結果還顯示該獎項.
            if (this.result[row.label].length === 0) {
              delete this.result[row.label];
            }
            // 同步將 localStorage 資訊更新.
            this.$store.commit('setResult', this.result);
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
    },
    exportResultsData() {
      const resultsData = Object.keys(this.result).map(key => {
        const winningPartner = this.result[key].map(
          id =>
            `${id} ${this.personsList.find(data => data.key === id).name} ${
              this.personsList.find(data => data.key === id).nameCH
            }`
        );
        return {
          name: this.lottery.find(data => data.key === key).name,
          winning_partner: winningPartner
        };
      });
      this.exportXlsx(resultsData, `${new Date().getFullYear()} 得獎名單`);
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog-title {
  display: flex;
  justify-content: space-between;
  div {
    margin: auto 0;
  }
}
.blue-background-button {
  background: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 2px;
  box-sizing: border-box;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.043);
}
.no-result-data-text {
  display: flex;
  justify-content: center;
  height: inherit;
  align-items: center;
}

.lottery-result {
  ::v-deep.el-dialog {
    height: 500px;
    margin: 0 auto;
  }
  ::v-deep .el-dialog__body {
    overflow: auto;
    height: 410px; // dialog height - dialog header height - padding top & bottom (20px)
    padding-bottom: 0px !important;
    padding-top: 0px !important;
    margin: 10px 0px;
  }
  .el-divider--horizontal {
    margin: 5px 0px;
  }
  .listrow {
    display: flex;
    align-items: center;
    line-height: 30px;
    .name {
      width: 80px;
      font-weight: bold;
    }
    .value {
      flex: 1;
    }
    .card {
      display: inline-block;
      padding: 0 5px;
      line-height: 30px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      border-radius: 4px;
      border: 1px solid #ccc;
      background-color: #f2f2f2;
      margin: 4.5px 5px;
      position: relative;
      cursor: pointer;
      &:hover {
        &::before {
          content: '删除';
          width: 100%;
          height: 100%;
          background-color: #ccc;
          position: absolute;
          left: 0;
          top: 0;
          color: red;
        }
      }
    }
  }
}
</style>
