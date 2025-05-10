import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
  limit,
  writeBatch,
  setDoc,
  type Timestamp,
} from "firebase/firestore"
import { db } from "./firebase-init"
import { auth } from "./firebase-init"
import { deleteUser } from "firebase/auth"

// Types
export interface Transaction {
  id?: string
  description: string
  amount: number
  category: string
  date: Date | Timestamp
  type: "income" | "expense"
  notes?: string
  createdAt?: Timestamp
  userId?: string
}

// Updated BudgetCategory type with spent field
export interface BudgetCategory {
  id?: string
  name: string
  amount: number
  spent?: number
  color?: string
  userId?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  month?: number
  year?: number
}

export interface SavingsGoal {
  id?: string
  name: string
  category: string
  targetAmount: number
  currentAmount: number
  targetDate?: Date | Timestamp
  createdAt?: Timestamp
  userId?: string
  updatedAt?: Timestamp
}

export interface IncomeSource {
  id?: string
  name: string
  amount: number
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "annually"
  entryDate: Date | Timestamp
  notes?: string
  createdAt?: Timestamp
  userId?: string
  updatedAt?: Timestamp
}

export interface Subscription {
  id?: string
  name: string
  amount: number
  billingCycle: "weekly" | "monthly" | "quarterly" | "annually"
  category: string
  nextBillingDate: Date | Timestamp
  notes?: string
  createdAt?: Timestamp
  userId?: string
  updatedAt?: Timestamp
}

// Helper function to clean undefined values from objects before sending to Firestore
function cleanUndefinedValues<T>(obj: T): T {
  const cleanedObj = { ...obj }
  Object.keys(cleanedObj).forEach((key) => {
    if (cleanedObj[key] === undefined) {
      delete cleanedObj[key]
    }
  })
  return cleanedObj
}

// Transactions
export async function getTransactions(userId: string): Promise<Transaction[]> {
  const transactionsRef = collection(db, `users/${userId}/transactions`)
  const q = query(transactionsRef, orderBy("date", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    userId,
  })) as Transaction[]
}

export async function getRecentTransactions(userId: string, count = 5): Promise<Transaction[]> {
  const transactionsRef = collection(db, `users/${userId}/transactions`)
  const q = query(transactionsRef, orderBy("date", "desc"), limit(count))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    userId,
  })) as Transaction[]
}

export async function addTransaction(userId: string, transaction: Transaction): Promise<string> {
  const transactionsRef = collection(db, `users/${userId}/transactions`)
  // Clean undefined values before sending to Firestore
  const cleanedTransaction = cleanUndefinedValues({
    ...transaction,
    userId,
    createdAt: serverTimestamp(),
  })

  const docRef = await addDoc(transactionsRef, cleanedTransaction)
  return docRef.id
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  transaction: Transaction,
): Promise<void> {
  const transactionRef = doc(db, `users/${userId}/transactions/${transactionId}`)
  // Clean undefined values before sending to Firestore
  const cleanedTransaction = cleanUndefinedValues({
    ...transaction,
    userId,
    updatedAt: serverTimestamp(),
  })
  await updateDoc(transactionRef, cleanedTransaction)
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  const transactionRef = doc(db, `users/${userId}/transactions/${transactionId}`)
  await deleteDoc(transactionRef)
}

// Budget Categories
export async function getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
  const budgetCategoriesRef = collection(db, `users/${userId}/budgetCategories`)
  const querySnapshot = await getDocs(budgetCategoriesRef)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    userId,
  })) as BudgetCategory[]
}

