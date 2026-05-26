export default function TeamStrip() {
  return (
    <section className="py-24 bg-white border-b border-neutral-200">
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
          {/* TODO: Replace with real team photos + names once confirmed */}
          <div className="flex flex-col text-center">
            <div className="aspect-square bg-neutral-200 rounded-[18px] mb-4 overflow-hidden" />
            <h3 className="font-display font-bold text-lg text-neutral-900">Josh Pack</h3>
            <p className="font-body text-sm text-[#F26522] font-bold">Founder & Creative Director</p>
          </div>
          <div className="flex flex-col text-center">
            <div className="aspect-square bg-neutral-200 rounded-[18px] mb-4 overflow-hidden" />
            <h3 className="font-display font-bold text-lg text-neutral-900">[Team Member 2]</h3>
            <p className="font-body text-sm text-[#F26522] font-bold">[Role]</p>
          </div>
          <div className="flex flex-col text-center">
            <div className="aspect-square bg-neutral-200 rounded-[18px] mb-4 overflow-hidden" />
            <h3 className="font-display font-bold text-lg text-neutral-900">[Team Member 3]</h3>
            <p className="font-body text-sm text-[#F26522] font-bold">[Role]</p>
          </div>
          <div className="flex flex-col text-center">
            <div className="aspect-square bg-neutral-200 rounded-[18px] mb-4 overflow-hidden" />
            <h3 className="font-display font-bold text-lg text-neutral-900">[Team Member 4]</h3>
            <p className="font-body text-sm text-[#F26522] font-bold">[Role]</p>
          </div>
        </div>
      </div>
    </section>
  );
}
