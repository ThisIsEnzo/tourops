// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { App } from '../../app/App';
import {
  acceptScenarioQuote, assignScenarioResources, completeMandatoryChecklist, convertScenarioQuote,
  createScenarioQuote, journeyUser, recordScenarioDeposit, resetScenario, startWalkthrough,
} from '../../test/journey';

describe('TO-01D walkthrough regressions', () => {
  beforeEach(() => { window.location.hash = '#/walkthrough'; });
  afterEach(() => { cleanup(); window.location.hash = ''; });

  it('exposes exactly one canonical start control', async () => {
    render(<App />);
    expect(await screen.findAllByRole('button', { name: 'Start scenario' })).toHaveLength(1);
  });

  it('renders exactly one current-stage region and one readiness projection', async () => {
    const user = journeyUser();
    render(<App />);
    await startWalkthrough(user);
    expect(screen.getAllByRole('region', { name: 'Current stage' })).toHaveLength(1);

    await createScenarioQuote(user);
    await acceptScenarioQuote(user);
    await convertScenarioQuote(user);
    await recordScenarioDeposit(user);
    await assignScenarioResources(user);

    expect(screen.getAllByRole('heading', { name: 'Departure readiness' })).toHaveLength(1);
    await completeMandatoryChecklist(user);
    expect(await screen.findByText('Ready to sail')).toBeTruthy();
    expect(screen.getAllByRole('heading', { name: 'Departure readiness' })).toHaveLength(1);
  }, 40000);

  it('restores the seeded scenario and leaves no stale stage controls', async () => {
    const user = journeyUser();
    render(<App />);
    await startWalkthrough(user);
    await createScenarioQuote(user);

    await resetScenario(user);
    expect(await screen.findByText('0/7 stages')).toBeTruthy();
    expect(screen.queryByText(/created as a draft/i)).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Create quote' })).toHaveLength(1);
  }, 20000);
});
