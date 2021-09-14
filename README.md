# Deprecated

RingCentral now provides an official tool to do the migration. You should always use the official tool. 

For more information, please refer to [this page](https://support.ringcentral.com/transition-to-rcv/admin.html).


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

https://www.youtube.com/watch?v=jdBzGyEnXQI


## Technical Reference

- Microsoft
    - https://docs.microsoft.com/en-us/graph/auth-v2-service
- Google
    - https://developers.google.com/identity/protocols/oauth2/service-account
- https://github.com/tylerlong/express-proxy
    - a solution to workaround the Microsoft CORS issue
    - Google SDK is node.js only


## Todo

- Schedule RCV meeting use the current Calendar user's RingCentral extension
    -  What if he/she doesn't have a RingCentral extension?
    -  What if his/her calendar email is different from his/her RingCentral profile email?
- RCV Meeting with password?
- Refactor code
