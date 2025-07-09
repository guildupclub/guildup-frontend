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
            <div key={idx} className="border rounded-lg p-4 flex flex-col gap-3 bg-white min-w-[180px] relative shadow-md transition hover:shadow-lg">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, education: formData.education.filter((_: any, i: number) => i !== idx) })}
                className="absolute top-2 right-0 text-gray-300 hover:text-red-500"
                aria-label="Delete education"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_123_1268" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                      <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_123_1268)">
                      <path d="M12 22.5C10.8 21.3667 9.425 20.5 7.875 19.9C6.325 19.3 4.7 19 3 19V8C4.68333 8 6.3 8.30417 7.85 8.9125C9.4 9.52083 10.7833 10.4 12 11.55C13.2167 10.4 14.6 9.52083 16.15 8.9125C17.7 8.30417 19.3167 8 21 8V19C19.2833 19 17.6542 19.3 16.1125 19.9C14.5708 20.5 13.2 21.3667 12 22.5ZM12 19.9C13.05 19.1167 14.1667 18.4917 15.35 18.025C16.5333 17.5583 17.75 17.25 19 17.1V10.2C17.7833 10.4167 16.5875 10.8542 15.4125 11.5125C14.2375 12.1708 13.1 13.05 12 14.15C10.9 13.05 9.7625 12.1708 8.5875 11.5125C7.4125 10.8542 6.21667 10.4167 5 10.2V17.1C6.25 17.25 7.46667 17.5583 8.65 18.025C9.83333 18.4917 10.95 19.1167 12 19.9ZM12 9C10.9 9 9.95833 8.60833 9.175 7.825C8.39167 7.04167 8 6.1 8 5C8 3.9 8.39167 2.95833 9.175 2.175C9.95833 1.39167 10.9 1 12 1C13.1 1 14.0417 1.39167 14.825 2.175C15.6083 2.95833 16 3.9 16 5C16 6.1 15.6083 7.04167 14.825 7.825C14.0417 8.60833 13.1 9 12 9ZM12 7C12.55 7 13.0208 6.80417 13.4125 6.4125C13.8042 6.02083 14 5.55 14 5C14 4.45 13.8042 3.97917 13.4125 3.5875C13.0208 3.19583 12.55 3 12 3C11.45 3 10.9792 3.19583 10.5875 3.5875C10.1958 3.97917 10 4.45 10 5C10 5.55 10.1958 6.02083 10.5875 6.4125C10.9792 6.80417 11.45 7 12 7Z" fill="#898989" />
                    </g>
                  </svg>
                </span>
                <Input
                  value={edu.school || ''}
                  onChange={e => {
                    const newEdu = [...formData.education];
                    newEdu[idx].school = e.target.value;
                    setFormData({ ...formData, education: newEdu });
                  }}
                  placeholder="School/University"
                  className="w-[90%] h-9 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Duration</Label>
                <Input
                  value={edu.duration || ''}
                  onChange={e => {
                    const newEdu = [...formData.education];
                    newEdu[idx].duration = e.target.value;
                    setFormData({ ...formData, education: newEdu });
                  }}
                  placeholder="APR 2017 - AUG 2021"
                 className="w-[90%] h-9 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Degree/Standard</Label>
                <Input
                  value={edu.degree || ''}
                  onChange={e => {
                    const newEdu = [...formData.education];
                    newEdu[idx].degree = e.target.value;
                    setFormData({ ...formData, education: newEdu });
                  }}
                  placeholder="Degree/Standard"
                  className="w-[90%] h-9 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
                />
              </div>
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
            <div key={idx} className="border rounded-lg p-4 flex flex-col gap-3 bg-white min-w-[180px] relative shadow-md transition hover:shadow-lg">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, workExperience: formData.workExperience.filter((_: any, i: number) => i !== idx) })}
                className="absolute top-2 right-0 text-gray-300 hover:text-red-500"
                aria-label="Delete experience"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_138_1328" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                      <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_138_1328)">
                      <path d="M4 21C3.45 21 2.97917 20.8042 2.5875 20.4125C2.19583 20.0208 2 19.55 2 19V8C2 7.45 2.19583 6.97917 2.5875 6.5875C2.97917 6.19583 3.45 6 4 6H8V4C8 3.45 8.19583 2.97917 8.5875 2.5875C8.97917 2.19583 9.45 2 10 2H14C14.55 2 15.0208 2.19583 15.4125 2.5875C15.8042 2.97917 16 3.45 16 4V6H20C20.55 6 21.0208 6.19583 21.4125 6.5875C21.8042 6.97917 22 7.45 22 8V19C22 19.55 21.8042 20.0208 21.4125 20.4125C21.0208 20.8042 20.55 21 20 21H4ZM10 6H14V4H10V6ZM20 15H15V17H9V15H4V19H20V15ZM11 15H13V13H11V15ZM4 13H9V11H15V13H20V8H4V13Z" fill="#898989" />
                    </g>
                  </svg>
                </span>
                <Input
                  value={exp.title || ''}
                  onChange={e => {
                    const newExp = [...formData.workExperience];
                    newExp[idx].title = e.target.value;
                    setFormData({ ...formData, workExperience: newExp });
                  }}
                  placeholder="Job Title"
className="w-[90%] h-9 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-gray-500">Duration</Label>
                <Input
                  value={exp.duration || ''}
                  onChange={e => {
                    const newExp = [...formData.workExperience];
                    newExp[idx].duration = e.target.value;
                    setFormData({ ...formData, workExperience: newExp });
                  }}
                  placeholder="APR 2017 - AUG 2021"
         className="w-[90%] h-9 rounded-md text-base focus:ring-0 focus:border-primary placeholder:text-gray-400"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {formData.certificates.map((cert: any, idx: number) => (
            <div key={idx} className="relative flex flex-col items-center    ">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, certificates: formData.certificates.filter((_: any, i: number) => i !== idx) })}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 z-10"
                aria-label="Delete certificate"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-100 mb-2 rounded-xl shadow-sm border-b-2 border-gray-200 overflow-hidden">
                  {cert.file ? (
                    <Image src={typeof cert.file === 'string' ? cert.file : URL.createObjectURL(cert.file)} alt="Certificate" width={180} height={120} className="object-cover w-full h-full rounded-xl" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const newCerts = [...formData.certificates];
                        newCerts[idx].file = e.target.files[0];
                        setFormData({ ...formData, certificates: newCerts });
                      }
                    }}
                  />
                </div>
              </label>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {(formData.testimonials || []).map((testimonial: any, idx: number) => (
            <div
              key={idx}
              className="relative flex flex-col items-center "
            >
              <button
                type="button"
                onClick={() => setFormData({ ...formData, testimonials: formData.testimonials.filter((_: any, i: number) => i !== idx) })}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 z-10"
                aria-label="Delete testimonial"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-50 mb-2 rounded-xl shadow-sm border-b-2 border-dashed border-gray-300 overflow-hidden">
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