function Breadcrumbs({ history, onJump }) {
  return (
    <div className="flex gap-2 items-center">
      <p>Steps : </p>
      {history.map((step, index) => (
        <div key={step.id}>
          <button
            className="relative group  w-8 h-8 text-sm font-md rounded-full bg-neutral-600 cursor-pointer hover:bg-sky-600 transition"
            onClick={() => onJump(index)}
          >
            {index + 1}
             <div
            className="
      absolute
      top-12
      left-1/2
      -translate-x-1/2
      hidden
      group-hover:block
      bg-neutral-900
      text-white
      text-sm
      px-3
      py-2
      rounded-lg
      shadow-lg
      w-64
      z-50
    "
          >
            {step.instruction}
          </div>
          </button>
         
          <span> &gt; </span>
        </div>
      ))}
      <span className="text-blue-300 "> Current step</span>
    </div>
  );
}

export default Breadcrumbs;
