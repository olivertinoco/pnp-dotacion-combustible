import BaseInput from "./components/BaseInput";
// import { BaseTabla } from "./components/BaseTabla";
import EjeCarga from "./components/EjeCarga";

export default function App() {
  return (
    <div className="p-5">
      <div className="text-lg font-bold mb-4">
        me integro Bien OLIVER y mili
      </div>
      <BaseInput />
      <div className="my-6">SEPARA PARA... solución estamos</div>
      {/* <BaseTabla />*/}
      <EjeCarga />
    </div>
  );
}
