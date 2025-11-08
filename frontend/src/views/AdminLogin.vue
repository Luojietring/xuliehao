<template>
  <div class="admin-login">
    <div class="container">
      <div class="card" style="max-width: 400px; margin: 100px auto;">
        <h1 style="text-align: center; margin-bottom: 30px; color: #111827;">
          管理员登录
        </h1>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div class="input-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              required
            />
          </div>

          <button class="btn btn-primary" type="submit" :disabled="loading" style="width: 100%;">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div style="text-align: center; margin-top: 20px;">
          <router-link to="/" style="color: #ff7000; text-decoration: none; font-weight: 500;">
            返回用户查询
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { adminLogin } from '../api/admin'

export default {
  name: 'AdminLogin',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await adminLogin(this.form.username, this.form.password)
        if (response.success) {
          // 保存 token
          localStorage.setItem('admin_token', response.token)
          // 跳转到管理后台
          this.$router.push('/admin/dashboard')
        }
      } catch (error) {
        this.errorMessage = error.message || '登录失败，请检查用户名和密码'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
}
</style>

