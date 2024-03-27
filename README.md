# Photo Folder

[![Video](https://img.youtube.com/vi/S4JwaCEHdi4/maxresdefault.jpg)](https://youtu.be/S4JwaCEHdi4)

Click the image above to view a demo of Photo Folder

## Overview

Your one stop to store and organize images you find on the web! Sort images into folders based on whatever criteria you want. Maybe you'd like to create a folder of images for your desktop background that you've found online, or cute pictures of cats that you don't want to lose. Whatever it may be, this web app will allow you to store all these images in a clean and organized fashion without taking up lots of storage on your computer.


## Tech
This project uses Node.js, Handlebars, and MongoDB Atlas. On registration, the user's password is hashed and encrypted using bcrypt before being stored in the database. 

## Data Model

This application will be mainly made up of folders and images. Each folder contains a title and an array of image objects, and each image object contains a link to the image and an optional caption.

An Example Folder:

```javascript
{
  title: 'cute-cats',
  description: 'This is a folder for storing images of cute cats',
  images: [{url: 'example.jpg', caption: 'OMG'}, {etc...}, {etc...}]
}
```

An Example Image:

```javascript
{
  url: 'example.jpg',
  caption: 'OMG'
}
```


## How to Run

Use 'node app.mjs' in terminal to run this project.


## Annotations / References Used

dotenv documentation: https://www.npmjs.com/package/dotenv 
SASS documentation: https://sass-lang.com/documentation/ (proof of running on save is in documentation folder in repo)


## [Link to Initial Main Project File](app.mjs) 
## [Link to Commented First Draft Schema](db.mjs) 
