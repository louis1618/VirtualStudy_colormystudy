module.exports = {
  // ESLint 설정을 완전히 비활성화
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 타입 체크 비활성화
  typescript: {
    ignoreBuildErrors: true,
  },
  // 이미지 최적화 설정
  images: {
    domains: ['cdn.pixabay.com'],
  },
  // 정적 내보내기 제거 (NextAuth와 호환되지 않음)
  // output: 'export',
  // 웹팩 설정
  webpack: (config) => {
    // 웹팩 설정 커스터마이징
    return config;
  },
}
