import { useState } from "react";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ usuario: "", password: "" });

  const handleLogin = () => {
    let newErrors = { usuario: "", password: "" };

    if (usuario.trim() === "") {
      newErrors.usuario = "Ingrese usuario";
    }
    if (password.trim() === "") {
      newErrors.password = "Ingrese una contraseña";
    }
    setErrors(newErrors);

    if (!newErrors.usuario && !newErrors.password) {
      console.log("Login exitoso", { usuario, password });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Columna izquierda - Imagen */}
      <div
        className="hidden md:flex w-2/3 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/backgroundPNP.png')" }}
      ></div>

      {/* Columna derecha */}
      <div className="flex w-full md:w-1/3 justify-center items-center  bg-gray-50">
        <div className="max-w-md w-full p-6">
          {/* Card*/}
          <div className="bg-gray-100 shadow-lg rounded-2xl p-8 flex flex-col items-center">
            <img
              src="/images/logoPNP.jpeg"
              alt="Logo"
              className="h-56 w-56 object-contain mb-4"
            />
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
              Iniciar Sesión
            </h2>
            <div className="space-y-5 w-full">
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Usuario
                </label>
                <input
                  type="text"
                  id="email"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="ingreso de usuario"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.usuario
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.usuario && (
                  <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
                    {errors.usuario}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                  placeholder="********"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    usuario.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } `}
                />
                {errors.password && (
                  <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
                    {errors.password}
                  </div>
                )}
              </div>

              <button
                className="w-full bg-green-900 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                onClick={handleLogin}
              >
                Ingresar
              </button>
            </div>
          </div>
          {/* fin Card*/}
        </div>
      </div>
    </div>
  );
};

export default Login;
