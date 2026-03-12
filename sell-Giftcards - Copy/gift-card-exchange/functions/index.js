

// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.addFunds = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated and has admin privileges
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can add funds');
  }

  const { uid, amount } = data;
  if (!uid || isNaN(amount) || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid UID or amount');
  }

  const userRef = admin.firestore().collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  const currentBalance = userDoc.data().balance || 0;
  const newBalance = currentBalance + amount;

  await userRef.update({ balance: newBalance });
  return { message: `Funds added successfully. New balance: ${newBalance}` };
});