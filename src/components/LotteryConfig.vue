<template>
  <div id="lottery_config">
    <el-dialog
      :visible="visible"
      :append-to-body="true"
      width="600px"
      @close="$emit('update:visible', false)"
      class="c-LotteryConfig"
      :show-close="false"
    >
      <div class="c-LotteryConfigtitle" slot="title">
        <span :style="{ fontSize: '16px', marginRight: '20px' }">
          抽獎配置
        </span>
        <div>
          <!-- <el-button size="mini" @click="addLottery">增加獎項</el-button> -->
          <el-button
            size="mini"
            type="primary"
            :disabled="memberList.length === 0"
            @click="toggleMemberList"
            >檢視人員名單</el-button
          >
          <!-- TODO: 獎項清單 -->
          <el-button
            size="mini"
            type="primary"
            :disabled="storeNewLottery.length === 0"
            @click="toggleLotteryList"
            >檢視獎項清單</el-button
          >
        </div>
      </div>
      <div class="container">
        <div class="flex justify-content-end ">
          <span class="me-2 warning-color">*</span>
          {{ `已配置獎品數量：${totalQueued}` }}
        </div>
        <el-form ref="form" :model="form" size="mini" label-position="top">
          <el-form-item label="抽獎標題" class="mb-5">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="抽獎總人數" class="mb-5">
            <el-input
              v-model="form.number"
              :min="1"
              :step="1"
              disabled
            ></el-input>
          </el-form-item>
          <!-- FIXME: 因 config / newLottery 資料未同步更新，暫時隱藏可修改獎項數量區塊 -->
          <el-form-item
            v-show="false"
            :label="lottery.name"
            v-for="lottery in form.prizes"
            :key="lottery.key"
          >
            <el-input
              v-model="lottery.number"
              @input="UpdateNumberOfAwards($event, lottery)"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="flex justify-content-end">
        <el-button size="mini" type="primary" @click="onSubmit" plain
          >儲存設定</el-button
        >
        <el-button size="mini" @click="$emit('update:visible', false)"
          >取消</el-button
        >
      </div>
    </el-dialog>
    <el-dialog
      width="600px"
      custom-class="config-list-dialog"
      :visible.sync="showMemberList"
      class="default-dialog-config removeoptions"
    >
      <el-button @click="clearFilter">reset all filters</el-button>
      <el-table
        :data="memberStatusList"
        :append-to-body="false"
        :row-class-name="tableRowClassName"
        ref="filterTable"
      >
        <el-table-column
          property="key"
          label="編號"
          width="80"
          :sortable="true"
          :sort-orders="['ascending']"
        ></el-table-column>
        <el-table-column property="name" label="英文名稱"></el-table-column>
        <el-table-column property="nameCH" label="中文名稱"></el-table-column>
        <el-table-column
          property="lotteryStatus"
          label="抽獎狀態"
          :formatter="getLotteryStatusName"
          :filters="LOTTERY_STATUS_CONFIG"
          :filter-method="filterHandler"
        >
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="toggleMemberList">關閉</el-button>
      </span>
    </el-dialog>
    <el-dialog
      width="600px"
      custom-class="config-list-dialog"
      :visible.sync="showLotteryList"
      class="default-dialog-config removeoptions"
    >
      <el-table :data="storeNewLottery" :append-to-body="false" show-summary>
        <el-table-column type="index" label="編號"></el-table-column>
        <el-table-column
          property="name"
          label="獎項名稱"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column
          property="number"
          label="數量"
          width="50"
        ></el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="toggleLotteryList">關閉</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { setData, configField } from '@/helper/index';
import { randomNum } from '@/helper/algorithm';

const LOTTERY_STATUS_CONFIG = [
  { text: '已中獎', value: true },
  { text: '未中獎', value: false }
];

export default {
  name: 'LotteryConfig',
  props: {
    visible: Boolean
  },
  computed: {
    form: {
      get() {
        return this.$store.state.config;
      },
      set(val) {
        this.$store.commit('setConfig', val);
      }
    },
    memberList() {
      return this.$store.state.list;
    },
    memberStatusList() {
      const memberList = [...this.$store.state.list];
      const results = { ...this.$store.state.result };
      const resultList = Object.values(results) || [];
      memberList.forEach(member => {
        member.lotteryStatus = resultList.some(item =>
          item.includes(member.key)
        );
      });
      return memberList;
    },
    storeNewLottery() {
      return this.$store.state.newLottery;
    },
    quantityVerification() {
      return this.form.number >= this.totalQueued;
    },
    totalQueued() {
      const { prizes } = this.form;
      return Object.keys(prizes).reduce((acc, cur) => {
        return (acc += Number(prizes[cur].number));
      }, 0);
    }
  },
  data() {
    return {
      showAddLottery: false,
      showMemberList: false,
      showLotteryList: false,
      newLottery: { name: '' },
      LOTTERY_STATUS_CONFIG,
      lotteryParts: [
        {
          title: 'Part1: 1-5獎',
          value: 1
        },
        {
          title: 'Part2: 6-15獎',
          value: 2
        }
      ]
    };
  },
  methods: {
    onSubmit() {
      if (this.quantityVerification) {
        setData(configField, this.form); // 字串 config
        this.$store.commit('setConfig', this.form);
        this.$emit('update:visible', false);

        this.$message({
          message: '儲存成功',
          type: 'success'
        });

        this.$nextTick(() => {
          this.$emit('resetconfig');
        });
      } else {
        this.$message({
          message: '獎項頒發數量數超出抽獎人數，請重新確認！',
          type: 'warning'
        });
      }
    },

    addLottery() {
      this.showAddLottery = true;
    },
    randomField() {
      const str = 'abcdefghijklmnopqrstuvwxyz';
      let fieldStr = '';
      for (let index = 0; index < 10; index++) {
        fieldStr += str.split('')[randomNum(1, 27) - 1];
      }
      return `${fieldStr}${Date.now()}`;
    },

    UpdateNumberOfAwards(value, item) {
      const result = Number(value) ? Number(value) : 0;
      this.form[item.key] = result;
    },
    toggleMemberList() {
      this.showMemberList = !this.showMemberList;
    },
    toggleLotteryList() {
      this.showLotteryList = !this.showLotteryList;
    },
    getLotteryStatusName(status) {
      return status.lotteryStatus ? '已中獎' : '未中獎';
    },
    tableRowClassName({ row }) {
      if (row.lotteryStatus) {
        return 'success-row';
      }
    },
    clearFilter() {
      this.$refs.filterTable.clearFilter();
    },
    filterHandler(value, row) {
      return row.lotteryStatus === value;
    }
  }
};
</script>
<style lang="scss">
.c-LotteryConfig {
  .el-dialog__body {
    .container {
      overflow-y: auto;
      padding: 0 10px 40px;
    }
  }
}
.dialog-showAddLottery {
  .el-dialog {
    height: 186px;
  }
}
.c-LotteryConfigtitle {
  display: flex;
  justify-content: space-between;
}
.config-list-dialog {
  top: 0 !important;
  transform: initial !important;
}
.warning-color {
  color: red;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>
