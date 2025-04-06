import { Navbar } from "../../components/navbar"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Find the perfect service for your needs
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            ServiceHub connects you with trusted professionals for any job, big or small.
          </p>
          <div className="flex justify-center gap-4">
            <div className="w-full max-w-md h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              Service showcase content
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

