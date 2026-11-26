import { beforeEach, describe, expect, it, vi } from 'vitest';

import axios from 'axios';

import { IAuthority, defaultValue } from 'app/shared/model/authority.model';
import { EntityState } from 'app/shared/reducers/reducer.utils';

import reducer, { getEntities, getEntity, updateEntity } from './authority.reducer';

describe('Authority reducer tests', () => {
  const initialState: EntityState<IAuthority> = {
    loading: false,
    errorMessage: null,
    entities: [],
    entity: defaultValue,
    updating: false,
    updateSuccess: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toMatchObject(initialState);
  });

  it('should set state to loading', () => {
    [getEntities.pending.type, getEntity.pending.type].forEach(type => {
      expect(reducer(undefined, { type })).toMatchObject({
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      });
    });
  });

  it('should set state to updating', () => {
    expect(reducer(undefined, { type: updateEntity.pending.type })).toMatchObject({
      errorMessage: null,
      updateSuccess: false,
      updating: true,
    });
  });

  it('should fetch all authorities', () => {
    const payload = { data: [{ name: 'ROLE_ADMIN' }, { name: 'ROLE_USER' }] };
    expect(reducer(undefined, { type: getEntities.fulfilled.type, payload })).toMatchObject({
      loading: false,
      entities: payload.data,
    });
  });

  it('should fetch a single authority', () => {
    const payload = { data: { name: 'ROLE_ADMIN' } };
    expect(reducer(undefined, { type: getEntity.fulfilled.type, payload })).toMatchObject({
      loading: false,
      entity: payload.data,
    });
  });

  it('should update an authority', () => {
    const payload = { data: { name: 'ROLE_ADMIN' } };
    expect(reducer(undefined, { type: updateEntity.fulfilled.type, payload })).toMatchObject({
      updating: false,
      updateSuccess: true,
      entity: payload.data,
    });
  });

  describe('Actions', () => {
    const resolvedObject = { value: 'whatever' };
    const getState = vi.fn();
    const dispatch = vi.fn();
    const extra = {};

    beforeEach(() => {
      axios.get = vi.fn().mockResolvedValue(resolvedObject);
      axios.put = vi.fn().mockResolvedValue(resolvedObject);
    });

    it('dispatches FETCH_AUTHORITY_LIST actions', async () => {
      const result = await getEntities()(dispatch, getState, extra);

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: getEntities.pending.type,
          meta: expect.objectContaining({ requestStatus: 'pending' }),
        }),
      );
      expect(getEntities.fulfilled.match(result)).toBe(true);
    });

    it('dispatches FETCH_AUTHORITY actions', async () => {
      const result = await getEntity('ROLE_ADMIN')(dispatch, getState, extra);

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: getEntity.pending.type,
          meta: expect.objectContaining({ requestStatus: 'pending' }),
        }),
      );
      expect(getEntity.fulfilled.match(result)).toBe(true);
    });

    it('dispatches UPDATE_AUTHORITY actions', async () => {
      const result = await updateEntity({ name: 'ROLE_ADMIN' })(dispatch, getState, extra);

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: updateEntity.pending.type,
          meta: expect.objectContaining({ requestStatus: 'pending' }),
        }),
      );
      expect(updateEntity.fulfilled.match(result)).toBe(true);
    });
  });
});
