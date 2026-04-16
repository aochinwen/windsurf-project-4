const element = {
  id: "el-1",
  type: "image-left-text",
  props: {
    title: "Testing title",
    titleFontSize: "14px",
    titleFont: "Arial, sans-serif"
  }
}
function cloneElement(element) {
  return {
    ...element,
    props: { ...(element?.props || {}) },
  };
}
console.log(JSON.stringify(cloneElement(element)));
