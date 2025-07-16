import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Tag, AlignLeft } from "lucide-react";

interface Step3AboutMeProps {
  formData: any;
  setFormData: (data: any) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  removeTag: (tag: string) => void;
  handleTagInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function Step3AboutMe({
  formData,
  setFormData,
  tagInput,
  setTagInput,
  removeTag,
  handleTagInputChange,
  handleTagInputKeyDown,
}: Step3AboutMeProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 p-2 sm:p-6 font-poppins">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tags" className="font-semibold text-sm md:text-base">Tags for area of expertise</Label>
        <span className="block text-[12px] lg:text-xs text-muted-foreground mb-1">Type tags and press Enter to help users find your Guild</span>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Tag className="w-5 h-5" />
          </span>
          <Input
            id="tags"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Parenting"
            className="bg-white border border-gray-200 h-9 text-base pl-10 font-poppins"
          />
        </div>
        <div className="flex flex-wrap gap-2 ">
          {formData.tags.map((tag: string, idx: number) => (
            <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1 font-poppins border border-primary">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-primary/70"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <Label htmlFor="bio" className="font-semibold text-base md:text-lg">Short bio about me</Label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">
            <AlignLeft className="w-5 h-5" />
          </span>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            placeholder="e.g., Weekly mindfulness tips & guided meditations to reduce stress."
            className="bg-white border border-gray-200 min-h-[50px] text-base pl-10 pt-2 font-poppins"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between w-full">

        <div className="font-semibold text-base md:text-lg">Add FAQs</div>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, faqs: [...formData.faqs, { question: "", answer: "" }] })}
          className="mt-3 px-3 py-1 rounded bg-primary text-white text-xs hover:bg-primary/90 font-poppins"
        >
          + Add new
        </button>
        </div>
        <span className="block text-xs text-muted-foreground mb-1">Some questions they answer</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formData.faqs.map((faq: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-2 flex flex-col gap-2 bg-white min-w-[180px]">
              <Input
                value={faq.question}
                onChange={e => {
                  const newFaqs = [...formData.faqs];
                  newFaqs[idx].question = e.target.value;
                  setFormData({ ...formData, faqs: newFaqs });
                }}
                placeholder="Enter Question"
                className="bg-white border border-gray-200 h-7 text-base font-poppins"
              />
              <Input
                value={faq.answer}
                onChange={e => {
                  const newFaqs = [...formData.faqs];
                  newFaqs[idx].answer = e.target.value;
                  setFormData({ ...formData, faqs: newFaqs });
                }}
                placeholder="Enter answer"
                className="bg-white border border-gray-200 h-7 text-base font-poppins"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, faqs: formData.faqs.filter((_: any, i: number) => i !== idx) })}
                className="text-xs text-red-500 hover:underline self-end"
                disabled={formData.faqs.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
       
      </div>
    </div>
  );
} 