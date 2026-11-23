// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../app/App';

async function startScenario(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(await screen.findByRole('button', { name: 'Start scenario' }));
}

async function currentPanel(): Promise<HTMLElement> {
  const heading = await screen.findByRole('heading', { name: /Prepare quote|Quote decision|Simulated deposit|Assign resources|Preparation checklist|Departure readiness/ });
  const panel = heading.closest('section');
  if (!panel) throw new Error('panel container missing');
  return panel as HTMLElement;
}

describe('operations walkthrough journey', () => {
  beforeEach(() => { window.location.hash = '#/walkthrough'; });
  afterEach(() => { cleanup(); window.location.hash = ''; });

  it('completes enquiry → quote → booking → deposit → resources → readiness and resets', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startScenario(user);
    expect(await screen.findByText('Suksai Family Group')).toBeTruthy();

    // A — prepare quote
    let panel = await currentPanel();
    await user.click(within(panel).getByRole('button', { name: 'Create quote' }));
    expect(await screen.findByText(/created as a draft/i)).toBeTruthy();

    // B — send + accept
    panel = await currentPanel();
    await user.click(within(panel).getByRole('button', { name: /Mark as sent/ }));
    panel = await currentPanel();
    await user.click(within(panel).getByRole('button', { name: /Accept quote/ }));

    // C — convert
    panel = await currentPanel();
    await user.click(within(panel).getByRole('button', { name: /Convert to booking/ }));
    expect(await screen.findByText(/and departure/i)).toBeTruthy();

    // D — simulated deposit
    panel = await currentPanel();
    await user.click(within(panel).getByRole('button', { name: 'Fill deposit due' }));
    await user.click(within(panel).getByRole('button', { name: /Record simulated payment/ }));
    expect(await screen.findByText(/Simulated payment recorded/i)).toBeTruthy();

    // E — resources
    panel = await currentPanel();
    const typeSelect = within(panel).getByLabelText('Resource type');
    const resourceSelect = within(panel).getByLabelText('Resource');
    const assign = within(panel).getByRole('button', { name: /Assign resource/ });

    await user.selectOptions(typeSelect, 'vessel');
    await user.selectOptions(resourceSelect, 'demo-vsl-001');
    await user.click(assign);

    await user.selectOptions(typeSelect, 'crew');
    await user.selectOptions(resourceSelect, 'demo-crew-001');
    await user.click(assign);
    await user.selectOptions(resourceSelect, 'demo-crew-004');
    await user.click(assign);

    await user.selectOptions(typeSelect, 'equipment');
    await user.selectOptions(resourceSelect, 'demo-eqp-005');
    await user.clear(within(panel).getByLabelText('Units'));
    await user.type(within(panel).getByLabelText('Units'), '16');
    await user.click(assign);
    await user.selectOptions(resourceSelect, 'demo-eqp-001');
    await user.click(assign);

    // F — mandatory checklist
    panel = await currentPanel();
    for (const button of within(panel).getAllByRole('button', { name: /^Complete:/ })) {
      await user.click(button);
    }

    // G — readiness derived from state
    expect(await screen.findByText('Ready to sail')).toBeTruthy();

    // Reset restores the seeded scenario
    await user.click(screen.getAllByRole('button', { name: 'Reset scenario' })[0] as HTMLElement);
    await user.click(screen.getAllByRole('button', { name: 'Confirm reset' })[0] as HTMLElement);
    expect(await screen.findByText('0/7 stages')).toBeTruthy();
  }, 30000);

  it('surfaces validation errors without mutating state', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startScenario(user);

    const panel = await currentPanel();
    const quantity = within(panel).getByLabelText('Qty');
    await user.clear(quantity);
    await user.type(quantity, '0');
    await user.click(within(panel).getByRole('button', { name: 'Create quote' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(/Quantity must be a positive integer/i)).toBeTruthy();
    expect(screen.getByText('0/7 stages')).toBeTruthy();
  });

  it('keeps TO-01B screens working and reflects walkthrough state', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startScenario(user);
    const panel = await currentPanel();
    await user.click(within(panel).getByRole('button', { name: 'Create quote' }));

    window.location.hash = '#/enquiries';
    const search = await screen.findByLabelText('Search enquiries…');
    await user.type(search, 'Suksai');
    expect(await screen.findByText('ENQ-2611-014')).toBeTruthy();

    await user.click(screen.getByText('ENQ-2611-014'));
    expect(await screen.findByRole('heading', { name: 'Quote prepared' })).toBeTruthy();
  }, 20000);
});