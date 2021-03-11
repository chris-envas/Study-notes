import "./style/index.css"

function render() {
  const div = document.createElement('div')
  div.innerHTML = '你好，世界'
  document.body.appendChild(div)
}

render()