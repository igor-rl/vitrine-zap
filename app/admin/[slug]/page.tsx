import StoreEditor from "@/components/StoreEditor";

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StoreEditor slug={slug} />;
}
