function Loading({ children = "Loading..." }) {
  return (
    <div className="flex justify-center items-center h-screen  text-white">
      {children}
    </div>
  );
}

export default Loading;
