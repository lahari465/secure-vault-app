'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Download, Eye } from "lucide-react";
import { useVault } from "@/src/context/VaultContext";
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

function YourFiles() {
  const { files, deleteFile, isLoading } = useVault();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteFile(deleteId);
        toast.success('File deleted successfully!');
        setDeleteId(null);
      } catch (error) {
        toast.error('Failed to delete file');
      }
    }
  };

  const handleDownload = (file: any) => {
    try {
      const link = document.createElement('a');
      link.href = `/api/files/${file.id}`;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('File downloaded!');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleView = (file: any) => {
    try {
      window.open(`/api/files/${file.id}?view=1`, '_blank');
    } catch (error) {
      toast.error('Failed to open file');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('zip')) return '🗜️';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    if (fileType.includes('text')) return '📃';
    return '📁';
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
          <CardTitle className="text-2xl">Your Files</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Manage your uploaded files ({files.length})
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No files uploaded yet</p>
              <p className="text-gray-400 text-sm mt-2">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-5 border-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 dark:hover:from-orange-900/20 dark:hover:to-pink-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-md">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate text-gray-800 dark:text-gray-200">
                        {file.fileName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {file.fileSize} • Uploaded {formatDate(file.uploadDate)}
                      </p>
                      {file.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {file.fileType.includes('image') || file.fileType.includes('pdf') ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(file)}
                        className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors"
                        title="View file"
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(file.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this file from your vault.
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

export { YourFiles };

// 'use client';

// import { useState } from "react";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { FileText, Trash2, Download } from "lucide-react";

// function YourFiles() {
//   const [files, setFiles] = useState([
//     { id: 1, fileName: 'Resume_2024.pdf', fileType: 'application/pdf', fileSize: '245 KB', uploadDate: '2024-11-15', description: 'Updated resume' },
//     { id: 2, fileName: 'Tax_Documents.zip', fileType: 'application/zip', fileSize: '1.2 MB', uploadDate: '2024-10-20', description: 'Tax year 2024' },
//     { id: 3, fileName: 'Passport_Scan.jpg', fileType: 'image/jpeg', fileSize: '890 KB', uploadDate: '2024-09-05', description: 'Passport copy' },
//   ]);

//   const deleteFile = (id:number) => {
//     setFiles(files.filter(file => file.id !== id));
//   };

//   const getFileIcon = (fileType:string) => {
//     if (fileType.includes('image')) return '🖼️';
//     if (fileType.includes('pdf')) return '📄';
//     if (fileType.includes('zip')) return '🗜️';
//     if (fileType.includes('document') || fileType.includes('word')) return '📝';
//     return '📁';
//   };

//   return (
//     <Card className="w-full shadow-lg border-2">
//       <CardHeader className="bg-transparent dark:bg-transparent">
//         <CardTitle className="text-2xl">Your Files</CardTitle>
//         <CardDescription className="text-gray-600">Manage your uploaded files</CardDescription>
//       </CardHeader>
//       <CardContent className="pt-6">
//         {files.length === 0 ? (
//           <div className="text-center py-12">
//             <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 text-lg">No files uploaded yet</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {files.map((file) => (
//               <div
//                 key={file.id}
//                 className="flex items-center justify-between p-5 border-2 rounded-xl hover:bg-linear-to-r hover:from-orange-50 hover:to-pink-50 hover:border-orange-300 transition-all group"
//               >
//                 <div className="flex items-center gap-4 flex-1 min-w-0">
//                   <div className="w-14 h-14 bg-linear-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-md">
//                     {getFileIcon(file.fileType)}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="font-bold text-lg truncate text-gray-800">{file.fileName}</p>
//                     <p className="text-sm text-gray-600">{file.fileSize} • Uploaded {file.uploadDate}</p>
//                     {file.description && <p className="text-xs text-gray-500 mt-1">{file.description}</p>}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 shrink-0">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
//                   >
//                     <Download className="w-5 h-5" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => deleteFile(file.id)}
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
// }
// // Simply export and import the components
// export {  YourFiles };