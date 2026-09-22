export const reviewItems = [
  {
    id: 'aigc-soda-concept',
    title: '汽水产品概念视觉练习',
    description: '非官方个人 AIGC 概念练习，与画面所涉品牌方不存在合作、委托、授权、认可或推广关系。',
    video: '/assets/visual-gallery/videos/aigc-soda-product-concept.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
    unofficial: true,
  },
  {
    id: 'aigc-brand-concept-01',
    title: '品牌概念视觉练习 01',
    description: '非官方个人 AIGC 概念练习，仅供受邀招聘人员评估制作能力。',
    video: '/assets/visual-gallery/videos/aigc-brand-concept-01.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
    unofficial: true,
  },
  {
    id: 'aigc-brand-concept-02',
    title: '品牌概念视觉练习 02',
    description: '非官方个人 AIGC 概念练习，仅供受邀招聘人员评估制作能力。',
    video: '/assets/visual-gallery/videos/aigc-brand-concept-02.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
    unofficial: true,
  },
  {
    id: 'aigc-fragrance-concept',
    title: '香氛产品｜AIGC 产品视觉练习',
    description: '非官方个人 AIGC 香氛产品概念练习，仅用于制作能力展示。',
    video: '/assets/visual-gallery/videos/aigc-product-fragrance.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
    unofficial: true,
  },
  {
    id: 'aigc-superhero-concept',
    title: '超级英雄动作概念练习',
    description: '非官方个人 AIGC 角色动作练习，与相关角色或 IP 权利方不存在合作、委托、授权、认可或推广关系。',
    video: '/assets/visual-gallery/videos/aigc-superhero-action.mp4',
    posterUrl: '/assets/review-posters/review-neutral.svg',
    unofficial: true,
  },
];

export const findReviewItem = videoId => reviewItems.find(item => item.id === videoId) || null;
