<template>
    <div class="unauthorized-container">
        <div class="unauthorized-content">
            <h1>Unauthorized Access</h1>
            <p>You do not have permission to access this page.</p>

            <div v-if="redirectReason" class="error-details">
                <p v-if="redirectReason === 'insufficient_permissions'">
                    You lack the necessary permissions to view this page.
                </p>
            </div>

            <div class="action-buttons">
                <button @click="goToLogin" class="btn btn-primary">
                    Go to Login
                </button>
                <button v-if="userRole === 'ADMIN'" @click="goToAdminDashboard" class="btn btn-secondary">
                    Admin Dashboard
                </button>
                <button v-else @click="goToUserDashboard" class="btn btn-secondary">
                    User Dashboard
                </button>
            </div>
        </div>
    </div>
</template>
  
  <script>
import { authService } from '@user/services/AuthService';


export default {
    name: 'UnauthorizedPage',
    data() {
        return {
            redirectReason: this.$route.query.reason,
            userRole: localStorage.getItem('role')
        };
    },
    methods: {
        goToLogin() {
            authService.logout();
            this.$router.push('/login');
        },
        goToAdminDashboard() {
            this.$router.push('/admin');
        },
        goToUserDashboard() {
            this.$router.push('/');
        }
    },
    mounted() {
        // Optional: Log unauthorized access attempt
        console.warn('Unauthorized access attempt', {
            attemptedPath: this.$route.query.redirect,
            reason: this.redirectReason
        });
    }
}
</script>
  <style scoped>
.unauthorized-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f4f4f4;
}

.unauthorized-content {
    text-align: center;
    background-color: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-details {
    margin: 1rem 0;
    color: #d9534f;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}
</style>