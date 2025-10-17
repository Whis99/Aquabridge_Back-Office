import { useState, useEffect, useCallback } from 'react'
import {
  getAllUsers,
  getAllActiveUsers,
  getPendingOrders,
  getAllPendingUsers,
  getPendingWithdrawals,
  getTotalRevenue,
  getAllOrders,
  getCompletedOrders,
  getAllTransactions,
  getCurrentExchangeRate,
  getActiveEelPrice,
  getAllBenefitSettings
} from '../services/firebaseServices'

export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // KPI Data
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeUsers, setActiveUsers] = useState(0)
  const [pendingUsers, setPendingUsers] = useState(0)
  const [newSignups, setNewSignups] = useState(0)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0)
  
  // Chart Data
  const [monthlyOrdersData, setMonthlyOrdersData] = useState([])
  const [yearlyOrdersData, setYearlyOrdersData] = useState([])
  const [weeklyOrdersData, setWeeklyOrdersData] = useState([])
  const [eelTradingData, setEelTradingData] = useState({})
  
  // Management Data
  const [exchangeRate, setExchangeRate] = useState(134)
  const [activeEelPrice, setActiveEelPrice] = useState(null)
  const [benefitSettings, setBenefitSettings] = useState({})

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch all data in parallel
      const [
        allUsers,
        activeUsersData,
        pendingUsersData,
        pendingOrders,
        pendingWithdrawals,
        transactionsData,
        allOrdersData,
        completedOrdersData,
        allTransactionsData,
        exchangeRateData,
        activeEelPriceData,
        benefitSettingsData,
      ] = await Promise.all([
        getAllUsers(),
        getAllActiveUsers(),
        getAllPendingUsers(),
        getPendingOrders(),
        getPendingWithdrawals(),
        getTotalRevenue(),
        getAllOrders(),
        getCompletedOrders(),
        getAllTransactions(),
        getCurrentExchangeRate(),
        getActiveEelPrice(),
        getAllBenefitSettings(),
      ])

      // Calculate new signups (users created in last 7 days)
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      // Handle both old format (with .docs) and new format (direct array)
      const usersArray = allUsers.docs ? allUsers.docs : allUsers
      
      const newSignupsCount = usersArray.filter(doc => {
        const userData = doc.data ? doc.data() : doc
        const createdAt = userData.created_at?.toDate ? userData.created_at.toDate() : new Date(userData.created_at)
        return createdAt && createdAt >= sevenDaysAgo
      }).length

      // Calculate total revenue from transactions (sum of positive amounts)
      const transactionsArray = transactionsData.docs ? transactionsData.docs : transactionsData
      
      const totalRevenueAmount = transactionsArray.reduce((sum, doc) => {
        const transaction = doc.data ? doc.data() : doc
        const amount = transaction.amount || transaction.totalCost || 0
        return sum + (amount > 0 ? amount : 0) // Only positive amounts
      }, 0)

      // Calculate orders data for chart (count instead of cost)
      const monthlyData = {}
      const yearlyData = {}
      const weeklyData = {}
      
      // Handle both old format (with .docs) and new format (direct array)
      const ordersArray = allOrdersData.docs ? allOrdersData.docs : allOrdersData
      
      ordersArray.forEach(doc => {
        const order = doc.data ? doc.data() : doc
        const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
        if (createdAt) {
          // Monthly data
          const month = createdAt.toLocaleDateString('en-US', { month: 'short' })
          if (!monthlyData[month]) {
            monthlyData[month] = 0
          }
          monthlyData[month] += 1

          // Yearly data
          const year = createdAt.getFullYear().toString()
          if (!yearlyData[year]) {
            yearlyData[year] = 0
          }
          yearlyData[year] += 1

          // Weekly data (last 12 weeks)
          const weekStart = new Date(createdAt)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
          const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = 0
          }
          weeklyData[weekKey] += 1
        }
      })

      // Convert to array format for chart
      const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
        name: month,
        value: count,
        count: count
      })).sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return months.indexOf(a.name) - months.indexOf(b.name)
      })

      const yearlyChartData = Object.entries(yearlyData).map(([year, count]) => ({
        name: year,
        value: count,
        count: count
      })).sort((a, b) => a.name.localeCompare(b.name))

      const weeklyChartData = Object.entries(weeklyData)
        .map(([week, count]) => ({
          name: week,
          value: count,
          count: count
        }))
        .sort((a, b) => {
          const dateA = new Date(a.name + ', ' + new Date().getFullYear())
          const dateB = new Date(b.name + ', ' + new Date().getFullYear())
          return dateA - dateB
        })
        .slice(-12) // Last 12 weeks

      // Process eel trading data (transactions between fishermen and associations)
      const eelTradingMonthly = {}
      const eelTradingYearly = {}
      const eelTradingWeekly = {}
      const eelTradingDaily = {}
      
      // Handle both old format (with .docs) and new format (direct array)
      const eelTransactionsArray = allTransactionsData.docs ? allTransactionsData.docs : allTransactionsData
      
      eelTransactionsArray.forEach(doc => {
        // Extract transaction data - handle both Firebase doc format and direct object format
        const transaction = doc.data ? doc.data() : doc
        const createdAt = transaction.createdAt?.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt)
        
        // Only process valid transactions with valid dates
        if (createdAt && !isNaN(createdAt.getTime())) {
          // Filter for fisherman to association transactions (glass eel sales)
          const isEelTrading = transaction.transaction_type === 'fisherman_to_association'
          
          if (isEelTrading) {
            const totalQty = transaction.totalQty || 0
            
            // Monthly data aggregation - count transactions and sum quantities
            const month = createdAt.toLocaleDateString('en-US', { month: 'short' })
            if (!eelTradingMonthly[month]) {
              eelTradingMonthly[month] = { count: 0, totalQty: 0 }
            }
            eelTradingMonthly[month].count += 1
            eelTradingMonthly[month].totalQty += totalQty

            // Yearly data aggregation
            const year = createdAt.getFullYear().toString()
            if (!eelTradingYearly[year]) {
              eelTradingYearly[year] = { count: 0, totalQty: 0 }
            }
            eelTradingYearly[year].count += 1
            eelTradingYearly[year].totalQty += totalQty

            // Weekly data aggregation (last 12 weeks)
            const weekStart = new Date(createdAt)
            weekStart.setDate(weekStart.getDate() - weekStart.getDay())
            const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (!eelTradingWeekly[weekKey]) {
              eelTradingWeekly[weekKey] = { count: 0, totalQty: 0 }
            }
            eelTradingWeekly[weekKey].count += 1
            eelTradingWeekly[weekKey].totalQty += totalQty

            // Daily data aggregation (last 30 days)
            const dayKey = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (!eelTradingDaily[dayKey]) {
              eelTradingDaily[dayKey] = { count: 0, totalQty: 0 }
            }
            eelTradingDaily[dayKey].count += 1
            eelTradingDaily[dayKey].totalQty += totalQty
          }
        }
      })

      // Convert eel trading data to chart format
      const eelTradingMonthlyChartData = Object.entries(eelTradingMonthly)
        .map(([month, data]) => ({
          name: month,
          count: data.count,
          totalQty: data.totalQty
        }))
        .sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          return months.indexOf(a.name) - months.indexOf(b.name)
        })

      const eelTradingYearlyChartData = Object.entries(eelTradingYearly)
        .map(([year, data]) => ({
          name: year,
          count: data.count,
          totalQty: data.totalQty
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      const eelTradingWeeklyChartData = Object.entries(eelTradingWeekly)
        .map(([week, data]) => ({
          name: week,
          count: data.count,
          totalQty: data.totalQty
        }))
        .sort((a, b) => {
          const dateA = new Date(a.name + ', ' + new Date().getFullYear())
          const dateB = new Date(b.name + ', ' + new Date().getFullYear())
          return dateA - dateB
        })
        .slice(-12)

      const eelTradingDailyChartData = Object.entries(eelTradingDaily)
        .map(([day, data]) => ({
          name: day,
          count: data.count,
          totalQty: data.totalQty
        }))
        .sort((a, b) => {
          const dateA = new Date(a.name + ', ' + new Date().getFullYear())
          const dateB = new Date(b.name + ', ' + new Date().getFullYear())
          return dateA - dateB
        })
        .slice(-30)

      // Update state - handle both old format (.size) and new format (.length)
      setTotalUsers(allUsers.size || allUsers.length)
      setActiveUsers(activeUsersData.size || activeUsersData.length)
      setPendingUsers(pendingUsersData.size || pendingUsersData.length)
      setNewSignups(newSignupsCount)
      setPendingOrdersCount(pendingOrders.size || pendingOrders.length)
      setPendingWithdrawalsCount(pendingWithdrawals.size || pendingWithdrawals.length)
      setTotalRevenue(totalRevenueAmount)
      setCompletedOrdersCount(completedOrdersData.size || completedOrdersData.length)
      setMonthlyOrdersData(monthlyChartData)
      setYearlyOrdersData(yearlyChartData)
      setWeeklyOrdersData(weeklyChartData)

      // Set eel trading data
      setEelTradingData({
        monthly: eelTradingMonthlyChartData,
        yearly: eelTradingYearlyChartData,
        weekly: eelTradingWeeklyChartData,
        daily: eelTradingDailyChartData
      })

      // Set exchange rate from Firebase
      if (exchangeRateData.success) {
        setExchangeRate(exchangeRateData.data.currentRate)
      }

      // Set active eel price from Firebase
      if (activeEelPriceData.success) {
        setActiveEelPrice(activeEelPriceData.data)
      }

      // Set benefit settings from Firebase
      if (benefitSettingsData.success) {
        setBenefitSettings(benefitSettingsData.data)
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    // Loading and error states
    isLoading,
    error,
    
    // KPI data
    totalUsers,
    activeUsers,
    pendingUsers,
    newSignups,
    pendingOrdersCount,
    pendingWithdrawalsCount,
    totalRevenue,
    completedOrdersCount,
    
    // Chart data
    monthlyOrdersData,
    yearlyOrdersData,
    weeklyOrdersData,
    eelTradingData,
    
    // Management data
    exchangeRate,
    activeEelPrice,
    benefitSettings,
    
    // Actions
    refreshData: fetchStats,
    setExchangeRate,
    setActiveEelPrice,
    setBenefitSettings
  }
}
