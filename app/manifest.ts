import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OUSCARAVAN Concierge',
    short_name: 'OUS',
    description: 'Smart Concierge for OUSCARAVAN',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#FF7E5F',
    // 아이콘 파일이 없으므로 임시로 제거
    // 실제 아이콘 파일을 추가한 후 다시 활성화하세요
    // icons: [
    //   {
    //     src: '/icon-192.png',
    //     sizes: '192x192',
    //     type: 'image/png',
    //   },
    //   {
    //     src: '/icon-512.png',
    //     sizes: '512x512',
    //     type: 'image/png',
    //   },
    // ],
  };
}
