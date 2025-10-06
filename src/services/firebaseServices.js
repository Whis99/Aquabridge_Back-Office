// src/services/firebaseQueries.js
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, addDoc, deleteDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

// Get all users
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap;
}

// Get all active users
export async function getAllActiveUsers() {
  const q = query(collection(db, "users"), where("account_status", "==", "active"));
  const snap = await getDocs(q);
  return snap;
}

// Get all pending users
export async function getAllPendingUsers() {
  const q = query(collection(db, "users"), where("account_status", "==", "pending"));
  const snap = await getDocs(q);
  return snap;
}

// Get count of users by role
export async function getAllActiveUserByRole(role) {
  const q = query(collection(db, "users"), where("role", "==", role));
  const snap = await getDocs(q);
  return snap;
}

// Get pending users by role
export async function getPendingUsersByRole(role) {
  const q = query(collection(db, "users"), where("role", "==", role), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap;
}

// Get all transactions
export async function getAllTransactions() {
  const q = query(collection(db, "transactions"));
  const snap = await getDocs(q);
  return snap;
}

// Get transactions by date
export async function getTransactionsByDate(date) {
  const q = query(collection(db, "transactions"), where("created_at", "==", date));
  const snap = await getDocs(q);
  return snap;
}
// Get pending orders count
export async function getPendingOrders() {
  const q = query(collection(db, "orders"), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap;
}

// Get pending withdrawals count
export async function getPendingWithdrawals() {
  const q = query(collection(db, "withdrawals"), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap;
}

// Get total revenue from transactions
export async function getTotalRevenue() {
  const q = query(collection(db, "transactions"));
  const snap = await getDocs(q);
  return snap;
}

// Get all orders for revenue calculation (legacy - use getAllOrders from Orders functions below)

// Get completed orders
export async function getCompletedOrders() {
  const q = query(collection(db, "orders"), where("status", "==", "completed"));
  const snap = await getDocs(q);
  return snap;
}

// Get users by role
export async function getUsersByRole(role) {
  const q = query(collection(db, "users"), where("role", "==", role));
  const snap = await getDocs(q);
  return snap;
}

// Get user details from specific collection by user_id
export async function getUserDetails(collectionName, userId) {
  const q = query(collection(db, collectionName), where("user_id", "==", userId));
  const snap = await getDocs(q);
  return snap;
}

// Get transactions by status
export async function getTransactionsByStatus(status) {
  const q = query(collection(db, "transactions"), where("status", "==", status));
  const snap = await getDocs(q);
  return snap;
}

// Get transactions by type
export async function getTransactionsByType(transactionType) {
  const q = query(collection(db, "transactions"), where("transaction_type", "==", transactionType));
  const snap = await getDocs(q);
  return snap;
}

// Get transactions by date range
export async function getTransactionsByDateRange(startDate, endDate) {
  const q = query(
    collection(db, "transactions"),
    where("createdAt", ">=", startDate),
    where("createdAt", "<=", endDate)
  );
  const snap = await getDocs(q);
  return snap;
}

// Update user status
export async function updateUserStatus(userId, newStatus) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    account_status: newStatus,
    updatedAt: new Date()
  });
}

// Get user by ID
export async function getUserById(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap;
}

