# Charbel's Link Generator

A tracking link generator, that tracks certain data from visiting users.

## Link Generation

- User can generate a unique randomized tracking Link
- User can add a custom identifier of up to 6 characters.

## Data Points for each link visit

- IP of visitor
- Country of visitor (based on geo-ip)
- Region of visitor (based on geo-ip)
- City of visitor (based on geo-ip)
- Device of visitor
- Browser of visitor
- Time link was visited

## Tech Stack

**Client:** React, Axios, Bootstrap

**Server:** Node, Express, MongoDB

## Note

Location data will not work if you are running this on localhost, as express will return "::1" as the IP address of the visitor.

This tracking link generator is meant to be a proof of concept and is not scaled for multiple users.

This can be very easily scaled to accomodate multiple users by simply adding a "created_by" field in the Link schema, if your website has multiple users.

Another thing to note is that because this was created as a hiring task for [portalys.io]("https://www.portalys.io/"), all links redirect to their website. This can be easily solved by having the user provide what the destination of their link is (or auto redirect to the respective event they are sharing) and have that saved in the Link schema as "redirect_to".
