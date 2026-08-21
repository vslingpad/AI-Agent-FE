export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to AI Agent
        </h1>
        <p className="text-muted-foreground">
          Select a section from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
