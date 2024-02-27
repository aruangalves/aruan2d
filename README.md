# Aruan2D

The code I've developed to create my professional website available at [aruan.dev](https://aruan.dev). The backend was made in node.js expecting a MongoDB database through the official driver. The frontend pages are available in EJS with all of the scripting done in raw JavaScript, the page look and feel was achieved through the help of [Material Design Lite](https://getmdl.io/index.html).

More info (written in portuguese) is available at the [project page](https://aruan.dev/dev/project/aruan2d) on my website.

## Resources
* The homepage automatically retrieves the most recent blog posts and projects posted on the site;
![Homepage](/screenshots/001.jpg)
<img src="/screenshots/002.jpg" width="30%"></img> <img src="/screenshots/003.jpg" width="30%"></img> <img src="/screenshots/004.jpg" width="30%"></img> 




* A blog page, with posts sorted by categories and date. These categories are listed on the individual post footer and on the sidebar of the main blog page. The sidebar also features a history where posts are arranged by year and each individual month;
![Blog section](/screenshots/005.jpg)
* A dev page, where all projects are ordered by most recent updates. There's also a header with shows all projects listed in alphabetical order and by categories;
![Dev project page listing](/screenshots/006.jpg)
* Each individual project available on the dev section features a wiki-styled page with a sidebar listing the project summary, an expandable navigation bar pointing to the different sections commenting on the project history, changes, installation steps and resources;
![Individual dev project page](/screenshots/007.jpg)
* A design page, featuring four different categories for showcasing a graphical design portfolio. Some of the sections features a dynamic image gallery for displaying an item in greater details. The art section can expand the thumbnails in a modal for showing the image in a larger size and further information regarding the picture. The video section expands a hidden videoplayer that automatically focus and plays the video with its information (video name, description and date) available below the player;
![Design page top](/screenshots/008.jpg)
![An individual item with its image gallery featuring two pages of content](/screenshots/009.jpg)
![Another item with an associated image gallery, this time with a single page](/screenshots/010.jpg)
![Art image gallery](/screenshots/011.jpg)
![An art image expanded and shown on a modal, this feature is also available for images added to blog posts and dev projects](/screenshots/012.jpg)
![The expanded item also has an attached text to describe it](/screenshots/013.jpg)
![Video section of the design page](/screenshots/014.jpg)
![Video shown on its embedded player, it also displays the video title, creation date and description](/screenshots/015.jpg)
* An about section for providing further information about the website and its author. Its layout is similar to a blog post, featuring a profile picture as an extra;
* A search function where you can find any blog post or dev project listed on the website. To enable this feature, it only requires setting the appropriate indexes on the database;
![Example of search function usage](/screenshots/016.jpg)
* All of the public pages were done with responsive web design principles so the website can be properly displayed on desktops or mobile devices;
![Mobile version of homepage](/screenshots/m01.jpg)
![A blog post in mobile view](/screenshots/m02.jpg)
![Blog history and post categories in mobile mode](/screenshots/m03.jpg)
![Search feature in mobile devices](/screenshots/m04.jpg)
![Main Dev section in mobile mode](/screenshots/m05.jpg)
![A singular project in mobile view](/screenshots/m06.jpg)
![A design item available on mobile access](/screenshots/m07.jpg)
![Image gallery now features a 2x2 grid to accomodate mobile screens](/screenshots/m08.jpg)
![A video being show in mobile mode](/screenshots/m10.jpg)
![The details of the aforementioned video, also in mobile view](/screenshots/m09.jpg)
* The dashboard behaves as an administrative panel where I can create, edit or delete any blog post, dev project, design item or the about section. Its main page also features details about the website such as the size of uploaded data, statistics regarding each section plotted on charts and security information.
![Login page](/screenshots/017.jpg)
![Main page showcasing website statistics](/screenshots/018.jpg)
![Main page showcasing its security info](/screenshots/019.jpg)
![Blog admin page](/screenshots/020.jpg)
![Creating a blog post, the main text is produced through Editor.js, a WYSIWYG text editor](/screenshots/022.jpg)
![Listing post categories from previous publications](/screenshots/023.jpg)
![Design admin page](/screenshots/021.jpg)
