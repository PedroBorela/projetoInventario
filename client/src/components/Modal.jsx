import React from 'react';

const Modal = ({ isOpen, onClose, title, message, type = 'info', onConfirm }) => {
    if (!isOpen) return null;

    const typeStyles = {
        success: 'text-green-600',
        error: 'text-red-600',
        info: 'text-blue-600',
        warning: 'text-orange-600'
    };

    const icon = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${typeStyles[type]} flex items-center gap-2`}>
                        <span>{icon[type]}</span>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✖
                    </button>
                </div>
                <p className="text-gray-700 mb-6">
                    {message}
                </p>
                <div className="flex justify-end gap-2">
                    {onConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                            >
                                Confirmar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors"
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
