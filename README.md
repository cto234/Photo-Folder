# Photo Folder

## Overview

Your one stop to store and organize images you find on the web! Sort images into folders based on whatever criteria you want. Maybe you'd like to create a folder of images for your desktop background that you've found online, or cute pictures of cats that you don't want to lose. Whatever it may be, this web app will allow you to store all these images in a clean and organized fashion.

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


## [Link to Commented First Draft Schema](db.mjs) 


## User Stories or Use Cases

1. As a non-registered user I can register and set a username/password
2. As a user I can create a new folder if one doesn't already exist
3. As a user I can examine the contents of an existing folder
4. As a user I can add images to a folder
5. As a user I can add captions to images
6. As a user I can edit the title and description of an existing folder by clicking on the title when viewing its contents

## [Link to Initial Main Project File](app.mjs) 

## Annotations / References Used

Authentication/login process: Homework 5
dotenv documentation: https://www.npmjs.com/package/dotenv 
SASS documentation: https://sass-lang.com/documentation/ (proof of running on save is in documentation folder in repo)
