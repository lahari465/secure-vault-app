'use client';

import { useState } from 'react';
import { Plus, Upload, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useVault } from "@/src/context/VaultContext";
import toast from "react-hot-toast";

function AddFile() {
  const { addFile } = useVault();
  const [fileData, setFileData] = useState({
    fileName: '',
    fileType: '',
    fileSize: '',
    description: '',
    fileData: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 4MB)
      if (file.size > 4 * 1024 * 1024) {
        toast.error('File size must be less than 4MB');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setFileData({
        ...fileData,
        fileName: file.name,
        fileType: file.type,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
      });
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileData({ fileName: '', fileType: '', fileSize: '', description: '', fileData: '' });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsSubmitting(true);
    try {
      await addFile(selectedFile, fileData.description);
      toast.success('File uploaded successfully!');
      clearFile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 hover:border-blue-200 transition-colors">
      <CardHeader className="bg-transparent dark:bg-transparent">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="w-6 h-6 text-orange-600" />
          Add a File
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Upload and store your important files securely (Max 4MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="file" className="text-base font-semibold">Choose File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-900 dark:file:text-orange-200"
            />
          </div>
          {selectedFile && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-700 space-y-2 relative">
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 p-1 hover:bg-orange-100 dark:hover:bg-orange-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 pr-8">{fileData.fileName}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Type: {fileData.fileType || 'Unknown'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Size: {fileData.fileSize}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fileDescription" className="text-base font-semibold">Description (Optional)</Label>
            <Input
              id="fileDescription"
              placeholder="Add a note about this file"
              value={fileData.description}
              onChange={(e) => setFileData({ ...fileData, description: e.target.value })}
              className="border-2"
            />
          </div>
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold py-6 text-base" 
            disabled={!selectedFile || isSubmitting}
          >
            <Plus className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Uploading...' : 'Add File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { AddFile };

// // import React, { useState } from 'react';
// // import { Plus } from "lucide-react";
// 'use client';

// import React, { useState } from 'react';
// import { Plus, Upload } from "lucide-react";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";


// function AddFile() {
//   const [fileData, setFileData] = useState({
//     fileName: '',
//     fileType: '',
//     fileSize: '',
//     description: '',
//   });
//   // const [selectedFile, setSelectedFile] = useState(null);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);


//   // const handleFileChange = (e) => {
//   //   const file = e.target.files?.[0];
//   //   if (file) {
//   //     setSelectedFile(file);
//   //     setFileData({
//   //       ...fileData,
//   //       fileName: file.name,
//   //       fileType: file.type,
//   //       fileSize: (file.size / 1024).toFixed(2) + ' KB',
//   //     });
//   //   }
//   // };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (file) {
//     setSelectedFile(file);
//     setFileData({
//       ...fileData,
//       fileName: file.name,
//       fileType: file.type,
//       fileSize: (file.size / 1024).toFixed(2) + ' KB',
//     });
//   }
// };


//   const handleSubmit = () => {
//     console.log('File added:', fileData);
//     setSelectedFile(null);
//     setFileData({ fileName: '', fileType: '', fileSize: '', description: '' });
//   };

//   return (
//     <Card className="w-full shadow-lg border-2 hover:border-blue-200 transition-colors">
//       <CardHeader className="bg-transparent dark:bg-transparent">
//         <CardTitle className="flex items-center gap-2 text-xl">
//           <Upload className="w-6 h-8 text-orange-600" />
//           Add a File
//         </CardTitle>
//         <CardDescription className="text-gray-600">Upload and store your important files securely</CardDescription>
//       </CardHeader>
//       <CardContent className="pt-6">
//         <div className="space-y-4">
//           <div className="space-y-3">
//             <Label htmlFor="file" className="text-base font-semibold">Choose File</Label>
//             <Input
//               id="file"
//               type="file"
//               onChange={handleFileChange}
//               className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
//             />
//           </div>
//           {selectedFile && (
//             <div className="p-4 bg-linear-to-r from-orange-50 to-pink-50 rounded-lg border-2 border-orange-200 space-y-2">
//               <p className="text-sm font-bold text-gray-800">{fileData.fileName}</p>
//               <p className="text-xs text-gray-600">Type: {fileData.fileType || 'Unknown'}</p>
//               <p className="text-xs text-gray-600">Size: {fileData.fileSize}</p>
//             </div>
//           )}
//           <div className="space-y-2">
//             <Label htmlFor="fileDescription" className="text-base font-semibold">Description (Optional)</Label>
//             <Input
//               id="fileDescription"
//               placeholder="Add a note about this file"
//               value={fileData.description}
//               onChange={(e) => setFileData({ ...fileData, description: e.target.value })}
//               className="border-2"
//             />
//           </div>
//           <Button 
//             onClick={handleSubmit} 
//             className="w-full bg-linear-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold py-6 text-base" 
//             disabled={!selectedFile}
//           >
//             <Plus className="w-5 h-5 mr-2" />
//             Add File
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
// // Simply export and import the components
// export { AddFile };