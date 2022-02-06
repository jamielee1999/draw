<template>
  <div id="tool">
    <el-button
      @click="startHandler"
      type="primary"
      size="mini"
      style="background-color: #f699cd;border-color: #f699cd;"
      >{{ running ? '停止' : '開始' }}</el-button
    >
    <el-button size="mini" @click="showRemoveoptions = true">
      重置
    </el-button>
    <el-button size="mini" @click="showImport = true">
      匯入名單
    </el-button>
    <el-button size="mini" @click="showAddPrizes = true">
      匯入獎項
    </el-button>
    <!-- <el-button size="mini" @click="showImportphoto = true">
      導入照片
    </el-button> -->
    <el-dialog
      :append-to-body="true"
      :visible.sync="showSetwat"
      class="default-dialog-config setwat-dialog"
      width="400px"
      :show-close="false"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="80px"
        size="mini"
        class="option-config"
      >
        <el-form-item label="抽取獎項">
          <el-select
            v-model="form.category"
            placeholder="請選取本次抽取的獎項"
            no-data-text="尚未匯入獎項"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in categorys"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label=" " v-if="form.category">
          <span>
            共&nbsp;
            <span class="colorred">{{ config[form.category] }}</span>
            &nbsp;名
          </span>
          <span :style="{ marginLeft: '20px' }">
            剩餘&nbsp;
            <span class="colorred">{{ remain }}</span>
            &nbsp;名
          </span>
        </el-form-item>

        <el-form-item label="抽取方式">
          <el-select v-model="form.mode" placeholder="請選取本次抽取方式">
            <el-option label="抽 1 人" :value="1"></el-option>
            <el-option label="一次抽完" :value="0"></el-option>
            <el-option label="自訂人數" :value="99"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="抽取人數" v-if="form.mode === 99">
          <el-input
            v-model="form.qty"
            type="number"
            :clearable="true"
            :min="1"
            :max="remain ? remain : 100"
            :step="1"
          ></el-input>
        </el-form-item>

        <el-form-item label="全員參與">
          <el-switch v-model="form.allin"></el-switch>
          <!-- <span :style="{ fontSize: '12px' }">
            (開啟後將在全體成員[無論有無中獎]中抽獎)
          </span> -->
        </el-form-item>

        <div class="footer">
          <el-button size="mini" type="primary" @click="onSubmit"
            >立即抽獎</el-button
          >
          <el-button size="mini" @click="showSetwat = false">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- ====== 獎項 ====== -->
    <el-dialog
      :visible.sync="showAddPrizes"
      :append-to-body="true"
      width="400px"
      class="default-dialog-config"
      :show-close="false"
    >
      <div class="add-title" slot="title">增加獎項</div>
      <el-upload
        class="upload-csv"
        ref="refPrizesFile"
        action
        :limit="1"
        accept=".csv"
        :auto-upload="false"
        :on-change="onChangePrizes"
      >
        <el-button size="small" type="primary">點擊上傳</el-button>
      </el-upload>
      <div class="footer">
        <el-button size="mini" type="primary" @click="transformPrizesList"
          >確定</el-button
        >
        <el-button size="mini" @click="showAddPrizes = false">取消</el-button>
      </div>
    </el-dialog>
    <!-- ====== 名單 ====== -->
    <el-dialog
      :append-to-body="true"
      :visible.sync="showImport"
      class="default-dialog-config"
      width="400px"
      :show-close="false"
    >
      <div class="add-title" slot="title">匯入名單</div>
      <el-upload
        class="upload-csv"
        ref="refFile"
        action
        :limit="1"
        accept=".csv"
        :auto-upload="false"
        :on-change="onChange"
      >
        <el-button size="small" type="primary">點擊上傳</el-button>
      </el-upload>
      <div class="footer">
        <el-button size="mini" type="primary" @click="transformList"
          >確定</el-button
        >
        <el-button size="mini" @click="showImport = false">取消</el-button>
      </div>
    </el-dialog>
    <!-- ====== 照片 ====== -->
    <!-- <Importphoto
      :visible.sync="showImportphoto"
      @getPhoto="$emit('getPhoto')"
    ></Importphoto> -->
    <!-- ====== 設定 ====== -->
    <el-dialog
      :visible.sync="showRemoveoptions"
      width="400px"
      class="default-dialog-config removeoptions"
      :append-to-body="true"
      :show-close="false"
    >
      <div class="add-title" slot="title">重置選項</div>
      <el-form ref="form" :model="removeInfo" label-width="80px" size="mini">
        <el-form-item>
          <el-radio-group v-model="removeInfo.type">
            <el-radio border :label="0">重置全部</el-radio>
            <el-radio border :label="1">重置獎項</el-radio>
            <el-radio border :label="2">重置名單</el-radio>
            <!--
            <el-radio border :label="3">重置照片</el-radio>
            -->
            <el-radio border :label="4">重置結果</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="footer">
          <el-button size="mini" type="primary" @click="resetConfig"
            >確定</el-button
          >
          <el-button size="mini" @click="showRemoveoptions = false"
            >取消</el-button
          >
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  clearData,
  removeData,
  configField,
  listField,
  resultField,
  conversionCategoryName
} from '@/helper/index';
// import Importphoto from './Importphoto';
import { database, DB_STORE_NAME } from '@/helper/db';
import Papa from 'papaparse';
import { randomNum } from '@/helper/algorithm';
import _ from 'lodash';

