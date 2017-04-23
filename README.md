# Interlocutor

Interlocutor is a decentralized comment software built on a Matrix (http://matrix.org/) backend as a Polymer Wecomponent, it is under active development and not ready for production use. 

The goal of this project is to provide a censorship-resistant software for discussions, while providing a comfortable modern UI and effective moderation.

### Comment UI

**Flagging Comments**: Comments can be flagged by users by clicking the flag icon. 

**Starring Comments**: Comments can be favorited by users by clicking the star icon. 

**Collapsing Comments**: Comments can be collapsed by clicking the collapse icon.

**Edit Comments**: Comments can be editted by clicking the edit button. An edited comment will display the time it was last edited.

**User Actions**: Ignore User will add the user to a list of Ignored Identities, see Moderation Features below. 

Contact User will attempt to initiate a Matrix chat with the user (which they are free to accept or decline).

### Moderation Features

Interlocutor supports a number of moderatain features which are accessible to all users. The aim is to allow a website to provide a set of sane defaults which will provide a good user experience for most users while still leaving final control to the user (censorship-resistant).

**Toggle Moderation Settings**: Toggling the power icon will entirely disable all moderation features for a user.

**Flag Kill Threshold**: Flag Kill Threshold determines how many flags a comment should have before it is hidden by filters. This does not apply to comments Flagged by a Moderator Identity, as those are assumed to be malicious and hidden instantly. 

**Auto-Collapse Below Star Threshold**: Hides all comments below a certain number of stars.

**Auto-Persisted Settings per Discussion**: For a logged in user, changes to Moderation Settings are automatically persisted on a per-discussion basis. This means that your Moderation Settings will be remembered and restored next time you come back.

**Moderator Identities**: Interlocutor allows the hosting site to specify a list of Moderator Identities, a user may choose to add or remove Moderator Identities from this list.

**Ignored Users**: All comments made by Ignored Users will be hidden from view.

### Usage

With a Polymer App `bower install https://github.com/pik/interlocutor` and include
the import `<link rel="import" href="../bower_components/interlocutor/interlocutor-app.html">`.

For usage outside of a Polymer App include webcomponents-lite.js and the bundled interloctur-app.

```
<script src="./webcomponents-lite.js"></script>
<link rel="import" href="./build/bundled/interlocutor-app.html">
```

Than simply include the `<interlocutor-app></interlocturp-app>` element. 

```
    <interlocutor-app
      default-login="password-for-guest-viewing"
      default-password="password-for-guest-user"
      room-id="room-id"
      home-server-address="https://my.home.server.address.com">
    </interlocutor-app>
```

#### roomId
Each comment thread corresponds to a unique Matrix RoomId, currently the relevant room should be created on a per discussion basis, this will be improved in the future.

### Backends
Pass a Matrix `home-server-address` to interlocutor. 

Use an existing HomeServer such as the official one at https://matrix.org or https://matrix.amaznev.net.

For running your own homeserver see: https://github.com/matrix-org/synapse. 
