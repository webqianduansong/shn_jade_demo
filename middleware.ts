import createMiddleware from 'next-intl/middleware';
import intlConfig from './next-intl.config';

const intl = createMiddleware(intlConfig);

export default intl;

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};


