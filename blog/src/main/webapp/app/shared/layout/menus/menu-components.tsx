import React from 'react';
import { Dropdown, DropdownMenu, DropdownToggle, Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface INavDropdown {
  children: React.ReactNode;
  icon: IconProp;
  name?: string;
  id?: string;
  style?: React.CSSProperties;
  'data-cy'?: string;
}

/**
 * Icon-only dropdown used inside the vertical rail. The label lives in the flyout trigger's
 * tooltip (and in the flyout items themselves), the menu always flies out to the right.
 */
export const NavDropdown = (props: INavDropdown) => (
  <Dropdown as={Nav.Item} id={props.id} data-cy={props['data-cy']} drop="end" className="jh-rail-item">
    <OverlayTrigger
      placement="right"
      overlay={tooltipProps => (
        <Tooltip {...tooltipProps}>
          <span>{props.name}</span>
        </Tooltip>
      )}
    >
      <DropdownToggle as={Nav.Link} className="jh-rail-link" aria-label={props.name}>
        <FontAwesomeIcon icon={props.icon} />
      </DropdownToggle>
    </OverlayTrigger>
    <DropdownMenu renderOnMount className="jh-rail-flyout" style={props.style}>
      {props.children}
    </DropdownMenu>
  </Dropdown>
);
