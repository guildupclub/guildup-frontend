import React from 'react';

const BenefitCards = () => {
  const benefits = [
    {
      title: "Share your expertise.",
      description: "Help others while building your reputation.",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
      textColor: "text-primary"
    },
    {
      title: "Build your audience.",
      description: "Share your expertise with thousands.",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600"
    },
    {
      title: "Earn money.",
      description: "Monetize your knowledge and skills.",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600"
    },
    {
      title: "Grow your brand.",
      description: "Establish yourself as an industry leader.",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600"
    },
    {
      title: "Connect instantly.",
      description: "Join communities of like-minded experts.",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-3 min-w-max pb-2">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className={`${benefit.bgColor} p-4 rounded-xl border ${benefit.borderColor} min-w-[280px]`}
            >
              <div className="text-center space-y-2">
                <p className={`${benefit.textColor} font-bold text-sm`}>
                  {benefit.title}
                </p>
                <p className="text-gray-700 text-sm">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BenefitCards; 