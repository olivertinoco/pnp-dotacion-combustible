import "../index.css";
import "leaflet/dist/leaflet.css";
import App from "../App";
import { DataProvider } from "../context/DataProvider";

export default function RootWrapper() {
  return (
    <DataProvider>
      <App />
    </DataProvider>
  );
}
