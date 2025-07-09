import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, FileText, Clock, DollarSign } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Step6CreateOfferingProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function Step6CreateOffering({ formData, setFormData }: Step6CreateOfferingProps) {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 p-2 sm:p-8 font-poppins">
      <div>
        <h2 className="text-2xl font-bold mb-1">Publish Your Offerings</h2>
        <p className="text-xs text-muted-foreground">Create your offering and start earning.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offering Title */}
        <div>
          <Label htmlFor="offeringTitle" className="text-sm font-medium mb-1 block">
            Enter offering title<span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="offeringTitle"
              name="offeringTitle"
              value={formData.offeringTitle}
              onChange={e => setFormData({ ...formData, offeringTitle: e.target.value })}
              placeholder="Offering title goes here"
              className="w-full h-12 pl-10 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
            />
          </div>
        </div>
        {/* Offering Type */}
        <div>
          <Label htmlFor="offeringType" className="text-sm font-medium mb-1 block">
            Select offering type<span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Select
              value={formData.offeringType}
              onValueChange={val => setFormData({ ...formData, offeringType: val })}
            >
              <SelectTrigger className="w-full h-12 pl-10 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="package">Package</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* Description */}
      <div>
        <Label htmlFor="offeringDescription" className="text-sm font-medium mb-1 block">
          Description<span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-gray-400" />
          <Textarea
            id="offeringDescription"
            name="offeringDescription"
            value={formData.offeringDescription}
            onChange={e => setFormData({ ...formData, offeringDescription: e.target.value })}
            placeholder="In this offering we will discuss about..."
           className="w-full h-12 pl-10 min-h-[50px] rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
          />
        </div>
      </div>
      {/* Price and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex flex-col md:flex-row justify-between w-full"> 
 <div  className="text-sm font-medium mb-1 block">
            Price (INR)<span className="text-red-500">*</span>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1 block">
            (10% platform fee + taxes, no hidden charges.)
          </div>  
          </div>
              
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="offeringPrice"
              name="offeringPrice"
              value={formData.offeringPrice}
              onChange={e => setFormData({ ...formData, offeringPrice: e.target.value })}
              placeholder="Enter price"
             className="w-full h-12 pl-10 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
              type="number"
              min={0}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="offeringDuration" className="text-sm font-medium mb-1 block">
            Duration (Mins)<span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="offeringDuration"
              name="offeringDuration"
              value={formData.offeringDuration}
              onChange={e => setFormData({ ...formData, offeringDuration: e.target.value })}
              placeholder="Enter duration"
              className="w-full h-12 pl-10 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
              type="number"
              min={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 