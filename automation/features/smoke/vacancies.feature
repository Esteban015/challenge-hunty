@smoke
Feature: Vacancy Management
  As a recruiter
  I want to manage job vacancies
  So that I can track open positions

  Background:
    Given I am on the vacancies page

  Scenario: Create a new vacancy and verify it appears in the table
    When I click the "New Vacancy" button
    And I fill in the vacancy form:
      | name        | QA Automation Engineer                                                    |
      | area        | Engineering                                                               |
      | location    | Mexico City, MX                                                           |
      | description | Looking for a senior QA Automation Engineer with Playwright expertise     |
    And I submit the vacancy form
    Then the vacancy "QA Automation Engineer" should appear in the vacancies table
