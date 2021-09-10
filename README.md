# Hawkerpedia with JS / NodeJS

If you are only interested to run the application, you can go to [Hawkerpedia](https://hawkerpedia.herokuapp.com).

## Introduction
This website seeks to be the first-ever repository of hawker stalls in Singapore with data populated by food lovers themselves.

Govtech and NEA only offer data containing a [list of hawker centres](https://data.gov.sg/dataset/list-of-government-markets-hawker-centres) in Singapore and their addresses, and a [list of Licensed Eating Establishments](https://data.gov.sg/dataset/list-of-nea-licensed-eating-establishments-with-grades-demerit-points-and-suspension-history) with Grades, Demerit Points and Suspension History.

With this repository, any food lover can help fill in information on what each hawker stall sells! 

## Structure of Application
The whole web application is programmed with HTML, CSS and VanillaJS for the front-end, and NodeJS for the back-end. The database used is Mongoose / MongoDB. 

The backend follows the conventional Model-View-Controller structure. 

JWT is used for authentication. 

## User access
There are three levels of user access:

1. *Guests* - can only view the list of hawker centres and hawker stalls

2. *Bureaucrats* - can only edit the details of each hawker *stall* but not the hawker centre. Bureaucrats cannot add or delete a hawker stall and hawker centre. To become a Bureaucrat, one needs the User ID of an existing Bureaucrat or Administrator. The username of the last Bureaucrat to edit a page will be shown to all readers to ensure that the Bureaucrat fills in the data responsibly. 

3. *Administrators* - can edit the details of the hawker stall and hawker centre, including adding and deleting new ones. An Administrator can also downgrade or upgrade a user's access level

## Seeding of Data
I first had to 'fetch' data from Govtech's [list of hawker centres](https://data.gov.sg/dataset/list-of-government-markets-hawker-centres) and NEA's [list of Licensed Eating Establishments](https://data.gov.sg/dataset/list-of-nea-licensed-eating-establishments-with-grades-demerit-points-and-suspension-history). 

To get the coordinates (longitude and latitude) of each hawker centre, I used OneMap's API. The advantage of OneMap over GoogleMaps is that OneMap's API is free, as long as we do not exceed 240 calls per minute. I used the Bottleneck library to ensure that I do not exceed this rate-limiting factor. 

