import React, { useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Translate } from 'react-jhipster';
import { Link } from 'react-router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities } from './authority.reducer';

export const Authority = () => {
  const dispatch = useAppDispatch();

  const authorities = useAppSelector(state => state.authority.entities);
  const loading = useAppSelector(state => state.authority.loading);

  // Only application roles are managed here; Keycloak-synced entries (SCOPE_*, OIDC_*) are excluded.
  const authorityList = authorities?.filter(authority => authority.name?.startsWith('ROLE_'));

  const getAllEntities = () => {
    dispatch(getEntities());
  };

  useEffect(() => {
    getAllEntities();
  }, []);

  const handleSyncList = () => {
    getAllEntities();
  };

  return (
    <div>
      <h2 id="authority-heading" data-cy="AuthorityHeading">
        <Translate contentKey="gatewayApp.authority.home.title">Authorities</Translate>
        <div className="d-flex justify-content-end">
          <Button className="me-2" variant="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="gatewayApp.authority.home.refreshListLabel">Refresh list</Translate>
          </Button>
        </div>
      </h2>
      <div className="table-responsive">
        {authorityList?.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="gatewayApp.authority.name">Name</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {authorityList.map((authority, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button as={Link as any} to={`/authority/${authority.name}`} variant="link" size="sm">
                      {authority.name}
                    </Button>
                  </td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button as={Link as any} to={`/authority/${authority.name}`} variant="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button
                        as={Link as any}
                        to={`/authority/${authority.name}/edit`}
                        variant="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && (
            <div className="alert alert-warning">
              <Translate contentKey="gatewayApp.authority.home.notFound">No Authorities found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Authority;
