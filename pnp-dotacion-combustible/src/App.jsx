import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Menu from "./components/Menu";
import ProgDotacion from "./pages/ProgDotacion";
import ProgExtraordinaria from "./pages/ProgExtraordinaria";
import PrivateRoute from "./context/PrivateRoute";
import { useData } from "./context/DataProvider";

export default function App() {
  const { data } = useData();

  const componentsMap = {
    ProgDotacion,
    ProgExtraordinaria,
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
        <Route />
      </Routes>
    </Router>
  );
}
