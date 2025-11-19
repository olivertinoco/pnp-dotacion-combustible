import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Menu from "./components/Menu";
import PageLayout from "./pages/PageLayout";
import ProgDotacion from "./pages/ProgDotacion";
import ProgExtraordinaria from "./pages/ProgExtraordinaria";
import ProgExtraordinariaSearch from "./pages/ProgExtraordinariaSearch";
import ProgTarjetaMultiflota from "./pages/ProgTarjetaMultiflota";
import ProgTarjetaMultiflotaMasivo from "./pages/ProgTarjetaMultiflotaMasivo";
import ProgCmbUnidades from "./pages/ProgCmbUnidades";
import ProgCmbGrifos from "./pages/ProgCmbGrifos";
import AdqOrdenPedido from "./pages/AdqOrdenPedido";
import AdqPedidoPlantaPP from "./pages/AdqPedidoPlantaPP";
import RctaControlSaldoUnidad from "./pages/RctaControlSaldoUnidad";
import RctaControlSaldoGrifo from "./pages/RctaControlSaldoGrifo";
import RctaActaConciliarVolumen from "./pages/RctaActaConciliarVolumen";
import UndPNPControlConsumoDiario from "./pages/UndPNPControlConsumoDiario";
import MtoParada from "./pages/MtoParada";
import MtoGrifos from "./pages/MtoGrifos";
import MtoRepteGrifos from "./pages/MtoRepteGrifos";
import MtoProdPlanta from "./pages/MtoProdPlanta";
import MtoEmpTransporte from "./pages/MtoEmpTransporte";
import MtoCodigosPedidos from "./pages/MtoCodigosPedidos";
import MtoServiciosVehiculosLR from "./pages/MtoServiciosVehiculosLR";
import MtoDiasFeriados from "./pages/MtoDiasFeriados";
import MtoTipoGrifo from "./pages/MtoTipoGrifo";
import MtoTipoDotacion from "./pages/MtoTipoDotacion";
import MtoCamiones from "./pages/MtoCamiones";
import MtoConductoresCamiones from "./pages/MtoConductoresCamiones";
import MtoProdPlantaGrifo from "./pages/MtoProdPlantaGrifo";

import PrivateRoute from "./context/PrivateRoute";
import { useData } from "./context/DataProvider";

export default function App() {
  const { data } = useData();

  const componentsMap = {
    ProgDotacion,
    ProgExtraordinariaSearch,
    ProgTarjetaMultiflota,
    ProgTarjetaMultiflotaMasivo,
    ProgCmbUnidades,
    ProgCmbGrifos,
    AdqOrdenPedido,
    AdqPedidoPlantaPP,
    RctaControlSaldoUnidad,
    RctaControlSaldoGrifo,
    RctaActaConciliarVolumen,
    UndPNPControlConsumoDiario,
    MtoParada,
    MtoGrifos,
    MtoRepteGrifos,
    MtoProdPlanta,
    MtoEmpTransporte,
    MtoCodigosPedidos,
    MtoServiciosVehiculosLR,
    MtoDiasFeriados,
    MtoTipoGrifo,
    MtoTipoDotacion,
    MtoCamiones,
    MtoConductoresCamiones,
    MtoProdPlantaGrifo,
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/menu/*"
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          }
        >
          {data
            .filter((val) => val.split("|")[2] != "")
            .map((row) => {
              const [path, _, componentName] = row.split("|");
              const Component = componentsMap[componentName];
              return (
                <Route
                  key={path}
                  path={`${path}-repo`}
                  element={<Component />}
                />
              );
            })}
        </Route>

        <Route
          path="/prog-extra-ord-base"
          element={
            <PrivateRoute>
              <PageLayout>
                <ProgExtraordinaria />
              </PageLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
