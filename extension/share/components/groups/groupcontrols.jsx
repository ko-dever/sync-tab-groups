import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Utils from '../../../background/utils/utils'
import TabControls from './tabcontrols'

class GroupControls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menuPosition: TabControls.POSITION.MIDDLE,
      show: false,
      panel: "main",
      waitFirstMount: false,
      maxHeight: window.innerHeight/2,
    };

    this.closeMenuTimeout = undefined;
  }

  getEditControls() {
    if (this.props.editing) {
      return [
        <i
          key="rename_agree"
          className="group-edit group-control fa fa-fw fa-check"
          onClick={this.props.onEditSave}
        ></i>,
        <i
          key="rename_abort"
          className="group-edit group-control fa fa-fw fa-ban"
          onClick={this.props.onEditAbort}
        ></i>,
      ];
    }
  }

  getUndoControls() {
    const overHelp = this.props.closing
      ? browser.i18n.getMessage("undo_closing")
      : browser.i18n.getMessage("undo_removing");

    return [
      <i
        title={overHelp}
        key="undo"
        className="group-undo group-control fa fa-fw fa-undo"
        onClick={this.props.onUndoCloseClick}
      ></i>,
    ];
  }

  render() {
    const expanderClasses = classNames({
      "group-expand": true,
      "group-control": true,
      "fa": true,
      "fa-fw": true,
      "fa-chevron-down": !this.props.expanded,
      "fa-chevron-up": this.props.expanded,
    });

    return (
      <span
        className="group-controls"
        onMouseUp={(e)=>e.stopPropagation()}>
        {this.getOpenNewWindowButton()}
        {this.getUndoClosingButton()}
        {this.getUndoRemovingButton()}
        {this.getCloseButton()}
        {this.getRemoveButton()}
        {this.getEditButtons()}
        {this.getTooltipOpenerButton()}
        <i
          className={expanderClasses}
          onClick={this.props.onExpand}
          title={this.getExpandTitle()}
        ></i>
      </span>);
  }

  getEditButtons() {
    if (this.props.controlsEnable && !this.props.closing
      && !this.props.removing) {
      return this.getEditControls();
    }
  }

  getRemoveButton() {
    if (this.props.controlsEnable && !this.props.editing
      && !this.props.closing) {
      const overHelp = this.props.removing
        ? browser.i18n.getMessage("force_removing")
        : browser.i18n.getMessage("remove_group");

      return (
        <i
          key="remove"
          title={overHelp}
          className="group-close group-control fa fa-fw fa-trash"
          onClick={this.props.onRemove}
        ></i>
      );
    }
  }

  getCloseButton() {
    if (this.props.controlsEnable && !this.props.editing
      && this.props.opened && !this.props.removing) {
      const overHelp = this.props.closing
        ? browser.i18n.getMessage("force_closing")
        : browser.i18n.getMessage("close_group");

      return (
        <i
          key="close"
          title={overHelp}
          className="group-close group-control fa fa-fw fa-times"
          onClick={this.props.onClose}
        ></i>
      );
    }
  }

  getUndoRemovingButton() {
    if (this.props.controlsEnable && !this.props.editing
      && this.props.removing) {
      return this.getUndoControls();
    }
  }

  getUndoClosingButton() {
    if (this.props.controlsEnable && !this.props.editing
      && this.props.closing) {
      return this.getUndoControls();
    }
  }

  getOpenNewWindowButton() {
    if (this.props.controlsEnable && !this.props.closing
      && !this.props.removing && !this.props.opened
      && !this.props.editing) {
      return (
        <i
          key="open_window"
          className="group-edit group-control fa fa-fw fa-window-maximize"
          title={browser.i18n.getMessage("open_window_group")}
          onClick={this.props.onOpenInNewWindow}
        ></i>
      );
    }
  }

  getTooltipOpenerButton() {
    if (!this.props.closing && !this.props.removing
      && this.props.controlsEnable && !this.props.editing) {
      return (
        <i
          key="tooltip"
          title={browser.i18n.getMessage("tab_show_actions_menu")}
          className="group-edit group-control fa fa-fw fa-exchange tab-actions"
          onClick={this.handleOpenExtraActions.bind(this)}
          onMouseLeave={this.handleMouseLeaveExtraActions.bind(this)}
          onMouseEnter={this.handleMouseEnterExtraActions.bind(this)}
        >
          {this.state.waitFirstMount && this.createExtraActionsMenu()}
        </i>
      );
    }
  }

  getExpandTitle() {
    return this.props.expanded
      ? browser.i18n.getMessage("hide_tabs")
      : browser.i18n.getMessage("show_tabs");
  }

  componentDidMount() {
    if (!this.state.waitFirstMount) {
      this.differedTimeOut = setTimeout(()=>{
        this.setState({
          waitFirstMount: true,
        });
      }, 500);
    }
  }

  createExtraActionsMenu() {
    return (
      <div  className={classNames({
        "tab-actions-menu": true,
        "top": this.state.menuPosition === TabControls.POSITION.TOP,
        "bottom": this.state.menuPosition === TabControls.POSITION.BOTTOM,
        "middle": this.state.menuPosition === TabControls.POSITION.MIDDLE,
        "show": this.state.show,
      })}>
        {this.createActionsPanel()}
      </div>
    );
  }

  getHiddenRemoveActionTooltip() {
    if (this.props.hasHiddenTabs) {
      return (
        <span
          className="row"
          onClick={((event)=>{
            if (event) {
              event.stopPropagation();
            }
            this.props.onRemoveHiddenTabsInGroup(this.props.groupId);
            this.closeExtraActions();
          })}>
          <i className="fa fa-fw fa-eye-slash" />
          {browser.i18n.getMessage("close_hidden_tabs_in_group")}
        </span>
      )
    }
  }

  getEditActionTooltip() {
    if (!this.props.editing) {
      return (
        <span
          className="row"
          onClick={((event)=>{
            if (event) {
              event.stopPropagation();
            }
            this.props.onEdit();
            this.closeExtraActions();
          })}>
          <i className="fa fa-fw fa-pencil" />
          {browser.i18n.getMessage("rename_group")}
        </span>
      )
    }
  }

  createActionsPanel() {
    return (
      <div className={classNames({
        "tab-actions-panel": true,
        "hiddenBySearch": this.state.panel !== "main",
      })}>
        {this.getEditActionTooltip()}
        {this.getHiddenRemoveActionTooltip()}
      </div>
    )
  }

  handleOpenExtraActions(event) {
    if (event) {
      event.stopPropagation();
    }

    let parentGroupList = Utils.getParentElement(event.target, "group-list");

    let pos = Utils.getOffset(event.target, parentGroupList),
      height = parentGroupList.clientHeight;

    let menuPosition = TabControls.POSITION.MIDDLE;

    if (pos < (height/2 + 34)) {
      menuPosition = TabControls.POSITION.TOP;
    } else {
      menuPosition = TabControls.POSITION.BOTTOM;
    }

    this.setState({
      menuPosition: menuPosition,
      show: !this.state.show,
      panel: "main",
      maxHeight: height/2,
    })
  }

  handleMouseLeaveExtraActions(event) {
    //return; // For debug
    this.closeMenuTimeout = setTimeout(()=>{
      this.closeExtraActions();
      this.closeMenuTimeout = undefined;
    }, 500);
  }

  handleMouseEnterExtraActions(event) {
    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
    }
  }

  closeExtraActions() {
    this.setState({
      show: false,
      panel: "main",
    });
  }

  componentWillUnmount() {
    if (this.differedTimeOut) {
      clearTimeout(this.differedTimeOut);
    }

    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
    }
  }
}

GroupControls.propTypes = {
  expanded: PropTypes.bool.isRequired,
  opened: PropTypes.bool.isRequired,
  closing: PropTypes.bool,
  removing: PropTypes.bool,
  editing: PropTypes.bool,
  onClose: PropTypes.func,
  onRemove: PropTypes.func,
  onEdit: PropTypes.func,
  onEditAbort: PropTypes.func,
  onEditSave: PropTypes.func,
  onExpand: PropTypes.func,
  onUndoCloseClick: PropTypes.func,
  onOpenInNewWindow: PropTypes.func,
}

export default GroupControls