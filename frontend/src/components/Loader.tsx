export default function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base" role="status" aria-label="Loading">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-cyan/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan shadow-glow" />
      </div>
    </div>
  );
}
