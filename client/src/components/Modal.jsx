import React from 'react';

const Modal = ({ isOpen, onClose, title, message, type = 'info', onConfirm }) => {
    if (!isOpen) return null;

    const typeStyles = {
        success: 'text-success',
        error: 'text-error',
        info: 'text-accent',
        warning: 'text-warning'
    };

    const icon = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/10 animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold ${typeStyles[type]} flex items-center gap-3`}>
                        <span>{icon[type]}</span>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-secondary hover:text-white transition-colors text-xl"
                    >
                        &times;
                    </button>
                </div>
                <p className="text-gray-300 mb-8 leading-relaxed">
                    {message}
                </p>
                <div className="flex justify-end gap-3">
                    {onConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-5 py-2 rounded-full text-secondary hover:text-white hover:bg-white/5 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="bg-error text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-900/20"
                            >
                                Confirmar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors font-medium"
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
