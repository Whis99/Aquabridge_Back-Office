// src/services/firebaseQueries.js
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, addDoc, deleteDoc, setDoc, orderBy, limit as limitQuery, runTransaction } from "firebase/firestore";
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

// ==================== EEL PRICE MANAGEMENT FUNCTIONS ====================

// Get all eel prices from the eel_prices collection
export const getAllEelPrices = async () => {
  try {
    const eelPricesRef = collection(db, "eel_prices");
    const snapshot = await getDocs(eelPricesRef);
    return snapshot;
  } catch (error) {
    console.error("Error fetching eel prices:", error);
    throw error;
  }
};

// Get active eel price
export const getActiveEelPrice = async (currency = "USD") => {
  try {
    const eelPricesQuery = query(
      collection(db, "eel_prices"),
      where("isActive", "==", true),
      where("currency", "==", currency)
    );
    const snapshot = await getDocs(eelPricesQuery);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { success: true, data: { id: doc.id, ...doc.data() } };
    } else {
      return { success: false, message: "No active eel price found" };
    }
  } catch (error) {
    console.error("Error fetching active eel price:", error);
    return { success: false, message: "Failed to fetch active eel price" };
  }
};

// Get eel price by ID
export const getEelPriceById = async (priceId) => {
  try {
    const eelPriceRef = doc(db, "eel_prices", priceId);
    const eelPriceDoc = await getDoc(eelPriceRef);
    
    if (eelPriceDoc.exists()) {
      return { success: true, data: { id: eelPriceDoc.id, ...eelPriceDoc.data() } };
    } else {
      return { success: false, message: "Eel price not found" };
    }
  } catch (error) {
    console.error("Error fetching eel price:", error);
    return { success: false, message: "Failed to fetch eel price" };
  }
};

// Create new eel price
export const createEelPrice = async (priceData, adminId = "ADM-202509-1344") => {
  try {
    // Generate custom ID: EEL-YYYYMMDD-HHMMSS
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const customId = `EEL-${year}${month}${day}-${hours}${minutes}${seconds}`;
    
    // Calculate price per gram
    const pricePerGram = priceData.pricePerKg / 1000;
    
    const eelPriceData = {
      pricePerKg: parseFloat(priceData.pricePerKg),
      pricePerGram: parseFloat(pricePerGram.toFixed(4)),
      currency: priceData.currency || "USD",
      isActive: priceData.isActive !== undefined ? priceData.isActive : true,
      createdBy: adminId,
      createdAt: new Date(),
      updatedBy: adminId,
      updatedAt: new Date(),
      notes: priceData.notes || ""
    };

    // If this price is being set as active, deactivate all other prices for this currency
    if (eelPriceData.isActive) {
      await deactivateOldEelPrices(priceData.currency, adminId);
    }

    // Create the new eel price document
    await setDoc(doc(db, "eel_prices", customId), eelPriceData);
    
    return { 
      success: true, 
      message: "Eel price created successfully",
      data: { id: customId, ...eelPriceData }
    };
  } catch (error) {
    console.error("Error creating eel price:", error);
    return { success: false, message: "Failed to create eel price" };
  }
};

// Update eel price
export const updateEelPrice = async (priceId, updateData, adminId = "ADM-202509-1344") => {
  try {
    const eelPriceRef = doc(db, "eel_prices", priceId);
    const eelPriceDoc = await getDoc(eelPriceRef);
    
    if (!eelPriceDoc.exists()) {
      return { success: false, message: "Eel price not found" };
    }

    const updateFields = {
      updatedBy: adminId,
      updatedAt: new Date()
    };

    // Update price per kg and recalculate price per gram
    if (updateData.pricePerKg !== undefined) {
      updateFields.pricePerKg = parseFloat(updateData.pricePerKg);
      updateFields.pricePerGram = parseFloat((updateData.pricePerKg / 1000).toFixed(4));
    }

    // Update other fields
    if (updateData.currency !== undefined) updateFields.currency = updateData.currency;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
    if (updateData.notes !== undefined) updateFields.notes = updateData.notes;

    // If this price is being set as active, deactivate all other prices for this currency
    if (updateFields.isActive) {
      const currentData = eelPriceDoc.data();
      await deactivateOldEelPrices(currentData.currency, adminId, priceId);
    }

    await updateDoc(eelPriceRef, updateFields);
    
    return { success: true, message: "Eel price updated successfully" };
  } catch (error) {
    console.error("Error updating eel price:", error);
    return { success: false, message: "Failed to update eel price" };
  }
};

