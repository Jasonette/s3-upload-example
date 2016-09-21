# Upload to S3 example

## What this does

This example is a server-side code that:

1. Takes a photo using [$media.camera](actions.md#mediacamera).
2. Then it uploads it to S3 using [$network.upload](actions.md#networkupload).

## How the code works

1. The server initializes a Mongo DB instance via `init.DB()`, and then starts an [express](https://expressjs.com) web server via `init.server()`.
2. When a Jasonette client hits the root URL (`/`), the server returns the JASON Markup, and the client renders it accordingly.
3. The Jasonette client listens for a `$pull` event, and when it happens (User pulls to refresh), it makes a POST request to `/sign_url` endpoint.
4. Upon a `/sign_url` POST request, the server generates and returns an S3 signed url using the `aws` module.
5. Jasonette client then takes the url and uploads the photo to that URL immediately.
6. Once the upload has finished, the Jasonette client makes a `$network.request` to `/post` endpoint.
7. The backend responds by storing that entry to the DB.

## Usage

You need to set the following environment variables to make the code work on your own server.

- **MONGODB_URI** - Set up a mongodb instance and use its URL (In my case I used a free instance of [mlab](https://www.mlab.com))
- **S3_KEY** - Your S3 key
- **S3_SECRET** - Your S3 secret

If you're using [heroku](https://heroku.com), you can learn more [here](https://devcenter.heroku.com/articles/config-vars)
