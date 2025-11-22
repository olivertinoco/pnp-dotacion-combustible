const modules = import.meta.glob("./*.jsx", { eager: true });
const pages = {};

for (const path in modules) {
  const name = path.replace("./", "").replace(".jsx", "");
  pages[name] = modules[path].default;
}

export default pages;
