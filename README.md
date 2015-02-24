# unindexed
A website that irrevocably deletes itself once indexed by Google.

The site is constantly searching for itself in Google, over and over and over, 24 hours a day. The instant it finds itself in Google search results, the site will instantaneously and irrevocably securely delete itself. Visitors can contribute to the public content of the site, these contributions will also be destroyed when the site deletes itself.

Why would you do such a thing? The full explanation is in the content of the site
(which is not linked anywhere here).

![card](http://f.cl.ly/items/0Q3t120C0f1f3N1Q0416/unindexed_invite_blurred_sm.jpg)

UPDATE: The experiment lasted 22 days before it was indexed by Google on 24 February 2015 at 21:01:14 and instantaneously destroyed.  It was primarily shared via physical means in the real world, word of mouth, etc.

If you didn't find it before it went away,
[you can maybe watch this instead.](https://www.youtube.com/watch?v=qqmNaOn56mc)

If you want to conduct your own similar experiment, the source code is here.

## info

  - Nothing has been done to prevent the site from being indexed, however the
    NOARCHIVE meta tag is specified which prevents the Googles from caching
    their own copy of the content.

  - The content for this site is stored in memory only (via Redis) and is loaded
    in via a file from an encrypted partition on my personal laptop.  This
    partition is then destroyed immediately after launching the site. Redis
    backups are disabled. The content is flushed from memory once the site
    detects that it has been indexed.

  - The URL of the site can be algorithmically generated and is configured via
    environment variable, so this source code can be made public without
    disclosing the location of the site to bots.

  - Visitors can leave comments on the site while it is active. These comments
    are similarly flushed along with the rest of the content upon index event,
    making them equally ephemeral.

## other

Sample configuration notes for running on Heroku:

    $ heroku create `pwgen -AnB 6 1` # generates a random hostname
    $ heroku addons:add rediscloud   # default free tier disables backups
    $ heroku config:set REDIS_URL=`heroku config:get REDISCLOUD_URL`
    $ heroku config:set SITE_URL=`heroku domains | sed -ne "2,2p;2q"`
    $ git push heroku master
    $ heroku run npm run reset
    $ heroku addons:add scheduler:standard
    $ heroku addons:open scheduler

Schedule a task every N minutes for `npm run-script query` (unfortunately seems
like this can only be done via web interface).

Use `scripts/load_content.js` to load the content piped from STDIN.

You can configure monitoring to check the `/status` endpoint for `"OK"` if you
trust an external service with your URL.
