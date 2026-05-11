@smoke
Feature: Candidate Management
  As a recruiter
  I want to add candidates to a vacancy
  So that I can track applicants and start the WhatsApp screening process

  Background:
    Given a vacancy exists
    And I navigate to that vacancy's candidates page

  Scenario: Add a candidate and verify initial status is contactado
    When I click the add candidate button
    And I fill in the candidate form:
      | name     | Juan                  |
      | lastName | Pérez                 |
      | phone    | CANDIDATE_PHONE       |
      | email    | juan.perez@test.com   |
    And I submit the candidate form
    Then the candidate "Juan Pérez" should appear in the candidates table
    And the candidate status should be "contactado"