// Delete eel price
export const deleteEelPrice = async (priceId) => {
  try {
    const eelPriceRef = doc(db, "eel_prices", priceId);
    await deleteDoc(eelPriceRef);
    
    return { success: true, message: "Eel price deleted successfully" };
  } catch (error) {
    console.error("Error deleting eel price:", error);
    return { success: false, message: "Failed to delete eel price" };
  }
};

// Helper function to deactivate old eel prices
const deactivateOldEelPrices = async (currency, adminId, excludeId = null) => {
  try {
    const eelPricesQuery = query(
      collection(db, "eel_prices"),
      where("isActive", "==", true),
      where("currency", "==", currency)
    );
    const snapshot = await getDocs(eelPricesQuery);
    
    const updatePromises = [];
    snapshot.docs.forEach(doc => {
      if (doc.id !== excludeId) {
        updatePromises.push(
          updateDoc(doc.ref, {
            isActive: false,
            updatedBy: adminId,
            updatedAt: new Date()
          })
        );
      }
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error deactivating old eel prices:", error);
    throw error;
  }
};

// Get eel price history
export const getEelPriceHistory = async (currency = null, limit = 50) => {
  try {
    let eelPricesQuery = collection(db, "eel_prices");
    
    if (currency) {
      eelPricesQuery = query(
        collection(db, "eel_prices"),
        where("currency", "==", currency)
      );
    }
    
    const snapshot = await getDocs(eelPricesQuery);
    const prices = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      .slice(0, limit);
    
    return { success: true, data: prices };
  } catch (error) {
    console.error("Error fetching eel price history:", error);
    return { success: false, message: "Failed to fetch eel price history" };
  }
};

// ==================== BENEFIT SETTINGS MANAGEMENT FUNCTIONS ====================

// Get all benefit settings
export const getAllBenefitSettings = async () => {
  try {
    const benefitSettingsRef = collection(db, "benefit_settings");
    const snapshot = await getDocs(benefitSettingsRef);
    
    const settings = {};
    snapshot.docs.forEach(doc => {
      settings[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    return { success: true, data: settings };
  } catch (error) {
    console.error("Error fetching benefit settings:", error);
    return { success: false, message: "Failed to fetch benefit settings" };
  }
};

// Get benefit setting by role
export const getBenefitSettingByRole = async (role) => {
  try {
    const benefitSettingRef = doc(db, "benefit_settings", role);
    const benefitSettingDoc = await getDoc(benefitSettingRef);
    
    if (benefitSettingDoc.exists()) {
      return { success: true, data: { id: benefitSettingDoc.id, ...benefitSettingDoc.data() } };
    } else {
      return { success: false, message: "Benefit setting not found" };
    }
  } catch (error) {
    console.error("Error fetching benefit setting:", error);
    return { success: false, message: "Failed to fetch benefit setting" };
  }
};

// Create or update benefit setting
export const setBenefitSetting = async (role, settingData, adminId = "ADM-202509-1344") => {
  try {
    const benefitSettingRef = doc(db, "benefit_settings", role);
    const benefitSettingDoc = await getDoc(benefitSettingRef);
    
    const benefitData = {
      profileName: settingData.profileName,
      basedOn: settingData.basedOn, // "perKg" or "total"
      benefitType: settingData.benefitType, // "fixed" or "percentage"
      value: parseFloat(settingData.value),
      currency: settingData.currency || "HTG",
      isActive: settingData.isActive !== undefined ? settingData.isActive : true,
      lastUpdated: new Date(),
      updatedBy: adminId
    };

    if (benefitSettingDoc.exists()) {
      // Update existing setting
      await updateDoc(benefitSettingRef, benefitData);
      return { 
        success: true, 
        message: `${settingData.profileName} benefit setting updated successfully`,
        data: { id: role, ...benefitData }
      };
    } else {
      // Create new setting
      await setDoc(benefitSettingRef, benefitData);
      return { 
        success: true, 
        message: `${settingData.profileName} benefit setting created successfully`,
        data: { id: role, ...benefitData }
      };
    }
  } catch (error) {
    console.error("Error setting benefit:", error);
    return { success: false, message: "Failed to set benefit setting" };
  }
};

// Update multiple benefit settings at once
export const updateAllBenefitSettings = async (settingsData, adminId = "ADM-202509-1344") => {
  try {
    const updatePromises = Object.entries(settingsData).map(([role, data]) => 
      setBenefitSetting(role, data, adminId)
    );
    
    const results = await Promise.all(updatePromises);
    const hasErrors = results.some(result => !result.success);
    
    if (hasErrors) {
      return { success: false, message: "Some benefit settings failed to update" };
    }
    
    return { success: true, message: "All benefit settings updated successfully" };
  } catch (error) {
    console.error("Error updating benefit settings:", error);
    return { success: false, message: "Failed to update benefit settings" };
  }
};

// Delete benefit setting
export const deleteBenefitSetting = async (role) => {
  try {
    const benefitSettingRef = doc(db, "benefit_settings", role);
    await deleteDoc(benefitSettingRef);
    
    return { success: true, message: "Benefit setting deleted successfully" };
  } catch (error) {
    console.error("Error deleting benefit setting:", error);
    return { success: false, message: "Failed to delete benefit setting" };
  }
};

// Get benefit calculation for a specific role and transaction
export const calculateBenefit = async (role, transactionData) => {
  try {
    const benefitSetting = await getBenefitSettingByRole(role);
    
    if (!benefitSetting.success) {
      return { success: false, message: "Benefit setting not found" };
    }
    
    const setting = benefitSetting.data;
    let calculatedBenefit = 0;
    
    if (setting.basedOn === "perKg" && setting.benefitType === "fixed") {
      // Fixed amount per kg
      calculatedBenefit = setting.value * (transactionData.totalQty || 0);
    } else if (setting.basedOn === "total" && setting.benefitType === "percentage") {
      // Percentage of total transaction
      calculatedBenefit = (setting.value / 100) * (transactionData.totalCost || 0);
    }
    
    return { 
      success: true, 
      data: {
        role: role,
        benefitAmount: calculatedBenefit,
        currency: setting.currency,
        calculationMethod: `${setting.benefitType} ${setting.basedOn}`,
        setting: setting
      }
    };
  } catch (error) {
    console.error("Error calculating benefit:", error);
    return { success: false, message: "Failed to calculate benefit" };
  }
};

// ==================== WALLET MANAGEMENT FUNCTIONS ====================

// Get all withdrawals from the withdrawals collection
export const getAllWithdrawals = async () => {
  try {
    const withdrawalsRef = collection(db, "withdrawals");
    const snapshot = await getDocs(withdrawalsRef);
    return snapshot;
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    throw error;
  }
};

// Get withdrawal by ID
export const getWithdrawalById = async (withdrawalId) => {
  try {
    const withdrawalRef = doc(db, "withdrawals", withdrawalId);
    const withdrawalDoc = await getDoc(withdrawalRef);
    
    if (withdrawalDoc.exists()) {
      return { success: true, data: { id: withdrawalDoc.id, ...withdrawalDoc.data() } };
    } else {
      return { success: false, message: "Withdrawal not found" };
    }
  } catch (error) {
    console.error("Error fetching withdrawal:", error);
    return { success: false, message: "Failed to fetch withdrawal" };
  }
};

// Update withdrawal status
export const updateWithdrawalStatus = async (withdrawalId, newStatus, adminId = "ADM-202509-1344") => {
  try {
    const withdrawalRef = doc(db, "withdrawals", withdrawalId);
    const updateData = {
      status: newStatus,
      updatedAt: new Date()
    };

    if (newStatus === 'approved') {
      updateData.approved_at = new Date();
      updateData.approved_by = adminId;
    } else if (newStatus === 'rejected') {
      updateData.rejection_reason = "Rejected by admin";
    } else if (newStatus === 'processed') {
      updateData.processed_at = new Date();
    }

    await updateDoc(withdrawalRef, updateData);
    return { success: true, message: `Withdrawal ${newStatus} successfully` };
  } catch (error) {
    console.error("Error updating withdrawal status:", error);
    return { success: false, message: "Failed to update withdrawal status" };
  }
};

// Get all wallets from the wallets collection
export const getAllWallets = async () => {
  try {
    const walletsRef = collection(db, "wallets");
    const snapshot = await getDocs(walletsRef);
    return snapshot;
  } catch (error) {
    console.error("Error fetching wallets:", error);
    throw error;
  }
};

// Get wallet by user ID
export const getWalletByUserId = async (userId) => {
  try {
    const walletRef = doc(db, "wallets", userId);
    const walletDoc = await getDoc(walletRef);
    
    if (walletDoc.exists()) {
      return { success: true, data: { id: walletDoc.id, ...walletDoc.data() } };
    } else {
      return { success: false, message: "Wallet not found" };
    }
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return { success: false, message: "Failed to fetch wallet" };
  }
};

// Update wallet balance
export const updateWalletBalance = async (userId, amount, reason, adminId = "ADM-202509-1344") => {
  try {
    const walletRef = doc(db, "wallets", userId);
    const walletDoc = await getDoc(walletRef);
    
    if (!walletDoc.exists()) {
      return { success: false, message: "Wallet not found for this user" };
    }

    const currentBalance = walletDoc.data().totalBalance || 0;
    const newBalance = currentBalance + amount;

    // Update wallet balance
    await updateDoc(walletRef, {
      totalBalance: newBalance,
      lastUpdated: new Date()
    });

    // Create transaction record
    const transactionData = {
      transaction_id: `TXN-${Date.now()}`,
      user_id: userId,
      amount: amount,
      transaction_type: amount > 0 ? 'wallet_credit' : 'wallet_debit',
      description: reason || `Wallet balance ${amount > 0 ? 'increased' : 'decreased'} by admin`,
      status: 'completed',
      created_at: new Date(),
      processed_by: adminId,
      balance_before: currentBalance,
      balance_after: newBalance
    };

    const transactionRef = await addDoc(collection(db, "transactions"), transactionData);

    return { 
      success: true, 
      message: `Wallet balance updated successfully. New balance: $${newBalance.toLocaleString()}`,
      newBalance: newBalance,
      transactionId: transactionRef.id
    };
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return { success: false, message: "Failed to update wallet balance" };
  }
};




// ==================== CREDIT REQUEST MANAGEMENT FUNCTIONS ====================

// Fetch credit requests with optional filters (status, user, limit)
export const getCreditRequests = async ({ status = null, userId = null, limit = 50 } = {}) => {
  try {
    const baseConstraints = [];

    // When a specific user is targeted, use Firestore filtering; status is filtered locally to avoid composite index requirements.
    if (userId) {
      baseConstraints.push(where("user_id", "==", userId));
    }

    baseConstraints.push(orderBy("submitted_at", "desc"), limitQuery(limit));

    const creditRequestQuery = query(collection(db, "credit_requests"), ...baseConstraints);
    const snapshot = await getDocs(creditRequestQuery);

    let requests = snapshot.docs.map((creditDoc) => ({
      id: creditDoc.id,
      ...creditDoc.data()
    }));

    // Normalize and apply status filtering client-side (case-insensitive, trimmed) so pending requests with stray casing still surface.
    if (status) {
      const normalizedTarget = String(status).toLowerCase().trim();
      requests = requests.filter((request) => {
        const currentStatus = request.status ? String(request.status).toLowerCase().trim() : "";
        return currentStatus === normalizedTarget;
      });
    }

    return {
      success: true,
      data: requests
    };
  } catch (error) {
    console.error("Error fetching credit requests:", error);
    return {
      success: false,
      message: "Failed to fetch credit requests",
      error: error.message
    };
  }
};

// Approve a pending credit request
export const approveCreditRequest = async (requestId, adminId = "ADM-202509-1344", notes = "") => {
  if (!requestId) {
    return { success: false, message: "Credit request id is required" };
  }

  if (!adminId) {
    return { success: false, message: "Admin id is required to approve credit requests" };
  }

  const creditRequestRef = doc(db, "credit_requests", requestId);

  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(creditRequestRef);

      if (!snapshot.exists()) {
        throw new Error("Credit request not found");
      }

      const requestData = snapshot.data();

      if (requestData.status === "rejected") {
        throw new Error("Rejected credit requests cannot be re-approved");
      }

      if (requestData.status === "processed") {
        throw new Error("Processed credit requests cannot be re-approved");
      }

      if (requestData.status !== "pending") {
        throw new Error("Only pending credit requests can be approved");
      }

      const updatedFields = {
        status: "approved",
        approved_at: new Date(),
        approved_by: adminId,
        updated_at: new Date()
      };

      if (notes !== undefined && notes !== null) {
        updatedFields.notes = notes;
      }

      transaction.update(creditRequestRef, updatedFields);
    });

    return { success: true, message: "Credit request approved successfully" };
  } catch (error) {
    console.error("Error approving credit request:", error);
    return { success: false, message: error.message || "Failed to approve credit request" };
  }
};

// Reject a pending credit request
export const rejectCreditRequest = async (requestId, adminId = "ADM-202509-1344", rejectionReason = "Rejected by admin") => {
  if (!requestId) {
    return { success: false, message: "Credit request id is required" };
  }

  if (!adminId) {
    return { success: false, message: "Admin id is required to reject credit requests" };
  }

  if (!rejectionReason) {
    return { success: false, message: "A rejection reason is required" };
  }

  const creditRequestRef = doc(db, "credit_requests", requestId);

  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(creditRequestRef);

      if (!snapshot.exists()) {
        throw new Error("Credit request not found");
      }

      const requestData = snapshot.data();

      if (requestData.status === "processed") {
        throw new Error("Processed credit requests cannot be rejected");
      }

      if (requestData.status === "rejected") {
        throw new Error("Credit request is already rejected");
      }

      if (requestData.status !== "pending") {
        throw new Error("Only pending credit requests can be rejected");
      }

      transaction.update(creditRequestRef, {
        status: "rejected",
        rejection_reason: rejectionReason,
        updated_at: new Date()
      });
    });

    return { success: true, message: "Credit request rejected successfully" };
  } catch (error) {
    console.error("Error rejecting credit request:", error);
    return { success: false, message: error.message || "Failed to reject credit request" };
  }
};