export async function addBudgetCategory(userId: string, categoryData: Omit<BudgetCategory, "id">): Promise<string> {
  const budgetCategoriesRef = collection(db, `users/${userId}/budgetCategories`)
  const docRef = await addDoc(budgetCategoriesRef, {
    ...categoryData,
    userId,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateBudgetCategory(
  userId: string,
  categoryId: string,
  categoryData: Partial<BudgetCategory>,
): Promise<void> {
  const categoryRef = doc(db, `users/${userId}/budgetCategories/${categoryId}`)
  await updateDoc(categoryRef, {
    ...categoryData,
    userId,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteBudgetCategory(userId: string, categoryId: string): Promise<void> {
  const categoryRef = doc(db, `users/${userId}/budgetCategories/${categoryId}`)
  await deleteDoc(categoryRef)
}

// Savings Goals
export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  const goalsRef = collection(db, `users/${userId}/savingsGoals`)
  const snapshot = await getDocs(goalsRef)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    userId,
  })) as SavingsGoal[]
}

export async function addSavingsGoal(userId: string, goal: SavingsGoal): Promise<string> {
  const goalsRef = collection(db, `users/${userId}/savingsGoals`)
  // Clean undefined values before sending to Firestore
  const cleanedGoal = cleanUndefinedValues({
    ...goal,
    userId,
    createdAt: serverTimestamp(),
  })

  const docRef = await addDoc(goalsRef, cleanedGoal)
  return docRef.id
}

export async function updateSavingsGoal(userId: string, goalId: string, goal: SavingsGoal): Promise<void> {
  const goalRef = doc(db, `users/${userId}/savingsGoals/${goalId}`)
  // Clean undefined values before sending to Firestore
  const cleanedGoal = cleanUndefinedValues({
    ...goal,
    userId,
    updatedAt: serverTimestamp(),
  })
  await updateDoc(goalRef, cleanedGoal)
}

export async function deleteSavingsGoal(userId: string, goalId: string): Promise<void> {
  const goalRef = doc(db, `users/${userId}/savingsGoals/${goalId}`)
  await deleteDoc(goalRef)
}

// Income Sources
export async function getIncomeSources(userId: string): Promise<IncomeSource[]> {
  const sourcesRef = collection(db, `users/${userId}/incomeSources`)
  const snapshot = await getDocs(sourcesRef)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    userId,
  })) as IncomeSource[]
}

export async function addIncomeSource(userId: string, source: IncomeSource): Promise<string> {
  const sourcesRef = collection(db, `users/${userId}/incomeSources`)
  // Clean undefined values before sending to Firestore
  const cleanedSource = cleanUndefinedValues({
    ...source,
    userId,
    createdAt: serverTimestamp(),
  })

  const docRef = await addDoc(sourcesRef, cleanedSource)
  return docRef.id
}

export async function updateIncomeSource(userId: string, sourceId: string, source: IncomeSource): Promise<void> {
  const sourceRef = doc(db, `users/${userId}/incomeSources/${sourceId}`)
  // Clean undefined values before sending to Firestore
  const cleanedSource = cleanUndefinedValues({
    ...source,
    userId,
    updatedAt: serverTimestamp(),
  })
  await updateDoc(sourceRef, cleanedSource)
}

export async function deleteIncomeSource(userId: string, sourceId: string): Promise<void> {
  const sourceRef = doc(db, `users/${userId}/incomeSources/${sourceId}`)
  await deleteDoc(sourceRef)
}

// Subscriptions
export async function getSubscriptions(userId: string): Promise<Subscription[]> {
  const subscriptionsRef = collection(db, `users/${userId}/subscriptions`)
  const q = query(subscriptionsRef, orderBy("nextBillingDate", "asc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    userId,
  })) as Subscription[]
}

export async function addSubscription(userId: string, subscription: Subscription): Promise<string> {
  const subscriptionsRef = collection(db, `users/${userId}/subscriptions`)
  // Clean undefined values before sending to Firestore
  const cleanedSubscription = cleanUndefinedValues({
    ...subscription,
    userId,
    createdAt: serverTimestamp(),
  })

  const docRef = await addDoc(subscriptionsRef, cleanedSubscription)
  return docRef.id
}

export async function updateSubscription(
  userId: string,
  subscriptionId: string,
  subscription: Subscription,
): Promise<void> {
  const subscriptionRef = doc(db, `users/${userId}/subscriptions/${subscriptionId}`)
  // Clean undefined values before sending to Firestore
  const cleanedSubscription = cleanUndefinedValues({
    ...subscription,
    userId,
    updatedAt: serverTimestamp(),
  })
  await updateDoc(subscriptionRef, cleanedSubscription)
}

