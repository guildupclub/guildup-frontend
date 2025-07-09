import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Step7LinkBankAccountProps {
  formData: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
  };
  setFormData: (data: any) => void;
}

const Step7LinkBankAccount: React.FC<Step7LinkBankAccountProps> = ({ formData, setFormData }) => {
  return (
    <div className="w-full flex flex-col items-center font-poppins">
   
      <div className="w-full flex flex-col gap-6 ">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Account holder's name</label>
            <Input
              type="text"
              name="accountHolder"
              value={formData.accountHolder}
              onChange={e => setFormData((prev: any) => ({ ...prev, accountHolder: e.target.value }))}
              placeholder="Enter account holder's name"
              className="w-full h-9 pl-3 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Account number</label>
            <Input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={e => setFormData((prev: any) => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="Enter account number"
               className="w-full h-9 pl-3 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600 mb-1">IFSC Code</label>
          <Input
            type="text"
            name="ifsc"
            value={formData.ifsc}
            onChange={e => setFormData((prev: any) => ({ ...prev, ifsc: e.target.value }))}
            placeholder="Enter IFSC Code"
             className="w-full h-9 pl-3 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
          />
        </div>
      </div>
   
    </div>
  );
};

export default Step7LinkBankAccount; 