Feature: Manage Users
  In order to manage the registered users
  As an administrator
  I want to list, register, view, edit and delete them

  Scenario: List all users logged as admin when just default ones
    Given I'm on the home page and logged out
    And I sign in as "admin" with password "password"
    When I click submenu option "Users" in menu "Administration"
    Then I see 2 users

  Scenario: No listed users when logged as user
    Given I'm on the home page and logged out
    When I sign in as "user" with password "password"
    Then The menu option "Administration" is not visible

  Scenario: No listed users when not logged in
    Given I'm on the home page and logged out
    Then The menu option "Administration" is not visible

  Scenario: Register new user and view details
    Given I'm on the home page and logged out
    And I sign in as "admin" with password "password"
    And I click submenu option "Users" in menu "Administration"
    And I see 2 users
    When I click the "Create User" button
    And I fill the user form with username "user2" and password "password"
    Then I see a user with name "user2"
    And I click the "Back" button
    And I see 3 users

  Scenario: Delete an existing user
    Given I'm on the home page and logged out
    And I sign in as "admin" with password "password"
    And I click submenu option "Users" in menu "Administration"
    And I see 3 users
    And I click the user with name "user2"
    And I see a user with name "user2"
    When I click the "Delete" button
    # And I confirm the deletion
    Then I see 2 users