export async function deleteSubscription(userId: string, subscriptionId: string): Promise<void> {
  const subscriptionRef = doc(db, `users/${userId}/subscriptions/${subscriptionId}`)
  await deleteDoc(subscriptionRef)
}

// User Preferences
export interface UserPreferences {
  theme?: "light" | "dark" | "system"
  currency?: string
  notificationsEnabled?: boolean
  emailNotifications?: boolean
  pushNotifications?: boolean
  offlineMode?: boolean
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const userDocRef = doc(db, `users/${userId}`)
  const docSnap = await getDoc(userDocRef)

  if (docSnap.exists() && docSnap.data().preferences) {
    return docSnap.data().preferences as UserPreferences
  }

  return {
    theme: "system",
    currency: "USD",
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: false,
    offlineMode: false,
  }
}

export async function setUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  const userDocRef = doc(db, `users/${userId}`)
  // Clean undefined values before sending to Firestore
  const cleanedPreferences = cleanUndefinedValues(preferences)
  await updateDoc(userDocRef, { preferences: cleanedPreferences })
}

// Initialize user data
export async function initializeUserData(
  userId: string,
  userData: {
    name: string
    email: string
    plan?: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    subscriptionStatus?: string
  },
): Promise<void> {
  // Use setDoc instead of updateDoc to create the document if it doesn't exist
  const userDocRef = doc(db, `users/${userId}`)

  const isPremium = userData.plan === "premium"

  await setDoc(
    userDocRef,
    {
      ...userData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      plan: userData.plan || "basic",
      onboardingCompleted: false,
      subscription: isPremium
        ? {
            customerId: userData.stripeCustomerId,
            subscriptionId: userData.stripeSubscriptionId,
            status: userData.subscriptionStatus || "active",
            createdAt: serverTimestamp(),
          }
        : null,
      preferences: {
        theme: "system",
        currency: "USD",
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: false,
        offlineMode: false,
      },
    },
    { merge: true },
  ) // Use merge: true to update the document if it already exists

  // Create default budget categories
  const defaultCategories = [
    { name: "Housing", amount: 1000, spent: 0 },
    { name: "Food", amount: 400, spent: 0 },
    { name: "Transportation", amount: 200, spent: 0 },
    { name: "Entertainment", amount: 100, spent: 0 },
    { name: "Utilities", amount: 150, spent: 0 },
  ]

  const batch = writeBatch(db)
  defaultCategories.forEach((category) => {
    batch.set(doc(collection(db, `users/${userId}/budgetCategories`), category.name), {
      ...category,
      userId,
      createdAt: serverTimestamp(),
    })
  })
  await batch.commit()

  // Create default savings goal
  await addSavingsGoal(userId, {
    name: "Emergency Fund",
    category: "emergency",
    targetAmount: 5000,
    currentAmount: 0,
    userId,
  })
}

// Add new functions for managing subscriptions

export async function getSubscriptionDetails(userId: string) {
  try {
    const userDocRef = doc(db, `users/${userId}`)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists() && userDoc.data().subscription) {
      return userDoc.data().subscription
    }

    return null
  } catch (error) {
    console.error("Error getting subscription details:", error)
    throw error
  }
}

export async function updateSubscriptionStatus(userId: string, status: string) {
  try {
    const userDocRef = doc(db, `users/${userId}`)
    await updateDoc(userDocRef, {
      "subscription.status": status,
      "subscription.updatedAt": serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating subscription status:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    // Query Firestore to find a user with the given email
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // Return the first matching user
      const userDoc = querySnapshot.docs[0]
      return {
        uid: userDoc.id,
        ...userDoc.data(),
      }
    }

    return null
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return null
  }
}

// Function to update a user's subscription information
export async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    customerId: string
    subscriptionId: string
    status: string
  },
) {
  try {
    const userDocRef = doc(db, `users/${userId}`)

    await updateDoc(userDocRef, {
      plan: "premium",
      subscription: {
        customerId: subscriptionData.customerId,
        subscriptionId: subscriptionData.subscriptionId,
        status: subscriptionData.status,
        createdAt: serverTimestamp(),
      },
    })

    return true
  } catch (error) {
    console.error("Error updating user subscription:", error)
    throw error
  }
}

