import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Calendar, GraduationCap, Briefcase, Image as ImageIcon, Award, Trash2 } from "lucide-react";

interface Step4ReviewsAchievementsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function Step4ReviewsAchievements({ formData, setFormData }: Step4ReviewsAchievementsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-2 sm:p-6 font-poppins">
      {/* Education */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center w-full">
          <div>
            <Label className="font-semibold text-sm md:text-base">Add Education</Label>
            <div className="text-xs text-muted-foreground">Add your education so learners can view</div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, education: [...formData.education, { school: '', duration: '', degree: '' }] })}
            className="px-3 py-1 rounded border border-primary text-primary text-xs hover:bg-primary/10 font-poppins"
          >
            + Add new
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {formData.education.map((edu: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-3 flex flex-col gap-1 bg-white min-w-[180px] relative">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, education: formData.education.filter((_: any, i: number) => i !== idx) })}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                aria-label="Delete education"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <Input
                  value={edu.school || ''}
                  onChange={e => {
                    const newEdu = [...formData.education];
                    newEdu[idx].school = e.target.value;
                    setFormData({ ...formData, education: newEdu });
                  }}
                  placeholder="School/University"
                  className="bg-transparent border-0 border-b border-gray-200 text-base font-poppins px-0 py-0 h-7 focus:ring-0 focus:border-gray-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Input
                  value={edu.duration || ''}
                  onChange={e => {
                    const newEdu = [...formData.education];
                    newEdu[idx].duration = e.target.value;
                    setFormData({ ...formData, education: newEdu });
                  }}
                  placeholder="APR 2017 - AUG 2021"
                  className="bg-transparent border-0 border-b border-gray-200 text-xs font-poppins px-0 py-0 h-6 focus:ring-0 focus:border-gray-200"
                />
              </div>
              <Input
                value={edu.degree || ''}
                onChange={e => {
                  const newEdu = [...formData.education];
                  newEdu[idx].degree = e.target.value;
                  setFormData({ ...formData, education: newEdu });
                }}
                placeholder="Degree/Standard"
                className="bg-transparent border-0 border-b border-gray-200 text-xs font-poppins px-0 py-0 h-6 focus:ring-0 focus:border-gray-200"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Experience */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center w-full">
          <div>
            <Label className="font-semibold text-sm md:text-base">Add Experience</Label>
            <div className="text-xs text-muted-foreground">Add your experience so learners can view</div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, workExperience: [...formData.workExperience, { title: '', duration: '' }] })}
            className="px-3 py-1 rounded border border-primary text-primary text-xs hover:bg-primary/10 font-poppins"
          >
            + Add new
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {formData.workExperience.map((exp: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-3 flex flex-col gap-1 bg-white min-w-[180px] relative">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, workExperience: formData.workExperience.filter((_: any, i: number) => i !== idx) })}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                aria-label="Delete experience"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <Input
                  value={exp.title || ''}
                  onChange={e => {
                    const newExp = [...formData.workExperience];
                    newExp[idx].title = e.target.value;
                    setFormData({ ...formData, workExperience: newExp });
                  }}
                  placeholder="Job Title"
                  className="bg-transparent border-0 border-b border-gray-200 text-base font-poppins px-0 py-0 h-7 focus:ring-0 focus:border-gray-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Input
                  value={exp.duration || ''}
                  onChange={e => {
                    const newExp = [...formData.workExperience];
                    newExp[idx].duration = e.target.value;
                    setFormData({ ...formData, workExperience: newExp });
                  }}
                  placeholder="APR 2017 - AUG 2021"
                  className="bg-transparent border-0 border-b border-gray-200 text-xs font-poppins px-0 py-0 h-6 focus:ring-0 focus:border-gray-200"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Certificates */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center w-full">
          <div>
            <Label className="font-semibold text-sm md:text-base">Add Certificates</Label>
            <div className="text-xs text-muted-foreground">Add your certificates so learners can view</div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, certificates: [...formData.certificates, { file: null }] })}
            className="px-3 py-1 rounded border border-primary text-primary text-xs hover:bg-primary/10 font-poppins"
          >
            + Add new
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-2">
          {formData.certificates.map((cert: any, idx: number) => (
            <div key={idx} className="border rounded-lg flex flex-col items-center justify-center bg-white min-h-[80px] min-w-[80px] h-20 w-20 relative overflow-hidden">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, certificates: formData.certificates.filter((_: any, i: number) => i !== idx) })}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                aria-label="Delete certificate"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {cert.file ? (
                <Image src={typeof cert.file === 'string' ? cert.file : URL.createObjectURL(cert.file)} alt="Certificate" width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300" />
              )}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const newCerts = [...formData.certificates];
                    newCerts[idx].file = e.target.files[0];
                    setFormData({ ...formData, certificates: newCerts });
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Awards */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center w-full">
          <div>
            <Label className="font-semibold text-sm md:text-base">Add Awards</Label>
            <div className="text-xs text-muted-foreground">Add your awards so learners can view</div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, awards: [...formData.awards, { image: null }] })}
            className="px-3 py-1 rounded border border-primary text-primary text-xs hover:bg-primary/10 font-poppins"
          >
            + Add new
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {formData.awards.map((award: any, idx: number) => (
            <div key={idx} className="relative flex flex-col items-center bg-white p-0">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, awards: formData.awards.filter((_: any, i: number) => i !== idx) })}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 z-10"
                aria-label="Delete award"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-100 mb-2 rounded-xl shadow-sm border-b-2 border-gray-200">
                  {award.image ? (
                    <Image src={typeof award.image === 'string' ? award.image : URL.createObjectURL(award.image)} alt="Award" width={180} height={120} className="object-cover w-full h-full rounded-xl" />
                  ) : (
                    <Award className="w-12 h-12 text-gray-300" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const newAwards = [...formData.awards];
                        newAwards[idx].image = e.target.files[0];
                        setFormData({ ...formData, awards: newAwards });
                      }
                    }}
                  />
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
      {/* Testimonials */}
      <div className="flex flex-col gap-2 mt-6">
        <div className="flex justify-between items-center w-full">
          <div>
            <Label className="font-semibold text-sm md:text-base">Add testimonials</Label>
            <div className="text-xs text-muted-foreground">Add your awards so learners can view</div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, testimonials: [...(formData.testimonials || []), { image: null }] })}
            className="px-3 py-1 rounded border border-primary text-primary text-xs hover:bg-primary/10 font-poppins"
          >
            + Add new
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {(formData.testimonials || []).map((testimonial: any, idx: number) => (
            <div key={idx} className="relative flex flex-col items-center bg-white p-0">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, testimonials: formData.testimonials.filter((_: any, i: number) => i !== idx) })}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 z-10"
                aria-label="Delete testimonial"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-50 mb-2 rounded-xl shadow-sm border-b-2 border-dashed border-gray-300">
                  {testimonial.image ? (
                    <Image src={typeof testimonial.image === 'string' ? testimonial.image : URL.createObjectURL(testimonial.image)} alt="Testimonial" width={180} height={120} className="object-cover w-full h-full rounded-xl" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /></svg>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const newTestimonials = [...formData.testimonials];
                        newTestimonials[idx].image = e.target.files[0];
                        setFormData({ ...formData, testimonials: newTestimonials });
                      }
                    }}
                  />
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 