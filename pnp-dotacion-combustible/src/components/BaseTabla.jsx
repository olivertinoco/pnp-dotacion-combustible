import { useRef, useMemo } from "react";
import Loader from "../components/Loader";
import { useData } from "../context/DataProvider";

export const BaseTabla = () => {
  const { data } = useData();
  const tableContainerRef = useRef(null);
  const scrollBarRef = useRef(null);

  const titulo = useMemo(
    () => (data && data.length > 1 ? data[0].split("|") : []),
    [data],
  );

  const cabecera = useMemo(() => {
    if (data && data.length > 1) {
      return data[1].split("|").map((val, i) => [titulo[i], Number(val)]);
    }
    return [];
  }, [data, titulo]);

  const totalWidth = useMemo(
    () => cabecera.reduce((acc, col) => acc + col[1], 0),
    [cabecera],
  );

  const syncScroll = (source) => {
    if (!tableContainerRef.current || !scrollBarRef.current) return;
    window.requestAnimationFrame(() => {
      if (source === "table") {
        scrollBarRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
      } else {
        tableContainerRef.current.scrollLeft = scrollBarRef.current.scrollLeft;
      }
    });
  };

  if (!data || data.length <= 1) {
    return <Loader />;
  }

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
              {cabecera.map((col, id) => (
                <th
                  key={id}
                  className="px-4 py-3 border-b border-gray-200 text-left text-gray-700 uppercase tracking-wider"
                  style={{ minWidth: `${col[1]}px` }}
                >
                  {col[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(2).map((row, i) => {
              const oneRow = row.split("|");
              return (
                <tr
                  key={i}
                  className="cursor-pointer odd:bg-white even:bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150"
                >
                  {cabecera.map((col, j) => (
                    <td
                      key={j}
                      className="px-4 py-2 border-b border-gray-200"
                      style={{ minWidth: `${col[1]}px` }}
                    >
                      {oneRow[j]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        ref={scrollBarRef}
        className="fixed bottom-0 left-0 w-full h-5 overflow-x-auto bg-gray-100"
        onScroll={() => syncScroll("bar")}
      >
        <div className="h-1" style={{ width: `${totalWidth}px` }}></div>
      </div>
    </>
  );
};
