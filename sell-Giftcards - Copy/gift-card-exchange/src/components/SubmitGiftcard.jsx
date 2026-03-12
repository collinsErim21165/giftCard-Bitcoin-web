import React, { useState } from 'react';
import { Sidebarpage } from './Sidebarpage';
import { useNavigate } from 'react-router-dom';
import amazon from '../assets/amazon.png';
import itunes from '../assets/itunes.png';
import google_play from '../assets/google-play.png';
import Steam from '../assets/Steam.png';
import Xbox from '../assets/Xbox.png';
import Walmart from '../assets/Walmart.png';
import CVS from '../assets/CVS.png';
import American from '../assets/American-Express.png';
import PlayStation from '../assets/PlayStation.png';
import eBay from '../assets/eBay.png';
import Target from '../assets/Target.png';
import Apple from '../assets/apple.png';
import Sephora from '../assets/Sephora.png';
import Coach from '../assets/Coach.png';
import Nike from '../assets/Nike.png';
import Nord from '../assets/Nordstrom.png';
import { BsChevronDown, BsGlobe, BsGift, BsCurrencyDollar } from 'react-icons/bs';
import '../App.css';

const giftCardOptions = [
  { name: "Amazon", logo: amazon, countries: { USA: ["Ecode $20-$500", "Cash Receipt $25-49", "Cash Receipt $50-$100", "Cash Receipt $101-$200", "Cash Receipt $201-$499", "Cash Receipt $500","Credit/No receipt $50-$200", "Credit/No receipt $201-$500", "Debit Receipt $50-$100", "Debit Receipt $101-$500"], Germany: ["Cash/Debit $25-$100", "Cash/Debit $101-$500"], UK: ["Cash/Debit $25-$200", "Cash/Debit $201-$500", "Cash Receipt $25-$100", "Cash Receipt $101-$500", "Debit Receipt $25-$500", "Credit Receipt $25-$500", "No Receipt $25-$500", "Ecode $25-$500"] } },
  // { name: "iTunes", logo: itunes, countries: { "USA": [15, 30, 60], "Canada": [10, 25, 50], "Australia": [20, 40, 80] } },
  { name: "GooglePlay", logo: google_play, countries: { "USA": ["Ecode $20-$500", "Physical $10-$49", "Physical $50-$99", "Physical $100-$500"], "Australia": ["Ecode $20-$500", "Physical $20-$500"], "Euro": ["Ecode $20-$500", "Physical $20-$500"], "CHF": ["Ecode $20-$500", "Physical $20-$500"], "New Zealand": ["Ecode $20-$500", "Physical $20-$500"], "Canada": ["Ecode $20-$500", "Physical $20-$500"], "UK": ["Ecode $20-$500","Physical $20-$500"], "Brazil": ["$100-$1000"] } },
  { name: "Steam", logo: Steam, countries: { "Australia": ["Physical $10-$49","Physical $50-$500", "Ecode $10-$49", "Ecode $50-$500"], "Canada": ["Physical $10-$49","Physical $50-$500", "Ecode $10-$49", "Ecode $50-$500"], "CHF": ["Physical $50-$500"], "Euro": ["Physical $10-$49","Physical $50-$500", "Ecode $10-$49", "Ecode $50-$500"], "New Zealand": ["Physical $10-$49","Physical $50-$500", "Ecode $10-$49", "Ecode $50-$500"], "UK": ["Physical $10-$49","Physical $50-$500", "Ecode $10-$49", "Ecode $50-$500"], "USA": ["Ecode $10-$45", "Ecode $50-$500", "Physical $10-$45", "Physical $50-$99", "Physical $100-$500"] } },
  { name: "Xbox", logo: Xbox, countries: {"USA": ["$10-$49","$50-$500" ], "Australia": ["$50-$500"], "Euro": ["$50-$500"], "UK": ["$50-$500"], "Canada": ["$50-$500"]} },
  { name: "Walmart", logo: Walmart, countries: {"USA": ["Ecode $300 and above", "Ecode $50-$299", "Physical $50-$99", "Physical $100-$299", "Physical $300 and above"]}},
  { name: "CVS", logo: CVS, countries: {"USA": ["$100-$500"]} },
  { name: "American_Express", logo: American, countries: {"USA": ["Amex (3779) $100-$199", "Amex (3779) $200-$299", "Amex (3779) $300-$399", "Amex (3779) $400-$499", "Amex (3779) $500 single", "Amex (3777/3751) $200-$399", "Amex (3777/3751) $400-$500", "Amex (3779) ecode $300-$399", "Amex (3779) ecode $400 and above", "Amex 3777/3751 $100-$199", "Amex 3779 $50-$99"   ]} },
  { name: "PlayStation", logo: PlayStation, countries: {"USA": ["$10-$99", "$100-$500"]},  },
  { name: "eBay", logo: eBay, countries: ["USA", "UK", "Germany"], values: [10, 25, 50] },
  { name: "Target", logo: Target, countries: ["USA"], values: [10, 25, 50] },
  { name: "Apple", logo: Apple, countries: ["USA", "Canada", "UK"], values: [15, 30, 50] },
  { name: "FootLocker", logo: "https://www.mygiftcardsupply.com/wp-content/uploads/2022/12/Foot-Locker.png.webp", countries: ["USA", "Canada", "UK"], values: [15, 30, 50] },
  { name: "Sephora", logo: Sephora, countries: ["USA", "Canada", "UK"], values: [15, 30, 50] },
  {name: "Coach", logo: Coach, countries: ["USA"], values: ["$100-$500"] },
  {name: "Nike", logo: Nike, countries:["USA"], values: ["$100-$500"] },
  {name: "Nordstrom", logo: Nord, countries:["USA"], },
  // Define other gift cards similarly
];

