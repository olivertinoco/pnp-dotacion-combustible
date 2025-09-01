export default function PanelCard({ title }) {
  return (
    <div className="bg-white shadow rounded p-4 space-y-4">
      <h3 className="text-lg font-bold">{title}</h3>

      <select className="w-full border rounded p-2">
        <option>Opción 1</option>
        <option>Opción 2</option>
      </select>

      <select className="w-full border rounded p-2">
        <option>Opción A</option>
        <option>Opción B</option>
      </select>

      <select className="w-full border rounded p-2">
        <option>Item X</option>
        <option>Item Y</option>
      </select>

      <input
        type="text"
        placeholder="Escribe algo..."
        className="w-full border rounded p-2"
      />

      <button className="w-full bg-blue-500 text-white rounded p-2 hover:bg-blue-600">
        Ejecutar
      </button>
    </div>
  );
}
