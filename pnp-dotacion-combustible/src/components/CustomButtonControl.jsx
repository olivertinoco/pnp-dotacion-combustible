import { useEffect } from "react";
import { Control, DomUtil, DomEvent } from "leaflet";
import { useMap } from "react-leaflet";
import { createRoot } from "react-dom/client";
import { Squares2X2Icon } from "@heroicons/react/24/solid";

export default function CustomButtonControl({ panelOpen, setPanelOpen }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Definir control extendiendo de Control
    const CustomControl = Control.extend({
      options: {
        position: "topleft",
      },
      onAdd: function () {
        const container = DomUtil.create(
          "div",
          "leaflet-bar leaflet-control leaflet-control-custom",
        );
        container.style.marginTop = "0px";
        container.style.marginLeft = "10px";

        // Crear botón
        const button = DomUtil.create("a", "", container);
        button.href = "#";
        button.title = "Abrir panel izquierdo";

        button.style.display = "flex"; // que sea bloque
        button.style.alignItems = "center";
        button.style.justifyContent = "center";
        button.style.width = "30px";
        button.style.height = "30px";

        const root = createRoot(button);
        root.render(<Squares2X2Icon className="w-5 h-5 text-blue-600" />);

        // Evita propagación de click
        DomEvent.disableClickPropagation(button);

        // Acción del botón
        DomEvent.on(button, "click", (e) => {
          e.preventDefault();
          setPanelOpen((prev) => !prev);
        });

        return container;
      },
    });

    const control = new CustomControl();
    map.addControl(control);

    // cleanup al desmontar
    return () => {
      map.removeControl(control);
    };
  }, [map, setPanelOpen]);

  useEffect(() => {
    const el = document.querySelector(".leaflet-control-custom");
    if (el) {
      el.style.display = panelOpen ? "none" : "block";
    }
  }, [panelOpen]);

  return null;
}
