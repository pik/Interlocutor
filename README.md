# Interlocutor

Interlocutor is a decentralized comment software built on a [Matrix](http://matrix.org/) backend as a [Polymer Webcomponent](https://www.webcomponents.org/), it is under active development and not ready for production use. 

The goal of this project is to provide a censorship-resistant software for discussions, while providing a comfortable modern UI and effective moderation features. 

### Blog

A brief article providing a high-level overview of Interlocutor and a demo application can be found at: https://pik.github.io/Interlocutor/blog/

### Comment UI

**Flagging Comments**: Comments can be flagged by users by clicking the flag icon. 

**Starring Comments**: Comments can be favorited by users by clicking the star icon. 

**Collapsing Comments**: Comments can be collapsed by clicking the collapse icon.

**Edit Comments**: Comments can be editted by clicking the edit button. An edited comment will display the time it was last edited.

**User Actions**: Ignore User will add the user to a list of Ignored Identities, see Moderation Features below. 

Contact User will attempt to initiate a Matrix chat with the user (which they are free to accept or decline).

### Moderation Features

Interlocutor supports a number of moderatain features which are accessible to all users. Default settings can be passed as a JSON string by the site-operator to interlocutor-app (see configuring Interlocutor) as well as modified by the users via UI. 

```js
{
  // Flag Kill Threshold determines how many flags a comment should have before it is hidden by filters. 
  // This does not apply to comments Flagged by a Moderator, as those are assumed to be malicious and hidden instantly. 
  flagKillThreshold: 1,
  // Hides all comments below a certain number of stars.  
  voteCollapseThreshold: -1,
  // Enable or disable the moderation filter.
  filterOn: true, 
  // Interlocutor allows the hosting site to specify a list of Moderator Identities.
  // a user may choose to add or remove Moderator Identities from this list.
  trustedIdentities: { '@pik:pik-test': {} },
  // All comments made by Ignored Users will be hidden from view.
  ignoredIdentities: {},
  // Window of time(ms) after a comment is posted that it can be edited.
  // Set to -1 to disable edit completely
  editWindow: 1000*60*24*7, 
}
```

**Auto-Persisted Settings per Discussion**: For a logged in user, changes to Moderation Settings are automatically persisted on a per-discussion basis. This means that your Moderation Settings will be remembered and restored next time you come back.

### Usage

With a Polymer App `bower install https://github.com/pik/interlocutor` and include
the import `<link rel="import" href="../bower_components/interlocutor/interlocutor-app.html">`.

For usage outside of a Polymer App include webcomponents-lite.js and the bundled interloctur-app.

```
<script src="./webcomponents-lite.js"></script>
<link rel="import" href="./build/bundled/interlocutor-app.html">
```

Than simply include the `<interlocutor-app>` element. 

```
    <interlocutor-app
      room-id="room-id"
      home-server-address="https://my.home.server.address.com">
      default-settings="<default_settings_json>"
      config="<config_json>"
    </interlocutor-app>
```

#### default-settings 
See Moderation features for a list of options which can be manipulated in for default-setting.

#### config
Static configuration for Interlocutor App. 

```js
{
    flagsEnabled:true, // Flags are enabled for comments.
    upvotesEnabled:true, // Stars are enabled for comments.
    editsEnabled:true // Edits are enabled for comments. 
}
```

#### roomId
Each comment thread corresponds to a unique Matrix RoomId, currently the relevant room should be created on a per discussion basis, this will be improved in the future.

#### home-server-address
Pass a Matrix `home-server-address` to interlocutor. 

Use an existing HomeServer such as the official one at https://matrix.org or https://matrix.amaznev.net.

For running your own homeserver see: https://github.com/matrix-org/synapse. 
