// PWA manifest for installable web app
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BSESensexVip - ผลหวยและข้อมูลตลาดหุ้น',
    short_name: 'BSESensexVip',
    description: 'ผลหวย BSESensexVip ผลหวยย้อนหลัง ข้อมูลตลาดหุ้น SET Index แผนภูมิหุ้น ข่าวสารการเงิน และการวิเคราะห์ตลาดทุน อัพเดทแบบเรียลไทม์',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/images/logo-header.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
