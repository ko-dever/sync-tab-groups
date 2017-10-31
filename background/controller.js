// Portage help from SDK/XUL to Web extension
// More on https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Comparison_with_the_Add-on_SDK
// self -> runtime.getManifest() and extension.getURL() for data.url()
// l10n -> i18n
// hotkeys -> commands
// sdk/simple-prefs -> storage and options_ui
// TabsUtils = Low level API: useless
// tabs -> tabs
// sdk/window/utils -> windows

function Controller() {
  this._hotkeyOpen = null;
  this._hotkeyNextGroup = null;
  this._hotkeyPrevGroup = null;

  this.tabmanager = new TabManager(null);

  this.init();
}

Controller.prototype = {
  init: function() {
    // TODO Hotkeys
    this.onGroupAddWithTab();
  },

  /* TODO DO I still need the binding
  bindEvents: function() {
    this.bindHotkeyPreference();
    this.bindGroupPreference();
    this.bindPanelButtonEvents();
    this.bindPanelEvents();
    this.bindTabEvents();
  },
  */

  /* TODO adapt pref and hotkey
  createOpenHotkey: function() {
    if (!Prefs.prefs.bindPanoramaShortcut) {
      return;
    }

    /**
     * Note: since this is intended to be released after 1222490 has landed,
     * it is perfectly save to assume accel-shift-e is not used by anything
     * else.
     *
    this._hotkeyOpen = Hotkey({
      combo: "accel-shift-e",
      onPress: () => {
        if (this._groupsPanel.isShowing) {
          this._groupsPanel.hide();
        } else {
          this._groupsPanel.show({position: this._panelButton});
          this._panelButton.state("window", {checked: true});
        }
      }
    });
  },
  */

  /* TODO adapt pref and hotkey
  createNavigationHotkey: function() {
    if (!Prefs.prefs.bindNavigationShortcut) {
      return;
    }

    this._hotkeyNextGroup = Hotkey({
      combo: "accel-`",
      onPress: () => {
        this.tabmanager.selectNextPrevGroup(
          this._getWindow(),
          this._getTabBrowser(),
          1
        );
      }
    });
    this._hotkeyPrevGroup = Hotkey({
      combo: "accel-shift-`",
      onPress: () => {
        this.tabmanager.selectNextPrevGroup(
          this._getWindow(),
          this._getTabBrowser(),
          -1
        );
      }
    });
  },
  */

  /* TODO adapt pref and hotkey
  bindHotkeyPreference: function() {
    if (Prefs.prefs.bindPanoramaShortcut) {
      this.createOpenHotkey();
    }

    if (Prefs.prefs.bindNavigationShortcut) {
      this.createNavigationHotkey();
    }

    Prefs.on("bindPanoramaShortcut", () => {
      if (Prefs.prefs.bindPanoramaShortcut) {
        if (!this._hotkeyOpen) {
          this.createOpenHotkey();
        }
      } else if (this._hotkeyOpen) {
        this._hotkeyOpen.destroy();
        this._hotkeyOpen = null;
      }
    });

    Prefs.on("bindNavigationShortcut", () => {
      if (Prefs.prefs.bindNavigationShortcut) {
        if (!this._hotkeyNextGroup) {
          this.createNavigationHotkey();
        }
      } else {
        if (this._hotkeyNextGroup) {
          this._hotkeyNextGroup.destroy();
          this._hotkeyNextGroup = null;
        }
        if (this._hotkeyPrevGroup) {
          this._hotkeyPrevGroup.destroy();
          this._hotkeyPrevGroup = null;
        }
      }
    });
  },
  */

  /* TODO To study
  bindGroupPreference: function() {
    let emitCloseTimeoutChange = () => {
      this._groupsPanel.port.emit("Groups:CloseTimeoutChanged", Prefs.prefs.groupCloseTimeout);
    };

    Prefs.on("groupCloseTimeout", emitCloseTimeoutChange);

    emitCloseTimeoutChange();
  },
  */

  refreshUi: function() {
    // TODO Add sorting again ???
    //let groups = this.tabmanager.getGroups(Prefs.prefs.enableAlphabeticSort);

    sendMessage("Groups:Changed", {
      groups: groups
    });
  },

  resizePanel: function(dimensions) {
    /* TODO Useful ??
    this._groupsPanel.resize(
      this._groupsPanel.width,
      dimensions.height + 18
    );
    */
  },

  onGroupAdd: function() {
    this.tabmanager.addGroup();
    this.refreshUi();
  },

  onGroupAddWithTab: function() {
    browser.tabs.query({
      currentWindow: true
    }).then((tabs) => {
      controller.tabmanager.addGroupWithTab(tabs);
      controller.refreshUi();
    })
  },

  onGroupRemove: function(params) {
    this.tabmanager.removeGroup(
      params.groupID
    );
    this.refreshUi();
  },

  onGroupRename: function(params) {
    this.tabmanager.renameGroup(
      params.groupID,
      params.title
    );
    this.refreshUi();
  },

  onGroupSelect: function(params) {
    this.tabmanager.selectGroup(
      params.groupID
    );
    this.refreshUi();
  },

  onTabSelect: function(params) {
    this.tabmanager.selectTab(
      params.tabIndex,
      params.groupID
    );
    this.refreshUi();
  },

  onMoveTabToGroup: function(params) {
    this.tabmanager.moveTabToGroup(
      params.sourceGroupID,
      params.tabIndex,
      params.targetGroupID
    );
    this.refreshUi();
  }
};

// Event from: tabs, windows
var controllerMessenger = function(message) {
    switch (message.task) {
      case "Group:Add":
        controller.onGroupAdd();
        break;
      case "Group:AddWithTab":
        controller.onGroupAddWithTab();
        break;
      case "Group:Close":
        controller.onGroupClose(message.params);
        break;
      case "Group:Rename":
        controller.onGroupRename(message.params);
        break;
      case "Group:Select":
        if ( message.params.groupID === null ) {
          console.log( "No GROUPID...." );
          break;
        }
        controller.onGroupSelect(message.params);
        break;
      case "Group:MoveTab":
        controller.onMoveTabToGroup(message.params);
        break;
      case "Tab:Select":
        controller.onTabSelect(message.params);
        break;
    }
  console.log(message);
}

var controller = new Controller();

browser.runtime.onMessage.addListener(controllerMessenger);

// Event from: tabs, windows
// TODO query and rewrite data
browser.tabs.onActivated.addListener(() => {

});
browser.tabs.onCreated.addListener(() => {

});
browser.tabs.onRemoved.addListener(() => {

});
browser.tabs.onMoved.addListener(() => {

});
browser.tabs.onUpdated.addListener(() => {

});
browser.tabs.onAttached.addListener(() => {

});
browser.tabs.onDetached.addListener(() => {

});
