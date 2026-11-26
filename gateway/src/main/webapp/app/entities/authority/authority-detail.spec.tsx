import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import axios from 'axios';

import AuthorityDetail from './authority-detail';
import authorityReducer from './authority.reducer';

const renderPage = () => {
  const store = configureStore({ reducer: { authority: authorityReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/authority/ROLE_ADMIN']}>
        <Routes>
          <Route path="/authority/:name" element={<AuthorityDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('Authority detail page', () => {
  beforeEach(() => {
    axios.get = vi.fn().mockResolvedValue({ data: { name: 'ROLE_ADMIN' } });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should fetch a single authority by its name', async () => {
    renderPage();

    await screen.findByText('ROLE_ADMIN');

    expect(axios.get).toHaveBeenCalledWith('api/authorities/ROLE_ADMIN');
  });

  it('should link back to the list and to the edit page', async () => {
    renderPage();

    await screen.findByText('ROLE_ADMIN');

    const hrefs = screen.getAllByRole('button').map(anchor => anchor.getAttribute('href'));

    expect(hrefs).toContain('/authority');
    expect(hrefs).toContain('/authority/ROLE_ADMIN/edit');
  });
});
