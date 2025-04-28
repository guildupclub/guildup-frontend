import PostPage from "@/components/post/PostPage"; // ✅ correct

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  const { id } = params;

  return (
    <div className="py-4">
      <PostPage id={id} />
    </div>
  );
}
