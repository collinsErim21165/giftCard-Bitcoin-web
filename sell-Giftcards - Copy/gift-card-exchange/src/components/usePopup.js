import { useState, useCallback } from 'react';

const usePopup = () => {
    const [popup, setPopup] = useState({
        show: false,
        type: 'info', // 'info', 'success', 'warning', 'error'
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        showInput: false,
        inputValue: '',
        inputPlaceholder: ''
    });

    const showPopup = useCallback((type, title, message, onConfirm = null, onCancel = null, options = {}) => {
        setPopup({
            show: true,
            type,
            title,
            message,
            onConfirm,
            onCancel,
            showInput: options.showInput || false,
            inputValue: options.inputValue || '',
            inputPlaceholder: options.inputPlaceholder || ''
        });
    }, []);

    const closePopup = useCallback(() => {
        setPopup(prev => ({
            ...prev,
            show: false,
            onConfirm: null, // Clear callbacks to prevent memory leaks
            onCancel: null
        }));
    }, []);

    const handlePopupInputChange = useCallback((e) => {
        setPopup(prev => ({
            ...prev,
            inputValue: e.target.value
        }));
    }, []);

    return {
        popup,
        showPopup,
        closePopup,
        handlePopupInputChange
    };
};

export default usePopup;
