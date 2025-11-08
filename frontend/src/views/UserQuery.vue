<template>
  <div class="user-query">
    <div class="container">
      <div class="card" style="max-width: 600px; margin: 50px auto;">
        <h1 style="text-align: center; margin-bottom: 30px; color: #111827;">
          序列号查询系统
        </h1>
        
        <div class="input-group">
          <label for="serialNumber">请输入序列号</label>
          <input
            id="serialNumber"
            v-model="serialNumber"
            type="text"
            placeholder="例如: SN123456"
            @keyup.enter="handleQuery"
          />
        </div>

        <button class="btn btn-primary" @click="handleQuery" :disabled="loading" style="width: 100%;">
          {{ loading ? '查询中...' : '查询' }}
        </button>

        <div style="text-align: center; margin-top: 20px;">
          <router-link to="/admin/login" style="color: #ff7000; text-decoration: none; font-weight: 500;">
            管理员登录
          </router-link>
        </div>

        <!-- 查询结果 -->
        <div v-if="result" class="result-card" style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <h2 style="margin-bottom: 20px; color: #111827;">查询结果</h2>
          
          <div v-if="!result.isReal" class="alert alert-info">
            <strong>序列号不存在</strong>
            <p style="margin-top: 8px; margin-bottom: 0;">该序列号在数据库中未找到</p>
          </div>

          <div v-else class="result-details">
            <div class="result-item">
              <span class="label">真实性：</span>
              <span class="value success">✓ 真实有效</span>
            </div>
            <div class="result-item">
              <span class="label">序列号：</span>
              <span class="value">{{ result.serialNumber }}</span>
            </div>
            <div class="result-item">
              <span class="label">持有者：</span>
              <span class="value">{{ result.holderName }}</span>
            </div>
            <div class="result-item">
              <span class="label">状态：</span>
              <span class="value" :class="result.status === '生效' ? 'status-active' : 'status-inactive'">
                {{ result.status }}
              </span>
            </div>
            <div class="result-item">
              <span class="label">激活时间：</span>
              <span class="value">{{ formatTime(result.activateTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { querySerial } from '../api/serial'

export default {
  name: 'UserQuery',
  data() {
    return {
      serialNumber: '',
      result: null,
      loading: false
    }
  },
  methods: {
    async handleQuery() {
      if (!this.serialNumber.trim()) {
        alert('请输入序列号')
        return
      }

      this.loading = true
      this.result = null

      try {
        const response = await querySerial(this.serialNumber.trim())
        if (response.success) {
          this.result = response.data
        }
      } catch (error) {
        alert(error.message || '查询失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    formatTime(timeStr) {
      if (!timeStr) return '未知'
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.result-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
}

.value {
  color: #111827;
  flex: 1;
}

.value.success {
  color: #10b981;
  font-weight: 600;
}

.status-active {
  color: #10b981;
  font-weight: 600;
}

.status-inactive {
  color: #ef4444;
  font-weight: 600;
}
</style>

