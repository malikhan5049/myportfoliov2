import { createAsyncThunk, isFulfilled, isPending } from '@reduxjs/toolkit';
import axios from 'axios';

import { IAuthority, defaultValue } from 'app/shared/model/authority.model';
import { EntityState, createEntitySlice, serializeAxiosError } from 'app/shared/reducers/reducer.utils';

const initialState: EntityState<IAuthority> = {
  loading: false,
  errorMessage: null,
  entities: [],
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

const apiUrl = 'api/authorities';

// Actions

export const getEntities = createAsyncThunk('authority/fetch_entity_list', async () => axios.get<IAuthority[]>(apiUrl), {
  serializeError: serializeAxiosError,
});

export const getEntity = createAsyncThunk('authority/fetch_entity', async (name: string) => axios.get<IAuthority>(`${apiUrl}/${name}`), {
  serializeError: serializeAxiosError,
});

export const updateEntity = createAsyncThunk(
  'authority/update_entity',
  async (entity: IAuthority) => axios.put<IAuthority>(`${apiUrl}/${entity.name}`, entity),
  {
    serializeError: serializeAxiosError,
  },
);

// slice

export const AuthoritySlice = createEntitySlice({
  name: 'authority',
  initialState,
  extraReducers(builder) {
    builder
      .addCase(getEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.entity = action.payload.data;
      })
      .addMatcher(isFulfilled(getEntities), (state, action) => {
        return {
          ...state,
          loading: false,
          entities: action.payload.data,
        };
      })
      .addMatcher(isFulfilled(updateEntity), (state, action) => {
        state.updating = false;
        state.loading = false;
        state.updateSuccess = true;
        state.entity = action.payload.data;
      })
      .addMatcher(isPending(getEntities, getEntity), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.loading = true;
      })
      .addMatcher(isPending(updateEntity), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.updating = true;
      });
  },
});

export const { reset } = AuthoritySlice.actions;

// Reducer
export default AuthoritySlice.reducer;
