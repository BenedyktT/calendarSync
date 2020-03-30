###### This is backend app exclusively, it has been build in node.js

Its goal is to keep restaurant google calendar updated
To achieve that it connects to reservation API and map room availability. Based on this it calculates number of rooms sold.
After that it checks status of google calendar and if there is any mismatch between prefetched API data it push it to calendar.
If there is no entry of date mapped in API report it creates missing entry.
This actions is scheduled every 10 minutes 
If there is more than 20 actions it sends email with list of updates to hotel email


## Biggest issues on the way

1. Roomer API doesn't have endpoint which gives room sold details on each date, it has only endpoint with result of availability.
So to make app output correct data response from endpoint needed to be processed appropriately. Since out of order rooms decreased
number of available rooms it wasn't sufficient to subtract number of available rooms from total rooms, so app collects data about
out of order rooms and include them into final calculation

## Cool things about it

1. It automates process of manual update of calendar so it is more reliable tool for making schedule for staff and to estimate
demand in given day - chef can make more accurate food order
1. It connects with google calendar api with server to server oauth
1. It send request to API every 10 minutes and send an email to user if there is more than 20 updates

