const BaseInput = () => {
  return (
    <label className="flex flex-col gap-2 mb-4">
      <span className="font-normal">COMPONENTE tailwindcss </span>
      <input
        className="w-full py-3 px-2 rounded-lg bg-slate-400"
        type="text"
        placeholder="saludo de datos ..."
      />
    </label>
  );
};

export default BaseInput;
