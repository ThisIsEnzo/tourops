/**
 * Shared driver for walkthrough integration tests.
 * Queries are scoped to the labelled current-stage region so coexisting panels
 * (for example readiness beside the checklist) can never make a query ambiguous.
 * Dev-only module: nothing in the application imports it.
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export function journeyUser() {
  return userEvent.setup();
}

export type JourneyUser = ReturnType<typeof journeyUser>;

export async function startWalkthrough(user: JourneyUser): Promise<void> {
  await user.click(await screen.findByRole('button', { name: 'Start scenario' }));
}

export async function currentStage(): Promise<HTMLElement> {
  return screen.findByRole('region', { name: 'Current stage' });
}

export async function createScenarioQuote(user: JourneyUser): Promise<void> {
  const stage = await currentStage();
  await user.click(within(stage).getByRole('button', { name: 'Create quote' }));
  // Creating the quote advances the stage and unmounts QuoteComposer; assert the
  // next stage's action rather than transient feedback owned by the old component.
  await screen.findByRole('button', { name: /Mark as sent/ });
}

export async function acceptScenarioQuote(user: JourneyUser): Promise<void> {
  let stage = await currentStage();
  await user.click(within(stage).getByRole('button', { name: /Mark as sent/ }));
  stage = await currentStage();
  await user.click(within(stage).getByRole('button', { name: /Accept quote/ }));
}

export async function convertScenarioQuote(user: JourneyUser): Promise<void> {
  const stage = await currentStage();
  await user.click(within(stage).getByRole('button', { name: /Convert to booking/ }));
}

export async function recordScenarioDeposit(user: JourneyUser): Promise<void> {
  const stage = await currentStage();
  await user.click(within(stage).getByRole('button', { name: 'Fill deposit due' }));
  await user.click(within(stage).getByRole('button', { name: /Record simulated payment/ }));
}

export async function assignScenarioResources(user: JourneyUser): Promise<void> {
  const stage = await currentStage();
  const type = within(stage).getByLabelText('Resource type');
  const resource = within(stage).getByLabelText('Resource');
  const assign = within(stage).getByRole('button', { name: /Assign resource/ });

  await user.selectOptions(type, 'vessel');
  await user.selectOptions(resource, 'demo-vsl-001');
  await user.click(assign);

  await user.selectOptions(type, 'crew');
  await user.selectOptions(resource, 'demo-crew-001');
  await user.click(assign);
  await user.selectOptions(resource, 'demo-crew-004');
  await user.click(assign);

  await user.selectOptions(type, 'equipment');
  const units = within(stage).getByLabelText('Units');
  await user.clear(units);
  await user.type(units, '16');
  await user.selectOptions(resource, 'demo-eqp-005');
  await user.click(assign);
  await user.selectOptions(resource, 'demo-eqp-001');
  await user.click(assign);
}

export async function completeMandatoryChecklist(user: JourneyUser): Promise<void> {
  const stage = await currentStage();
  for (const button of within(stage).getAllByRole('button', { name: /^Complete:/ })) {
    await user.click(button);
  }
}

export async function resetScenario(user: JourneyUser): Promise<void> {
  const resets = screen.getAllByRole('button', { name: 'Reset scenario' });
  const first = resets[0];
  if (!first) throw new Error('reset control missing');
  await user.click(first);
  const confirm = screen.getAllByRole('button', { name: 'Confirm reset' })[0];
  if (confirm) await user.click(confirm);
}
