import React from 'react';
import { NavItem, NavLink, NavbarBrand, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Translate } from 'react-jhipster';
import { NavLink as Link } from 'react-router';

import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import logo from '/content/images/my-app-store-logo.png';

export const BrandIcon = props => (
  <div {...props} className="brand-icon">
    <img src={logo} alt="Logo" />
  </div>
);

export const Brand = () => (
  <OverlayTrigger
    placement="right"
    overlay={tooltipProps => (
      <Tooltip {...tooltipProps}>
        <Translate contentKey="global.title">Blog</Translate>
      </Tooltip>
    )}
  >
    <NavbarBrand as={Link} to="/" className="brand-logo jh-rail-brand">
      <BrandIcon />
    </NavbarBrand>
  </OverlayTrigger>
);

export const Home = () => (
  <NavItem className="jh-rail-item">
    <OverlayTrigger
      placement="right"
      overlay={tooltipProps => (
        <Tooltip {...tooltipProps}>
          <Translate contentKey="global.menu.home">Home</Translate>
        </Tooltip>
      )}
    >
      <NavLink as={Link} to="/" end className="jh-rail-link">
        <FontAwesomeIcon icon={faHome} />
      </NavLink>
    </OverlayTrigger>
  </NavItem>
);
