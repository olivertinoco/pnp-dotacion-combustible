import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Menu from "./components/Menu";
import pages from "./pages";
import PrivateRoute from "./context/PrivateRoute";
import { useData } from "./context/DataProvider";
import { MenuTriggerProvider } from "./context/MenuTriggerContext";
import { useEffect, useState } from "react";

function LazyPage({ loader, children }) {
  const [Comp, setComp] = useState(null);
  useEffect(() => {
    let active = true;
    loader().then((mod) => active && setComp(() => mod));
    return () => {
      active = false;
    };
  }, [loader]);
  if (!Comp) return <div>Cargando…</div>;
  return <Comp>{children}</Comp>;
}

export default function App() {
  const { data } = useData();

  return (
    <MenuTriggerProvider>
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
                const ComponentLoader = pages[componentName];
                return (
                  <Route
                    key={path}
                    path={`${path}-repo`}
                    element={<LazyPage loader={ComponentLoader} />}
                  />
                );
              })}
          </Route>

          <Route
            path="/prog-extra-ord-base"
            element={
              <PrivateRoute>
                <LazyPage loader={pages.PageLayout}>
                  <LazyPage loader={pages.ProgExtraordinaria} />
                </LazyPage>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </MenuTriggerProvider>
  );
}
