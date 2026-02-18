import React from "react";

const stats = [
  { label: "Years of local expertise", value: "15+" },
  { label: "Transactions managed", value: "1,200+" },
  { label: "Countries served", value: "14" },
  { label: "Client satisfaction", value: "4.9 / 5" },
];

const pillars = [
  {
    title: "Advisory first",
    body: "We pair market intelligence with tailored guidance, helping clients buy, sell, and invest with clarity.",
  },
  {
    title: "Global reach, local focus",
    body: "Our Dubai roots and international network keep us close to every opportunity, from luxury launches to off-plan gems.",
  },
  {
    title: "Design + data",
    body: "We combine storytelling, architecture, and analytics to present properties with intention and accuracy.",
  },
];

const leadership = [
  {
    name: "Abdullah Al Hashimi",
    title: "Chief Executive Officer",
    blurb:
      "Steers A2 Properties with a focus on disciplined growth, transparent partnerships, and investor-first execution across Dubai’s prime districts.",
  },
  {
    name: "Aya Motaz Nachar",
    title: "Managing Director",
    blurb:
      "Oversees daily operations and client delivery, ensuring every transaction runs with precision, speed, and white-glove service.",
  },
];

const About = () => {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141414] via-[#0f1013] to-[#090b0c] px-6 sm:px-10 py-12 sm:py-16 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <div className="absolute -left-24 -top-24 h-64 w-64 bg-[#7DF5CA]/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-72 w-72 bg-white/5 blur-[120px]" />

        <div className="relative grid gap-10 lg:grid-cols-[1.2fr,1fr] items-center">
          <div className="space-y-5 text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">About A2 Properties</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
              A trusted real estate partner grounded in Dubai, connected worldwide.
            </h1>
            <p className="text-white/75 text-base sm:text-lg leading-relaxed">
              We help investors, homeowners, and developers navigate Dubai's most dynamic neighborhoods. From off-plan
              launches to premium resales, our team pairs data, design, and deep market knowledge to deliver clarity and
              confidence at every step.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:info@a2properties.ae"
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-3 text-sm font-semibold shadow hover:bg-gray-200 transition"
              >
                Talk to our team
              </a>
              <a
                href="/properties"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                View listings
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-white shadow-[0_16px_50px_rgba(0,0,0,0.4)]"
              >
                <p className="text-2xl sm:text-3xl font-semibold">{item.value}</p>
                <p className="text-xs sm:text-sm text-white/60 mt-1 leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr] items-start">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4 text-white">
          <p className="text-sm uppercase tracking-[0.18em] text-white/60">Our promise</p>
          <h2 className="text-2xl sm:text-3xl font-semibold leading-tight">
            Boutique service with institutional rigor.
          </h2>
          <p className="text-white/70 leading-relaxed">
            We move quickly, but never at the expense of diligence. Our advisors keep you informed, our marketing team
            elevates each listing, and our operations group ensures every document, timeline, and touchpoint is clear.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm font-semibold">Transparent process</p>
              <p className="text-sm text-white/60 mt-1">Clear fees, timely updates, and no surprises.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm font-semibold">Curated inventory</p>
              <p className="text-sm text-white/60 mt-1">We hand-pick launches and resales that meet strict quality bars.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#121212] via-[#0d0d0d] to-[#0a0a0a] p-6 sm:p-7 space-y-5 text-white">
          <p className="text-sm uppercase tracking-[0.18em] text-white/60">What sets us apart</p>
          <ul className="space-y-4">
            {pillars.map((pillar) => (
              <li key={pillar.title} className="space-y-1.5">
                <p className="text-lg font-semibold">{pillar.title}</p>
                <p className="text-sm text-white/70 leading-relaxed">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

<section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1013] via-[#0b0c0f] to-black p-6 sm:p-10 space-y-8 text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
  {/* soft ambient glow */}
  <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[#7DF5CA]/10 blur-3xl" />
  <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/5 blur-[120px]" />

  <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="space-y-2 max-w-2xl">
      <p className="text-xs uppercase tracking-[0.22em] text-white/60">Leadership</p>
      <h3 className="text-2xl sm:text-3xl font-semibold">People behind the craft</h3>
      <p className="text-sm sm:text-base text-white/70 leading-relaxed">
        Seasoned operators and advisors focused on precision execution, clear communication, and investor-first outcomes.
      </p>
    </div>

    <div className="flex flex-wrap gap-3">
      <a
        href="mailto:info@a2properties.ae?subject=Leadership%20meeting%20request"
        className="inline-flex items-center justify-center rounded-full bg-white text-black px-4 py-2 text-sm font-semibold shadow hover:bg-gray-200 transition"
      >
        Meet with us
      </a>
      <a
        href="/contact"
        className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
      >
        Contact page
      </a>
    </div>
  </div>

  <div className="relative grid gap-4 sm:grid-cols-2">
    {leadership.map((leader) => {
      const initials = leader.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 3);

      return (
        <div
          key={leader.name}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_16px_60px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
        >
          {/* hover sheen */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#7DF5CA]/10 blur-2xl" />
            <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
          </div>

          <div className="relative flex items-start gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/15 flex items-center justify-center font-semibold text-lg">
                {initials}
              </div>
              <div className="absolute -bottom-2 -right-2 h-6 px-2 rounded-full border border-white/15 bg-black/40 text-[10px] uppercase tracking-[0.18em] text-white/70 flex items-center">
                Lead
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-lg font-semibold leading-snug">{leader.name}</p>
              <p className="text-sm text-white/60">{leader.title}</p>
            </div>
          </div>

          <div className="relative mt-4 h-px w-full bg-gradient-to-r from-white/15 via-white/5 to-transparent" />

          <p className="relative mt-4 text-sm text-white/75 leading-relaxed">
            {leader.blurb}
          </p>

          <div className="relative mt-5 flex flex-wrap gap-3">
            <a
              href={`mailto:info@a2properties.ae?subject=Meeting%20request%20with%20${encodeURIComponent(
                leader.name
              )}`}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Email
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
            >
              Request a callback
            </a>
          </div>
        </div>
      );
    })}
  </div>
</section>

    </div>
  );
};

export default About;
