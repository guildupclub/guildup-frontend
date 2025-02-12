"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";

interface ProfileCardProps {
  name: string;
  title: string;
  description: string;
  memberCount?: number;
  price?: string;
  skills: string[];
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  avatarUrl: string;
  offerings: Array<{
    title: string;
    price: number;
    description: string;
    icon?: string;
  }>;
}

export function ProfileCard({
  name,
  title,
  description,
  memberCount,
  skills,
  socialLinks,
  avatarUrl,
  offerings,
}: ProfileCardProps) {
  const user = useSelector((state: RootState) => state?.user?.user);
  const { data: session } = useSession();
  console.log(session);

  return (
    <div className="w-full max-w-5xl mx-auto  text-zinc-200 py-20">
      <div className="relative ">
        <div className="h-48 w-full overflow-hidden ounded-t-lg">
          <img
            src="https://target.scene7.com/is/image/Target/GUEST_93a59447-93af-4117-aeae-81456b0089f4?fmt=webp&qlt=80&wid=600"
            alt="Profile banner"
            width={1200}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-12 left-8">
          <Avatar className="h-24 w-24 border-4 border-background">
            <Image
              src={user?.image || "/fallback-avatar.png"} // Replace with a valid fallback URL
              alt={name}
              width={96}
              height={96}
              className="rounded-full"
            />

            <AvatarFallback className="text-black">{name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="bg-background pt-16 pb-8 px-8 rounded-b-lg bg-black">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-muted-foreground">{title}</p>
            {memberCount && (
              <p className="text-sm text-muted-foreground">
                {memberCount.toLocaleString()} Members • Free
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.instagram && (
              <Link
                href={socialLinks.instagram}
                className="text-zinc-300 hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            )}
            {socialLinks.linkedin && (
              <Link
                href={socialLinks.linkedin}
                className="text-zinc-300 hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            )}
            {socialLinks.twitter && (
              <Link
                href={socialLinks.twitter}
                className="text-zinc-300 hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            )}
            {socialLinks.facebook && (
              <Link
                href={socialLinks.facebook}
                className="text-zinc-300 hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            )}
            <Button
              variant="secondary"
              className="bg-primary-gradient text-primary-foreground hover:bg-primary/90"
            >
              Join Group
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          <div className="bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-muted-foreground mb-4">{description}</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-black text-zinc-200"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Offering</h2>
            <div className="space-y-4 ">
              {offerings.map((offering) => (
                <Card key={offering.title} className="bg-zinc-900 border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="font-semibold">{offering.title}</h3>
                    <p className="font-bold">${offering.price}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {offering.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
