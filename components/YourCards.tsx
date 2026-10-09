'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Trash2, Edit2, X, Check } from "lucide-react";
import { useVault, CardType } from "@/src/context/VaultContext";
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

function YourCards() {
  const { cards, deleteCard, updateCard, isLoading } = useVault();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<CardType>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (card: CardType) => {
    setEditingId(card.id);
    setEditData(card);
  };

  const handleSave = async () => {
    if (editingId && editData) {
      try {
        await updateCard(editingId, {
          cardName: editData.cardName!,
          cardNumber: editData.cardNumber!,
          expiryDate: editData.expiryDate!,
          cvv: editData.cvv!,
          cardType: editData.cardType!,
        });
        toast.success('Card updated successfully!');
        setEditingId(null);
        setEditData({});
      } catch (error) {
        toast.error('Failed to update card');
      }
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteCard(deleteId);
        toast.success('Card deleted successfully!');
        setDeleteId(null);
      } catch (error) {
        toast.error('Failed to delete card');
      }
    }
  };

  const maskCardNumber = (number: string) => {
    const last4 = number.slice(-4);
    return `**** **** **** ${last4}`;
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
          <CardTitle className="text-2xl">Your Cards</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Manage your saved credit cards ({cards.length})
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No cards saved yet</p>
              <p className="text-gray-400 text-sm mt-2">Add your first card to get started</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {cards.map((card) => (
                <div key={card.id}>
                  {editingId === card.id ? (
                    <div className="p-5 border-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Card Name</Label>
                        <Input
                          value={editData.cardName || ''}
                          onChange={(e) => setEditData({ ...editData, cardName: e.target.value })}
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Card Number</Label>
                        <Input
                          value={editData.cardNumber || ''}
                          onChange={(e) => setEditData({ ...editData, cardNumber: e.target.value })}
                          className="border-2 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">Expiry</Label>
                          <Input
                            value={editData.expiryDate || ''}
                            onChange={(e) => setEditData({ ...editData, expiryDate: e.target.value })}
                            className="border-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">CVV</Label>
                          <Input
                            type="password"
                            value={editData.cvv || ''}
                            onChange={(e) => setEditData({ ...editData, cvv: e.target.value })}
                            className="border-2"
                          />
                        </div>
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
                    <div className="flex items-center justify-between p-5 border-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                          <CreditCard className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{card.cardName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {maskCardNumber(card.cardNumber)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Expires: {card.expiryDate} • {card.cardType}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(card)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(card.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
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
            <AlertDialogTitle>Delete Card?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this card from your vault.
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

export { YourCards };

// 'use client';

// import { useState } from "react";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { CreditCard, Trash2, Edit2 } from "lucide-react";


// function YourCards() {
//   const [cards, setCards] = useState([
//     { id: 1, cardName: 'Chase Sapphire', cardNumber: '**** **** **** 1234', expiryDate: '12/25', cardType: 'Visa' },
//     { id: 2, cardName: 'Amex Gold', cardNumber: '**** **** **** 5678', expiryDate: '08/26', cardType: 'American Express' },
//     { id: 3, cardName: 'Discover It', cardNumber: '**** **** **** 9012', expiryDate: '03/27', cardType: 'Discover' },
//   ]);

//   const deleteCard = (id:number) => {
//     setCards(cards.filter(card => card.id !== id));
//   };

//   return (
//     <Card className="w-full shadow-lg border-2">
//       <CardHeader className="bg-transparent dark:bg-transparent">
//         <CardTitle className="text-2xl">Your Cards</CardTitle>
//         <CardDescription className="text-gray-600">Manage your saved credit cards</CardDescription>
//       </CardHeader>
//       <CardContent className="pt-6">
//         {cards.length === 0 ? (
//           <div className="text-center py-12">
//             <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 text-lg">No cards saved yet</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {cards.map((card) => (
//               <div
//                 key={card.id}
//                 className="flex items-center justify-between p-5 border-2 rounded-xl hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 hover:border-purple-300 transition-all group"
//               >
//                 <div className="flex items-center gap-4">
//                   <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
//                     <CreditCard className="w-7 h-7 text-white" />
//                   </div>
//                   <div>
//                     <p className="font-bold text-lg text-gray-800">{card.cardName}</p>
//                     <p className="text-sm text-gray-600 font-mono">{card.cardNumber}</p>
//                     <p className="text-xs text-gray-500 mt-1">Expires: {card.expiryDate} • {card.cardType}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
//                   >
//                     <Edit2 className="w-5 h-5" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => deleteCard(card.id)}
//                     className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }// Simply export and import the components
// export { YourCards };