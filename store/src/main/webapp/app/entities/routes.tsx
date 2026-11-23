import React from 'react';
import { Route } from 'react-router';

import { ReducersMapObject, combineReducers } from '@reduxjs/toolkit';
import { useStore } from 'react-redux';

import type { InjectableStore } from 'app/config/store';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import PageNotFound from 'app/shared/error/page-not-found';
import { registerTranslations } from 'app/shared/reducers/locale';

import entitiesReducers from './reducers';

// Register the microfrontend translations before the routes are rendered by the host application.
await registerTranslations();

import Product from './store/product';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  // Use the store provided by the host application, microfrontends must not rely on module singletons.
  const store = useStore() as InjectableStore;
  store.injectReducer('store', combineReducers(entitiesReducers as ReducersMapObject));
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        <Route path="/product/*" element={<Product />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
        <Route path="*" element={<PageNotFound />} />
      </ErrorBoundaryRoutes>
    </div>
  );
};
