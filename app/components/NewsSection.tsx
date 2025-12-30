/**
 * [PURPOSE] Displays a vertical list of news articles with images, titles, content, and timestamps, alongside a sidebar advertisement.
 * [FLOW] Static news data -> NewsSection component -> UI render
 * [LINKS]
 * - Used By: @/app/page.tsx
 */
import React from 'react';
import Image from 'next/image';

// News data structure
interface NewsItem {
  id: number;
  image: string;
  title: string;
  content: string;
  timeAgo: string;
}

// News articles data
const newsData: NewsItem[] = [
  {
    id: 1,
    image: '/images/fix-new-toppage.jpg',
    title: 'ตลาดหุ้นวันนี้: หุ้นกลุ่มพลังงานหนุนดาวโจนส์ปรับตัวขึั้น',
    content: 'Investing.com -- ดัชนีดาวโจนส์เริ่มต้นสัปดาห์ที่ดีในวันจันทร์ เนื่องจากการปรับขึ้นของภาคพลังงานชดเชยการอ่อนแอลงในภาคเทคโนโลยี ก่อนรายรับรายไตรมาสจากเทคโนโลยีรายใหญ่และการประชุมธนาคารกลางสหรัฐที่จะเริ่มขึ้นในสัปดาห์นี้',
    timeAgo: 'Last updated 20 mins ago',
  },
  {
    id: 2,
    image: '/images/new1.jpg',
    title: 'น้ำมันขึ้นเนื่องจากยุโรปอาจเปลี่ยนไปใช้น้ำมันดิบแทนการใช้ก๊าซ',
    content: 'ราคาน้ำมันปรับตัวขึ้นเช้าวันอังคารในเอเชียเนื่องจากมีการคาดการณ์ว่าการที่รัสเซียปรับลดการส่ง ก๊าซธรรมชาติ ไปยังยุโรปจะกระตุ้นให้เกิดการเปลี่ยนไปใช้น้ำมันดิบแทน และยังมีความกังวลเกี่ยวกับความต้องการน้ำมันที่ลดลงเนื่องจากการปรับขึ้นอัตราดอกเบี้ยของสหรัฐฯ',
    timeAgo: 'Last updated 3 mins ago',
  },
  {
    id: 3,
    image: '/images/new2.jpg',
    title: 'ทองคำขึ้นจากค่าเงินดอลลาร์ที่อ่อนค่าลงจากการประชุมของเฟด',
    content: 'ราคาทองคำปรับตัวขึ้นเช้าวันอังคารในตลาดเอเชียจากค่าเงินดอลลาร์ที่อ่อนค่าลง แต่ราคายังคงอยู่ในช่วงตึงตัวเนื่องจากนักลงทุนเปลี่ยนโฟกัสไปที่การปรับขึ้นอัตราดอกเบี้ยของสหรัฐฯ',
    timeAgo: 'Last updated 7 mins ago',
  },
  {
    id: 4,
    image: '/images/new3.jpg',
    title: 'หุ้นเอเชียขึ้น ก่อนเฟดปรับขึ้นอัตราดอกเบี้ย',
    content: 'หุ้นเอเชียแปซิฟิกปรับตัวขึ้นในเช้าวันอังคาร ก่อนการปรับขึ้นอัตราดอกเบี้ยจากธนาคารกลางสหรัฐฯ',
    timeAgo: 'Last updated 12 mins ago',
  },
];

export function NewsSection() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News articles */}
          <div className="lg:col-span-2 space-y-4">
            {newsData.map((news) => (
              <div key={news.id} className="flex gap-4 pb-4 border-b border-gray-200">
                {/* Image */}
                <div className="w-32 h-24 rounded flex-shrink-0 overflow-hidden relative">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-base text-[#0051a3] leading-tight hover:underline cursor-pointer">
                    {news.title}
                  </h3>
                  <p className="text-sm text-[#333333] leading-relaxed line-clamp-2">
                    {news.content}
                  </p>
                  <p className="text-[11px] text-[#999999] pt-1">
                    {news.timeAgo}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sidebar ad */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="w-full flex items-center justify-center">
                <Image
                  src="/images/6836881427976322671.gif"
                  alt="Advertisement"
                  width={250}
                  height={500}
                  className="object-contain max-w-[250px]"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

