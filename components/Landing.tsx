import Link from "next/link"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import {
  ArrowRight,
  CreditCard,
  FileText,
  Lock,
  Search,
  ShieldCheck,
  UserPlus,
  PlusCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const FEATURES = [
  {
    icon: CreditCard,
    title: "Credit cards",
    text: "Save card details with a nickname so you can tell them apart, then edit or remove them whenever you like.",
    tint: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Lock,
    title: "Passwords",
    text: "Keep your logins for every site and app together instead of scattered across notes and screenshots.",
    tint: "text-green-600 dark:text-green-400",
  },
  {
    icon: FileText,
    title: "Files",
    text: "Upload important documents, up to 5 MB each, and keep them listed alongside everything else.",
    tint: "text-orange-600 dark:text-orange-400",
  },
]

const STEPS = [
  { icon: UserPlus, title: "Create an account", text: "Sign up with your email in a few seconds." },
  { icon: PlusCircle, title: "Add what matters", text: "Save cards, passwords and files from one dashboard." },
  { icon: Search, title: "Find it later", text: "Everything you saved is listed and ready when you come back." },
]

function VaultIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[2rem] bg-primary/15 blur-2xl" />

      <div className="relative rounded-2xl border border-border bg-card p-5 shadow-xl">
        {/* window chrome */}
        <div className="mb-4 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-medium text-muted-foreground">My vault</span>
        </div>

        {/* credit card */}
        <div className="rounded-xl bg-gradient-to-br from-lime-600 to-emerald-700 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Everyday card</span>
            <CreditCard className="h-5 w-5 opacity-80" />
          </div>
          <p className="mt-7 font-mono text-lg tracking-widest">•••• •••• •••• 4242</p>
          <div className="mt-4 flex justify-between text-xs opacity-80">
            <span>Card holder</span>
            <span>12 / 28</span>
          </div>
        </div>

        {/* password row */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/15 text-green-600 dark:text-green-400">
            <Lock className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Email account</p>
            <p className="font-mono text-xs text-muted-foreground">••••••••••••</p>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Saved</span>
        </div>

        {/* file row */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">passport-scan.pdf</p>
            <p className="text-xs text-muted-foreground">1.2 MB</p>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Saved</span>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Your personal digital vault
          </span>
          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Everything important, kept in one place.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Secure Vault lets you save your credit cards, passwords and files in one organised
            dashboard, so you stop digging through notes, screenshots and old emails.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <SignUpButton mode="modal">
              <Button size="lg" className="gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" variant="outline">
                I already have an account
              </Button>
            </SignInButton>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0" />
            Everything you save is encrypted before it is stored and tied to your account.
          </p>
        </div>

        <VaultIllustration />
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-16 border-y border-border bg-muted/40">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-center">
          <h2 className="text-3xl font-bold">What is Secure Vault?</h2>
          <p className="text-lg text-muted-foreground">
            It is a simple place for the small but important things you need to keep track of.
            Instead of a note on your phone for card details, a spreadsheet for logins and a folder
            for documents, you get one dashboard with three sections. Sign in, add what you need,
            and it is there the next time you open the app.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16">
        <div className="mb-10 max-w-2xl space-y-2">
          <h2 className="text-3xl font-bold">Three things, handled well</h2>
          <p className="text-muted-foreground">Each one has its own section with a form to add items and a list to manage them.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text, tint }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                <Icon className={`h-5 w-5 ${tint}`} />
              </span>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-16 border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-10 text-3xl font-bold">How it works</h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Step {i + 1}</p>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-20 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Ready to tidy up your digital life?</h2>
        <p className="text-muted-foreground">Create an account and start adding your first items.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <SignUpButton mode="modal">
            <Button size="lg">Create your vault</Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button size="lg" variant="ghost">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Secure-Vault</span>
          <nav className="flex gap-5">
            <Link href="/#about" className="hover:text-foreground">About</Link>
            <Link href="/#features" className="hover:text-foreground">Features</Link>
            <Link href="/#how-it-works" className="hover:text-foreground">How it works</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
