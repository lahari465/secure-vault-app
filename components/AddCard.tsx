'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import { useVault } from "@/src/context/VaultContext";
import toast from "react-hot-toast";

function AddCard() {
  const { addCard } = useVault();
  const [cardData, setCardData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardType: 'Visa',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\s/g, '');
    const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const detectCardType = (number: string) => {
    const digits = number.replace(/\s/g, '');
    if (digits.startsWith('4')) return 'Visa';
    if (digits.startsWith('5')) return 'Mastercard';
    if (digits.startsWith('3')) return 'American Express';
    if (digits.startsWith('6')) return 'Discover';
    return 'Unknown';
  };

  const handleSubmit = async () => {
    if (!cardData.cardName || !cardData.cardNumber || !cardData.expiryDate || !cardData.cvv) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCard({
        ...cardData,
        cardType: detectCardType(cardData.cardNumber),
      });
      toast.success('Card added successfully!');
      setCardData({ cardName: '', cardNumber: '', expiryDate: '', cvv: '', cardType: 'Visa' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add card');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 hover:border-purple-200 transition-colors">
      <CardHeader className="bg-transparent dark:bg-transparent">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CreditCard className="w-6 h-6 text-blue-600" />
          Add a Credit Card
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Securely store your card information
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName" className="text-base font-semibold">Card Name</Label>
            <Input
              id="cardName"
              placeholder="My Visa Card"
              value={cardData.cardName}
              onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
              className="border-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-base font-semibold">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={(e) => setCardData({ 
                ...cardData, 
                cardNumber: formatCardNumber(e.target.value) 
              })}
              className="border-2 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-base font-semibold">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => setCardData({ 
                  ...cardData, 
                  expiryDate: formatExpiry(e.target.value) 
                })}
                maxLength={5}
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-base font-semibold">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => setCardData({ 
                  ...cardData, 
                  cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                })}
                maxLength={4}
                className="border-2"
              />
            </div>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-6 text-base"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Adding...' : 'Add Card'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { AddCard };

// 'use client';

// import { useState } from "react";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Plus, CreditCard } from "lucide-react";
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"

// function AddCard() {
//   const [cardData, setCardData] = useState({
//     cardName: '',
//     cardNumber: '',
//     expiryDate: '',
//     cvv: '',
//   });

  


//   const handleSubmit = () => {
//     console.log('Card added:', cardData);
//     setCardData({ cardName: '', cardNumber: '', expiryDate: '', cvv: '' });
//   };

//   return (
//     <Card className="w-full shadow-lg border-2 hover:border-purple-200 transition-colors">
//       <CardHeader className="bg-transparent dark:bg-transparent">
//         <CardTitle className="flex items-center gap-2 text-xl">
//           <CreditCard className="w-6 h-6 text-blue-600" />
//           Add a Credit Card
//         </CardTitle>
//         <CardDescription className="text-gray-600">Securely store your card information</CardDescription>
//       </CardHeader>
//       <CardContent className="pt-6">
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="cardName" className="text-base font-semibold">Card Name</Label>
//             <Input
//               id="cardName"
//               placeholder="My Visa Card"
//               value={cardData.cardName}
//               onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
//               className="border-2"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="cardNumber" className="text-base font-semibold">Card Number</Label>
//             <Input
//               id="cardNumber"
//               placeholder="1234 5678 9012 3456"
//               value={cardData.cardNumber}
//               onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
//               maxLength={19}
//               className="border-2 font-mono"
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="expiryDate" className="text-base font-semibold">Expiry Date</Label>
//               <Input
//                 id="expiryDate"
//                 placeholder="MM/YY"
//                 value={cardData.expiryDate}
//                 onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
//                 maxLength={5}
//                 className="border-2"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="cvv" className="text-base font-semibold">CVV</Label>
//               <Input
//                 id="cvv"
//                 type="password"
//                 placeholder="123"
//                 value={cardData.cvv}
//                 onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
//                 maxLength={4}
//                 className="border-2"
//               />
//             </div>
//           </div>
//           <Button onClick={handleSubmit} className="w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-6 text-base">
//             <Plus className="w-5 h-5 mr-2" />
//             Add Card
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // Simply export and import the components
// export { AddCard};