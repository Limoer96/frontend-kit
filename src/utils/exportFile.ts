import { Dict } from "../definitions";

/**
 * 导出 流方式
 *
 * const sendData = {
 *    Authorization: this.state.Authorization,
 *  }
 *  exportFile('/api/admin/platform/downloadReceiptProfitTemplate.xls', sendData)
 */
export const exportFile = (url: string, params: Dict, removeTime = 4000) => {
  const urlParams: any[] = [];
  for (const p of Object.keys(params)) {
    const key = p;
    const value = params[p];
    if (value != undefined && value !== "") {
      urlParams.push({
        key,
        value,
      });
    }
  }
  // urlParams.push({ key: 'Authorization', value: (config.authKey) })
  const exportForm = document.createElement("form");
  exportForm.method = "get";
  exportForm.action = url;
  exportForm.style.display = "none";
  urlParams.forEach((v) => {
    const input = document.createElement("input");
    input.type = "text";
    input.name = v.key;
    input.value = v.value;
    exportForm.appendChild(input);
  });

  document.body.appendChild(exportForm);

  exportForm.submit();

  setTimeout(() => {
    document.body.removeChild(exportForm);
  }, removeTime);
};