const getRate = (giftCardName, country, value) => {
  const rates = {
    Amazon: {
      USA: { "Ecode $20-$500": 354, "Cash Receipt $25-49": 685, "Cash Receipt $50-$100": 695, "Cash Receipt $101-$200": 695, "Cash Receipt $201-$499": 695, "Cash Receipt $500": 670, "Credit/No receipt $50-$200": 695, "Credit/No receipt $201-$500": 695, "Debit Receipt $50-$100": 695, "Debit Receipt $101-$500": 695, },
      UK: { "Cash/Debit $25-$200": 1043, "Cash/Debit $201-$500": 590, "Cash Receipt $25-$100": 610, "Cash Receipt $101-$500": 630, "Debit Receipt $25-$500": 660, "Credit Receipt $25-$500": 680, "No Receipt $25-$500": 585,   "Ecode $25-$500": 625 ,},
      Germany: {"Cash/Debit $25-$100": 600, "Cash/Debit $101-$500": 700,}
    },
    GooglePlay: { 
      USA: { "Ecode $20-$500": 776, "Physical $10-49": 746, "Physical $50-$99": 746, "Physical $100-$500": 776},
      Australia: { "Ecode $20-$500": 412, "Physical $20-$500": 412},
      Euro: { "Ecode $20-$500": 766, "Physical $20-500": 766,},
      CHF: { "Ecode $20-$500": 695, "Physical $20-$500": 695,},
      Canada: { "Ecode $20-$500": 412, "Physical $20-500": 412, },
      UK: { "Ecode $20-$500": 530, "Physical $20-500": 530,},
      Brazil: { "$100-$1000": 55},
      "New Zealand": { "Ecode $20-$500": 0, "Physical $20-500": 0,},
     },
     Steam: { 
      Australia: {"Physical $10-$49": 635, "Physical $50-$500": 695, "Ecode $10-$49": 635, "Ecode $50-$500": 695 },
      Canada: {"Physical $10-$49": 706,"Physical $50-$500": 766, "Ecode $10-$49": 706, "Ecode $50-$500": 766},
      CHF: {"Physical $50-$500": 1241},
      Euro: {"Physical $10-$49": 1259,"Physical $50-$500": 1179,"Ecode $10-$49": 1159, "Ecode $50-$500": 1179},
      "New Zealand": {"Physical $10-$49": 592,"Physical $50-$500": 612, "Ecode $10-$49": 592, "Ecode $50-$500": 612},
      UK: {"Physical $10-$49": 1406,"Physical $50-$500":  1426, "Ecode $10-$49": 1406, "Ecode $50-$500": 1426},
      USA: {"Ecode $10-$45":  1123, "Ecode $50-$500": 1143, "Physical $10-$45": 1123, "Physical $50-$99": 1123, "Physical $100-$500": 1143},
     },
     Xbox: {
       USA: {"$10-$49": 800,"$50-$500": 980 },
       Australia: {"$50-$500": 530},
       Euro: {"$50-$500": 902},
       UK: {"$50-$500": 1110},
       Canada: {"$50-$500":  624}
     },
    // Add other gift card rates here
  };

  return rates[giftCardName]?.[country]?.[value] || 0;
};

