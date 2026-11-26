import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Authority from './authority';
import AuthorityDetail from './authority-detail';
import AuthorityUpdate from './authority-update';

const AuthorityRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Authority />} />
    <Route path=":name">
      <Route index element={<AuthorityDetail />} />
      <Route path="edit" element={<AuthorityUpdate />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default AuthorityRoutes;
