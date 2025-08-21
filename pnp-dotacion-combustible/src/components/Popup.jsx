const Popup = ({ show, onClose, title, message }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default Popup;
