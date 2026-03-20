import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { RefreshCcw } from "lucide-react";
import { useToast } from "../ui/Toast";
import { db } from "../../firebase";
import ImageUploader from "../ui/ImageUploader";
import {
  generateSearchKeywords,
  slugifyText,
  splitCommaSeparated,
} from "../../lib/blogs";

interface UploadedImage {
  url: string;
  publicId: string;
}

export interface EditableBlog {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  category?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  coverImage?: string;
  coverImagePublicId?: string;
  status?: string;
  published?: boolean;
  publishedAt?: any;
}

interface BlogFormCardProps {
  blogToEdit: EditableBlog | null;
  onSaved: () => void;
  onCancelEdit: () => void;
}

interface BlogFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogImage: string;
  coverImage: UploadedImage[];
}

const initialFormState: BlogFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "AfixZ Team",
  category: "Insights",
  tags: "",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  ogImage: "",
  coverImage: [],
};

const BlogFormCard = ({
  blogToEdit,
  onSaved,
  onCancelEdit,
}: BlogFormCardProps) => {
  const [form, setForm] = useState<BlogFormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!blogToEdit) {
      setForm(initialFormState);
      setSlugManuallyEdited(false);
      return;
    }

    setForm({
      title: blogToEdit.title || "",
      slug: blogToEdit.slug || "",
      excerpt: blogToEdit.excerpt || "",
      content: blogToEdit.content || "",
      author: blogToEdit.author || "AfixZ Team",
      category: blogToEdit.category || "Insights",
      tags: Array.isArray(blogToEdit.tags) ? blogToEdit.tags.join(", ") : "",
      status:
        blogToEdit.status === "published" || blogToEdit.published
          ? "published"
          : "draft",
      seoTitle: blogToEdit.seoTitle || "",
      seoDescription: blogToEdit.seoDescription || "",
      canonicalUrl: blogToEdit.canonicalUrl || "",
      ogImage: blogToEdit.ogImage || "",
      coverImage: blogToEdit.coverImage
        ? [
            {
              url: blogToEdit.coverImage,
              publicId: blogToEdit.coverImagePublicId || `blog-cover-${blogToEdit.id}`,
            },
          ]
        : [],
    });
    setSlugManuallyEdited(true);
  }, [blogToEdit]);

  const handleChange =
    (name: keyof BlogFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;

      setForm((prev) => {
        const next = {
          ...prev,
          [name]: value,
        };

        if (name === "title" && !slugManuallyEdited) {
          next.slug = slugifyText(value);
        }

        return next;
      });
    };

  const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({
      ...prev,
      slug: slugifyText(event.target.value),
    }));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setSlugManuallyEdited(false);
    onCancelEdit();
  };

  const handleSubmit = async () => {
    const slug = form.slug || slugifyText(form.title);

    if (!form.title.trim() || !slug) {
      showToast("Title and slug are required.", "error");
      return;
    }

    try {
      setLoading(true);

      const duplicateQuery = query(
        collection(db, "blogs"),
        where("slug", "==", slug)
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);

      const hasDuplicate = duplicateSnapshot.docs.some(
        (entry) => entry.id !== blogToEdit?.id
      );

      if (hasDuplicate) {
        showToast("A blog with this slug already exists.", "error");
        return;
      }

      const tags = splitCommaSeparated(form.tags);
      const coverImage = form.coverImage[0];
      const publishedAt =
        form.status === "published"
          ? blogToEdit?.publishedAt || Timestamp.now()
          : null;

      const payload = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        author: form.author.trim() || "AfixZ Team",
        category: form.category.trim() || "Insights",
        tags,
        status: form.status,
        published: form.status === "published",
        publishedAt,
        coverImage: coverImage?.url || "",
        coverImagePublicId: coverImage?.publicId || "",
        ogImage: form.ogImage.trim() || coverImage?.url || "",
        seoTitle: form.seoTitle.trim() || form.title.trim(),
        seoDescription: form.seoDescription.trim() || form.excerpt.trim(),
        canonicalUrl: form.canonicalUrl.trim(),
        readTime: `${Math.max(
          1,
          Math.ceil(form.content.trim().split(/\s+/).filter(Boolean).length / 200)
        )} min read`,
        searchKeywords: generateSearchKeywords([
          form.title,
          form.category,
          ...tags,
          form.seoTitle,
        ]),
        updatedAt: Timestamp.now(),
      };

      if (blogToEdit) {
        await updateDoc(doc(db, "blogs", blogToEdit.id), payload);
      } else {
        await addDoc(collection(db, "blogs"), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      }

      showToast(blogToEdit ? "Blog updated successfully." : "Blog published successfully.", "success");
      setForm(initialFormState);
      setSlugManuallyEdited(false);
      onSaved();
    } catch (error) {
      showToast("Failed to save the blog. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const seoPreviewTitle = form.seoTitle || form.title || "Blog title preview";
  const seoPreviewDescription =
    form.seoDescription ||
    form.excerpt ||
    "A short search-friendly summary for your article will appear here.";
  const seoPreviewUrl =
    form.canonicalUrl || `${window.location.origin}/blogs/${form.slug || "your-blog-slug"}`;

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {blogToEdit ? "Edit Blog" : "Create Blog"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Write the article, set publish status, and define the SEO metadata
              the public blog pages will use.
            </p>
          </div>

          {blogToEdit && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCcw size={15} />
              New Blog
            </button>
          )}
        </div>

        <div className="mt-8 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Blog Title"
              value={form.title}
              onChange={handleChange("title")}
              placeholder="10 monsoon home-care tips"
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={handleSlugChange}
              placeholder="10-monsoon-home-care-tips"
            />
            <Input
              label="Author"
              value={form.author}
              onChange={handleChange("author")}
              placeholder="AfixZ Team"
            />
            <Input
              label="Category"
              value={form.category}
              onChange={handleChange("category")}
              placeholder="Home Care"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-2 block text-sm text-slate-600">Excerpt</label>
              <textarea
                rows={4}
                value={form.excerpt}
                onChange={handleChange("excerpt")}
                placeholder="A concise summary shown on blog cards and in search results."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-600">Status</label>
              <select
                value={form.status}
                onChange={handleChange("status")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Draft blogs stay hidden from the public page. Published blogs go
                live immediately.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-600">
              Article Content
            </label>
            <textarea
              rows={14}
              value={form.content}
              onChange={handleChange("content")}
              placeholder="Write the full article here. Separate paragraphs with blank lines."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Tags"
              value={form.tags}
              onChange={handleChange("tags")}
              placeholder="cleaning, seasonal care, maintenance"
              helperText="Comma-separated tags for filtering and SEO keywords."
            />
            <Input
              label="Open Graph Image URL"
              value={form.ogImage}
              onChange={handleChange("ogImage")}
              placeholder="Optional. Uses cover image if left blank."
            />
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-slate-700">Cover Image</h3>
            <ImageUploader
              value={form.coverImage}
              onChange={(images) =>
                setForm((prev) => ({
                  ...prev,
                  coverImage: images,
                  ogImage: prev.ogImage || images[0]?.url || "",
                }))
              }
              maxImages={1}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-800">SEO Settings</h3>
            <p className="mt-2 text-sm text-slate-500">
              These fields power the public blog page metadata, social previews,
              and search snippets.
            </p>

            <div className="mt-6 grid gap-6">
              <Input
                label="SEO Title"
                value={form.seoTitle}
                onChange={handleChange("seoTitle")}
                placeholder="Custom search title. Falls back to blog title."
              />

              <div>
                <label className="mb-2 block text-sm text-slate-600">
                  SEO Description
                </label>
                <textarea
                  rows={3}
                  value={form.seoDescription}
                  onChange={handleChange("seoDescription")}
                  placeholder="Custom meta description for search and social."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Input
                label="Canonical URL"
                value={form.canonicalUrl}
                onChange={handleChange("canonicalUrl")}
                placeholder="Optional. Leave empty to use the site blog URL."
              />

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Search Preview
                </p>
                <p className="mt-4 text-xl font-medium text-blue-700">
                  {seoPreviewTitle}
                </p>
                <p className="mt-1 break-all text-sm text-emerald-700">
                  {seoPreviewUrl}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {seoPreviewDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {loading
                ? "Saving..."
                : blogToEdit
                ? "Update Blog"
                : form.status === "published"
                ? "Publish Blog"
                : "Save Draft"}
            </button>

            {blogToEdit && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-xl border border-slate-200 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel Editing
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogFormCard;

interface InputProps {
  label: string;
  value: string;
  placeholder?: string;
  helperText?: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

function Input({ label, helperText, ...props }: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-600">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
      {helperText && (
        <p className="mt-2 text-xs leading-6 text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
