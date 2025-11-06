import { ref } from 'vue'

export function useNotifications() {
  const notifications = ref([])

  const showNotification = (message, type = 'info') => {
    const id = Date.now()
    notifications.value.push({ id, message, type })
    
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }, 3000)
  }

  return {
    notifications,
    showNotification
  }
}

