import React from 'react';
import {
    FaCheckCircle,
    FaTimes,
    FaClock,
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaInfoCircle
} from 'react-icons/fa';

const CustomPopup = ({ popup, onClose, onInputChange }) => {
    if (!popup.show) return null;

    const getStyle = (type) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50 border-green-200',
                    text: 'text-green-900',
                    icon: FaCheckCircle,
                    iconColor: 'text-green-600',
                    btn: 'bg-green-600 hover:bg-green-700'
                };
            case 'error':
                return {
                    bg: 'bg-red-50 border-red-200',
                    text: 'text-red-900',
                    icon: FaTimes, // Or FaExclamationTriangle
                    iconColor: 'text-red-600',
                    btn: 'bg-red-600 hover:bg-red-700'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50 border-yellow-200',
                    text: 'text-yellow-900',
                    icon: FaExclamationTriangle,
                    iconColor: 'text-yellow-600',
                    btn: 'bg-yellow-600 hover:bg-yellow-700'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-50 border-blue-200',
                    text: 'text-blue-900',
                    icon: FaInfoCircle, // Or FaMoneyBillWave depending on context
                    iconColor: 'text-blue-600',
                    btn: 'bg-blue-600 hover:bg-blue-700'
                };
        }
    };

    const style = getStyle(popup.type);
    const IconComponent = style.icon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className={`${style.bg} border-2 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100`}>
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-2 rounded-full bg-white bg-opacity-60`}>
                                <IconComponent className={`text-2xl ${style.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold text-xl mb-2 ${style.text}`}>{popup.title}</h3>
                                <div className="text-gray-700 whitespace-pre-line leading-relaxed break-all">
                                    {popup.message}
                                </div>

                                {popup.showInput && (
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            value={popup.inputValue}
                                            onChange={onInputChange}
                                            placeholder={popup.inputPlaceholder}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 border-opacity-50">
                        {popup.onCancel && (
                            <button
                                onClick={popup.onCancel}
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        )}
                        {popup.onConfirm ? (
                            <button
                                onClick={popup.onConfirm}
                                className={`px-5 py-2.5 text-white rounded-lg transition-colors font-medium shadow-md ${style.btn}`}
                            >
                                Confirm
                            </button>
                        ) : !popup.onCancel && (
                            <button
                                onClick={onClose}
                                className={`px-6 py-2.5 text-white rounded-lg transition-colors font-medium shadow-md ${style.btn}`}
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomPopup;
