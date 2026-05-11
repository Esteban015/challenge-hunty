const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the vacancies page', async function () {
  await this.page.goto(this.baseUrl);
  await this.page.waitForSelector('[data-testid="btn-create-vacancy"]');
});

When('I click the {string} button', async function (label) {
  if (label === 'New Vacancy') {
    await this.page.click('[data-testid="btn-create-vacancy"]');
    await this.page.waitForSelector('[data-testid="input-vacancy-name"]');
  }
});

When('I fill in the vacancy form:', async function (dataTable) {
  const data = dataTable.rowsHash();
  await this.page.fill('[data-testid="input-vacancy-name"]', data.name);
  await this.page.fill('[data-testid="input-vacancy-area"]', data.area);
  await this.page.fill('[data-testid="input-vacancy-location"]', data.location);
  await this.page.fill('[data-testid="input-vacancy-description"]', data.description);
});

When('I submit the vacancy form', async function () {
  await this.page.click('[data-testid="btn-submit-vacancy"]');
  await this.page.waitForSelector('[data-testid="vacancies-table"]');
});

Then('the vacancy {string} should appear in the vacancies table', async function (vacancyName) {
  const table = this.page.locator('[data-testid="vacancies-table"]');
  await expect(table).toContainText(vacancyName);
});
