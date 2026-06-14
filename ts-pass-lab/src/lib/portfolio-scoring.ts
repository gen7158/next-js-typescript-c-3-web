import type { PortfolioScore } from '@/types/platform';

const includesAny = (value: string, words: string[]) => words.some((word) => value.toLowerCase().includes(word.toLowerCase()));

export function scorePortfolio(input: {
  code: string;
  description: string;
  repositoryUrl: string;
  demoUrl: string;
}): PortfolioScore {
  const { code, description, repositoryUrl, demoUrl } = input;
  if (!code.trim()) {
    return { functionality: 0, typeSafety: 0, backend: 0, security: 0, testing: 0, documentation: 0, total: 0 };
  }
  const functionality = Math.min(20, (code.length >= 300 ? 12 : code.length >= 100 ? 8 : 4) + (includesAny(code, ['function', '=>', 'class']) ? 5 : 0) + (includesAny(code, ['console.log', 'return']) ? 3 : 0));
  const typeSafety = Math.min(20, (includesAny(code, ['type ', 'interface ']) ? 8 : 0) + (includesAny(code, [': string', ': number', ': boolean', 'unknown']) ? 7 : 0) + (!includesAny(code, [': any', ' as any']) ? 5 : 0));
  const backend = Math.min(15, (includesAny(`${code} ${description}`, ['api', 'route', 'request', 'response', 'sql', 'prisma', 'database', 'db']) ? 9 : 2) + (includesAny(code, ['async', 'promise', 'status']) ? 6 : 0));
  const security = Math.min(15, (includesAny(`${code} ${description}`, ['validate', '検証', 'session', '認証', '認可', 'owner', 'permission', 'hash']) ? 9 : 2) + (!includesAny(code, ['password = "', 'apiKey = "', 'secret = "']) ? 6 : 0));
  const testing = Math.min(15, (includesAny(`${code} ${description}`, ['test', 'expect', 'テスト', '境界値', '異常系']) ? 9 : 2) + (includesAny(code, ['throw new Error', 'try', 'catch', 'if (']) ? 6 : 0));
  const documentation = Math.min(15, (description.trim().length >= 120 ? 8 : description.trim().length >= 50 ? 5 : 2) + (repositoryUrl.startsWith('http') ? 4 : 0) + (demoUrl.startsWith('http') ? 3 : 0));
  return {
    functionality,
    typeSafety,
    backend,
    security,
    testing,
    documentation,
    total: functionality + typeSafety + backend + security + testing + documentation,
  };
}
