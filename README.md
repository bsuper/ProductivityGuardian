# ProductivityGuardian

This is a GPT-4 generated chrome extension to boost your productivity.

## System Design

Title: Productivity Guardian Chrome Extension - System Design

1. Introduction

    The Productivity Guardian Chrome extension is designed to help users stay focused and productive by temporarily blocking websites based on a customizable blocklist. The extension allows users to configure blocking durations, either using preset durations or a custom duration in minutes.

2. Components
    
    2.1. Options Page
    
    The options page is responsible for the following tasks:
    - Add websites to the blocklist
    - Remove websites from the blocklist
    - Clear all websites from the blocklist
    - Start website blocking with a specified duration
    - Stop website blocking
    - Display the current blocking status
    - Configure custom block duration or use preset block durations

    2.2. Popup Page

    The popup page is responsible for:
    - Displaying a quick summary of the current blocking status
    - Providing shortcuts to start or stop blocking
    - Offering a link to the options page for further configuration

    2.3. Background Script

    The background script is responsible for:
    - Managing the blocking rules
    - Updating the blocking rules based on changes made in the options page
    - Blocking websites according to the blocklist and specified duration
    - Communicating with the options page and popup page to update the blocking status

3. Implementation
    
    3.1. Options Page
    
    The options page is implemented using HTML, CSS, and JavaScript. The HTML structure is styled with TailwindCSS. The JavaScript code handles the user interactions and communicates with the background script using the Chrome extension APIs.

    3.2. Popup Page

    The popup page is implemented using HTML, CSS, and JavaScript. The HTML structure is styled with TailwindCSS. The JavaScript code handles the user interactions and communicates with the background script using the Chrome extension APIs.

    3.3. Background Script

    The background script is implemented using JavaScript and utilizes the Chrome extension APIs to manage and apply the blocking rules.

4. Storage

    The Chrome extension uses Chrome's storage API (chrome.storage.sync) to store the following information:
    - Blocklist: A list of websites that should be blocked
    - Block duration: The duration for which the websites should be blocked
    - Blocking status: Whether the extension is currently blocking websites or not


5. Communication

    The options page, popup page, and background script communicate using the Chrome extension message passing API (chrome.runtime.sendMessage and chrome.runtime.onMessage). Messages are used to trigger updates to the blocking rules or the blocking status.

6. Future Enhancements

    - Allow users to schedule blocking times (e.g., block websites from 9 AM to 5 PM on weekdays)
    - Provide statistics on time spent on blocked websites or successful blocks
    - Implement a Pomodoro timer feature with customizable work and break intervals
    - Add whitelist functionality to always allow specific websites, even if they match the blocklist
    - Integrate with popular productivity tools like Trello or Todoist to display task-related information in the extension
    - Provide a visual indicator (e.g., badge or icon change) to indicate when blocking is active or inactive