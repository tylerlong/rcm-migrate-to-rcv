# RCM migrate to RCV

Let's say there are lots of RCM meetings in your outlook calendar. This tool helps you to convert them to RCV meetings.

It replaces `https://meetings.ringcentral.com/j/123456` with `https://v.ringcentral.com/join/567890`.


## How it works

1. The app will go through your Outlook calendar and find all events which you are the organizer.
2. The app will invoke RingCentral API to get your **default RCV meeting link**.
3. The app will update the events found in step #1 and replace all RCM links in body or location with your default RCV meeting link
4. Outlook will update all meeting participants.
5. All your meetings are migrated from RCM to RCV.


## A video introduction

https://youtu.be/nQWFO5Jzp6U
