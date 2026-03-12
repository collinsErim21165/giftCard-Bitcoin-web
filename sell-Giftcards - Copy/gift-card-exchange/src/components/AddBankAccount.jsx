import React, { useEffect, useState } from 'react';
import AddBank from './AddBank';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { MdDelete } from "react-icons/md";
import OPayLogo from '../assets/opay.svg';
import MoniepointLogo from '../assets/Moniepoint.svg';
import KudaLogo from '../assets/Kuda.svg';
import PalmPayLogo from '../assets/palmpay.png';
import bankLogo from '../assets/bank.png';

const AddBankAccount = () => {
  const [banks, setBanks] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bankToDeleteIndex, setBankToDeleteIndex] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const rawBanks = data.banks || [];

          // Refresh bank logos for brand accuracy
          const updatedBanks = rawBanks.map(bank => {
            if (bank.name === 'OPay' && bank.logo !== OPayLogo) return { ...bank, logo: OPayLogo };
            if (bank.name === 'Moniepoint' && bank.logo !== MoniepointLogo) return { ...bank, logo: MoniepointLogo };
            if (bank.name === 'Kuda Bank' && bank.logo !== KudaLogo) return { ...bank, logo: KudaLogo };
            if (bank.name === 'PalmPay' && bank.logo !== PalmPayLogo) return { ...bank, logo: PalmPayLogo };
            return bank;
          });

          setBanks(updatedBanks);

          // Update Firestore if we refreshed any logos
          const needsUpdate = rawBanks.some(b => {
            if (b.name === 'OPay' && b.logo !== OPayLogo) return true;
            if (b.name === 'Moniepoint' && b.logo !== MoniepointLogo) return true;
            if (b.name === 'Kuda Bank' && b.logo !== KudaLogo) return true;
            if (b.name === 'PalmPay' && b.logo !== PalmPayLogo) return true;
            return false;
          });

          if (needsUpdate) {
            updateFirebaseBanks(updatedBanks);
          }
        }
      }
    };

    fetchBanks();
  }, []);

  const updateFirebaseBanks = async (updatedBanks) => {
    if (auth.currentUser) {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        { banks: updatedBanks },
        { merge: true }
      );
    }
  };

  const handleAddBank = async (newBank) => {
    const updatedBanks = [...banks, newBank];
    setBanks(updatedBanks);
    await updateFirebaseBanks(updatedBanks);
  };

  const confirmDeleteBank = (index) => {
    setBankToDeleteIndex(index);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirmed = async () => {
    const updatedBanks = banks.filter((_, index) => index !== bankToDeleteIndex);
    setBanks(updatedBanks);
    await updateFirebaseBanks(updatedBanks);
    setShowConfirmModal(false);
    setBankToDeleteIndex(null);
    setShowSuccessMessage(true);

    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-black shadow-md rounded-md mb-10 mt-8 relative">
      <div className='flex flex-row items-center gap-3 mb-4'>
        <h3 className="text-2xl font-bold text-[rgb(255,240,120)]">Your Banks</h3>
        <img className='h-12 w-12 object-contain bg-[rgb(255,240,120)] rounded ' src={bankLogo} alt="Bank Icon" />
      </div>

      {showSuccessMessage && (
        <div className="bg-green-500/20 text-green-400 border border-green-500/20 px-4 py-2 rounded-md mb-4">
          Bank deleted successfully!
        </div>
      )}

      <ul className="space-y-4">
        {banks.map((bank, index) => (
          <li
            key={index}
            className="flex items-center justify-between bg-white/5 p-3 rounded-md border border-white/10"
          >
            <div className="flex items-center gap-4">
              <img
                src={bank.logo}
                alt={bank.name}
                className="w-14 h-14 object-contain"
              />
              <div>
                <p className="text-white/80 font-medium">
                  {bank.name} - {bank.accountNumber}
                </p>
                <p className="text-sm text-white/50">Name: {bank.accountName}</p>
              </div>
            </div>
            <button
              onClick={() => confirmDeleteBank(index)}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              <MdDelete size={25} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <AddBank onAddBank={handleAddBank} />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-[rgb(18,18,18)] border border-white/10 p-6 rounded-md shadow-lg w-[90%] max-w-sm text-center">
            <h2 className="text-lg font-semibold text-white mb-4">
              Are you sure you want to delete this bank?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDeleteConfirmed}
              >
                Yes
              </button>
              <button
                className="bg-white/10 text-white/70 px-4 py-2 rounded hover:bg-white/20"
                onClick={() => setShowConfirmModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBankAccount;