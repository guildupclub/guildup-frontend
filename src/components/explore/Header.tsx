import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";

// Add text animation variants
const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  })
};

const headingWords = ["Take", "advice", "from", "experts"];

export default function Header() {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const benefits = [
    "Top experts",
    "Affordable price",
    "Set up in few minutes",
    "Monetise your expertise"
  ];

  const handleCreatorButtonClick = () => {
    if (!session) {
      toast("Sign in required", {
        action: {
          label: "Sign In",
          onClick: () => signIn(undefined, {
            callbackUrl: `${window.location.origin}?hero=1`
          }),
        },
      });
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-8 mt-16">
      {/* Animated Main Heading */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide font-dmSans leading-tight max-w-4xl">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {headingWords.map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700
                hover:scale-110 hover:bg-gradient-to-r hover:from-primary hover:to-primary/80
                transition-all duration-300 cursor-default
                hover:animate-float"
            >
              {word}
            </motion.span>
          ))}
        </div>
      </h1>

      {/* Animated Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl px-4 
          hover:text-gray-900 transition-all duration-300
          hover:scale-105 group cursor-default"
      >
        Why figure it out alone when you can learn from someone who&rsquo;s already nailed it?
        <span className="block h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 
          transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
      </motion.p>

      {/* Benefits List */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl px-4">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
            className="flex items-center gap-2 text-muted-foreground
              hover:text-gray-900 transition-all duration-300
              hover:scale-105 transform p-2 rounded-lg 
              hover:bg-gradient-to-r hover:from-white/50 hover:to-transparent
              group cursor-default"
          >
            <Check className="h-5 w-5 text-primary flex-shrink-0 
              group-hover:text-primary group-hover:animate-bounce" />
            <span className="text-sm group-hover:font-medium">{benefit}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <Dialog open={session ? isDialogOpen : false} onOpenChange={setIsDialogOpen}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button 
            onClick={handleCreatorButtonClick}
            className="mt-8 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg 
              bg-primary hover:bg-primary/90 text-white
              transition-all duration-300 
              hover:scale-105 hover:shadow-xl hover:shadow-primary/20
              relative overflow-hidden group"
          >
            <span className="relative z-10">Become a creator</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ArrowRight className="ml-2 h-5 w-5 relative z-10 
              group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </motion.div>
        {session && <CreatorForm onClose={() => setIsDialogOpen(false)} />}
      </Dialog>
    </div>
  );
}
