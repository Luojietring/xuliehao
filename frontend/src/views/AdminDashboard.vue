<template>
  <div class="admin-dashboard">
    <div class="container">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
          <h1 style="color: #111827; margin: 0;">管理后台</h1>
          <div>
            <button class="btn btn-primary" @click="showAddModal = true" style="margin-right: 10px;">
              添加序列号
            </button>
            <button class="btn btn-secondary" @click="handleLogout">
              退出登录
            </button>
          </div>
        </div>

        <!-- 搜索和筛选 -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索序列号或持有者姓名"
            style="flex: 1; min-width: 200px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px;"
            @input="handleSearch"
          />
          <select
            v-model="filterStatus"
            style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px;"
            @change="loadData"
          >
            <option value="">全部状态</option>
            <option value="active">生效</option>
            <option value="inactive">失效</option>
          </select>
          <button class="btn btn-primary" @click="loadData">搜索</button>
        </div>

        <!-- 提示信息 -->
        <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-error']">
          {{ message }}
        </div>

        <!-- 序列号列表 -->
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="serialList.length === 0" class="empty-state">
          <p>暂无数据</p>
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>序列号</th>
              <th>持有者</th>
              <th>状态</th>
              <th>激活时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in serialList" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.serial_number }}</td>
              <td>{{ item.holder_name }}</td>
              <td>
                <span :class="item.status === 'active' ? 'status-active' : 'status-inactive'">
                  {{ item.status === 'active' ? '生效' : '失效' }}
                </span>
              </td>
              <td>{{ formatTime(item.activate_time) }}</td>
              <td>
                <button class="btn btn-secondary" @click="handleEdit(item)" style="margin-right: 5px; padding: 6px 12px; font-size: 14px;">
                  编辑
                </button>
                <button class="btn btn-danger" @click="handleDelete(item)" style="padding: 6px 12px; font-size: 14px;">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div v-if="total > 0" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
          <div>
            共 {{ total }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" @click="prevPage" :disabled="currentPage === 1">
              上一页
            </button>
            <button class="btn btn-secondary" @click="nextPage" :disabled="currentPage === totalPages">
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ showAddModal ? '添加序列号' : '编辑序列号' }}</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div class="input-group">
          <label for="modalSerialNumber">序列号</label>
          <input
            id="modalSerialNumber"
            v-model="form.serialNumber"
            type="text"
            placeholder="请输入序列号"
          />
        </div>

        <div class="input-group">
          <label for="modalHolderName">持有者姓名</label>
          <input
            id="modalHolderName"
            v-model="form.holderName"
            type="text"
            placeholder="请输入持有者姓名"
          />
        </div>

        <div class="input-group">
          <label for="modalStatus">状态</label>
          <select id="modalStatus" v-model="form.status">
            <option value="active">生效</option>
            <option value="inactive">失效</option>
          </select>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="submitting">
            {{ submitting ? '提交中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addSerial, getSerialList, updateSerial, deleteSerial } from '../api/admin'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      serialList: [],
      loading: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      searchKeyword: '',
      filterStatus: '',
      showAddModal: false,
      showEditModal: false,
      submitting: false,
      message: '',
      messageType: 'success',
      form: {
        id: null,
        serialNumber: '',
        holderName: '',
        status: 'active'
      }
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        }
        if (this.filterStatus) {
          params.status = this.filterStatus
        }
        if (this.searchKeyword) {
          params.search = this.searchKeyword
        }

        const response = await getSerialList(params)
        if (response.success) {
          this.serialList = response.data.list
          this.total = response.data.total
        }
      } catch (error) {
        this.showMessage(error.message || '加载数据失败', 'error')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      // 防抖处理
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.currentPage = 1
        this.loadData()
      }, 500)
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.loadData()
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.loadData()
      }
    },
    handleEdit(item) {
      this.form = {
        id: item.id,
        serialNumber: item.serial_number,
        holderName: item.holder_name,
        status: item.status
      }
      this.showEditModal = true
    },
    async handleDelete(item) {
      if (!confirm(`确定要删除序列号 "${item.serial_number}" 吗？此操作不可恢复！`)) {
        return
      }

      try {
        const response = await deleteSerial(item.id)
        if (response.success) {
          this.showMessage('删除成功', 'success')
          this.loadData()
        }
      } catch (error) {
        this.showMessage(error.message || '删除失败', 'error')
      }
    },
    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.form = {
        id: null,
        serialNumber: '',
        holderName: '',
        status: 'active'
      }
    },
    async handleSubmit() {
      if (!this.form.serialNumber.trim() || !this.form.holderName.trim()) {
        this.showMessage('请填写完整信息', 'error')
        return
      }

      this.submitting = true
      try {
        if (this.showAddModal) {
          // 添加
          const response = await addSerial({
            serialNumber: this.form.serialNumber.trim(),
            holderName: this.form.holderName.trim(),
            status: this.form.status
          })
          if (response.success) {
            this.showMessage('添加成功', 'success')
            this.closeModal()
            this.loadData()
          }
        } else {
          // 编辑
          const response = await updateSerial(this.form.id, {
            serialNumber: this.form.serialNumber.trim(),
            holderName: this.form.holderName.trim(),
            status: this.form.status
          })
          if (response.success) {
            this.showMessage('更新成功', 'success')
            this.closeModal()
            this.loadData()
          }
        }
      } catch (error) {
        this.showMessage(error.message || '操作失败', 'error')
      } finally {
        this.submitting = false
      }
    },
    handleLogout() {
      if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('admin_token')
        this.$router.push('/admin/login')
      }
    },
    showMessage(text, type = 'success') {
      this.message = text
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 3000)
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
.status-active {
  color: #10b981;
  font-weight: 600;
}

.status-inactive {
  color: #ef4444;
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

