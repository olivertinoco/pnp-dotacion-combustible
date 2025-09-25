// PROBANDO MIS ENDPOINTS
// ======================

// const res = await fetch("http://localhost:5222/Home/TraerListaMenus", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded",
//     Accept: "text/plain",
//   },
//   body: "data1=maria&data2=1234",
// });

// const res = await fetch(
//   "http://localhost:5222/Home/TraerListaDotacionCombustible",
//   {
//     method: "GET",
//     headers: {
//       Accept: "text/plain",
//     },
//   },
// );

const res = await fetch(
  "http://localhost:5222/Home/TraerListaOperatividadVeh",
  {
    method: "GET",
    headers: {
      Accept: "text/plain",
    },
  },
);

console.log(await res.text());

// # PARA PROBAR EN CONSOLA
// bun run test.js |cut -c1-1000
