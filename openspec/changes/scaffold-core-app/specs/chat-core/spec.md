# Spec: Chat Core

## ADDED Requirements

### Requirement: Context Window Construction
The system MUST build linear history from the message tree.

#### Scenario: Sending a new message
- **Given** the current leaf message ID
- **When** preparing context for the LLM
- **Then** the system SHALL traverse `parentId` upwards to the root to construct the conversation history

### Requirement: Branching
The system MUST create siblings for message edits.

#### Scenario: User edits a previous message
- **Given** an existing message node
- **When** the user submits an "Edit"
- **Then** a new Message node SHALL be created with the *same* `parentId` as the original message, creating a branch
