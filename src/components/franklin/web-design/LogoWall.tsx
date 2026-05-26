export default function LogoWall() {
  const placeholders = [
    "PORTFOLIO CLIENT 01",
    "PORTFOLIO CLIENT 02",
    "PORTFOLIO CLIENT 03",
    "PORTFOLIO CLIENT 04",
    "PORTFOLIO CLIENT 05",
    "PORTFOLIO CLIENT 06",
    "PORTFOLIO CLIENT 07",
    "PORTFOLIO CLIENT 08",
    "PORTFOLIO CLIENT 09",
    "PORTFOLIO CLIENT 10",
  ];

  return (
    <section className="py-12 bg-[#EDE9E4] overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        {/* Uppercase label */}
        <p className="font-body text-xs font-bold tracking-[0.2em] text-[#6a6a68] uppercase mb-8">
          RECENT CLIENTS · SOUTHEAST PORTFOLIO
        </p>

        {/* Wordmarks Row */}
        <div className="relative w-full overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center justify-between gap-8 md:gap-12 min-w-max md:min-w-0 md:justify-center opacity-40">
            {placeholders.map((text, i) => (
              <div key={i} className="flex-shrink-0 transition-opacity duration-300 hover:opacity-100 py-2">
                <svg width="150" height="24" viewBox="0 0 150 24" className="w-auto h-5">
                  <text
                    x="50%"
                    y="16"
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
                    fontSize="11"
                    fontWeight="800"
                    fill="#121417"
                    letterSpacing="0.08em"
                  >
                    {text}
                  </text>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
