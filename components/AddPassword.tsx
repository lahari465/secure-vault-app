'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useVault } from "@/src/context/VaultContext";
import toast from "react-hot-toast";

function AddPassword() {
  const { addPassword } = useVault();
  const [passwordData, setPasswordData] = useState({
    website: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    // Use the browser's cryptographically secure generator; Math.random is predictable.
    // Values above the largest multiple of the charset size are rejected so every character is equally likely.
    const limit = Math.floor(0x100000000 / charset.length) * charset.length;
    const buffer = new Uint32Array(1);
    let password = "";
    while (password.length < length) {
      crypto.getRandomValues(buffer);
      if (buffer[0] < limit) password += charset.charAt(buffer[0] % charset.length);
    }
    setPasswordData({ ...passwordData, password });
    toast.success('Strong password generated!');
  };

  const handleSubmit = async () => {
    if (!passwordData.website || !passwordData.username || !passwordData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addPassword(passwordData);
      toast.success('Password saved successfully!');
      setPasswordData({ website: '', username: '', password: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save password');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 hover:border-teal-200 transition-colors">
      <CardHeader className="bg-transparent dark:bg-transparent">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lock className="w-6 h-6 text-green-600" />
          Add a Password
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Save your login credentials securely
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website" className="text-base font-semibold">Website</Label>
            <Input
              id="website"
              placeholder="example.com"
              value={passwordData.website}
              onChange={(e) => setPasswordData({ ...passwordData, website: e.target.value })}
              className="border-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base font-semibold">Username/Email</Label>
            <Input
              id="username"
              placeholder="user@example.com"
              value={passwordData.username}
              onChange={(e) => setPasswordData({ ...passwordData, username: e.target.value })}
              className="border-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-semibold">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                className="pr-20 border-2"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="p-1.5 text-gray-500 hover:text-green-600 transition-colors rounded hover:bg-green-50"
                  title="Generate strong password"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded hover:bg-gray-100"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-6 text-base"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Saving...' : 'Add Password'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { AddPassword };

// 'use client';

// import { useState } from "react";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Lock, Plus, Eye, EyeOff } from "lucide-react";

// function AddPassword() {
//   const [passwordData, setPasswordData] = useState({
//     website: '',
//     username: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = () => {
//     console.log('Password added:', passwordData);
//     setPasswordData({ website: '', username: '', password: '' });
//   };

//   return (
//     <Card className="w-full shadow-lg border-2 hover:border-teal-200 transition-colors">
//       <CardHeader className="bg-transparent dark:bg-transparent">
//         <CardTitle className="flex items-center gap-2 text-xl">
//           <Lock className="w-6 h-6 text-green-600" />
//           Add a Password
//         </CardTitle>
//         <CardDescription className="text-gray-600">Save your login credentials securely</CardDescription>
//       </CardHeader>
//       <CardContent className="pt-6">
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="website" className="text-base font-semibold">Website</Label>
//             <Input
//               id="website"
//               placeholder="example.com"
//               value={passwordData.website}
//               onChange={(e) => setPasswordData({ ...passwordData, website: e.target.value })}
//               className="border-2"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="username" className="text-base font-semibold">Username/Email</Label>
//             <Input
//               id="username"
//               placeholder="user@example.com"
//               value={passwordData.username}
//               onChange={(e) => setPasswordData({ ...passwordData, username: e.target.value })}
//               className="border-2"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="password" className="text-base font-semibold">Password</Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? 'text' : 'password'}
//                 placeholder="Enter password"
//                 value={passwordData.password}
//                 onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
//                 className="pr-10 border-2"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
//               >
//                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//               </button>
//             </div>
//           </div>
//           <Button onClick={handleSubmit} className="w-full bg-linear-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-6 text-base">
//             <Plus className="w-5 h-5 mr-2" />
//             Add Password
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
// // Simply export and import the components
// export {  AddPassword };