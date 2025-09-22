const mapasBase = {
  "Google Hybrid (ArcGIS Canvas)": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    options: { maxZoom: 18, attribution: "Esri / ArcGIS" },
  },

  "Google Streets": {
    url: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    options: {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "Google",
    },
  },

  "Google Satellite": {
    url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    options: {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "Google Satellite",
    },
  },

  "Google Terrain": {
    url: "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    options: {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "Google Terrain",
    },
  },

  OpenStreetMap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" },
  },

  "OSM WMS (Mundialis)": {
    url: "https://ows.mundialis.de/services/service?",
    options: {
      layers: "OSM-WMS",
      format: "image/png",
      transparent: true,
      maxZoom: 18,
    },
    type: "wms",
  },

  OpenTopoMap: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    options: {
      maxZoom: 17,
      attribution: "Map data: &copy; OpenTopoMap (CC-BY-SA)",
    },
  },

  "ESRI World Topo": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    options: { maxZoom: 18, attribution: "Esri / ArcGIS" },
  },
};

export default mapasBase;
