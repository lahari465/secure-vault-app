import { AddCard } from "@/components/AddCard";
import { AddFile } from "@/components/AddFile";
import { AddPassword } from "@/components/AddPassword";
import { YourCards } from "@/components/YourCards";
import { YourFiles } from "@/components/YourFiles";
import { YourPasswords } from "@/components/YourPasswords";
import { CreditCard, FileText, Lock } from "lucide-react";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Landing from "@/components/Landing";

export default function Home() {
  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
    //   <div className="max-w-7xl mx-auto space-y-12">
    //     {/* Header */}
    //     <div className="text-center mb-12">
    //       <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-3">
    //         Secure Vault
    //       </h1>


    //---------------------
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
//   <div className="max-w-7xl mx-auto space-y-12">
//     {/* Header */}
//     <div className="text-center mb-12">
//       <h1 className="text-5xl font-black text-black dark:text-white mb-3">
//         Secure Vault
//       </h1>
//     </div>

        
    
//         <p className="text-gray-600 dark:text-gray-300 text-lg">
//   Manage your cards, passwords, and files safely in one place
// </p>
// </div> 
// ---------------------------
    // <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-8 text-gray-900 dark:text-gray-100">
    <>
      <SignedIn>
    <div className="min-h-screen p-8">
  <div className="max-w-7xl mx-auto space-y-12">
    {/* Header */}
    <div className="text-center mb-12">
      <h1 className="text-5xl font-black mb-3">
        Secure Vault
      </h1>
      <p className="text-lg">
        Manage your cards, passwords, and files safely in one place
      </p>
    </div>
        {/* Files Section */}
        <div>
          {/* <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3"> */}
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">

            {/* <FileText className="w-8 h-8 text-orange-600" /> */}
            <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />

            Files Management
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <AddFile/>
            <YourFiles />
          </div>
        </div>

        {/* Passwords Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
            <Lock className="w-8 h-8 text-green-600" />
            Password Management
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <AddPassword/>
            <YourPasswords />
          </div>
        </div>

        {/* Cards Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Credit Cards Management
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <AddCard />
            <YourCards />
          </div>
        </div>
      </div>
    </div>
      </SignedIn>
      <SignedOut>
        <Landing />
      </SignedOut>
    </>

  );
}

  // (
  //   <div>
  //     <div>
  //     <div className="flex">
  //       <h1>Add a File</h1>
  //     <AddCard/>
  //     </div>
  //     <div>
  //       <h1>Add a Password</h1>
  //       <AddPassword/>
  //     </div>
  //     </div>
  //     <div>
  //     <div>
  //       <h1>Your Files</h1>
  //       <YourCards/>
  //     </div>
  //     <div>
  //      <h1>Your Passwords</h1> 
  //      <YourPasswords/>
  //     </div>
  //   </div>
  //    <div>
  //     <div className="flex">
  //       <h1>Add a Credit Card</h1>
  //     <AddCard/>
  //     </div>
  //     <div>
  //       <h1>Add a Password</h1>
  //       <AddPassword/>
  //     </div>
  //     </div>
  //     <div>
  //     <div>
  //       <h1>Your Cards</h1>
  //       <YourCards/>
  //     </div>
  //     <div>
  //      <h1>Your Passwords</h1> 
  //      <YourPasswords/>
  //     </div>
  //   </div>
  //   </div>
  // );