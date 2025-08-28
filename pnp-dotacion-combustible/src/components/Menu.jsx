import { useState, Fragment } from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { useData } from "../context/DataProvider";
import { useNavigateTo } from "../utils/useNavigateTo";
import { Outlet } from "react-router-dom";

export default function Menu4() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubItem, setOpenSubItem] = useState(null);
  const [selectedNames, setSelectedNames] = useState({
    menu: "",
    sub: "",
  });

  const navigateTo = useNavigateTo();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSubItem = (codigo) =>
    setOpenSubItem((prev) => (prev === codigo ? null : codigo));

  const { data } = useData();

  const [posId, ...newData] = data;

  const parsedData = newData.map((item) => {
    const [codigo, nombre] = item.split("|");
    return { codigo, nombre };
  });

  const listaMenuItems = parsedData.filter((item) =>
    item.codigo.endsWith("00"),
  );

  const listaMenuSubItems = parsedData.filter(
    (item) => !item.codigo.endsWith("00"),
  );

  const subItemsMap = listaMenuSubItems.reduce((acc, sub) => {
    const parentPrefix = sub.codigo.slice(0, 2);
    if (!acc[parentPrefix]) acc[parentPrefix] = [];
    acc[parentPrefix].push(sub);
    return acc;
  }, {});

  const handleSubItem = (codigoSubMenu, nombreSubMenu, nombreMenu) => {
    setSelectedNames({ menu: nombreMenu, sub: nombreSubMenu });
    let child = `/menu/${codigoSubMenu}-repo`;
    navigateTo(child, { state: { value: posId } });
  };

  const handleLogout = () => {
    navigateTo("/");
  };

  return (
    <div>
      <nav className="w-full bg-gray-800 text-white px-4 py-2 flex items-center">
        <button
          onClick={toggleMenu}
          className="p-2 rounded hover:bg-gray-700 transition"
        >
          MENU
        </button>
        <span className="mx-auto font-semibold">
          {selectedNames.menu}
          {selectedNames.sub && ` / ${selectedNames.sub}`}
        </span>
        <button
          onClick={handleLogout}
          className="ml-auto px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition"
        >
          Cerrar sesión
        </button>
      </nav>

      <SwipeableDrawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={toggleMenu}
        sx={{
          "& .MuiDrawer-paper": {
            top: "48px",
            backgroundColor: "#1f2937",
            color: "white",
            fontSize: "0.875rem",
          },
        }}
      >
        <Box
          sx={{ width: 300 }}
          role="presentation"
          onKeyDown={() => setMenuOpen(false)}
        >
          <List>
            {listaMenuItems.map((menu) => {
              const prefix = menu.codigo.slice(0, 2);
              const subItems = subItemsMap[prefix] || [];

              return (
                <Fragment key={menu.codigo}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() =>
                        subItems.length > 0
                          ? toggleSubItem(menu.codigo)
                          : setMenuOpen(false)
                      }
                    >
                      <ListItemIcon>
                        {subItems.length > 0 ? (
                          openSubItem === menu.codigo ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-300" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-300" />
                          )
                        ) : (
                          <DocumentIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={menu.nombre} />
                    </ListItemButton>
                  </ListItem>

                  {subItems.length > 0 && (
                    <Collapse
                      in={openSubItem === menu.codigo}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {subItems.map((sub) => (
                          <ListItem
                            key={sub.codigo}
                            disablePadding
                            sx={{ pl: 6 }}
                          >
                            <ListItemButton onClick={() => setMenuOpen(false)}>
                              <ListItemIcon>
                                <DocumentIcon className="h-5 w-5 text-gray-400" />
                              </ListItemIcon>
                              <ListItemText
                                primary={sub.nombre}
                                onClick={() =>
                                  handleSubItem(
                                    sub.codigo,
                                    sub.nombre,
                                    menu.nombre,
                                  )
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Fragment>
              );
            })}
          </List>
        </Box>
      </SwipeableDrawer>

      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}
