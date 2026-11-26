import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import axios from 'axios';

import { Authority } from './authority';
import authorityReducer from './authority.reducer';

const renderPage = () => {
  const store = configureStore({ reducer: { authority: authorityReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Authority />
      </MemoryRouter>
    </Provider>,
  );
};

describe('Authority list page', () => {
  beforeEach(() => {
    axios.get = vi.fn().mockResolvedValue({
      data: [{ name: 'ROLE_ADMIN' }, { name: 'ROLE_USER' }, { name: 'OIDC_USER' }, { name: 'SCOPE_openid' }],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should fetch the authorities from the backend', async () => {
    renderPage();

    await screen.findByText('ROLE_ADMIN');

    expect(axios.get).toHaveBeenCalledWith('api/authorities');
  });

  it('should render one row per returned authority', async () => {
    renderPage();

    await screen.findByText('ROLE_ADMIN');

    // one header row plus one row per ROLE_ authority
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('ROLE_USER').closest('tr')).not.toBeNull();
  });

  it('should exclude non-ROLE authorities synced from Keycloak', async () => {
    renderPage();

    await screen.findByText('ROLE_ADMIN');

    expect(screen.queryByText('OIDC_USER')).toBeNull();
    expect(screen.queryByText('SCOPE_openid')).toBeNull();
  });

  it('should only offer view and edit actions per row', async () => {
    renderPage();

    const adminRow = (await screen.findByText('ROLE_ADMIN')).closest('tr') as HTMLTableRowElement;
    const hrefs = Array.from(adminRow.querySelectorAll('a')).map(anchor => anchor.getAttribute('href'));

    expect(hrefs).toContain('/authority/ROLE_ADMIN');
    expect(hrefs).toContain('/authority/ROLE_ADMIN/edit');
    expect(adminRow.querySelector('[data-cy="entityDeleteButton"]')).toBeNull();
    expect(adminRow.querySelector('[data-cy="entityCreateButton"]')).toBeNull();
  });
});
