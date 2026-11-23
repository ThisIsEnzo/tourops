// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { App } from '../../app/App';
import {
  acceptScenarioQuote, assignScenarioResources, completeMandatoryChecklist, convertScenarioQuote,
  createScenarioQuote, currentStage, journeyUser, recordScenarioDeposit, resetScenario, startWalkthrough,
} from '../../test/journey';

describe('operations walkthrough journey', () => {
  beforeEach(() => { window.location.hash = '#/walkthrough'; });
  afterEach(() => { cleanup(); window.location.hash = ''; });

  it('completes enquiry → quote → booking → deposit → resources → readiness and resets', async () => {
    const user = journeyUser();
    render(<App />);

    await startWalkthrough(user);
    expect(await screen.findByText('Suksai Family Group')).toBeTruthy();

    await createScenarioQuote(user);

    await acceptScenarioQuote(user);
    await convertScenarioQuote(user);
    expect(await screen.findByText(/and departure/i)).toBeTruthy();

    await recordScenarioDeposit(user);
    expect(await screen.findByText(/Simulated payment recorded/i)).toBeTruthy();

    await assignScenarioResources(user);
    await completeMandatoryChecklist(user);

    expect(await screen.findByText('Ready to sail')).toBeTruthy();
    expect(screen.getAllByRole('heading', { name: 'Departure readiness' })).toHaveLength(1);

    await resetScenario(user);
    expect(await screen.findByText('0/7 stages')).toBeTruthy();
  }, 40000);

  it('surfaces validation errors without mutating state', async () => {
    const user = journeyUser();
    render(<App />);
    await startWalkthrough(user);

    const stage = await currentStage();
    const quantity = within(stage).getByLabelText('Qty');
    await user.clear(quantity);
    await user.type(quantity, '0');
    await user.click(within(stage).getByRole('button', { name: 'Create quote' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(/Quantity must be a positive integer/i)).toBeTruthy();
    expect(screen.getByText('0/7 stages')).toBeTruthy();
  }, 20000);

  it('keeps TO-01B screens working and reflects walkthrough state', async () => {
    const user = journeyUser();
    render(<App />);
    await startWalkthrough(user);
    await createScenarioQuote(user);

    window.location.hash = '#/enquiries';
    const search = await screen.findByLabelText('Search enquiries…');
    await user.type(search, 'Suksai');
    expect(await screen.findByText('ENQ-2611-014')).toBeTruthy();

    await user.click(screen.getByText('ENQ-2611-014'));
    expect(await screen.findByRole('heading', { name: 'Quote prepared' })).toBeTruthy();
  }, 20000);
});
