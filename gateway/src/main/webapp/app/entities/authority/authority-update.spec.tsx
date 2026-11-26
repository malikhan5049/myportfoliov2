import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import axios from 'axios';

import AuthorityUpdate from './authority-update';
import authorityReducer from './authority.reducer';

const renderPage = () => {
  const store = configureStore({ reducer: { authority: authorityReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/authority/ROLE_ADMIN/edit']}>
        <Routes>
          <Route path="/authority/:name/edit" element={<AuthorityUpdate />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('Authority edit page', () => {
  beforeEach(() => {
    axios.get = vi.fn().mockResolvedValue({ data: { name: 'ROLE_ADMIN' } });
    axios.put = vi.fn().mockResolvedValue({ data: { name: 'ROLE_ADMIN' } });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should load the authority into the name field', async () => {
    renderPage();

    await waitFor(() => expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('ROLE_ADMIN'));

    expect(axios.get).toHaveBeenCalledWith('api/authorities/ROLE_ADMIN');
  });

  it('should send the updated authority with a PUT request', async () => {
    renderPage();

    const nameField = await waitFor(() => screen.getByRole('textbox') as HTMLInputElement);
    fireEvent.change(nameField, { target: { value: 'ROLE_ADMIN' } });
    fireEvent.click(document.querySelector('#save-entity') as HTMLButtonElement);

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith('api/authorities/ROLE_ADMIN', expect.objectContaining({ name: 'ROLE_ADMIN' })),
    );
  });
});
