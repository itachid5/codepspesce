import { ImageUploader } from "./ImageUploader";
import { SubmitButton } from "./SubmitButton";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";

type Option = { id: string; name: string };
type PostDefaults = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImageUrl?: string;
  thumbnailUrl?: string | null;
  categoryId?: string;
  status?: string;
  isFeatured?: boolean;
  tagIds?: string[];
};

export function PostEditor({
  action,
  categories,
  tags,
  defaults = {},
}: {
  action: (formData: FormData) => Promise<void>;
  categories: Option[];
  tags: Option[];
  defaults?: PostDefaults;
}) {
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-5 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
        <div><Label>Title</Label><Input name="title" defaultValue={defaults.title} required /></div>
        <div><Label>Slug</Label><Input name="slug" defaultValue={defaults.slug} placeholder="auto-generated when empty" /></div>
        <div><Label>Excerpt</Label><Textarea name="excerpt" defaultValue={defaults.excerpt} required className="min-h-28" /></div>
        <div><Label>Content</Label><Textarea name="content" defaultValue={defaults.content} required className="min-h-[28rem] font-mono leading-7" /></div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
          <Label>Featured image</Label>
          <ImageUploader defaultUrl={defaults.featuredImageUrl} />
          <div className="mt-5"><Label>Thumbnail URL</Label><Input name="thumbnailUrl" defaultValue={defaults.thumbnailUrl ?? ""} placeholder="optional; defaults to featured image" /></div>
        </div>

        <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <Label>Category</Label>
              <Select name="categoryId" defaultValue={defaults.categoryId} required>
                <option value="">Choose category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue={defaults.status ?? "draft"}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
            <label className="flex items-center gap-3 text-sm font-bold text-ink/70">
              <input type="checkbox" name="isFeatured" defaultChecked={defaults.isFeatured} className="h-4 w-4" /> Featured post
            </label>
          </div>
        </div>

        <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label key={tag.id} className="rounded-full border border-ink/10 px-3 py-2 text-sm font-bold text-ink/65">
                <input type="checkbox" name="tagIds" value={tag.id} defaultChecked={defaults.tagIds?.includes(tag.id)} className="mr-2" />{tag.name}
              </label>
            ))}
          </div>
        </div>

        <SubmitButton>Save post</SubmitButton>
      </aside>
    </form>
  );
}
