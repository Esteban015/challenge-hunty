const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('a candidate with the candidate WhatsApp phone has been added via the API', async function () {
  const candidate = await this.apiPost(`/vacancies/${this.vacancyId}/candidates`, {
    name: 'Test',
    lastName: 'Candidate',
    phone: this.candidatePhone,
    email: 'test.candidate@automation.com',
  });
  this.candidateId = candidate.id;
  // Allow the backend a moment to dispatch the initial WhatsApp message
  await new Promise((r) => setTimeout(r, 2000));
});

Given('the candidate simulator is connected', async function () {
  const { isClientReady } = require('../support/candidateWhatsApp');
  if (!this.sendAsCandidate || !isClientReady()) {
    throw new Error(
      'Candidate WA simulator is not connected. ' +
      'Kill any orphaned chrome.exe processes using candidate-session and re-run.'
    );
  }
});

When('the candidate replies {string}', async function (message) {
  await this.sendAsCandidate(message);
  // Allow the backend time to receive and process the incoming message
  await new Promise((r) => setTimeout(r, 2000));
});

Then('the candidate status should eventually be {string}', async function (expectedStatus) {
  // Poll the API until the status reaches the expected value (max 30 s)
  await this.pollCandidateStatus(expectedStatus);

  // Navigate to the candidates page and verify the status badge in the UI
  await this.page.goto(`${this.baseUrl}/vacancies/${this.vacancyId}/candidates`);
  await this.page.waitForSelector('[data-testid="candidates-table"]');

  const statusBadge = this.page.locator(`[data-testid="candidate-status-${this.candidateId}"]`);
  await expect(statusBadge).toContainText(expectedStatus);
});

Then('the bot should ask for experience again', async function () {
  // Verify the candidate is still in awaiting_experience (invalid input did NOT advance the state)
  const candidates = await this.apiGet(`/vacancies/${this.vacancyId}/candidates`);
  const candidate = candidates.find((c) => c.id === this.candidateId);
  expect(candidate.conversationStage).toBe('awaiting_experience');
});
