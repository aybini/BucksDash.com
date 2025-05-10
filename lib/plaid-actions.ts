"use server"

import { revalidatePath } from "next/cache"
import { Configuration, PlaidApi, PlaidEnvironments, type Products, type CountryCode } from "plaid"
import { db } from "./firebase-init"
import { getDoc, doc, updateDoc, serverTimestamp, collection, query, getDocs } from "firebase/firestore"
import { fetchTransactions } from "./plaid-service"
import {
  processPlaidTransactions,
  updateBudgetCategoriesWithSpending,
  generateFinancialInsights,
  detectAndCreateIncomeSources,
  detectAndCreateSubscriptions,
} from "./plaid-data-processor"

// Constants
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || ""
const PLAID_SECRET = process.env.PLAID_SECRET || ""
const PLAID_ENV = (process.env.PLAID_ENV || "production") as "sandbox" | "development" | "production"
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || ""
const PLAID_WEBHOOK_URL = process.env.PLAID_WEBHOOK_URL || ""

// Configure Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
})

const plaidClient = new PlaidApi(configuration)

// Helper function to check if user has premium subscription
export async function checkPremiumStatus(userId: string) {
  const userDoc = await getDoc(doc(db, "users", userId))

  if (!userDoc.exists()) {
    return false
  }

  const userData = userDoc.data()
  return userData.plan === "premium" && userData.subscription?.status === "active"
}

