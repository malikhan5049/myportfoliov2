import React, { useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Translate } from 'react-jhipster';
import { Link, useParams } from 'react-router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './authority.reducer';

export const AuthorityDetail = () => {
  const dispatch = useAppDispatch();

  const { name } = useParams<'name'>();

  useEffect(() => {
    dispatch(getEntity(name!));
  }, []);

  const authorityEntity = useAppSelector(state => state.authority.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="authorityDetailsHeading">
          <Translate contentKey="gatewayApp.authority.detail.title">Authority</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="name">
              <Translate contentKey="gatewayApp.authority.name">Name</Translate>
            </span>
          </dt>
          <dd>{authorityEntity.name}</dd>
        </dl>
        <Button as={Link as any} to="/authority" replace variant="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button as={Link as any} to={`/authority/${authorityEntity.name}/edit`} replace variant="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default AuthorityDetail;
