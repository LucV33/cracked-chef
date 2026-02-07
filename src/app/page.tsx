export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white dark:from-zinc-950 dark:to-black">
      <main className="flex flex-col items-center gap-8 text-center px-6">
        <span className="text-[8rem] leading-none" role="img" aria-label="chef hat">
          👨‍🍳
        </span>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
          Cracked Chef
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-md">
          Rate Your Dining Hall Food
        </p>
      </main>
    </div>
  );
}
