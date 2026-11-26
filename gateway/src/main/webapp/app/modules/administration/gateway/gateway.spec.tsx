import { afterEach, describe, expect, it } from 'vitest';
import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';

import { badgeInfo } from './gateway';

type HealthService = {
  checks?: { status?: string }[];
  Checks?: { Status?: string; status?: string }[];
};

// Trimmed to the fields badgeInfo reads, but keyed and shaped exactly like the Gson-serialized
// payload of GET /api/gateway/routes (`Checks[].Status`, status value `"passing"`).
const pascalCaseSerfHealth = {
  Checks: [
    {
      CheckID: 'serfHealth',
      Name: 'Serf Health Status',
      Node: '41883cbe1286',
      Output: 'Agent alive and reachable',
      ServiceID: '',
      ServiceName: '',
      ServiceTags: [],
      Status: 'passing',
      Notes: '',
      CreateIndex: 13,
      ModifyIndex: 13,
    },
  ],
};

describe('GatewayPage badgeInfo', () => {
  const renderBadge = (healthService?: HealthService) => render(<>{badgeInfo(healthService)}</>);

  afterEach(cleanup);

  it('should render an UP badge when every check reports lowercase "passing"', () => {
    renderBadge({ checks: [{ status: 'passing' }, { status: 'passing' }] });

    const badge = screen.getByText('UP');
    expect(badge.className).toContain('bg-success');
    expect(screen.queryByText('DOWN')).toBeNull();
  });

  it('should render an UP badge regardless of check status casing', () => {
    renderBadge({ checks: [{ status: 'Passing' }, { status: 'PASSING' }] });

    expect(screen.getByText('UP').className).toContain('bg-success');
  });

  it('should render a DOWN badge when a check reports a non-passing status', () => {
    renderBadge({ checks: [{ status: 'passing' }, { status: 'critical' }] });

    const badge = screen.getByText('DOWN');
    expect(badge.className).toContain('bg-danger');
    expect(screen.queryByText('UP')).toBeNull();
  });

  it('should render a DOWN badge when checks are missing', () => {
    renderBadge({});

    expect(screen.getByText('DOWN').className).toContain('bg-danger');
  });

  it('should render the unknown badge when the health service is missing', () => {
    renderBadge(undefined);

    const badge = screen.getByText('?');
    expect(badge.className).toContain('bg-warning');
    expect(screen.queryByText('UP')).toBeNull();
    expect(screen.queryByText('DOWN')).toBeNull();
  });

  it('should render an UP badge for the real Gson payload with PascalCase Checks/Status', () => {
    renderBadge(pascalCaseSerfHealth);

    const badge = screen.getByText('UP');
    expect(badge.className).toContain('bg-success');
    expect(screen.queryByText('DOWN')).toBeNull();
  });

  it('should render an UP badge for a PascalCase payload reporting uppercase "PASSING"', () => {
    renderBadge({ Checks: [{ Status: 'PASSING' }] });

    expect(screen.getByText('UP').className).toContain('bg-success');
  });

  it('should render a DOWN badge for a PascalCase payload with a non-passing status', () => {
    renderBadge({ Checks: [{ Status: 'passing' }, { Status: 'critical' }] });

    const badge = screen.getByText('DOWN');
    expect(badge.className).toContain('bg-danger');
    expect(screen.queryByText('UP')).toBeNull();
  });

  it('should render a DOWN badge for a PascalCase payload with no checks', () => {
    renderBadge({ Checks: [] });

    expect(screen.getByText('DOWN').className).toContain('bg-danger');
  });
});
