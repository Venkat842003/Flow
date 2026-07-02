function Button({
  children,
  onClick,
  type,
  color = "sky",
  text = "sm",
  hoverColor,
}) {
  const variants = {
    sky: "bg-sky-600 hover:bg-sky-700",
    primary: "bg-neutral-600",
    secondary: "bg-neutral-800  ",
    option: "bg-neutral-700 hover:bg-neutral-800 border border-neutral-500",

    red: "bg-red-600 hover:bg-red-700",
    orange: "bg-orange-500 hover:bg-orange-600",
    form: "bg-fuchsia-600 hover:bg-fuchsia-700",
  };
  return (
    <button
      type={type}
      className={`flex gap-2 text-${text} text-neutral-50  rounded-xl  px-3 py-1 ${variants[color]}  cursor-pointer ${hoverColor ? hoverColor : ""} items-center justify-center`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export default Button;
