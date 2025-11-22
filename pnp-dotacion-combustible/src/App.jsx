import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Menu from "./components/Menu";
import pages from "./pages";
import PrivateRoute from "./context/PrivateRoute";
import { useData } from "./context/DataProvider";
import { MenuTriggerProvider } from "./context/MenuTriggerContext";

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
                const Component = pages[componentName];
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
                <pages.PageLayout>
                  <pages.ProgExtraordinaria />
                </pages.PageLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </MenuTriggerProvider>
  );
}
