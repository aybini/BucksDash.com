import { Configuration, PlaidApi, PlaidEnvironments, type CountryCode, type Products } from "plaid"
import { db } from "./firebase-init"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { processPlaidTransactions } from "./plaid-data-processor"

// Constants
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || ""
const PLAID_SECRET = process.env.PLAID_SECRET || ""
const PLAID_ENV = (process.env.PLAID_ENV || "production") as "sandbox" | "development" | "production"

// Configure Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
})

const plaidClient = new PlaidApi(configuration)

// Create a link token
export async function createLinkToken(userId: string, isUpdate = false, itemId?: string) {
  try {
    console.log(`Creating link token for user ${userId}, update: ${isUpdate}, itemId: ${itemId || "none"}`)

    // Create the request object
    const request: any = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      user: {
        client_user_id: userId,
      },
      client_name: "Rose Finance",
      products: ["transactions", "auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    }

    // Add webhook URL if available
    if (process.env.PLAID_WEBHOOK_URL) {
      request.webhook = process.env.PLAID_WEBHOOK_URL
    }

    // Add redirect URI if available
    if (process.env.PLAID_REDIRECT_URI) {
      request.redirect_uri = process.env.PLAID_REDIRECT_URI
    }

    // If this is an update, add the access_token
    if (isUpdate && itemId) {
      request.access_token = itemId
    }

    // Create the link token
    const response = await plaidClient.linkTokenCreate(request)

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
export async function exchangePublicToken(userId: string, publicToken: string, metadata: any) {
  try {
    console.log(`Exchanging public token for user ${userId}`)

    // Exchange the public token for an access token
    const response = await plaidClient.itemPublicTokenExchange({
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      public_token: publicToken,
    })

    const accessToken = response.data.access_token
    const itemId = response.data.item_id

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

// Fetch transactions for a specific item
async function fetchTransactions(userId: string, accessToken: string, itemId: string) {
  try {
    console.log(`Fetching transactions for user ${userId}, item ${itemId}`)

    // Get the current date
    const now = new Date()

    // Get transactions from the last 30 days
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 30)

    // Format dates as YYYY-MM-DD
    const startDateString = startDate.toISOString().split("T")[0]
    const endDateString = now.toISOString().split("T")[0]

    // Fetch transactions from Plaid
    const response = await plaidClient.transactionsGet({
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: accessToken,
      start_date: startDateString,
      end_date: endDateString,
    })

    const transactions = response.data.transactions

    console.log(`Retrieved ${transactions.length} transactions from Plaid`)

    // Process and store the transactions
    const result = await processPlaidTransactions(userId, transactions)

    // Update the last sync timestamp
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      [`plaidItems.${itemId}.lastUpdated`]: serverTimestamp(),
      plaidLastSync: serverTimestamp(),
    })

    return {
      success: true,
      count: result.transactions ? result.transactions.length : 0,
    }
  } catch (error: any) {
    console.error("Error fetching transactions:", error)

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
      error: error.message || "Failed to fetch transactions",
    }
  }
}

// Refresh transactions for a user
export async function refreshPlaidTransactions(userId: string) {
  try {
    console.log(`Refreshing transactions for user ${userId}`)

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

    // Process each Plaid item
    for (const [itemId, item] of Object.entries(plaidItems)) {
      const accessToken = (item as any).accessToken

      console.log(`Refreshing transactions for item ${itemId}`)
      const result = await fetchTransactions(userId, accessToken, itemId)
      if (result.success) {
        totalTransactions += result.count || 0
      }
    }

    console.log(`Refreshed a total of ${totalTransactions} transactions`)

    return {
      success: true,
      count: totalTransactions,
    }
  } catch (error: any) {
    console.error("Error refreshing transactions:", error)
    return {
      success: false,
      error: error.message || "Failed to refresh transactions",
    }
  }
}

// Function to check if a user has connected bank accounts
export async function checkPlaidConnection(userId: string) {
  // Define a fallback mechanism using direct Firestore access
  const checkConnectionFallback = async (userId: string) => {
    try {
      console.log("Using fallback method to check Plaid connection from Firestore");
      
      // Get user document to check if they have any Plaid items
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (!userDoc.exists()) {
        return {
          connected: false,
          accountsCount: 0,
          institutions: [],
          lastSync: null,
          error: "User not found"
        };
      }
      
      const userData = userDoc.data();
      const plaidItems = userData.plaidItems || {};
      const institutions: any[] = [];
      
      // Count the number of accounts and collect institution names
      let accountsCount = 0;
      
      for (const item of Object.values(plaidItems)) {
        const itemData = item as any;
        if (itemData.institution && !institutions.includes(itemData.institution)) {
          institutions.push(itemData.institution);
        }
        
        if (itemData.accounts && Array.isArray(itemData.accounts)) {
          accountsCount += itemData.accounts.length;
        }
      }
      
      return {
        connected: Object.keys(plaidItems).length > 0,
        accountsCount,
        institutions,
        lastSync: userData.plaidLastSync ? new Date(userData.plaidLastSync.toDate()) : null,
        error: ""
      };
    } catch (error: any) {
      console.error("Error in fallback connection check:", error);
      return {
        connected: false,
        accountsCount: 0,
        institutions: [],
        lastSync: null,
        error: error.message || "Failed to check connection status"
      };
    }
  };

  try {
    // Skip API call if no userId
    if (!userId) {
      console.warn("checkPlaidConnection called with empty userId");
      return {
        connected: false,
        accountsCount: 0,
        institutions: [],
        lastSync: null,
        error: "User ID is required"
      };
    }

    // First try using the API endpoint with timeout
    try {
      console.log("Checking Plaid connection via API endpoint");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced timeout to 5 seconds
      
      const response = await fetch(`/api/plaid/connection-status?userId=${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // If API call succeeds, use its result
      if (response.ok) {
        const data = await response.json();
        
        return {
          connected: data.success ? !!data.connected : false,
          accountsCount: data.accountsCount || 0,
          institutions: Array.isArray(data.institutions) ? data.institutions : [],
          lastSync: data.lastSync ? new Date(data.lastSync) : null,
          error: ""
        };
      }
      
      console.warn(`API returned status ${response.status}, using fallback method`);
      // If API call fails, use the fallback method
      return await checkConnectionFallback(userId);
      
    } catch (apiError: any) {
      console.warn("API call failed:", apiError.message || "Unknown error");
      console.log("Falling back to direct Firestore check");
      
      // If API call throws an error, use the fallback method
      return await checkConnectionFallback(userId);
    }
  } catch (error: any) {
    console.error("Error checking Plaid connection:", error);
    
    return {
      connected: false,
      accountsCount: 0,
      institutions: [],
      lastSync: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}