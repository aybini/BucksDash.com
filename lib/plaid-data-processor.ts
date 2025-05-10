import { db } from "./firebase-init"
import { doc, setDoc, collection, query, getDocs, where, Timestamp, updateDoc } from "firebase/firestore"

// Process Plaid transactions and sync to Firebase
export async function processPlaidTransactions(userId: string, transactions: any[]) {
  try {
    console.log(`Processing ${transactions.length} transactions for user ${userId}`)

    // Process each transaction
    const processedTransactions = []

    for (const transaction of transactions) {
      // Skip pending transactions
      if (transaction.pending) {
        continue
      }

      // Create a processed transaction object
      const processedTransaction = {
        id: transaction.transaction_id,
        userId,
        amount: transaction.amount,
        date: new Date(transaction.date),
        description: transaction.name,
        category: transaction.personal_finance_category?.primary || "Uncategorized",
        subcategory: transaction.personal_finance_category?.detailed || "Uncategorized",
        merchantName: transaction.merchant_name || transaction.name,
        paymentChannel: transaction.payment_channel,
        pending: transaction.pending,
        accountId: transaction.account_id,
        plaidTransactionId: transaction.transaction_id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      // Add to processed transactions
      processedTransactions.push(processedTransaction)

      // Save to Firestore
      const transactionRef = doc(db, "users", userId, "transactions", transaction.transaction_id)
      await setDoc(transactionRef, processedTransaction, { merge: true })
    }

    console.log(`Processed and saved ${processedTransactions.length} transactions`)

    return {
      success: true,
      transactions: processedTransactions,
    }
  } catch (error: any) {
    console.error("Error processing transactions:", error)
    return {
      success: false,
      error: error.message || "Failed to process transactions",
      transactions: [],
    }
  }
}

// Update budget categories with actual spending
export async function updateBudgetCategoriesWithSpending(userId: string, transactions: any[]) {
  try {
    console.log(`Updating budget categories with spending for user ${userId}`)

    // Get the current month and year
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()

    // Get the user's budget categories
    const budgetCategoriesRef = collection(db, "users", userId, "budgetCategories")
    const q = query(budgetCategoriesRef, where("year", "==", currentYear), where("month", "==", currentMonth))
    const querySnapshot = await getDocs(q)

    // If no budget categories found, return early
    if (querySnapshot.empty) {
      console.log("No budget categories found for the current month")
      return {
        success: true,
        message: "No budget categories found for the current month",
      }
    }

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {}

    for (const transaction of transactions) {
      // Skip transactions from other months
      const transactionDate = new Date(transaction.date)
      const transactionMonth = transactionDate.getMonth() + 1
      const transactionYear = transactionDate.getFullYear()

      if (transactionMonth !== currentMonth || transactionYear !== currentYear) {
        continue
      }

      // Skip income transactions (negative amounts in Plaid are credits/income)
      if (transaction.amount < 0) {
        continue
      }

      // Add to spending by category
      const category = transaction.category || "Uncategorized"
      spendingByCategory[category] = (spendingByCategory[category] || 0) + transaction.amount
    }

    // Update each budget category with actual spending
    for (const doc of querySnapshot.docs) {
      const budgetCategory = doc.data()
      const category = budgetCategory.category
      const actualSpending = spendingByCategory[category] || 0

      // Update the budget category
      await updateDoc(doc.ref, {
        actualSpending,
        updatedAt: Timestamp.now(),
      })
    }

    console.log(`Updated spending for ${querySnapshot.size} budget categories`)

    return {
      success: true,
      spendingByCategory,
    }
  } catch (error: any) {
    console.error("Error updating budget categories:", error)
    return {
      success: false,
      error: error.message || "Failed to update budget categories",
    }
  }
}

// Detect and create subscriptions
export async function detectAndCreateSubscriptions(userId: string, transactions: any[]) {
  try {
    console.log(`Detecting subscriptions for user ${userId}`)

    // This is a placeholder for a more sophisticated algorithm
    // In a real implementation, you would use a more advanced algorithm to detect recurring transactions

    // Look for common subscription keywords in the transaction name
    const subscriptionKeywords = [
      "netflix",
      "spotify",
      "hulu",
      "disney",
      "apple",
      "google",
      "amazon prime",
      "gym",
      "membership",
      "subscription",
      "monthly",
      "recurring",
    ]

    const potentialSubscriptions = transactions.filter((transaction) => {
      const name = (transaction.description || transaction.merchantName || "").toLowerCase()
      return subscriptionKeywords.some((keyword) => name.includes(keyword))
    })

    console.log(`Found ${potentialSubscriptions.length} potential subscriptions`)

    // Create or update subscription records
    for (const transaction of potentialSubscriptions) {
      const subscriptionId = `sub_${transaction.merchantName.replace(/\s+/g, "_").toLowerCase()}`
      const subscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId)

      await setDoc(
        subscriptionRef,
        {
          id: subscriptionId,
          userId,
          name: transaction.merchantName || transaction.description,
          amount: transaction.amount,
          category: transaction.category || "Subscriptions",
          frequency: "monthly", // Assuming monthly for simplicity
          lastTransactionDate: new Date(transaction.date),
          lastTransactionId: transaction.id,
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      )
    }

    return {
      success: true,
      subscriptionsCount: potentialSubscriptions.length,
    }
  } catch (error: any) {
    console.error("Error detecting subscriptions:", error)
    return {
      success: false,
      error: error.message || "Failed to detect subscriptions",
    }
  }
}

// Detect and create income sources
export async function detectAndCreateIncomeSources(userId: string, transactions: any[]) {
  try {
    console.log(`Detecting income sources for user ${userId}`)

    // This is a placeholder for a more sophisticated algorithm
    // In a real implementation, you would use a more advanced algorithm to detect income sources

    // Look for income transactions (negative amounts in Plaid are credits/income)
    const incomeTransactions = transactions.filter((transaction) => transaction.amount < 0)

    console.log(`Found ${incomeTransactions.length} potential income transactions`)

    // Group by source (merchant name)
    const incomeBySource: Record<string, any[]> = {}

    for (const transaction of incomeTransactions) {
      const source = transaction.merchantName || transaction.description || "Unknown"

      if (!incomeBySource[source]) {
        incomeBySource[source] = []
      }

      incomeBySource[source].push(transaction)
    }

    // Create or update income source records
    for (const [source, transactions] of Object.entries(incomeBySource)) {
      // Skip sources with only one transaction (might be one-time income)
      if (transactions.length < 2) {
        continue
      }

      const incomeSourceId = `income_${source.replace(/\s+/g, "_").toLowerCase()}`
      const incomeSourceRef = doc(db, "users", userId, "incomeSources", incomeSourceId)

      // Calculate average income amount
      const totalAmount = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
      const averageAmount = totalAmount / transactions.length

      await setDoc(
        incomeSourceRef,
        {
          id: incomeSourceId,
          userId,
          name: source,
          amount: averageAmount,
          frequency: "monthly", // Assuming monthly for simplicity
          lastTransactionDate: new Date(transactions[0].date),
          lastTransactionId: transactions[0].id,
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      )
    }

    return {
      success: true,
      incomeSourcesCount: Object.keys(incomeBySource).length,
    }
  } catch (error: any) {
    console.error("Error detecting income sources:", error)
    return {
      success: false,
      error: error.message || "Failed to detect income sources",
    }
  }
}

// Generate financial insights
export function generateFinancialInsights(transactions: any[]) {
  try {
    console.log(`Generating financial insights from ${transactions.length} transactions`)

    // Calculate total spending
    const totalSpending = transactions
      .filter((t) => t.amount > 0) // Exclude income transactions
      .reduce((sum, t) => sum + t.amount, 0)

    // Calculate total income
    const totalIncome = transactions
      .filter((t) => t.amount < 0) // Only income transactions
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {}

    for (const transaction of transactions) {
      // Skip income transactions
      if (transaction.amount < 0) {
        continue
      }

      const category = transaction.category || "Uncategorized"
      spendingByCategory[category] = (spendingByCategory[category] || 0) + transaction.amount
    }

    // Calculate top spending categories
    const topCategories = Object.entries(spendingByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }))

    // Calculate recurring transactions count (placeholder)
    const recurringTransactionsCount = Math.floor(transactions.length * 0.1) // Assuming 10% are recurring

    // Calculate income sources count (placeholder)
    const incomeSourcesCount = new Set(
      transactions.filter((t) => t.amount < 0).map((t) => t.merchantName || t.description),
    ).size

    // Calculate detected subscriptions count (placeholder)
    const detectedSubscriptionsCount = Math.floor(transactions.length * 0.05) // Assuming 5% are subscriptions

    return {
      totalSpending,
      totalIncome,
      spendingByCategory,
      topCategories,
      recurringTransactionsCount,
      incomeSourcesCount,
      detectedSubscriptionsCount,
      transactionsAnalyzed: transactions.length,
      generatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error generating financial insights:", error)
    return {
      recurringTransactionsCount: 0,
      incomeSourcesCount: 0,
      detectedSubscriptionsCount: 0,
      transactionsAnalyzed: 0,
      generatedAt: new Date(),
    }
  }
}
