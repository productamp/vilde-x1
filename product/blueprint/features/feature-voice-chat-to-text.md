# Feature — Voice Chat To Text

Add a voice input feature so users can talk instead of typing.

This is a nice-to-have feature (not a must-have), but useful for demos and accessibility.

This is a simple product feature:
- A `Voice` input option is available in chat.
- User taps/clicks and speaks naturally.
- Speech is converted to text using an open-source speech-to-text method.
- The transcribed text is sent as the chat prompt (same flow as typed input).

## User flow

1. User opens chat.
2. User taps `Voice`.
3. User speaks their request.
4. System transcribes speech to text.
5. User can quickly review/edit transcript if needed.
6. User sends prompt.

## Behavior

- Works as an alternative to typing (not a separate assistant mode).
- Keeps existing chat behavior unchanged after text is submitted.
- Should feel familiar to users who already use voice input in ChatGPT/mobile assistants.
- Prefer open-source speech-to-text stack for implementation.

## Goal

Reduce friction for non-technical users by letting them speak naturally, especially in demo and onboarding scenarios.