// Process an approved credit request and credit the user's wallet
export const processCreditRequest = async (requestId, adminId = "ADM-202509-1344") => {
  if (!requestId) {
    return { success: false, message: "Credit request id is required" };
  }

  if (!adminId) {
    return { success: false, message: "Admin id is required to process credit requests" };
  }

  const creditRequestRef = doc(db, "credit_requests", requestId);
  const snapshot = await getDoc(creditRequestRef);

  if (!snapshot.exists()) {
    return { success: false, message: "Credit request not found" };
  }

  const requestData = snapshot.data();

  if (requestData.status === "processed") {
    return { success: false, message: "Credit request has already been processed" };
  }

  if (requestData.status === "rejected") {
    return { success: false, message: "Rejected credit requests cannot be processed" };
  }

  if (!requestData.user_id) {
    return { success: false, message: "Credit request is missing the target user id" };
  }

  if (!requestData.amount || requestData.amount <= 0) {
    return { success: false, message: "Credit request has an invalid amount" };
  }

  const creditMemo = `Credit request ${requestData.credit_request_id || requestId}`;
  const walletResult = await updateWalletBalance(
    requestData.user_id,
    requestData.amount,
    creditMemo,
    adminId
  );

  if (!walletResult.success) {
    return {
      success: false,
      message: walletResult.message || "Failed to update wallet balance"
    };
  }

  await updateDoc(creditRequestRef, {
    status: "processed",
    processed_at: new Date(),
    processed_by: adminId,
    updated_at: new Date(),
    wallet_transaction_id: walletResult.transactionId || null
  });

  return {
    success: true,
    message: "Credit request processed and wallet updated successfully",
    walletTransactionId: walletResult.transactionId || null,
    newBalance: walletResult.newBalance
  };
};
