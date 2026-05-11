const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('a vacancy exists', async function () {
  const vacancy = await this.apiPost('/vacancies', {
    name: 'Test Vacancy – Smoke',
    area: 'Engineering',
    location: 'Remote',
    description: 'Automated smoke test vacancy',
  });
  this.vacancyId = vacancy.id;
});

Given("I navigate to that vacancy's candidates page", async function () {
  await this.page.goto(`${this.baseUrl}/vacancies/${this.vacancyId}/candidates`);
  await this.page.waitForSelector(`[data-testid="btn-add-candidate-${this.vacancyId}"]`);
});

When('I click the add candidate button', async function () {
  await this.page.click(`[data-testid="btn-add-candidate-${this.vacancyId}"]`);
  await this.page.waitForSelector('[data-testid="input-candidate-name"]');
});

When('I fill in the candidate form:', async function (dataTable) {
  const data = dataTable.rowsHash();
  // Allow the feature file to use CANDIDATE_PHONE as a token resolved from env
  const phone = data.phone === 'CANDIDATE_PHONE' ? this.candidatePhone : data.phone;

  await this.page.fill('[data-testid="input-candidate-name"]', data.name);
  await this.page.fill('[data-testid="input-candidate-lastname"]', data.lastName);
  await this.page.fill('[data-testid="input-candidate-phone"]', phone);
  await this.page.fill('[data-testid="input-candidate-email"]', data.email);
});

When('I submit the candidate form', async function () {
  await this.page.click('[data-testid="btn-submit-candidate"]');
  await this.page.waitForSelector('[data-testid="candidates-table"]');
});

Then('the candidate {string} should appear in the candidates table', async function (fullName) {
  const table = this.page.locator('[data-testid="candidates-table"]');
  await expect(table).toContainText(fullName);
});

Then('the candidate status should be {string}', async function (expectedStatus) {
  // Target the status badge element directly rather than the whole table
  const badge = this.page.locator('[data-testid^="candidate-status-"]').first();
  await expect(badge).toContainText(expectedStatus);
});
