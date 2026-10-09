"use client"
import React from 'react'
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { theme, setTheme } = useTheme()
  const toggleTheme =() => {

    toast.success("Theme Changed!")
    if(theme === "dark"){
      setTheme("light")
    } else{
      setTheme("dark")
    }
  }
  return (

    
    <nav className='flex justify-between items-center px-4 h-16 bg-primary/40 text-foreground'>
      <Link href='/' className='font-bold text-xl'>Secure-Vault</Link>
      <ul className='hidden sm:flex gap-5 items-center justify-start'>
        <li><Link href='/' className='hover:underline'>Home</Link></li>
        <li><Link href='/#about' className='hover:underline'>About</Link></li>
        <li><Link href='/#features' className='hover:underline'>Services</Link></li>
      </ul>
 
      <div className='flex gap-2 justify-center items-center'>
        
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          <Sun className="h-{1.2rem} w-{1.2rem} rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0"/>
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        {/* <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu> */} 
      <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button>Sign up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton/>
        </SignedIn>
      </div>
    </nav>
   
  )
}

export default Navbar