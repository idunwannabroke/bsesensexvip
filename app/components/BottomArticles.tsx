/**
 * [PURPOSE] Horizontal grid of article cards with images, titles, content, and timestamps.
 * [FLOW] Static news data -> BottomArticles component -> UI render
 * [LINKS]
 * - Used By: @/app/page.tsx
 */
import React from 'react';
import Image from 'next/image';

// Bottom article data structure
interface BottomArticle {
  id: number;
  image: string;
  title: string;
  content: string;
  source: string;
  timeAgo: string;
}

// Bottom articles data
const bottomArticlesData: BottomArticle[] = [
  {
    id: 1,
    image: '/images/download (10).png',
    title: 'เปิดมุมมองนักกลยุทธ์การลงทุน คาดปี 2023 ตลาดหุ้นโลกเตรียมเผชิญหน้า ‘ปัจจัยเซอร์ไพรส์’ เพียบ',
    content: 'ระบอบภาษีของทรัมป์ถูกนำขึ้นศาล Macquarie ชี้ทุกสายตาจับจ้องที่ดอลลาร์สหรัฐ Investing.com - สถานะของดอลลาร์กลับมาอยู่ในความสนใจอีกครั้ง... โดย Investing.com • Nov 05, 2025 หุ้นญี่ปุ่นที่พุ่งสูงจะส่งผ',
    source: 'Investing.com',
    timeAgo: 'Last updated 18 mins ago',
  },
  {
    id: 2,
    image: '/images/download (11).png',
    title: 'ราคาทองคำปรับตัวขึ้นในเช้าวันจันทร์ในเอเชีย เนื่องจากค่าเงินดอลลาร์สหรัฐอ่อนค่าลงก่อนวันหยุดของสหรัฐฯ',
    content: 'ราคาทองคำปรับตัวขึ้นในเช้าวันจันทร์ในเอเชีย เนื่องจากค่าเงินดอลลาร์สหรัฐอ่อนค่าลงก่อนวันหยุดของสหรัฐฯ ท่ามกลางการซื้อขายที่เบาบางก่อนเข้าสู่ช่วงวันหยุดยาว',
    source: 'Investing.com',
    timeAgo: 'Last updated 25 mins ago',
  },
  {
    id: 3,
    image: '/images/download (12).png',
    title: 'โจทย์ท้าทาย “ตลาดหุ้นญี่ปุ่น” นักลงทุนส่วนใหญ่อายุมากกว่า 70 ปี',
    content: 'ปัญหาสังคมสูงอายุของ “ญี่ปุ่น” กำลังส่งสัญญาณดังขึ้นในทุก ๆ ด้าน ไม่ว่าจะเป็นภาวะขาดแคลนแรงงาน ปัญหาบ้านร้าง และปัจจุบันพบว่า ผู้สูงวัยญี่ปุ่น ยังเป็นกลุ่มนักลงทุนรายย่อยที่มีสัดส่วนการถือครองหุ้นของบริษัทในตลาดหลักทรัพย์ญี่ปุ่นสูงสุดเมื่อเทียบกับนักลงทุนวัยอื่น ที่กลายเป็นความเสี่ยงต่อบริษัทญี่ปุ่น',
    source: 'Investing.com',
    timeAgo: 'Last updated 49 mins ago',
  },
];

export function BottomArticles() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bottomArticlesData.map((article) => (
            <div key={article.id} className="space-y-3">
              {/* Image */}
              <div className="w-full aspect-video rounded overflow-hidden relative">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-bold text-base text-black leading-tight">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {article.content}
                </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {article.timeAgo}
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

