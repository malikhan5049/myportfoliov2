export const getLoginUrl = () => {
  // If you have configured multiple OIDC providers, then, you can update this URL to /login.
  // It will show a Spring Security generated login page with links to configured OIDC providers.
  //
  // This must be a root-relative path: react-router's navigate() parses protocol-relative
  // URLs like `//localhost:9001/sign-in` as relative paths, which corrupts the post-login
  // redirect stored in state (`http://<origin>/localhost:9001/sign-in`).
  return '/sign-in';
};
export const REDIRECT_URL = 'redirectURL';