export default {
  props: {
    running: Boolean,
    closeRes: Function
  },
  computed: {
    config: {
      get() {
        return this.$store.state.config;
      }
    },
    remain() {
      return this.config[this.form.category]
        ? this.config[this.form.category] -
            (this.result[this.form.category]
              ? this.result[this.form.category].length
              : 0)
        : '';
    },
    result() {
      return this.$store.state.result;
    },
    list() {
      return this.$store.state.list;
    },
    lottery() {
      return this.$store.state.newLottery;
    },
    categorys() {
      const options = [];
      for (const key in this.config) {
        if (this.config.hasOwnProperty(key)) {
          const item = this.config[key];
          if (item > 0) {
            let name = conversionCategoryName(key);
            name &&
              options.push({
                label: name,
                value: key
              });
          }
        }
      }
      return options;
    }
  },
  // components: { Importphoto },
  data() {
    return {
      showSetwat: false,
      showImport: false,
      // showImportphoto: false,
      showAddPrizes: false,
      showRemoveoptions: false,
      removeInfo: { type: 0 },
      form: {
        category: '',
        mode: 1,
        qty: 1,
        allin: false
      },
      listData: [],
      prizesData: []
    };
  },
  watch: {
    showRemoveoptions(v) {
      if (!v) {
        this.removeInfo.type = 0;
      }
    }
  },
  methods: {
    onChange(file) {
      this.listData.length = 0;
      const cavData = this.listData;
      Papa.parse(file.raw, {
        complete: function(res) {
          cavData.push(...res.data);
        }
      });
    },
    onChangePrizes(file) {
      this.prizesData.length = 0;
      const csvData = this.prizesData;
      Papa.parse(file.raw, {
        complete: function(res) {
          res.data.forEach(data => {
            csvData.push({
              key: data[0],
              name: data[1]
            });
          });
        }
      });
    },
    resetConfig() {
      const type = this.removeInfo.type;
      this.$confirm('此操作將重置所選數據，是否繼續？', '提示', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          switch (type) {
            case 0:
              clearData();
              this.$store.commit('setClearStore');
              database.clear(DB_STORE_NAME);
              break;
            case 1:
              this.form.category = '';
              removeData(configField);
              this.$store.commit('clearConfig');
              break;
            case 2:
              if (_.isEmpty(this.result)) {
                removeData(listField);
                this.$store.commit('clearList');
                break;
              } else {
                this.$message({
                  type: 'warning',
                  message: '已進行過抽獎，無法單獨重置名單!'
                });
                return;
              }
            case 3:
              database.clear(DB_STORE_NAME);
              this.$store.commit('clearPhotos');
              break;
            case 4:
              removeData(resultField);
              this.$store.commit('clearResult');
              break;
            default:
              break;
          }

          this.closeRes && this.closeRes();

          this.showRemoveoptions = false;
          this.$message({
            type: 'success',
            message: '重置成功!'
          });

          this.$nextTick(() => {
            this.$emit('resetConfig');
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
    },
    onSubmit() {
      if (!this.form.category) {
        return this.$message.error('請選擇本次抽取的獎項');
      }
      if (this.remain <= 0) {
        return this.$message.error('該獎項剩餘人數不足');
      }
      if (this.form.mode === 99) {
        if (this.form.qty <= 0) {
          return this.$message.error('必須輸入本次抽取人數');
        }
        if (this.form.qty > this.remain) {
          return this.$message.error('本次抽獎人數已超過本獎項的剩餘人數');
        }
      }
      if (this.form.mode === 1) {
        if (this.form.mode > this.remain) {
          return this.$message.error('本次收講人數已抽過本獎項的剩餘人數');
        }
      }
      this.showSetwat = false;
      this.$emit(
        'toggle',
        Object.assign({}, this.form, { remain: this.remain })
      );
    },
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
        this.showSetwat = true;
      }
    },
    transformList() {
      if (this.listData.length === 0) {
        this.$message.error('沒有數據');
      }
      const list = [];
      if (this.listData.length > 0) {
        this.listData.forEach(item => {
          const key = Number(item[0].trim());
          const name = item[1].trim();
          list.push({
            key,
            name
          });
        });
      }
      // TODO: setup list here
      this.$store.commit('setList', list);

      this.$message({
        message: '匯入名單成功',
        type: 'success'
      });
      this.showImport = false;
      this.$nextTick(() => {
        this.$refs.refFile.clearFiles();
        this.$emit('resetConfig');
      });
    },
    transformPrizesList() {
      const updatePrizesData = this.prizesData.map(data => {
        const field = this.randomField();
        return {
          key: field,
          name: data.name
        };
      });

      this.$store.commit('setNewLottery', updatePrizesData);
      this.$message({
        message: '匯入獎項成功',
        type: 'success'
      });
      this.showAddPrizes = false;
      this.$nextTick(() => {
        this.$refs.refPrizesFile.clearFiles();
        this.$emit('resetConfig');
      });
    },
    randomField() {
      const str = 'abcdefghijklmnopqrstuvwxyz';
      let fieldStr = '';
      for (let index = 0; index < 10; index++) {
        fieldStr += str.split('')[randomNum(1, 27) - 1];
      }
      return `${fieldStr}${Date.now()}`;
    }
  }
};
</script>
<style lang="scss" scoped>
#tool {
  position: fixed;
  width: 60px;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .el-button + .el-button {
    margin-top: 20px;
    margin-left: 0px;
  }
}
.setwat-dialog {
  .colorred {
    color: red;
    font-weight: bold;
  }
}
.option-config {
  .el-form-item__content {
    div {
      width: 180px;
    }
  }
}
.default-dialog-config {
  .footer {
    height: 40px;
    line-height: 40px;
    text-align: center;
    button {
      width: 80px;
    }
  }
}
.removeoptions {
  /deep/.el-form-item__content {
    margin-left: 0px !important;
    display: flex;
    flex-direction: column;
    text-align: center;
  }
  .el-radio {
    margin-right: 0px;
    width: 182px;
  }
  .el-radio.is-bordered + .el-radio.is-bordered {
    margin-left: 0px;
  }
  .el-radio.is-bordered {
    margin-bottom: 10px;
  }
}

.upload-csv {
  border: 1px solid #dcdfe6;
  color: #606266;
  border-radius: 4px;
  padding: 5px;
  display: flex;
}
/deep/ .el-upload-list {
  margin: auto 0 !important;
  li {
    margin: 0;
    margin-top: 0px !important;
  }
}
</style>