// Helper function to get transactions from Firestore
async function getTransactions(userId: string) {
  try {
    const transactionsRef = collection(db, "users", userId, "transactions")
    const q = query(transactionsRef)
    const querySnapshot = await getDocs(q)

    const transactions: any[] = []
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return transactions
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

// Helper function to retry a function with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let retries = 0
  let delay = initialDelay

  while (true) {
    try {
      return await fn()
    } catch (error) {
      if (retries >= maxRetries) {
        throw error
      }

      console.log(`Retry attempt ${retries + 1} after ${delay}ms delay`)
      await new Promise((resolve) => setTimeout(resolve, delay))

      retries++
      delay *= 2 // Exponential backoff
    }
  }
}

// Create a link token
export async function createPlaidLinkToken(userId: string, isUpdate = false, itemId?: string) {
  try {
    console.log("Creating Plaid link token for user:", userId)

    const request = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      user: {
        client_user_id: userId,
      },
      client_name: "Rose Finance",
      products: ["transactions", "auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
      webhook: PLAID_WEBHOOK_URL,
      redirect_uri: PLAID_REDIRECT_URI,
    }

    console.log(
      "Link token request:",
      JSON.stringify(
        {
          ...request,
          secret: "[REDACTED]", // Don't log the secret
        },
        null,
        2,
      ),
    )

    const response = await plaidClient.linkTokenCreate(request)

    console.log("Link token created successfully")

    return {
      success: true,
      linkToken: response.data.link_token,
    }
  } catch (error: any) {
    console.error("Error creating link token:", error)

    if (error.response && error.response.data) {
      const plaidError = error.response.data
      console.error("Plaid API error:", plaidError)
      return {
        success: false,
        error: `Plaid API error: ${plaidError.error_message || plaidError.error_code}`,
      }
    }

    return {
      success: false,
      error: error.message || "Failed to create link token",
    }
  }
}

// Exchange public token for access token
export async function exchangePublicToken(publicToken: string, userId: string, metadata: any) {
  try {
    console.log("Exchanging public token for access token")

    if (!publicToken) {
      console.error("Missing public token")
      return {
        success: false,
        error: "Missing public token",
      }
    }

    if (!userId) {
      console.error("Missing user ID")
      return {
        success: false,
        error: "Missing user ID",
      }
    }

    const response = await plaidClient.itemPublicTokenExchange({
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      public_token: publicToken,
    })

    if (!response.data) {
      console.error("No data returned from Plaid API")
      return {
        success: false,
        error: "No data returned from Plaid API",
      }
    }

    const accessToken = response.data.access_token
    const itemId = response.data.item_id

    if (!accessToken || !itemId) {
      console.error("Missing access token or item ID in Plaid response")
      return {
        success: false,
        error: "Missing access token or item ID in Plaid response",
      }
    }

    console.log("Public token exchanged successfully")

    // Store the access token in Firestore
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()
    const plaidItems = userData.plaidItems || {}

    // Add the new Plaid item
    plaidItems[itemId] = {
      accessToken,
      itemId,
      institutionId: metadata?.institution?.institution_id || "unknown",
      institutionName: metadata?.institution?.name || "Unknown Bank",
      lastUpdated: serverTimestamp(),
    }

    // Update the user document with the new Plaid item
    await updateDoc(userRef, {
      plaidItems,
      hasPlaidConnection: true,
      plaidLastSync: serverTimestamp(),
    })

    // Fetch initial data from Plaid
    try {
      await refreshFinancialData(userId)
    } catch (refreshError) {
      console.error("Error refreshing financial data:", refreshError)
      // Continue even if refresh fails
    }

    return {
      success: true,
      accessToken,
      itemId,
    }
  } catch (error: any) {
    console.error("Error exchanging public token:", error)

    if (error.response && error.response.data) {
      const plaidError = error.response.data
      console.error("Plaid API error:", plaidError)
      return {
        success: false,
        error: `Plaid API error: ${plaidError.error_message || plaidError.error_code}`,
      }
    }

    return {
      success: false,
      error: error.message || "Failed to exchange public token",
    }
  }
}

// Sync Plaid transactions
export async function syncPlaidTransactions(userId: string) {
  // For now, we'll just call refreshFinancialData
  return refreshFinancialData(userId)
}

export async function refreshFinancialData(userId: string) {
  try {
    console.log(`Refreshing financial data for user ${userId}`)

    // Get user document to check if they have any Plaid items
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()
    const plaidItems = userData.plaidItems || {}

    // If no Plaid items, return early
    if (Object.keys(plaidItems).length === 0) {
      console.log("No Plaid items found for user")
      return {
        success: false,
        error: "No connected accounts found",
      }
    }

    let totalTransactions = 0
    let hasError = false
    let errorMessage = ""

    // Process each Plaid item
    let allTransactions: any[] = []
    for (const [itemId, item] of Object.entries(plaidItems)) {
      const accessToken = (item as any).accessToken

      if (!accessToken) {
        console.warn(`Missing access token for item ${itemId}`)
        continue
      }

      console.log(`Refreshing transactions for item ${itemId}`)

      // Get the current date and 90 days ago
      const now = new Date()
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 90)

      // Format dates as YYYY-MM-DD
      const startDateString = startDate.toISOString().split("T")[0]
      const endDateString = now.toISOString().split("T")[0]

      try {
        const transactionsResult = await fetchTransactions(accessToken, startDateString, endDateString)

        if (transactionsResult.success) {
          // Make sure transactions is an array before accessing length
          const transactions = transactionsResult.transactions || []
          totalTransactions += transactions.length
          allTransactions = [...allTransactions, ...transactions]
        } else {
          hasError = true
          errorMessage = transactionsResult.error || "Failed to fetch transactions"
          console.error(`Failed to fetch transactions for item ${itemId}:`, errorMessage)
        }
      } catch (error: any) {
        hasError = true
        errorMessage = error.message || "Error processing transactions"
        console.error(`Error processing transactions for item ${itemId}:`, error)
      }
    }

    // If we have no transactions but there was an error, return the error
    if (allTransactions.length === 0 && hasError) {
      return {
        success: false,
        error: errorMessage || "Failed to fetch transactions",
      }
    }

    // If we have no transactions but no error, just return success with 0 transactions
    if (allTransactions.length === 0) {
      console.log("No transactions found for user")

      // Update the last sync time even if no transactions were found
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        plaidLastSync: serverTimestamp(),
      })

      return {
        success: true,
        transactionCount: 0,
        balancesUpdated: false,
        lastUpdated: new Date(),
        insights: {
          recurringTransactionsCount: 0,
          incomeSourcesCount: 0,
          detectedSubscriptionsCount: 0,
        },
      }
    }

    // Process and store the transactions
    try {
      const processResult = await processPlaidTransactions(userId, allTransactions)

      if (!processResult.success) {
        console.error("Failed to process transactions:", processResult.error)
        return {
          success: false,
          error: processResult.error,
        }
      }

      // Update budget categories with actual spending
      await updateBudgetCategoriesWithSpending(userId, processResult.transactions)

      // Detect and create subscriptions
      await detectAndCreateSubscriptions(userId, allTransactions)

      // Detect and create income sources
      await detectAndCreateIncomeSources(userId, allTransactions)

      // Generate financial insights
      const insights = generateFinancialInsights(processResult.transactions)

      // Update the user document with the new Plaid item
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        plaidLastSync: serverTimestamp(),
        plaidInsights: insights,
      })

      console.log(`Refreshed a total of ${totalTransactions} transactions`)

      // Revalidate paths to update UI
      revalidatePath("/dashboard")
      revalidatePath("/transactions")
      revalidatePath("/accounts")
      revalidatePath("/subscriptions")

      return {
        success: true,
        transactionCount: totalTransactions,
        balancesUpdated: true,
        lastUpdated: new Date(),
        insights: insights,
      }
    } catch (error: any) {
      console.error("Error processing financial data:", error)
      return {
        success: false,
        error: error.message || "Failed to process financial data",
      }
    }
  } catch (error: any) {
    console.error("Error refreshing financial data:", error)
    return {
      success: false,
      error: error.message || "Failed to refresh financial data",
    }
  }
}

