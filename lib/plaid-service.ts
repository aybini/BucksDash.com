import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

// Constants
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || ""
const PLAID_SECRET = process.env.PLAID_SECRET || ""
const PLAID_ENV = (process.env.PLAID_ENV || "production") as "sandbox" | "development" | "production"

// Configure Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
})

const plaidClient = new PlaidApi(configuration)

// Fetch transactions from Plaid
export async function fetchTransactions(accessToken: string, startDate: string, endDate: string) {
  try {
    console.log(`Fetching transactions from ${startDate} to ${endDate}`)

    const request = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        include_personal_finance_category: true,
      },
    }

    const response = await plaidClient.transactionsGet(request)

    // Make sure response.data and response.data.transactions exist
    if (!response.data || !response.data.transactions) {
      console.log("No transactions found or invalid response")
      return {
        success: true,
        transactions: [],
      }
    }

    console.log(`Found ${response.data.transactions.length} transactions`)

    return {
      success: true,
      transactions: response.data.transactions,
    }
  } catch (error: any) {
    console.error("Error fetching transactions:", error)

    if (error.response && error.response.data) {
      const plaidError = error.response.data
      console.error("Plaid API error:", plaidError)
      return {
        success: false,
        error: `Plaid API error: ${plaidError.error_message || plaidError.error_code}`,
        transactions: [],
      }
    }

    return {
      success: false,
      error: error.message || "Failed to fetch transactions",
      transactions: [],
    }
  }
}

// Fetch account balances from Plaid
export async function fetchAccountBalances(accessToken: string) {
  try {
    console.log("Fetching account balances")

    const request = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: accessToken,
    }

    const response = await plaidClient.accountsGet(request)

    // Make sure response.data and response.data.accounts exist
    if (!response.data || !response.data.accounts) {
      console.log("No accounts found or invalid response")
      return {
        success: true,
        accounts: [],
      }
    }

    console.log(`Found ${response.data.accounts.length} accounts`)

    return {
      success: true,
      accounts: response.data.accounts,
    }
  } catch (error: any) {
    console.error("Error fetching account balances:", error)

    if (error.response && error.response.data) {
      const plaidError = error.response.data
      console.error("Plaid API error:", plaidError)
      return {
        success: false,
        error: `Plaid API error: ${plaidError.error_message || plaidError.error_code}`,
        accounts: [],
      }
    }

    return {
      success: false,
      error: error.message || "Failed to fetch account balances",
      accounts: [],
    }
  }
}

// Detect recurring transactions (subscriptions)
export function detectRecurringTransactions(transactions: any[]) {
  // This is a placeholder for a more sophisticated algorithm
  // In a real implementation, you would use a more advanced algorithm to detect recurring transactions

  const recurringTransactions = transactions.filter((transaction) => {
    // Look for common subscription keywords in the name
    const name = transaction.name?.toLowerCase() || ""
    return (
      name.includes("subscription") ||
      name.includes("netflix") ||
      name.includes("spotify") ||
      name.includes("hulu") ||
      name.includes("disney") ||
      name.includes("apple") ||
      name.includes("google") ||
      name.includes("amazon prime") ||
      name.includes("gym") ||
      name.includes("membership")
    )
  })

  return recurringTransactions
}

// Create subscriptions from recurring transactions
export async function createSubscriptionsFromRecurring(userId: string, recurringTransactions: any[]) {
  // This is a placeholder for a more sophisticated algorithm
  // In a real implementation, you would create subscription records in your database

  console.log(`Found ${recurringTransactions.length} potential subscriptions`)

  // Return the subscriptions
  return {
    success: true,
    subscriptions: recurringTransactions,
  }
}

// Detect income sources
export function detectIncomeSources(transactions: any[]) {
  // This is a placeholder for a more sophisticated algorithm
  // In a real implementation, you would use a more advanced algorithm to detect income sources

  const incomeSources = transactions.filter((transaction) => {
    // Look for income transactions (positive amounts)
    return transaction.amount < 0
  })

  return incomeSources
}
