import { useState, useRef } from "react";

const ExcelUploader = ({ onFileSelected }) => {
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    // Opcional: puedes leerlo aquí o enviar el file al padre
    const reader = new FileReader();
    reader.onload = (evt) => {
      const arrayBuffer = evt.target.result;
      // Aquí puedes enviar el contenido al padre
      if (onFileSelected) {
        onFileSelected({ file, arrayBuffer });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const openFileExplorer = () => {
    inputRef.current.click();
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <label className="text-sm font-semibold text-gray-700">
        Seleccionar archivo Excel
      </label>
      <div
        onClick={openFileExplorer}
        className="w-full p-5 border-2 border-dashed rounded-xl cursor-pointer border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 ease-in-out flex flex-col items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <p className="text-sm text-gray-600">
          Haz clic para seleccionar un archivo Excel
        </p>
        {fileName && (
          <p className="text-sm font-medium text-green-700 mt-1">
            Archivo seleccionado: <span className="underline">{fileName}</span>
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xls, .xlsx"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ExcelUploader;
