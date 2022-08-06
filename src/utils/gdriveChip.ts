export const createGdriveChip = (url: string, name: string) => {
  return `<div class="gmail_chip gmail_drive_chip" style="width:396px;height:18px;max-height:18px;background-color:rgb(245,245,245);padding:5px;font-family:arial;font-weight:bold;font-size:13px;border:1px solid rgb(221,221,221);line-height:1"><a href="${url}?usp=drive_web" target="_blank" style="display::hidinline-block;max-width:366px;overflowden;text-overflow:ellipsis;white-space:nowrap;text-decoration-line:none;padding:1px 0px;border:none" aria-label="${name}" moz-do-not-send="true"><img style="vertical-align: bottom; border: none;" src="https://ssl.gstatic.com/docs/doclist/images/icon_10_generic_list.png" moz-do-not-send="true"> <span dir="ltr" style="vertical-align:bottom;text-decoration:none">${name}</span></a><img src="//ssl.gstatic.com/ui/v1/icons/common/x_8px.png" style="opacity: 0.55; cursor: pointer; float: right; position: relative; top: -1px; display: none;" moz-do-not-send="true"></div>`;
}