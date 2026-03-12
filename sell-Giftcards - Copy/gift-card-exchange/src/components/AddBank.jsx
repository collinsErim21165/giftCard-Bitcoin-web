import React, { useState } from 'react';
import banksList from '../banksData'; // list of banks with logos
import bankLogo from '../assets/bank.png';

const AddBank = ({ onAddBank }) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBank || !accountNumber.trim() || !accountName.trim()) return;

    onAddBank({
      name: selectedBank.name,
      logo: selectedBank.logo,
      accountNumber,
      accountName,
    });

    setSelectedBank(null);
    setAccountNumber('');
    setAccountName('');
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-[rgb(18,18,18)] border border-white/10 rounded-md mt-10">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-2xl font-bold text-[rgb(255,240,120)]">Add Bank</h3>
        <img src={bankLogo} alt="Bank Logo" className="w-10 rounded bg-[rgb(255,240,120)] h-10 object-contain" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 ">
        <div className="flex flex-col  gap-4">
          <div className="flex items-center gap-3">
            {selectedBank && (
              <img src={selectedBank.logo} alt={selectedBank.name} className="w-10 h-10 object-contain" />
            )}
            <select
              onChange={(e) =>
                setSelectedBank(banksList.find((bank) => bank.name === e.target.value))
              }
              value={selectedBank ? selectedBank.name : ''}
              required
              className="w-full bg-black border border-white/20 text-white rounded-md p-2 focus:outline-none focus:border-[rgb(255,240,120)] focus:ring-2 focus:ring-[rgb(255,240,120)]/30"
            >
              <option value="" disabled>Select Bank</option>
              {banksList.map((bank, index) => (
                <option key={index} value={bank.name}>{bank.name}</option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
            className="w-full bg-black border border-white/20 text-white rounded-md p-2 focus:outline-none focus:border-[rgb(255,240,120)] focus:ring-2 focus:ring-[rgb(255,240,120)]/30"
          />

          <input
            type="text"
            placeholder="Account Full Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
            className="w-full bg-black border border-white/20 text-white rounded-md p-2 focus:outline-none focus:border-[rgb(255,240,120)] focus:ring-2 focus:ring-[rgb(255,240,120)]/30"
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-40 bg-[rgb(255,240,120)] text-black hover:opacity-90 font-bold py-2 px-4 rounded-md"
        >
          Add Bank
        </button>
      </form>
    </div>
  );
};

export default AddBank;