const SubmitGiftcard = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCardValue, setSelectedCardValue] = useState("");
  const [amount, setAmount] = useState("");
  const [totalNaira, setTotalNaira] = useState(0);
  const [rate, setRate] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const navigate = useNavigate();

  const handleGiftCardChange = (e) => {
    const selectedGiftCardName = e.target.value;
    const selectedGiftCard = giftCardOptions.find(gc => gc.name === selectedGiftCardName);
    setSelectedGiftCard(selectedGiftCard);
    setSelectedCountry("");
    setSelectedCardValue("");
    setAmount("");
    setTotalNaira(0);
    setRate(0);
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);

    // Mapping of country to currency symbols
    const currencySymbols = {
        USA: "$",
        Germany: "€",
        UK: "£",
        Canada: "C$",
        Brazil: "R$",
        Australia: "A$",
        Euro: "€",
        CHF: "CHF",   // Swiss Franc
        "New Zealand": "NZ$",
    };

    // Get the symbol based on the selected country or default to an empty string if not found
    const symbol = currencySymbols[country] || "";
    setCurrencySymbol(symbol);

    setSelectedCardValue("");
    setAmount("");
    setTotalNaira(0);
};

  const handleCardValueChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedCardValue(selectedValue);
    setAmount("");
  
    if (selectedGiftCard) {
      const cardRate = getRate(selectedGiftCard.name, selectedCountry, selectedValue);
      setRate(cardRate);
  
      // Reset total since amount has not been entered yet
      setTotalNaira(0);
    }
  };

  const handleAmountChange = (e) => {
    const inputAmount = e.target.value;
    setAmount(inputAmount);

    // Calculate total in Naira if a valid rate is set
    if (rate && inputAmount) {
      const total = Number(inputAmount) * rate;
      setTotalNaira(total);
    } else {
      setTotalNaira(0);
    }
  };

  const handleProceed = () => {
    // Parse amount to number before sending
    const numericAmount = parseFloat(amount);
    
    navigate('/summary', {
      state: {
        selectedGiftCard: selectedGiftCard.name,
        selectedCountry,
        amount: numericAmount, // Now it's a number, not a string
        totalNaira: totalNaira,
        currencySymbol,
        giftCardLogo: selectedGiftCard.logo,
        rate: rate,
      }
    });

    // Optional: Log to verify
    console.log('Sending to summary:', {
      selectedGiftCard: selectedGiftCard.name,
      selectedCountry,
      amount: numericAmount,
      totalNaira,
      currencySymbol,
      rate
    });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className='flex flex-row items-start justify-start bg-[rgb(255,240,120)] md:min-h-screen min-h-screen'>
      <div className={isCollapsed ? 'md:mr-24 mr-14' : 'md:mr-52 mr-36'}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex-1 md:-ml-0 -ml-12 pt-24 md:pt-8">
        <div className="md:max-w-2xl md:px-0 px-4 ">
          <h2 className="text-4xl lg:text-5xl font-[1000] text-black leading-[0.9] tracking-tighter uppercase mb-4">Sell Your <span className="text-black/20">Gift-Card</span></h2>
          <p className="text-black/60 text-sm font-black uppercase tracking-widest leading-relaxed">Select your gift card details to get the best exchange rate</p>

          {/* Modern Card Design */}
          <div className="bg-black rounded-2xl shadow-lg p-6 mb-8 mt-3 border-2 border-gray-200">
            {/* Gift Card Selection */}
            <div className="mb-8">
              <label htmlFor="giftCard" className=" text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BsGift className="w-5 h-5" />
                Select Gift Card
              </label>
              <div className="relative">
                <select
                  id="giftCard"
                  value={selectedGiftCard?.name || ""}
                  onChange={handleGiftCardChange}
                  className="
                    w-full
                    p-4
                    rounded-xl
                    border-2 border-gray-300
                    bg-white
                    text-gray-900
                    font-medium
                    focus:border-blue-500
                    focus:ring-2 focus:ring-blue-200
                    focus:outline-none
                    transition-all duration-200
                    appearance-none
                    hover:border-gray-400
                    cursor-pointer
                  "
                >
                  <option value="">Choose a gift card type</option>
                  {giftCardOptions.map((gc) => (
                    <option key={gc.name} value={gc.name}>
                      {gc.name}
                    </option>
                  ))}
                </select>
                <BsChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Gift Card Image Preview */}
            {selectedGiftCard && (
              <div className="mb-8 flex flex-col items-center">
                <div className="w-52 h-40 bg-gray-50 rounded-xl p-4 flex items-center justify-center border border-gray-200 mb-4">
                  <img 
                    src={selectedGiftCard.logo} 
                    alt={selectedGiftCard.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedGiftCard.name}</h3>
              </div>
            )}

            {/* Country Selection */}
            <div className="mb-8">
              <label htmlFor="country" className=" text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BsGlobe className="w-5 h-5" />
                Select Country
              </label>
              <div className="relative">
                <select
                  id="country"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="
                    w-full
                    p-4
                    rounded-xl
                    border-2 border-gray-300
                    bg-white
                    text-gray-900
                    font-medium
                    focus:border-blue-500
                    focus:ring-2 focus:ring-blue-200
                    focus:outline-none
                    transition-all duration-200
                    appearance-none
                    hover:border-gray-400
                    cursor-pointer
                    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                  "
                  disabled={!selectedGiftCard}
                >
                  <option value="">Select country of gift card</option>
                  {Object.keys(selectedGiftCard?.countries || {}).map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <BsChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Card Value Selection */}
            <div className="mb-8">
              <label htmlFor="cardValueDropdown" className="block text-sm font-semibold text-white mb-3">
                Gift Card Value
              </label>
              <div className="relative">
                <select
                  id="cardValueDropdown"
                  value={selectedCardValue}
                  onChange={handleCardValueChange}
                  className="
                    w-full
                    p-4
                    rounded-xl
                    border-2 border-gray-300
                    bg-white
                    text-gray-900
                    font-medium
                    focus:border-blue-500
                    focus:ring-2 focus:ring-blue-200
                    focus:outline-none
                    transition-all duration-200
                    appearance-none
                    hover:border-gray-400
                    cursor-pointer
                    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                  "
                  disabled={!selectedCountry}
                >
                  <option value="">Select card value</option>
                  {(selectedGiftCard?.countries[selectedCountry] || []).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
                <BsChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-8">
              <label htmlFor="amount" className=" text-sm font-semibold text-white mb-3 flex items-center gap-1">
                <BsCurrencyDollar className="w-5 h-5" />
                Enter Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  className="
                    w-full
                    p-4
                    rounded-xl
                    border-2 border-gray-300
                    bg-white
                    text-gray-900
                    font-medium
                    focus:border-blue-500
                    focus:ring-2 focus:ring-blue-200
                    focus:outline-none
                    transition-all duration-200
                    hover:border-gray-400
                    placeholder:text-gray-400
                  "
                  placeholder={`Enter amount in ${currencySymbol}`}
                  disabled={!selectedCardValue}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                  {currencySymbol}
                </span>
              </div>
            </div>

            {/* Rate and Total Display */}
            {(rate > 0 || totalNaira > 0) && (
              <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rate > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-blue-700 mb-1">Exchange Rate</p>
                      <p className="text-2xl font-bold text-blue-800">
                        ₦{rate.toLocaleString()}
                        <span className="text-lg font-medium text-gray-600">/{currencySymbol}</span>
                      </p>
                    </div>
                  )}
                  
                  {totalNaira > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                      <p className="text-sm text-gray-700 mb-1">Total Payout</p>
                      <p className="text-2xl font-bold text-green-700">
                        ₦{totalNaira.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {amount} {currencySymbol} × ₦{rate.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Proceed Button */}
            <div className="flex justify-center">
              <button 
                onClick={handleProceed} 
                disabled={!selectedGiftCard || !selectedCountry || !selectedCardValue || !amount || totalNaira === 0}
                className="
                  w-full md:w-auto
                  px-8 py-4
                  bg-white text-black
                  rounded-xl
                  font-bold
                  text-lg
                  hover:bg-gray-400
                  active:scale-[0.98]
                  transition-all duration-200
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  disabled:hover:bg-black
                  flex items-center justify-center gap-2
                "
              >
                Proceed to Summary
                <BsChevronDown className="w-4 h-4 transform rotate-270" />
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center md:pb-3 pb-6 text-gray-500 text-sm">
            <p>Select all details above to see your payout amount</p>
            <p className="mt-1">Rate is automatically calculated based on gift card type and value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitGiftcard;