export const reviewItems = [
  {
    id: 'aigc-soda-concept',
    title: '汽水产品概念视觉练习',
    description: '围绕汽水产品的色彩与形态，探索 AIGC 产品镜头、场景氛围与视觉节奏。',
    video: '/assets/visual-gallery/videos/aigc-soda-product-concept.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
  },
  {
    id: 'aigc-brand-concept-01',
    title: '品牌概念视觉练习 01',
    description: '以食物微距、暖色光影与质感细节为核心，呈现富有食欲的 AIGC 产品概念影像。',
    video: '/assets/visual-gallery/videos/aigc-brand-concept-01.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
  },
  {
    id: 'aigc-brand-concept-02',
    title: '品牌概念视觉练习 02',
    description: '以汉堡的层次结构、热气与近景细节构建画面，探索 AIGC 食品视觉的质感与节奏。',
    video: '/assets/visual-gallery/videos/aigc-brand-concept-02.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
  },
  {
    id: 'aigc-fragrance-concept',
    title: '香氛产品｜AIGC 产品视觉练习',
    description: '以香氛瓶身、玻璃材质与明暗光影构建产品氛围，呈现克制的 AIGC 产品视觉。',
    video: '/assets/visual-gallery/videos/aigc-product-fragrance.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
  },
  {
    id: 'aigc-superhero-concept',
    title: '超级英雄动作概念练习',
    description: '将角色动作与城市夜景结合，通过镜头运动与节奏编排营造动作场面的速度感。',
    video: '/assets/visual-gallery/videos/aigc-superhero-action.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
  },
];

export const findReviewItem = videoId => reviewItems.find(item => item.id === videoId) || null;
