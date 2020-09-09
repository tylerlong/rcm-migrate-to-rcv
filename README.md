# RCM to RCV migration tool

This tool is for Office 365 admin or Google G Suite admin. 
If you organization is currently using RCM, use this tool to migrate to RCV.


## How it works

1. The app will get the list of all Office 365 / Google G Suite users
1. For each user from last step, check his/her calendar to find events with him/her as organizer
1. For each event from last step, check its body and location field for RCM links
1. If RCM links are found, they will be replaced with new RCV meeting links
1. Outlook/Google Calendar will sync all events participants


## Known/potential issues

### New RCV meetings all have the same host user

New RCV meetings all have the same host user: the RingCentral user authorized into this tool. 
This is because: there is no reliable way to map every calendar user to a RingCentral extension.


### Dial in numbers not updated

Some RCM meetings allow you to join by phone call. The phone numbers to join meeting are not updated.
I believe it could be done. More development and testing are needed.


## A video introduction

https://youtu.be/nQWFO5Jzp6U


## Technical Reference

- Microsoft
    - https://docs.microsoft.com/en-us/graph/auth-v2-service
- Google
    - https://developers.google.com/identity/protocols/oauth2/service-account
- EXPRESS_PROXY_URI
    - a solution to workaround the CORS issue
    - Google SDK is node.js only

## Todo

- Prompt to enable Google calendar/admin API
- Handle exception cases
    - Google
        - wrong key file
        - revoked key file
        - wrong admin email
    - MS
        - authorization cancelled
    - RC
        - authorization cancelled
- Display migration progress
    - as a minimum, show a spinner
- RCV Meeting with password?
- Refactor code
