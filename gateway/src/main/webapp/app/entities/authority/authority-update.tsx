import React, { useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Translate, ValidatedField, ValidatedForm, translate } from 'react-jhipster';
import { useNavigate, useParams } from 'react-router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity, updateEntity } from './authority.reducer';

export const AuthorityUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { name } = useParams<'name'>();

  const authorityEntity = useAppSelector(state => state.authority.entity);
  const loading = useAppSelector(state => state.authority.loading);
  const updating = useAppSelector(state => state.authority.updating);
  const updateSuccess = useAppSelector(state => state.authority.updateSuccess);

  const handleClose = () => {
    navigate('/authority');
  };

  useEffect(() => {
    dispatch(getEntity(name!));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    dispatch(updateEntity({ ...authorityEntity, ...values }));
  };

  const defaultValues = () => ({
    name: authorityEntity?.name,
  });

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="gatewayApp.authority.home.editLabel" data-cy="AuthorityEditHeading">
            <Translate contentKey="gatewayApp.authority.home.editLabel">Edit Authority</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              <ValidatedField
                label={translate('gatewayApp.authority.name')}
                id="authority-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: translate('entity.validation.required') },
                  maxLength: { value: 50, message: translate('entity.validation.maxlength', { max: 50 }) },
                }}
              />
              <Button onClick={handleClose} data-cy="entityEditCancelButton" variant="info">
                <FontAwesomeIcon icon="arrow-left" />{' '}
                <span className="d-none d-md-inline">
                  <Translate contentKey="entity.action.cancel">Cancel</Translate>
                </span>
              </Button>
              &nbsp;
              <Button variant="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" /> <Translate contentKey="entity.action.save">Save</Translate>
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AuthorityUpdate;
