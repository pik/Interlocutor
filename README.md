# \<interlocutor\>

Interlocutor is a decentralized comment software built on matrix(http://matrix.org/) as a Polymer Wecomponent, it is under active development and not ready for production use. 

### Why use decentralized comment software? 

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

### Styling

Under Development
