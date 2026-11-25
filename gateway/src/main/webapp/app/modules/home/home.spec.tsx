import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { render } from '@testing-library/react';

import getStore from 'app/config/store';
import { REDIRECT_URL } from 'app/shared/util/url-utils';

import Home from './home';

describe('Home', () => {
  const createLocationStub = () => {
    let navigatedTo: string | undefined;
    const stub = {
      origin: 'http://localhost:9000',
      pathname: '/',
      search: '',
      get href() {
        return navigatedTo ?? 'http://localhost:9000/';
      },
      set href(value: string) {
        navigatedTo = value;
      },
    };
    return {
      stub,
      wasNavigated: () => navigatedTo !== undefined,
      navigatedTo: () => navigatedTo,
    };
  };

  let locationStub: ReturnType<typeof createLocationStub>;

  beforeEach(() => {
    localStorage.clear();
    locationStub = createLocationStub();
    vi.stubGlobal('location', locationStub.stub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  const renderHome = () =>
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']}>
          <Home />
        </MemoryRouter>
      </Provider>,
    );

  it('should not reload when the stored redirect target is the page we are already on', () => {
    localStorage.setItem(REDIRECT_URL, '/');

    renderHome();

    expect(locationStub.wasNavigated()).toBe(false);
    expect(localStorage.getItem(REDIRECT_URL)).toBeNull();
  });

  it('should still redirect when the stored target is a different page', () => {
    localStorage.setItem(REDIRECT_URL, '/admin/metrics');

    renderHome();

    expect(locationStub.navigatedTo()).toBe('http://localhost:9000/admin/metrics');
    expect(localStorage.getItem(REDIRECT_URL)).toBeNull();
  });

  it('should do nothing when no redirect is stored', () => {
    renderHome();

    expect(locationStub.wasNavigated()).toBe(false);
  });
});
