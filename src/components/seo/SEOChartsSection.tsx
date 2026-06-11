"use client";

import { KeywordRankingChart, TrafficSparkline } from "@/components/ui/animated-charts";

export default function SEOChartsSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Keyword Ranking Chart */}
            <div className="lg:col-span-7 border-[2.5px] border-[#F5C842] p-6 md:p-8 bg-[#0a0a0a]/40 shadow-[6px_6px_0px_#0a0a0a]">
                <KeywordRankingChart 
                    title="Keyword Ranking Improvement"
                    subtitle="Jackson Law — Google position before → after SEO campaign"
                    data={[
                        { keyword: "personal injury lawyer georgia", before: 24, after: 1 },
                        { keyword: "car accident attorney villa rica", before: 18, after: 1 },
                        { keyword: "slip and fall lawyer west georgia", before: 31, after: 2 },
                        { keyword: "wrongful death attorney ga", before: 27, after: 3 },
                        { keyword: "truck accident lawyer georgia", before: 22, after: 1 },
                    ]}
                />
            </div>

            {/* Traffic Sparklines Column */}
            <div className="lg:col-span-5 flex flex-col gap-8 w-full">
                <div className="border-[2.5px] border-[#F5C842] p-6 md:p-8 bg-[#0a0a0a]/40 shadow-[6px_6px_0px_#0a0a0a]">
                    <TrafficSparkline 
                        label="Organic Sessions (Jackson Law)" 
                        valueLabel="+340%" 
                        color="#B5330E" 
                    />
                </div>
                <div className="border-[2.5px] border-[#F5C842] p-6 md:p-8 bg-[#0a0a0a]/40 shadow-[6px_6px_0px_#0a0a0a]">
                    <TrafficSparkline
                        label="Google Business Profile Clicks"
                        valueLabel="+180%"
                        color="#56CCF2"
                        data={[80, 90, 85, 100, 115, 128, 140, 155, 168, 182, 200, 212]}
                    />
                </div>
            </div>
        </div>
    );
}