// Orders functions
export async function getAllOrders() {
  const ordersRef = collection(db, "orders");
  const ordersSnap = await getDocs(ordersRef);
  return ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getOrdersByStatus(status) {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("status", "==", status));
  const ordersSnap = await getDocs(q);
  return ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getOrdersByDateRange(startDate, endDate) {
  const ordersRef = collection(db, "orders");
  const q = query(
    ordersRef,
    where("createdAt", ">=", startDate),
    where("createdAt", "<=", endDate)
  );
  const ordersSnap = await getDocs(q);
  return ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getOrdersByClient(clientId) {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("client_id", "==", clientId));
  const ordersSnap = await getDocs(q);
  return ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getOrdersByCollectionCenter(collectionCenterId) {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("collection_center_id", "==", collectionCenterId));
  const ordersSnap = await getDocs(q);
  return ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ==================== EXCHANGE RATE MANAGEMENT FUNCTIONS ====================

// Get current exchange rate
export async function getCurrentExchangeRate() {
  try {
    const exchangeRateRef = doc(db, "exchange_rate", "USD-HTG");
    const exchangeRateSnap = await getDoc(exchangeRateRef);
    
    if (exchangeRateSnap.exists()) {
      return { 
        success: true, 
        data: { id: exchangeRateSnap.id, ...exchangeRateSnap.data() } 
      };
    } else {
      return { 
        success: false, 
        message: "Exchange rate not found" 
      };
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return { 
      success: false, 
      error: error.message,
      message: "Failed to fetch exchange rate" 
    };
  }
}

// Update exchange rate and create history entry
export async function updateExchangeRate(newRate, updatedBy) {
  try {
    const now = new Date();
    
    // Get current rate for history
    const currentRateData = await getCurrentExchangeRate();
    if (!currentRateData.success) {
      return { 
        success: false, 
        message: "Could not fetch current rate" 
      };
    }
    
    const oldRate = currentRateData.data.currentRate;
    
    // Update the main exchange rate document
    const exchangeRateRef = doc(db, "exchange_rate", "USD-HTG");
    await updateDoc(exchangeRateRef, {
      currentRate: parseFloat(newRate),
      updatedAt: now,
      updatedBy: updatedBy
    });
    
    // Create history entry in subcollection
    const historyId = `EXC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    
    const historyRef = doc(db, "exchange_rate", "USD-HTG", "history", historyId);
    await setDoc(historyRef, {
      oldRate: oldRate,
      newRate: parseFloat(newRate),
      changedBy: updatedBy,
      changedAt: now
    });
    
    return { 
      success: true, 
      message: "Exchange rate updated successfully",
      oldRate: oldRate,
      newRate: parseFloat(newRate)
    };
  } catch (error) {
    console.error("Error updating exchange rate:", error);
    return { 
      success: false, 
      error: error.message,
      message: "Failed to update exchange rate" 
    };
  }
}

// Get exchange rate history
export async function getExchangeRateHistory() {
  try {
    const historyRef = collection(db, "exchange_rate", "USD-HTG", "history");
    const historySnap = await getDocs(query(historyRef, orderBy("changedAt", "desc")));
    
    const historyData = historySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { 
      success: true, 
      data: historyData 
    };
  } catch (error) {
    console.error("Error fetching exchange rate history:", error);
    return { 
      success: false, 
      error: error.message,
      message: "Failed to fetch exchange rate history" 
    };
  }
}

// ==================== ADMIN MANAGEMENT FUNCTIONS ====================

// Get all admins
export async function getAllAdmins() {
  const snap = await getDocs(collection(db, "admins"));
  return snap;
}

// Get admin by ID
export async function getAdminById(adminId) {
  const adminRef = doc(db, "admins", adminId);
  const adminSnap = await getDoc(adminRef);
  if (adminSnap.exists()) {
    return { id: adminSnap.id, ...adminSnap.data() };
  }
  return null;
}

// Create new admin (adds to both admins and users collections and Firebase Auth)
export async function createAdmin(adminData) {
  try {
    // Generate custom admin ID: ADM-yearmonthday-secondsnanoseconds (2 digits seconds, 3 digits nanoseconds)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const seconds = String(Math.floor(now.getTime() / 1000)).slice(-2); // Last 2 digits of seconds
    const nanoseconds = String(now.getTime() % 1000).padStart(3, '0'); // 3 digits for milliseconds (as nanoseconds)
    const adminId = `ADM-${year}${month}${day}-${seconds}${nanoseconds}`;

    // Create Firebase Authentication user first
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminData.email, 
      adminData.default_password || "admin123"
    );
    const firebaseUser = userCredential.user;

    // Prepare admin data for admins collection
    const adminDocData = {
      admin_id: adminId,
      name: adminData.name,
      email: adminData.email,
      account_status: "active", // Always active by default
      created_at: now,
      updated_at: now
    };

    // Add to admins collection with custom ID
    const adminRef = doc(db, "admins", adminId);
    await setDoc(adminRef, adminDocData);

    // Add to users collection using Firebase Auth UID as document ID
    const userDocData = {
      user_id: adminId,
      name: adminData.name,
      email: adminData.email,
      role: "admin",
      account_status: "active", // Always active by default
      created_at: now,
      updated_at: now
    };

    // Use Firebase Auth UID as the document ID
    const userRef = doc(db, "users", firebaseUser.uid);
    await setDoc(userRef, userDocData);

    return { 
      success: true, 
      adminId: adminId,
      userId: firebaseUser.uid, // Firebase Auth UID is now the document ID
      firebaseUid: firebaseUser.uid,
      message: "Admin created successfully with Firebase Authentication" 
    };
  } catch (error) {
    console.error("Error creating admin:", error);
    
    // Handle specific Firebase Auth errors
    let errorMessage = "Failed to create admin";
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = "Invalid email address format";
        break;
      case 'auth/email-already-in-use':
        errorMessage = "Email address is already in use";
        break;
      case 'auth/weak-password':
        errorMessage = "Password is too weak. Please use at least 6 characters";
        break;
      case 'auth/operation-not-allowed':
        errorMessage = "Email/password accounts are not enabled";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Network error. Please check your connection";
        break;
      default:
        errorMessage = error.message || "An unexpected error occurred";
    }
    
    return { 
      success: false, 
      error: error.code,
      message: errorMessage 
    };
  }
}

// Update admin status
export async function updateAdminStatus(adminId, newStatus) {
  try {
    // Update in admins collection
    const adminRef = doc(db, "admins", adminId);
    await updateDoc(adminRef, {
      account_status: newStatus,
      updated_at: new Date()
    });

    // Find and update in users collection using user_id field
    const usersQuery = query(collection(db, "users"), where("user_id", "==", adminId));
    const usersSnap = await getDocs(usersQuery);
    
    if (!usersSnap.empty) {
      const userDoc = usersSnap.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        account_status: newStatus,
        updated_at: new Date()
      });
    }

    return { 
      success: true, 
      message: `Admin status updated to ${newStatus}` 
    };
  } catch (error) {
    console.error("Error updating admin status:", error);
    return { 
      success: false, 
      error: error.message,
      message: "Failed to update admin status" 
    };
  }
}

// Delete admin (removes from both collections)
export async function deleteAdmin(adminId) {
  try {
    // Delete from admins collection
    const adminRef = doc(db, "admins", adminId);
    await deleteDoc(adminRef);

    // Find and delete from users collection using user_id field
    const usersQuery = query(collection(db, "users"), where("user_id", "==", adminId));
    const usersSnap = await getDocs(usersQuery);
    
    if (!usersSnap.empty) {
      const userDoc = usersSnap.docs[0];
      await deleteDoc(doc(db, "users", userDoc.id));
    }

    return { 
      success: true, 
      message: "Admin deleted successfully" 
    };
  } catch (error) {
    console.error("Error deleting admin:", error);
    return { 
      success: false, 
      error: error.message,
      message: "Failed to delete admin" 
    };
  }
}

// Update admin details
export async function updateAdminDetails(adminId, updateData) {
  try {
    const now = new Date();
    
    // Update in admins collection
    const adminRef = doc(db, "admins", adminId);
    await updateDoc(adminRef, {
      ...updateData,
      updated_at: now
    });

    // Find and update in users collection using user_id field
    const usersQuery = query(collection(db, "users"), where("user_id", "==", adminId));
    const usersSnap = await getDocs(usersQuery);
    
    if (!usersSnap.empty) {
      const userDoc = usersSnap.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        name: updateData.name,
        email: updateData.email,
        account_status: updateData.account_status,
        updated_at: now
      });
    }

    return { 
      success: true, 
      message: "Admin details updated successfully" 
    };
  } catch (error) {
    console.error("Error updating admin details:", error);
    return { 
      success: false, 
      error: error.message,
      message: "Failed to update admin details" 
    };
  }
}

// ==================== STOCK MANAGEMENT FUNCTIONS ====================

// Get all stocks from the stocks collection
export const getAllStocks = async () => {
  try {
    const stocksRef = collection(db, "stocks");
    const snapshot = await getDocs(stocksRef);
    return snapshot;
  } catch (error) {
    console.error("Error fetching stocks:", error);
    throw error;
  }
};

// Get stock by entity ID
export const getStockByEntityId = async (entityId) => {
  try {
    const stockRef = doc(db, "stocks", entityId);
    const stockDoc = await getDoc(stockRef);
    
    if (stockDoc.exists()) {
      return { success: true, data: { id: stockDoc.id, ...stockDoc.data() } };
    } else {
      return { success: false, message: "Stock not found" };
    }
  } catch (error) {
    console.error("Error fetching stock:", error);
    return { success: false, message: "Failed to fetch stock" };
  }
};

// Get entity details by ID (from users collection)
export const getEntityDetails = async (entityId) => {
  try {
    // Try to find in users collection by user_id
    const usersQuery = query(collection(db, "users"), where("user_id", "==", entityId));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { success: false, message: "Entity not found" };
    }
  } catch (error) {
    console.error("Error fetching entity details:", error);
    return { success: false, message: "Failed to fetch entity details" };
  }
};

// Update stock data
export const updateStock = async (entityId, stockData) => {
  try {
    const stockRef = doc(db, "stocks", entityId);
    await updateDoc(stockRef, {
      ...stockData,
      lastUpdated: new Date()
    });
    return { success: true, message: "Stock updated successfully" };
  } catch (error) {
    console.error("Error updating stock:", error);
    return { success: false, message: "Failed to update stock" };
  }
};



