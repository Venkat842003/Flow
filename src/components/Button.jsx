function Button({ children, onClick, type, color= "sky", text="sm" }) {
  const variants = {
    sky: "bg-sky-600 hover:bg-sky-700",
    primary: "bg-neutral-900 hover:bg-neutral-800",
    red: "bg-red-600 hover:bg-red-700",
    form: "bg-emerald-600 hover:bg-emerald-700",
  };
  return (
    <button
      type={type}
      className={`flex gap-2 text-${text} text-neutral-50  rounded-xl  px-3 py-1 ${variants[color]}  cursor-pointer`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export default Button;
