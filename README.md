# Interlocutor

Interlocutor is a decentralized comment software built on matrix(http://matrix.org/) as a Polymer Wecomponent, it is under active development and not ready for production use. 

### Moderation Features

Currently interlocutor supports upvotes and flags which are accesible to all users. By default a discussion loads the default moderation settings setup by the content provider. The settings page then allows a user to alter the default settings for comment visibility based on an upvote-threshold or a flag-kill-threshold. Trustred moderator-identities can be added or removed by a user (a moderator flagging a comment will cause it to disappear independent of flag-kill-threshold). User-local settings are persisted on a per discussion basis.

### Use with a Polymer App
```

<link rel="import" href="../bower_components/interlocutor/interlocutor-app.html">

    <interlocutor-app
      default-login="password-for-guest-viewing"
      default-password="password-for-guest-user"
      room-id="room-id"
      home-server-address="https://my.home.server.address.com">
    </interlocutor-app>
```

### Use with a non-Polymer App

Run `gulp` to build a bundled `interlocutor-app.html`. Than import the "/build/bundled/interlocutor-app.html" file.

### Backends
Pass a Matrix `home-server-address` to interlocutor. 

Use an existing HomeServer such as the official one at https://matrix.org or https://matrix.amaznev.net.

For running your own homeserver see: https://github.com/matrix-org/synapse. 

### Styling

Under Development
