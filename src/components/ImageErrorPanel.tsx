import React from "react";
import { AlertCircle } from "lucide-react";

export default function ImageErrorPanel() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 border border-red-200 text-center p-4">
      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
      <p className="text-xs text-red-600 font-semibold">Usage Limit Exceeded</p>
      <p className="text-xs text-red-500/70 mt-1">Backblaze quota limit</p>
    </div>
  );
}