// Get Plaid connection status
export async function getPlaidConnectionStatus(userId: string) {
  try {
    console.log(`Getting Plaid connection status for user ${userId}`)

    // Get user document to check if they have any Plaid items
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()
    const plaidItems = userData.plaidItems || {}

    // If no Plaid items, return early
    if (Object.keys(plaidItems).length === 0) {
      console.log("No Plaid items found for user")
      return {
        connected: false,
      }
    }

    // Get unique institutions
    const institutions = [...new Set(Object.values(plaidItems).map((item: any) => item.institutionName))].filter(
      Boolean,
    )

    return {
      connected: true,
      accountsCount: Object.keys(plaidItems).length,
      institutions,
      lastSync: userData.plaidLastSync ? userData.plaidLastSync.toDate() : null,
      insights: userData.plaidInsights || {
        recurringTransactionsCount: 0,
        incomeSourcesCount: 0,
        detectedSubscriptionsCount: 0,
      },
    }
  } catch (error: any) {
    console.error("Error getting Plaid connection status:", error)
    return {
      connected: false,
      error: error.message || "Failed to get Plaid connection status",
    }
  }
}

// Disconnect Plaid
export async function disconnectPlaid(userId: string, itemId: string) {
  try {
    console.log(`Disconnecting Plaid item ${itemId} for user ${userId}`)

    // Get user document to check if they have the Plaid item
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()
    const plaidItems = userData.plaidItems || {}

    // If the item doesn't exist, return early
    if (!plaidItems[itemId]) {
      console.log(`Plaid item ${itemId} not found for user`)
      return {
        success: false,
        error: "Plaid item not found",
      }
    }

    const accessToken = plaidItems[itemId].accessToken

    // Remove the item from Plaid
    await plaidClient.itemRemove({
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: accessToken,
    })

    // Remove the item from the user document
    delete plaidItems[itemId]

    // Update the user document
    await updateDoc(userRef, {
      plaidItems,
      hasPlaidConnection: Object.keys(plaidItems).length > 0,
    })

    console.log(`Disconnected Plaid item ${itemId} for user ${userId}`)

    // Revalidate paths to update UI
    revalidatePath("/dashboard")
    revalidatePath("/transactions")
    revalidatePath("/accounts")
    revalidatePath("/subscriptions")

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Error disconnecting Plaid:", error)
    return {
      success: false,
      error: error.message || "Failed to disconnect Plaid",
    }
  }
}
