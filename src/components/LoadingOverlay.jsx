function LoadingOverlay({ children = "Saving..." }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg px-8 py-5 shadow-lg flex items-center gap-4">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-lg">{children}</span>
      </div>
    </div>
  );
}

export default LoadingOverlay;
