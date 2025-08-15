import { useRef } from "react";

export const BaseTabla = ({ data }) => {
  const tableContainerRef = useRef(null);
  const scrollBarRef = useRef(null);

  const columns = [
    { id: "nombre", label: "Nombre", width: "200px" },
    { id: "edad", label: "Edad", width: "100px" },
    { id: "ciudad", label: "Ciudad", width: "180px" },
    { id: "profesion", label: "Profesión", width: "250px" },
  ];

  const data = [
    { nombre: "Juan", edad: 30, ciudad: "Lima", profesion: "Ingeniero" },
    { nombre: "Ana", edad: 25, ciudad: "Cusco", profesion: "Doctora" },
    { nombre: "Luis", edad: 28, ciudad: "Arequipa", profesion: "Abogado" },
    { nombre: "Marta", edad: 32, ciudad: "Trujillo", profesion: "Arquitecta" },
    { nombre: "Pedro", edad: 29, ciudad: "Piura", profesion: "Profesor" },
  ];

  const syncScroll = (source) => {
    if (!tableContainerRef.current || !scrollBarRef.current) return;
    if (source === "table") {
      scrollBarRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
    } else {
      tableContainerRef.current.scrollLeft = scrollBarRef.current.scrollLeft;
    }
  };

  return (
    <>
      <div
        ref={tableContainerRef}
        className="bg-white shadow-lg rounded-lg border border-gray-200"
        onScroll={() => syncScroll("table")}
        style={{
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <table className="border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-3 border-b border-gray-200 text-left text-gray-700 uppercase tracking-wider"
                  style={{ minWidth: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="cursor-pointer odd:bg-white even:bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className="px-4 py-2 border-b border-gray-200"
                    style={{ minWidth: col.width }}
                  >
                    {row[col.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        ref={scrollBarRef}
        className="fixed bottom-0 left-0 w-full h-5 overflow-x-auto bg-gray-100"
        onScroll={() => syncScroll("bar")}
      >
        <div
          className="h-1"
          style={{
            width: `${columns.reduce(
              (acc, col) => acc + parseInt(col.width, 10),
              0,
            )}px`,
          }}
        ></div>
      </div>
    </>
  );
};
