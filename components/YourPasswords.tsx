'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Copy, Edit2, Trash2, X, Check } from "lucide-react";
import { useVault, PasswordType } from "@/src/context/VaultContext";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function YourPasswords() {
  const { passwords, deletePassword, updatePassword, isLoading } = useVault();
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PasswordType>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Password copied to clipboard!');
  };

  const handleEdit = (password: PasswordType) => {
    setEditingId(password.id);
    setEditData(password);
  };

  const handleSave = async () => {
    if (editingId && editData) {
      try {
        await updatePassword(editingId, {
          website: editData.website!,
          username: editData.username!,
          password: editData.password!,
        });
        toast.success('Password updated successfully!');
        setEditingId(null);
        setEditData({});
      } catch (error) {
        toast.error('Failed to update password');
      }
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deletePassword(deleteId);
        toast.success('Password deleted successfully!');
        setDeleteId(null);
      } catch (error) {
        toast.error('Failed to delete password');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg border-2">
        <CardContent className="p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full shadow-lg border-2">
        <CardHeader className="bg-transparent dark:bg-transparent">
          <CardTitle className="text-2xl">Your Passwords</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Manage your saved login credentials ({passwords.length})
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {passwords.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No passwords saved yet</p>
              <p className="text-gray-400 text-sm mt-2">Add your first password to get started</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {passwords.map((pwd) => (
                <div key={pwd.id}>
                  {editingId === pwd.id ? (
                    <div className="p-5 border-2 rounded-xl bg-green-50 dark:bg-green-900/20 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Website</Label>
                        <Input
                          value={editData.website || ''}
                          onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Username/Email</Label>
                        <Input
                          value={editData.username || ''}
                          onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Password</Label>
                        <Input
                          type="text"
                          value={editData.password || ''}
                          onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                          className="border-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} size="sm" className="flex-1">
                          <Check className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => { setEditingId(null); setEditData({}); }} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 border-2 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 dark:hover:from-green-900/20 dark:hover:to-teal-900/20 hover:border-teal-300 dark:hover:border-teal-700 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                            <Lock className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{pwd.website}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{pwd.username}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                                {visiblePasswords[pwd.id] ? pwd.password : '••••••••'}
                              </p>
                              <button
                                onClick={() => togglePasswordVisibility(pwd.id)}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                              >
                                {visiblePasswords[pwd.id] ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(pwd.password)}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                title="Copy password"
                              >
                                <Copy className="w-5 h-5" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              Last updated: {formatDate(pwd.lastUpdated)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(pwd)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <Edit2 className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(pwd.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Password?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this password from your vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { YourPasswords };

// 'use client';

// import { useState } from "react";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Lock, Eye, EyeOff, Copy, Edit2, Trash2 } from "lucide-react";

// function YourPasswords() {
//   const [passwords, setPasswords] = useState([
//     { id: 1, website: 'github.com', username: 'user@example.com', password: 'secret123', lastUpdated: '2024-11-01' },
//     { id: 2, website: 'linkedin.com', username: 'professional@work.com', password: 'pass456', lastUpdated: '2024-10-15' },
//     { id: 3, website: 'netflix.com', username: 'viewer@email.com', password: 'secure789', lastUpdated: '2024-09-20' },
//   ]);
//  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});


//   const deletePassword = (id:number) => {
//     setPasswords(passwords.filter(pwd => pwd.id !== id));
//   };

//   const togglePasswordVisibility = (id:number) => {
//     setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
//   };

//   const copyToClipboard = (text:string) => {
//     navigator.clipboard.writeText(text);
//   };

//   return (
//     <Card className="w-full shadow-lg border-2">
//       <CardHeader className="bg-transparent dark:bg-transparent">
//         <CardTitle className="text-2xl">Your Passwords</CardTitle>
//         <CardDescription className="text-gray-600">Manage your saved login credentials</CardDescription>
//       </CardHeader>
//       <CardContent className="pt-6">
//         {passwords.length === 0 ? (
//           <div className="text-center py-12">
//             <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 text-lg">No passwords saved yet</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {passwords.map((pwd) => (
//               <div
//                 key={pwd.id}
//                 className="p-5 border-2 rounded-xl hover:bg-linear-to-r hover:from-green-50 hover:to-teal-50 hover:border-teal-300 transition-all"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-start gap-4 flex-1">
//                     <div className="w-14 h-14 bg-linear-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
//                       <Lock className="w-7 h-7 text-white" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-bold text-lg text-gray-800">{pwd.website}</p>
//                       <p className="text-sm text-gray-600 truncate">{pwd.username}</p>
//                       <div className="flex items-center gap-3 mt-3">
//                         <p className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
//                           {visiblePasswords[pwd.id] ? pwd.password : '••••••••'}
//                         </p>
//                         <button
//                           onClick={() => togglePasswordVisibility(pwd.id)}
//                           className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded"
//                         >
//                           {visiblePasswords[pwd.id] ? (
//                             <EyeOff className="w-5 h-5" />
//                           ) : (
//                             <Eye className="w-5 h-5" />
//                           )}
//                         </button>
//                         <button
//                           onClick={() => copyToClipboard(pwd.password)}
//                           className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded"
//                           title="Copy password"
//                         >
//                           <Copy className="w-5 h-5" />
//                         </button>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-2">Last updated: {pwd.lastUpdated}</p>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
//                     >
//                       <Edit2 className="w-5 h-5" />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => deletePassword(pwd.id)}
//                       className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
//                     >
//                       <Trash2 className="w-5 h-5" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }// Simply export and import the components
// export {  YourPasswords };