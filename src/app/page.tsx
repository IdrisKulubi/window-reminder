import { ModeToggle } from "@/components/theme/mode-toggle";

export default function Home() {
  return <div>
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Window Reminder</h1>
      <ModeToggle />
    </div>
  </div>;
}

