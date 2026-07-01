import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Loader2,
  Package,
  Search,
  Tags,
  X,
} from "lucide-react";
import { db } from "../../../lib/firebase";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  inStock: boolean;
  featured: boolean;
  categoryId: string;
  categoryName: string;
}

interface ProductCategory {
  id: string;
  name: string;
  count: number;
}

export default function AdminAllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [productsSnap, categoriesSnap] = await Promise.all([
          getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "productCategories")),
        ]);

        const categoryNameById = new Map<string, string>();
        const categoryCounts = new Map<string, number>();

        for (const categoryDoc of categoriesSnap.docs) {
          const data = categoryDoc.data() as Record<string, unknown>;
          const name =
            typeof data.name === "string" && data.name.trim()
              ? data.name
              : "Unnamed";

          categoryNameById.set(categoryDoc.id, name);
          categoryCounts.set(categoryDoc.id, 0);
        }

        const loadedProducts = productsSnap.docs.map((productDoc) => {
          const data = productDoc.data() as Record<string, unknown>;
          const categoryId =
            typeof data.categoryId === "string" ? data.categoryId : "";

          if (categoryId) {
            categoryCounts.set(
              categoryId,
              (categoryCounts.get(categoryId) ?? 0) + 1
            );
          }

          return {
            id: productDoc.id,
            name:
              typeof data.name === "string" && data.name.trim()
                ? data.name
                : "Untitled",
            slug: typeof data.slug === "string" ? data.slug : "",
            price: typeof data.price === "number" ? data.price : 0,
            stock: typeof data.stock === "number" ? data.stock : 0,
            inStock: data.inStock !== false,
            featured: data.featured === true,
            categoryId,
            categoryName:
              categoryNameById.get(categoryId) ??
              (typeof data.categorySlug === "string" && data.categorySlug
                ? data.categorySlug
                : "Uncategorized"),
          };
        });

        const loadedCategories = categoriesSnap.docs
          .map((categoryDoc) => ({
            id: categoryDoc.id,
            name: categoryNameById.get(categoryDoc.id) ?? "Unnamed",
            count: categoryCounts.get(categoryDoc.id) ?? 0,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setProducts(loadedProducts);
        setCategories(loadedCategories);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;
      const matchesSearch =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery) ||
        product.categoryName.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [normalizedQuery, products, selectedCategory]);

  const groupedProducts = useMemo(() => {
    if (selectedCategory !== "all" || normalizedQuery) {
      return null;
    }

    const groups = new Map<string, { categoryName: string; products: Product[] }>();

    for (const product of filteredProducts) {
      const key = product.categoryId || "uncategorized";
      if (!groups.has(key)) {
        groups.set(key, {
          categoryName: product.categoryName || "Uncategorized",
          products: [],
        });
      }

      groups.get(key)?.products.push(product);
    }

    return Array.from(groups.entries()).map(([categoryId, value]) => ({
      categoryId,
      categoryName: value.categoryName,
      products: value.products,
    }));
  }, [filteredProducts, normalizedQuery, selectedCategory]);

  const selectedCategoryLabel =
    selectedCategory === "all"
      ? "All Categories"
      : categories.find((category) => category.id === selectedCategory)?.name ??
        "Unknown";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
              All Products
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {products.length} product{products.length !== 1 ? "s" : ""} across{" "}
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
            </p>
          </div>

          <Link
            to="/admin/store?tab=products"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Package size={15} />
            New Product
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products by name, slug, or category"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label="Clear product search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <Tags size={15} />
              <span className="sr-only">Filter by category</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-1 focus:ring-slate-300"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </label>

            {(selectedCategory !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-700"
              >
                <X size={12} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {!loading && (
          <p className="mt-3 text-xs text-slate-400">
            Showing {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
            {selectedCategory !== "all" ? ` in ${selectedCategoryLabel}` : ""}
            {normalizedQuery ? ` for "${searchQuery.trim()}"` : ""}
          </p>
        )}

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-20 text-center">
              <p className="text-sm text-slate-500">No products found.</p>
              <p className="mt-1 text-xs text-slate-400">
                Try a different category or search term.
              </p>
            </div>
          ) : groupedProducts ? (
            <div className="space-y-5">
              {groupedProducts.map((group) => (
                <section
                  key={group.categoryId}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-sm font-semibold text-slate-700">
                        {group.categoryName}
                      </h2>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                        {group.products.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory(group.categoryId)}
                      className="text-xs font-medium text-slate-400 transition hover:text-slate-600"
                    >
                      Filter this category
                    </button>
                  </div>

                  <ProductsTable products={group.products} />
                </section>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <ProductsTable products={filteredProducts} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsTable({ products }: { products: Product[] }) {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{product.name}</span>
                    {product.featured && (
                      <span className="rounded bg-violet-50 px-1.5 py-px text-[10px] font-semibold text-violet-600">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-400">
                    {product.slug}
                  </div>
                </td>
                <td className="px-3 py-3.5 text-slate-600">{product.categoryName}</td>
                <td className="px-3 py-3.5 font-semibold text-slate-800">
                  ₹{product.price}
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                      product.stock <= 0
                        ? "bg-red-50 text-red-600"
                        : product.stock <= 5
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      product.inStock
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    to={`/admin/store?tab=products&editProduct=${product.id}`}
                    className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    Edit <ChevronRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {products.map((product) => (
          <div key={product.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {product.name}
                  </p>
                  {product.featured && (
                    <span className="rounded bg-violet-50 px-1.5 py-px text-[10px] font-semibold text-violet-600">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">{product.categoryName}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  ₹{product.price}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                  product.inStock
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {product.inStock ? "In Stock" : "Out"}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Stock: {product.stock}</span>
                <span className="font-mono">{product.slug}</span>
              </div>
              <Link
                to={`/admin/store?tab=products&editProduct=${product.id}`}
                className="text-xs font-medium text-blue-600"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
