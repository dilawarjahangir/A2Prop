import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import GradientButton from "../../../components/GradientButton.jsx";
import { blogs, getBlogBySlug, getBlogsForLocale } from "../../../data/blogs.js";
import { getLocale } from "../../../hooks/useLocale.js";
import { useTranslation } from "react-i18next";
import OptimizedImage from "../../../components/OptimizedImage.jsx";

const parseBlogDate = (value) => {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
};

const tryCopyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
};

const BlockRenderer = ({ block }) => {
  if (!block) return null;

  if (block.type === "paragraph") {
    return (
      <p className="text-white/70 leading-relaxed">{block.text}</p>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="list-disc pl-5 space-y-2 text-white/75">
        {block.items?.map((item, idx) => (
          <li key={`${item}-${idx}`}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "steps") {
    return (
      <ol className="space-y-4">
        {block.items?.map((item, idx) => (
          <li
            key={`${item?.title ?? "step"}-${idx}`}
            className="flex gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 sm:p-5"
          >
            <div className="shrink-0 h-9 w-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-sm font-semibold text-white">
              {idx + 1}
            </div>
            <div className="space-y-1">
              {item?.title && (
                <p className="font-semibold text-white/90">{item.title}</p>
              )}
              {item?.text && (
                <p className="text-sm text-white/70 leading-relaxed">
                  {item.text}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="space-y-3">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <OptimizedImage
            src={block.src}
            alt={block.alt || "Blog image"}
            className="block w-full h-auto"
            imgClassName="w-full h-auto object-cover"
            loading="lazy"
            decoding="async"
            sizes="(max-width: 1024px) 100vw, 75vw"
          />
        </div>
        {block.caption && (
          <figcaption className="text-xs text-white/50">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "table") {
    return (
      <div className="space-y-3">
        {block.caption && (
          <p className="text-sm text-white/60">{block.caption}</p>
        )}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-white/80">
              <tr>
                {block.columns?.map((col) => (
                  <th key={col} className="px-4 py-3 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white/75">
              {block.rows?.map((row, idx) => (
                <tr key={`row-${idx}`}>
                  {row.map((cell, cellIdx) => (
                    <td key={`cell-${idx}-${cellIdx}`} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (block.type === "callout") {
    const internalTarget = typeof block.ctaTo === "string" ? block.ctaTo : null;

    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            {block.title && (
              <p className="text-lg font-semibold text-white">{block.title}</p>
            )}
            {block.text && (
              <p className="text-sm text-white/70 leading-relaxed max-w-prose">
                {block.text}
              </p>
            )}
          </div>
          {block.ctaLabel && (
            <GradientButton to={internalTarget} href={block.ctaHref}>
              {block.ctaLabel}
            </GradientButton>
          )}
        </div>
      </div>
    );
  }

  return null;
};

const RelatedCard = ({ post, t }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden flex flex-col">
    <Link to={`/blog/${post.slug}`} className="relative h-40 block">
      <img
        src={post.image}
        alt={post.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      {post.tag && (
        <span className="absolute top-3 left-3 rounded-full bg-black/70 border border-white/15 px-3 py-1 text-xs font-semibold text-white">
          {post.tag}
        </span>
      )}
    </Link>
    <div className="p-5 space-y-2 flex-1">
      <p className="text-xs text-white/60 uppercase tracking-wide">{post.displayDate || post.date}</p>
      <h4 className="text-lg font-semibold text-white leading-snug line-clamp-2">
        {post.title}
      </h4>
      {post.excerpt && (
        <p className="text-sm text-white/70 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      )}
    </div>
    <div className="p-5 pt-0">
      <Link
        to={`/blog/${post.slug}`}
        className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
      >
        {t("buttons.read_article")}
      </Link>
    </div>
  </div>
);

const FAQ = ({ items = [], t }) => {
  const [openIndex, setOpenIndex] = useState(0);

  if (!items.length) return null;

  const handleToggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
      <h2 className="text-2xl font-semibold">{t("sections.faq_title")}</h2>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const open = idx === openIndex;
          return (
            <button
              key={`${item.q}-${idx}`}
              type="button"
              onClick={() => handleToggle(idx)}
              aria-expanded={open}
              className={`w-full text-left bg-[#191919] border border-white/10 rounded-xl px-4 py-5 flex items-start gap-3 hover:border-white/20 transition-colors ${open ? "border-white/20" : ""}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-lg leading-none transition-transform duration-300 ${open ? "rotate-45" : ""}`}
              >
                +
              </span>

              <div className="flex-1">
                <p className="text-base font-semibold text-white/90">{item.q}</p>
                <div
                  className={`mt-2 grid overflow-hidden transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100 translate-y-0" : "grid-rows-[0fr] opacity-0 -translate-y-1"}`}
                >
                  <p className="text-sm text-white/70 leading-relaxed overflow-hidden">
                    {item.a}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const BlogDetail = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const locale = getLocale();
  const list = useMemo(() => getBlogsForLocale(locale), [locale]);
  const post = useMemo(
    () => getBlogBySlug(slug, locale) || getBlogBySlug(slug),
    [slug, locale]
  );
  const [copied, setCopied] = useState(false);

  const toc = useMemo(
    () => post?.sections?.map(({ id, title }) => ({ id, title })) ?? [],
    [post?.sections]
  );

  const related = useMemo(() => {
    const pool = (list.length ? list : blogs).filter((b) => b.slug !== post?.slug);
    const sorted = [...pool].sort(
      (a, b) => parseBlogDate(b.date) - parseBlogDate(a.date)
    );

    if (!post?.tag) return sorted.slice(0, 3);

    const sameTag = sorted.filter((b) => b.tag === post.tag);
    const otherTag = sorted.filter((b) => b.tag !== post.tag);
    return [...sameTag, ...otherTag].slice(0, 3);
  }, [list, post]);

  if (!post) {
    return (
      <div className="py-12 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
          <h1 className="text-2xl font-semibold">Article not found</h1>
          <p className="text-white/70">
            The blog post you’re looking for doesn’t exist or has been moved.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            {t("nav.blog")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 space-y-10 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/blog" className="text-sm text-white/70 hover:text-white">
          ← {t("nav.blog")}
        </Link>

        <button
          type="button"
          onClick={async () => {
            const ok = await tryCopyToClipboard(window.location.href);
            setCopied(ok);
            window.setTimeout(() => setCopied(false), 1200);
          }}
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
          {post.tag && (
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-white">
              {post.tag}
            </span>
          )}
          <span className="text-white/50">{post.displayDate || post.date}</span>
          <span className="text-white/30">•</span>
          <span className="text-white/50">{post.readingTime}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="text-white/70 text-base sm:text-lg max-w-3xl">
            {post.subtitle}
          </p>
        )}

        {post.author?.name && (
          <p className="text-sm text-white/60">
            By <span className="text-white/80">{post.author.name}</span>
            {post.author.role ? ` · ${post.author.role}` : ""}
          </p>
        )}
      </div>

      <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5">
        <OptimizedImage
          src={post.image}
          alt={post.title}
          className="block w-full h-[260px] sm:h-[360px]"
          imgClassName="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 70vw"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <article className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-10">
            {post.sections?.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 space-y-4"
              >
                <h2 className="text-2xl font-semibold">{section.title}</h2>
                <div className="space-y-4">
                  {section.blocks?.map((block, idx) => (
                    <BlockRenderer key={`${section.id}-${idx}`} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <FAQ items={post.faqs} t={t} />
        </article>

        <aside className="space-y-6 self-start lg:sticky lg:top-24">
          {toc.length > 1 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold">{t("sections.blog_detail_on_this_page")}</h3>
              <nav className="space-y-2 text-sm">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-white/70 hover:text-white transition"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h3 className="text-lg font-semibold">{t("sections.blog_detail_stay_in_loop_title")}</h3>
            <p className="text-sm text-white/70">
              {t("sections.blog_detail_stay_in_loop_body")}
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-stretch gap-2"
            >
              <input
                type="email"
                placeholder={t("forms.email_placeholder")}
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#7DF5CA] to-white text-black font-semibold px-4 text-sm"
              >
                {t("sections.blog_detail_subscribe")}
              </button>
            </form>
            <p className="text-xs text-white/40">
              {t("sections.blog_detail_no_spam")}
            </p>
          </div>
        </aside>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold">{t("sections.blog_detail_may_also_interest")}</h3>
          <Link
            to="/blog"
            className="text-sm text-white/70 hover:text-white"
          >
            {t("sections.blog_home_more_insights")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <RelatedCard key={item.slug} post={item} t={t} />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-white/60 uppercase tracking-wide">
            {t("sections.blog_detail_need_guidance_label")}
          </p>
          <h3 className="text-xl sm:text-2xl font-semibold">
            {t("sections.blog_detail_need_guidance_title")}
          </h3>
          <p className="text-sm text-white/70">
            {t("sections.blog_detail_need_guidance_body")}
          </p>
        </div>
        <GradientButton href="/properties">{t("buttons.explore_properties")}</GradientButton>
      </div>
    </div>
  );
};

export default BlogDetail;
