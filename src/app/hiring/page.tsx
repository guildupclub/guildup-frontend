'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  type: string;
  formUrl: string;
}

const jobPostings: JobPosting[] = [
  {
    id: 'ui-designer',
    title: 'UI/UX Designer',
    description: 'Join our team and help us design the best possible user experience for our platform. You will be responsible for creating beautiful and intuitive interfaces that delight our users.',
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'User Testing'],
    location: 'Remote',
    type: 'Part-time',
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfxqvoKkQLBd8wulhEyKNRtcrzSmDwLxWAVapMlwZAGI7Di8Q/viewform?embedded=true"
  },
  {
    id: 'frontend-dev',
    title: 'Frontend Developer Intern',
    description: 'Join our team to build and scale our platform. You will be responsible for developing new features, improving existing ones, and collaborating with the team to deliver the best possible user experience.',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Git'],
    location: 'Remote',
    type: 'Internship',
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeEhTNRn1PR1eEvjGpyR87RsdOVcoITvLO7VZRaH9c2oiwlvg/viewform?embedded=true"
  }
];

export default function HiringPage() {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  const handleApply = (job: JobPosting) => {
    setSelectedJob(job);
    setIsApplicationOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Join Our Team</h1>
          <p className="text-xl text-foreground">
            We're looking for talented individuals to help us build the future
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {jobPostings.map((job) => (
            <Card key={job.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl text-black font-semibold">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-zinc-500">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.type}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-foreground mb-4">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleApply(job)}
                >
                  Apply Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
            <DialogHeader>
              <DialogTitle>
                Apply for {selectedJob?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedJob && (
              <iframe
                src={selectedJob.formUrl}
                className="w-full h-[600px] scrollbar-hide p-0"
                title="Application Form"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 