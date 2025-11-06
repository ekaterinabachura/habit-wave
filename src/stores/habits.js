import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref([])

  const addHabit = (habit) => {
    habits.value.push({
      id: Date.now(),
      title: habit.title,
      color: habit.color,
      frequency: habit.frequency,
      completedDates: [],
      createdAt: new Date()
    })
    saveToLocalStorage()
  }

  const toggleHabitDate = (habitId, date) => {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return

    const dateStr = date.toDateString()
    const index = habit.completedDates.indexOf(dateStr)
    
    if (index > -1) {
      habit.completedDates.splice(index, 1)
    } else {
      habit.completedDates.push(dateStr)
    }
    saveToLocalStorage()
  }

  const deleteHabit = (habitId) => {
    const index = habits.value.findIndex(h => h.id === habitId)
    if (index > -1) {
      habits.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  const isDateInThisWeek = (date) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const checkDate = new Date(date)
    return checkDate >= startOfWeek && checkDate <= endOfWeek
  }

  const calculateStreak = (completedDates) => {
    if (!completedDates || !Array.isArray(completedDates) || completedDates.length === 0) return 0
    
    const sortedDates = [...completedDates]
      .map(d => new Date(d))
      .sort((a, b) => b - a)
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      checkDate.setHours(0, 0, 0, 0)
      
      const found = sortedDates.find(d => {
        const dDate = new Date(d)
        dDate.setHours(0, 0, 0, 0)
        return dDate.getTime() === checkDate.getTime()
      })
      
      if (found) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const getHabitStats = computed(() => {
    if (!habits.value || !Array.isArray(habits.value)) {
      return []
    }
    return habits.value.map(habit => {
      const completedDates = habit.completedDates || []
      const completedThisWeek = completedDates.filter(date => {
        return isDateInThisWeek(new Date(date))
      }).length
      
      return {
        ...habit,
        completionRate: habit.frequency > 0 
          ? Math.round((completedThisWeek / habit.frequency) * 100) 
          : 0,
        streak: calculateStreak(completedDates)
      }
    })
  })

  const saveToLocalStorage = () => {
    localStorage.setItem('habits', JSON.stringify(habits.value))
  }

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('habits')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        habits.value = parsed.map(habit => ({
          ...habit,
          completedDates: habit.completedDates || []
        }))
      } catch (e) {
        console.error('Error loading habits from localStorage:', e)
      }
    }
  }

  return {
    habits,
    addHabit,
    toggleHabitDate,
    deleteHabit,
    getHabitStats,
    loadFromLocalStorage
  }
})

