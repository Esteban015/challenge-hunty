@whatsapp
Feature: WhatsApp Conversation Flow
  As a recruiter
  I want the platform to qualify candidates automatically via WhatsApp
  So that initial screening is consistent and hands-free

  Background:
    Given a vacancy exists
    And a candidate with the candidate WhatsApp phone has been added via the API
    And the candidate simulator is connected

  Scenario: Accept flow — candidate is approved with sufficient experience
    When the candidate replies "Acepto"
    Then the candidate status should eventually be "conversando"
    When the candidate replies "6"
    Then the candidate status should eventually be "aprobado"

  Scenario: Reject flow — candidate declines the process
    When the candidate replies "No acepto"
    Then the candidate status should eventually be "descalificado"

  Scenario Outline: Disqualified by insufficient experience
    When the candidate replies "Acepto"
    Then the candidate status should eventually be "conversando"
    When the candidate replies "<years>"
    Then the candidate status should eventually be "descalificado"

    Examples:
      | years |
      | 3     |
      | 1     |

  Scenario: Invalid experience input — bot re-asks, then valid number leads to approval
    When the candidate replies "Acepto"
    Then the candidate status should eventually be "conversando"
    When the candidate replies "mucho tiempo"
    Then the bot should ask for experience again
    When the candidate replies "7"
    Then the candidate status should eventually be "aprobado"
