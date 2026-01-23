import { db as firestoreDb } from './firebase';
import { db as dexieDb } from './db';
import * as firestoreService from './firestore-service';
import { Transaction, Category, PaymentMethod } from './types';

// Sync functions to save to both Dexie and Firestore
export const addTransactionWithSync = async (transaction: Omit<Transaction, 'id'>) => {
  try {
    // Save to Dexie (local)
    const id = await dexieDb.transactions.add(transaction as any);

    // Save to Firestore
    try {
      await firestoreService.addTransaction({
        ...transaction,
        id: id as string
      });
      console.log('Transaction saved to both Dexie and Firestore:', id);
    } catch (firestoreError) {
      console.warn('Firestore save failed, but Dexie saved:', firestoreError);
    }

    return id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransactionWithSync = async (id: string, transaction: Partial<Transaction>) => {
  try {
    // Update Dexie
    await dexieDb.transactions.update(id, transaction);

    // Update Firestore
    try {
      await firestoreService.updateTransaction(id, transaction);
      console.log('Transaction updated in both Dexie and Firestore:', id);
    } catch (firestoreError) {
      console.warn('Firestore update failed, but Dexie updated:', firestoreError);
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransactionWithSync = async (id: string) => {
  try {
    // Delete from Dexie
    await dexieDb.transactions.delete(id);

    // Delete from Firestore
    try {
      await firestoreService.deleteTransaction(id);
      console.log('Transaction deleted from both Dexie and Firestore:', id);
    } catch (firestoreError) {
      console.warn('Firestore delete failed, but Dexie deleted:', firestoreError);
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const addCategoryWithSync = async (category: Omit<Category, 'id'>) => {
  try {
    const id = await dexieDb.categories.add(category as any);

    try {
      await firestoreService.addCategory({
        ...category,
        id: id as string
      });
      console.log('Category saved to both Dexie and Firestore:', id);
    } catch (firestoreError) {
      console.warn('Firestore save failed, but Dexie saved:', firestoreError);
    }

    return id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const addPaymentMethodWithSync = async (method: Omit<PaymentMethod, 'id'>) => {
  try {
    const id = await dexieDb.paymentMethods.add(method as any);

    try {
      await firestoreService.addPaymentMethod({
        ...method,
        id: id as string
      });
      console.log('Payment method saved to both Dexie and Firestore:', id);
    } catch (firestoreError) {
      console.warn('Firestore save failed, but Dexie saved:', firestoreError);
    }

    return id;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};
