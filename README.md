# RCM migrate to RCV

Let's say there are lots of RCM meetings in your outlook calendar. This tool helps you to convert them to RCV meetings.

It replaces `https://meetings.ringcentral.com/j/123456` with `https://v.ringcentral.com/join/567890`.


## How it works

1. The app will get the list of all Office 365 users
1. For each office 365 user from last step, check his/her calendar to find events with him/her as organizer
    1. The app only updates events as organizer, Outlook will update all participants automatically.
1. For each event from last step, check its body and location field for RCM links
1. If RCM links are found, a new RCV meeting will be scheduled
1. Update the event to replace RCM links with RCV links from last step.
1. Outlook will sync all meetings participants.


## Known issues

### New RCV meetings all have the same host user

New RCV meetings all have the same host user: the RingCentral user authorized into this app. 
This is because: given an outlook user, there is no reliable way to map it to a RingCentral user.
This app works even if the outlook user doesn't have RingCentral account at all. (as long as he borrow a RingCentral account somewhere he can run this app)


### Dial in numbers not updated

Some RCM meetings allow you to join by phone call. The phone numbers to join meeting are not updated.
I believe it could be done. More development and testing are needed.


## A video introduction

https://youtu.be/nQWFO5Jzp6U


## Technical Reference

- https://stackoverflow.com/questions/43240591/cant-access-microsoft-graph-users-calendars-403
- https://docs.microsoft.com/en-us/graph/auth-v2-service
- https://developers.google.com/identity/protocols/oauth2/service-account


## Todo

- Support Google calendar in addition to Outlook calendar.
