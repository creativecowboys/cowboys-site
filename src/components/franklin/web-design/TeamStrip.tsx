import Image from "next/image";

export default function TeamStrip() {
  const team = [
    {
      name: "Josh Pack",
      role: "Founder & Creative Director",
      image: "/franklin-tn/team-placeholder-1.png",
    },
    {
      name: "[Team Member 2]",
      role: "[Role]",
      image: "/franklin-tn/team-placeholder-2.png",
    },
    {
      name: "[Team Member 3]",
      role: "[Role]",
      image: "/franklin-tn/team-placeholder-3.png",
    },
    {
      name: "[Team Member 4]",
      role: "[Role]",
      image: "/franklin-tn/team-placeholder-4.png",
    },
  ];

  return (
    <section className="py-28 bg-[#F4F2F0]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-neutral-900 mb-6">
            Who you&apos;ll actually work with.
          </h2>
          <p className="font-body text-lg text-neutral-600 leading-relaxed">
            Most agencies show you a senior person on the sales call and hand the project to a junior nobody after you sign. We don&apos;t do that. The person you meet is the person who builds it.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <div key={i} className="flex flex-col text-center">
              <div className="aspect-square bg-[#EDE9E4] rounded-[18px] mb-4 overflow-hidden relative shadow-sm select-none">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-display font-bold text-lg text-neutral-900">
                {member.name}
              </h3>
              <p className="font-body text-sm text-[#F26522] font-bold">
                {member.role}
              </p>
              <p className="font-body text-[12px] text-[#6a6a68] mt-2 italic leading-tight">
                Illustrated portrait · Real photo coming soon
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