// Function to delete a user account and all associated data
export async function deleteUserAccount(userId: string): Promise<void> {
  if (!auth || !db) {
    throw new Error("Firebase services not initialized")
  }

  if (!auth.currentUser) {
    throw new Error("No user is currently signed in")
  }

  if (auth.currentUser.uid !== userId) {
    throw new Error("You can only delete your own account")
  }

  try {
    console.log(`Starting deletion of user account ${userId}`)

    // Define subcollections under the user document
    const subcollections = [
      "transactions",
      "budgetCategories",
      "savingsGoals",
      "incomeSources",
      "subscriptions",
      "bills",
      "accounts",
      "plaidItems",
    ]

    // Delete data from each subcollection
    for (const subcollectionName of subcollections) {
      await deleteUserSubcollection(userId, subcollectionName)
    }

    // Delete the main user document
    const userDocRef = doc(db, "users", userId)
    await deleteDoc(userDocRef)
    console.log(`Deleted user document for ${userId}`)

    // Delete the user authentication account
    await deleteUser(auth.currentUser)
    console.log(`Deleted authentication account for ${userId}`)
  } catch (error) {
    console.error("Error deleting user account:", error)
    throw error
  }
}

// Helper function to delete a subcollection under a user document
async function deleteUserSubcollection(userId: string, subcollectionName: string): Promise<void> {
  try {
    console.log(`Deleting data from ${subcollectionName} for user ${userId}`)

    // Get all documents in the subcollection
    const subcollectionRef = collection(db, `users/${userId}/${subcollectionName}`)
    const querySnapshot = await getDocs(subcollectionRef)

    if (querySnapshot.empty) {
      console.log(`No documents found in ${subcollectionName} for user ${userId}`)
      return
    }

    // Delete each document in the subcollection
    const batch = writeBatch(db)
    let count = 0

    querySnapshot.forEach((document) => {
      batch.delete(doc(db, `users/${userId}/${subcollectionName}`, document.id))
      count++

      // Firestore batches are limited to 500 operations
      if (count >= 450) {
        // Commit the current batch and start a new one
        batch.commit()
        count = 0
      }
    })

    // Commit any remaining operations
    if (count > 0) {
      await batch.commit()
    }

    console.log(`Deleted ${querySnapshot.size} documents from ${subcollectionName}`)
  } catch (error) {
    console.error(`Error deleting data from ${subcollectionName}:`, error)
    // Continue with other collections even if one fails
  }
}

// Enhance the syncPendingChanges function to be more robust
export async function getUserTransactions(userId: string, startDate: number): Promise<Transaction[]> {
  const transactionsRef = collection(db, `users/${userId}/transactions`)
  const q = query(transactionsRef, where("date", ">=", new Date(startDate)), orderBy("date", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    userId,
  })) as Transaction[]
}

// Add this function to the existing file
export async function updateUserData(userId: string, data: any): Promise<void> {
  const userDocRef = doc(db, `users/${userId}`)
  await updateDoc(userDocRef, data)
}

// Add this function to get user data
export async function getUserData(userId: string) {
  try {
    const userDocRef = doc(db, `users/${userId}`)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      return userDoc.data()
    }

    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    throw error
  }
}

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const subscriptionsRef = collection(db, `users/${userId}/subscriptions`)
  const q = query(subscriptionsRef, orderBy("nextBillingDate", "asc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Subscription[]
}

export async function cancelSubscription(userId: string, subscriptionId: string) {
  try {
    const subscriptionRef = doc(db, `users/${userId}/subscriptions/${subscriptionId}`)
    await updateDoc(subscriptionRef, { status: "canceled", canceledAt: serverTimestamp() })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    throw error
  }
}

export async function syncPendingChanges(userId: string) {
  // Placeholder for syncing pending changes
  console.log("Syncing pending changes for user:", userId)
}

export function checkNetworkStatus(): boolean {
  return navigator.onLine
}

export async function reconnectToFirestore() {
  // Placeholder for reconnecting to Firestore
  console.log("Reconnecting to Firestore...")
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("Reconnection complete")
}
