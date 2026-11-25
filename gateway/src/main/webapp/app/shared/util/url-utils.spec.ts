import { describe, expect, it } from 'vitest';

import { getLoginUrl } from './url-utils';

describe('url-utils', () => {
  describe('getLoginUrl', () => {
    it('should return a root-relative login URL that the router can navigate to', () => {
      expect(getLoginUrl()).toBe('/sign-in');
    });

    it('should not return a protocol-relative URL (react-router parses those as relative paths)', () => {
      expect(getLoginUrl().startsWith('//')).toBe(false);
    });
  });
});
