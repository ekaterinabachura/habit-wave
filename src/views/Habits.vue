<template>
  <v-container class="pa-4" fluid>
    <!-- Уведомления -->
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      :model-value="true"
      :color="getNotificationColor(notification.type)"
      :timeout="3000"
      location="top"
      class="mt-2"
    >
      {{ notification.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="notifications = notifications.filter(n => n.id !== notification.id)"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Заголовок и добавление привычки -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-wave" size="40" color="primary" class="mr-3" />
          <h1 class="text-h4 font-weight-bold">HabitWave</h1>
        </div>
        <v-btn 
          color="primary" 
          size="large"
          prepend-icon="mdi-plus"
          @click="showAddDialog = true"
          elevation="2"
        >
          Новая привычка
        </v-btn>
      </v-col>
    </v-row>

    <!-- Статистика -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="pa-0 mb-4">
            <v-icon class="mr-2">mdi-chart-pie</v-icon>
            Общий прогресс
          </v-card-title>
          <v-card-text class="text-center pa-0">
            <v-progress-circular
              :model-value="overallCompletion"
              :size="140"
              :width="18"
              color="primary"
              class="mb-2"
            >
              <template v-slot:default>
                <div class="text-h5 font-weight-bold">{{ overallCompletion }}%</div>
              </template>
            </v-progress-circular>
            <div class="text-caption text-medium-emphasis">
              Выполнено на этой неделе
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <HabitChart :progress-data="weeklyProgress" />
      </v-col>
    </v-row>

    <!-- Сетка привычек -->
    <v-row v-if="getHabitStats.length > 0">
      <v-col 
        cols="12" 
        :md="getHabitStats.length === 1 ? 12 : 6" 
        :lg="getHabitStats.length === 1 ? 12 : getHabitStats.length === 2 ? 6 : 4"
        v-for="habit in getHabitStats" 
        :key="habit.id"
      >
        <HabitCard 
          :habit="habit" 
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </v-col>
    </v-row>

    <!-- Пустое состояние -->
    <v-row v-else>
      <v-col cols="12" class="text-center py-12">
        <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-information-outline</v-icon>
        <h2 class="text-h5 mb-2 text-grey-darken-1">У вас пока нет привычек</h2>
        <p class="text-body-2 text-grey mb-4">Создайте свою первую привычку, чтобы начать отслеживать прогресс!</p>
        <v-btn 
          color="primary" 
          size="large"
          prepend-icon="mdi-plus"
          @click="showAddDialog = true"
        >
          Создать привычку
        </v-btn>
      </v-col>
    </v-row>

    <!-- Диалог добавления привычки -->
    <v-dialog v-model="showAddDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="pa-4">
          <v-icon class="mr-2">mdi-plus-circle</v-icon>
          Новая привычка
        </v-card-title>
        <v-card-text class="pa-4">
          <v-text-field 
            v-model="newHabit.title" 
            label="Название привычки"
            placeholder="Например: Утренняя зарядка"
            variant="outlined"
            class="mb-4"
            autofocus
            @keyup.enter="addNewHabit"
          />
          
          <v-select
            v-model="newHabit.frequency"
            :items="frequencyItems"
            label="Цель: раз в неделю"
            variant="outlined"
            class="mb-4"
            prepend-inner-icon="mdi-calendar-week"
          />

          <div class="mb-2">
            <label class="text-body-2 mb-2 d-block">Цвет карточки</label>
            <div class="d-flex align-center mb-2">
              <v-text-field
                v-model="newHabit.color"
                type="color"
                variant="outlined"
                hide-details
                class="mr-2"
                style="max-width: 100px;"
              />
              <v-text-field
                v-model="newHabit.color"
                label="Hex код"
                variant="outlined"
                hide-details
                prepend-inner-icon="mdi-palette"
              />
            </div>
            <div class="color-swatches">
              <template v-for="(row, rowIndex) in colorSwatches" :key="rowIndex">
                <v-btn
                  v-for="color in row"
                  :key="color"
                  :style="{ backgroundColor: color }"
                  :class="{ 'selected-color': newHabit.color === color }"
                  size="small"
                  icon
                  variant="flat"
                  class="ma-1"
                  @click="newHabit.color = color"
                >
                  <v-icon v-if="newHabit.color === color" color="white">mdi-check</v-icon>
                </v-btn>
              </template>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn 
            variant="text"
            @click="closeDialog"
          >
            Отмена
          </v-btn>
          <v-btn 
            color="primary" 
            @click="addNewHabit"
            :disabled="!newHabit.title.trim()"
          >
            Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHabitsStore } from '@/stores/habits'
import { useHabitAnalytics } from '@/composables/useHabitAnalytics'
import { useNotifications } from '@/composables/useNotifications'
import HabitCard from '@/components/HabitCard.vue'
import HabitChart from '@/components/HabitChart.vue'

const habitsStore = useHabitsStore()
const { addHabit, toggleHabitDate, deleteHabit, loadFromLocalStorage } = habitsStore
const { habits, getHabitStats } = storeToRefs(habitsStore)

const { weeklyProgress, overallCompletion } = useHabitAnalytics(habits)
const { notifications, showNotification } = useNotifications()

const showAddDialog = ref(false)
const newHabit = ref({
  title: '',
  frequency: 3,
  color: '#1976D2'
})

const frequencyItems = [
  { title: '1 раз в неделю', value: 1 },
  { title: '2 раза в неделю', value: 2 },
  { title: '3 раза в неделю', value: 3 },
  { title: '4 раза в неделю', value: 4 },
  { title: '5 раз в неделю', value: 5 },
  { title: '6 раз в неделю', value: 6 },
  { title: '7 раз в неделю (каждый день)', value: 7 }
]

const colorSwatches = [
  ['#1976D2', '#42A5F5', '#90CAF9'],
  ['#388E3C', '#66BB6A', '#A5D6A7'],
  ['#F57C00', '#FFA726', '#FFCC80'],
  ['#7B1FA2', '#BA68C8', '#CE93D8'],
  ['#C62828', '#EF5350', '#EF9A9A'],
  ['#00897B', '#26A69A', '#80CBC4']
]

const addNewHabit = () => {
  if (newHabit.value.title.trim()) {
    addHabit({ ...newHabit.value })
    showNotification(`Привычка "${newHabit.value.title}" добавлена!`, 'success')
    closeDialog()
  }
}

const closeDialog = () => {
  showAddDialog.value = false
  newHabit.value = {
    title: '',
    frequency: 3,
    color: '#1976D2'
  }
}

const handleToggle = (habitId, date) => {
  toggleHabitDate(habitId, date)
  const habit = habits.value.find(h => h.id === habitId)
  if (habit) {
    const isCompleted = habit.completedDates.includes(date.toDateString())
    if (isCompleted) {
      showNotification(`Привычка "${habit.title}" отмечена как выполненная!`, 'success')
    }
  }
}

const handleDelete = (habitId) => {
  const habit = habits.value.find(h => h.id === habitId)
  if (habit) {
    deleteHabit(habitId)
    showNotification(`Привычка "${habit.title}" удалена`, 'info')
  }
}

const getNotificationColor = (type) => {
  const colors = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }
  return colors[type] || 'info'
}

onMounted(() => {
  // Загружаем данные из localStorage сразу при монтировании
  loadFromLocalStorage()
})

// Также загружаем при инициализации компонента
loadFromLocalStorage()
</script>

<style scoped>
.v-container {
  max-width: 1400px;
}

.color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.selected-color {
  border: 2px solid rgba(0, 0, 0, 0.3) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>

