import { useData } from "../context/DataProvider";

const EjeCarga = () => {
  const { listaDotacion } = useData();

  return (
    <div
      style={{
        overflow: "auto",
        maxHeight: "400px",
        border: "1px solid #ccc",
        padding: "10px",
        fontFamily: "monospace",
        whiteSpace: "pre",
      }}
    >
      {listaDotacion.map((linea, idx) => (
        <div key={idx}>{linea}</div>
      ))}
    </div>
  );
};

export default EjeCarga;
